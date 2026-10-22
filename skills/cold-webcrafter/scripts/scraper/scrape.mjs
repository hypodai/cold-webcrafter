#!/usr/bin/env node
/*
 * Collects what the rebuild needs from a website: page texts, every image
 * with its real size, desktop and mobile screenshots, and the measurable
 * facts the auditor interprets. Writes files and nothing else — no API, no
 * background process, no uploads.
 *
 *   node scrape.mjs <url> [--out sources] [--max-pages 8] [--urls list.txt]
 *                         [--delay 500] [--no-screenshots]
 *
 * Install once, next to this file:
 *   npm install && npx playwright install chromium
 *
 * Output contract: references/sources.md. Pages come from the sitemap
 * (including sitemap indexes) and from the links of the rendered home page,
 * shallow paths first, capped by --max-pages; --urls replaces discovery
 * with a hand-made list (one URL per line). robots.txt is honoured: it's a
 * stranger's site.
 */
import '../lib/env-proxy.mjs';
import { chromium, devices } from 'playwright';
import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseRobots } from './lib/robots.mjs';
import { bareHost, pageKey, pageUrl, parseSitemap, slugFor } from './lib/urls.mjs';
import * as words from './lib/dictionaries.mjs';
import { acceptCookies, collect, horizontalOverflow, scrollThrough } from './lib/in-page.mjs';

const AGENT = 'cold-webcrafter';
const VERSION = '0.1';
const NAV_TIMEOUT = 30000;
// Site builders and chat widgets keep connections open, so the network is
// never fully idle; wait at most this long for it to settle.
const SETTLE_MS = 8000;

// --- arguments -------------------------------------------------------------

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name, fallback) => {
    const at = args.indexOf(name);
    return at === -1 ? fallback : args[at + 1];
};
const valued = new Set(['--out', '--max-pages', '--urls', '--delay']);
const positional = args.filter((a, i) => !a.startsWith('--') && !valued.has(args[i - 1]));

if (positional.length !== 1) {
    console.error('usage: scrape.mjs <url> [--out sources] [--max-pages 8] [--urls list.txt] [--delay 500] [--no-screenshots]');
    process.exit(2);
}

const start = new URL(/^https?:\/\//i.test(positional[0]) ? positional[0] : `https://${positional[0]}`);
const out = resolve(option('--out', 'sources'));
const maxPages = Number(option('--max-pages', 8));
const delay = Number(option('--delay', 500));
const urlsFile = option('--urls');
const screenshots = !flag('--no-screenshots');

if (!(maxPages >= 1 && maxPages <= 500) || !(delay >= 0)) {
    console.error('--max-pages must be 1–500 and --delay a number of milliseconds');
    process.exit(2);
}

const warnings = [];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// --- output folder -----------------------------------------------------------

// Only files this script writes are replaced, matched by their names; any
// other file in the folder (e.g. lighthouse-before.json) stays. Nothing is
// deleted recursively.
const OWN_FILES = {
    screenshots: /^\d{2,}-[a-z0-9_-]+-(?:desktop|mobile)(?:-top)?\.png$/,
    text: /^\d{2,}-[a-z0-9_-]+\.txt$/,
};
mkdirSync(out, { recursive: true });
for (const [dir, pattern] of Object.entries(OWN_FILES)) {
    const folder = join(out, dir);
    if (!existsSync(folder)) continue;
    for (const file of readdirSync(folder)) if (pattern.test(file)) unlinkSync(join(folder, file));
}
for (const file of ['images.json', 'audit-raw.json', 'summary.json', 'overview.html']) {
    if (existsSync(join(out, file))) unlinkSync(join(out, file));
}
mkdirSync(join(out, 'text'), { recursive: true });
if (screenshots) mkdirSync(join(out, 'screenshots'), { recursive: true });

// --- site-wide facts: https, robots, sitemap ---------------------------------

async function get(url, options = {}) {
    try {
        return await fetch(url, {
            headers: { 'User-Agent': `Mozilla/5.0 (compatible; ${AGENT}/${VERSION})` },
            signal: AbortSignal.timeout(15000),
            ...options,
        });
    } catch {
        return null;
    }
}

const origin = start.origin;
const site = {
    https: start.protocol === 'https:',
    http_redirects_to_https: null,
    sitemap_xml: false,
    robots_txt: false,
    pages: 0,
    unavailable_pages: [],
    skipped_by_robots: [],
};

const plain = await get(`http://${start.host}/`, { redirect: 'manual' });
if (plain) {
    const location = plain.headers.get('location') ?? '';
    site.http_redirects_to_https = plain.status >= 300 && plain.status < 400 && /^https:/i.test(new URL(location, `http://${start.host}/`).href);
}

// RFC 9309: a missing robots.txt (4xx) allows everything; one that can't be
// read (5xx, network error) means "don't crawl". Guessing would either
// ignore the owner's rules or report a sitemap that isn't missing.
let robots = parseRobots('', AGENT);
const robotsResponse = await get(`${origin}/robots.txt`);
if (!robotsResponse || robotsResponse.status >= 500) {
    console.error(`robots.txt of ${start.host} couldn't be read (${robotsResponse ? `HTTP ${robotsResponse.status}` : 'network error'}) — not scraping.`
        + '\nCheck that the site answers; behind a proxy, Node 22.21+ is needed.');
    process.exit(1);
}
if (robotsResponse.ok && !/html/i.test(robotsResponse.headers.get('content-type') ?? '')) {
    site.robots_txt = true;
    robots = parseRobots(await robotsResponse.text(), AGENT);
}

// The site's own Crawl-delay wins over a shorter --delay. It's applied
// between page loads (each page is loaded twice, desktop and mobile).
let pause = delay;
if (robots.crawlDelaySeconds && robots.crawlDelaySeconds * 1000 > delay) {
    pause = Math.min(robots.crawlDelaySeconds, 60) * 1000;
    warnings.push(`robots.txt asks for ${robots.crawlDelaySeconds} s between requests — waiting ${pause / 1000} s per page load`);
}

async function sitemapUrls() {
    const queue = [...new Set([...robots.sitemaps, `${origin}/sitemap.xml`, `${origin}/sitemap_index.xml`])].map((url) => ({ url, depth: 0 }));
    const seen = new Set();
    const pages = [];
    while (queue.length) {
        const { url, depth } = queue.shift();
        if (seen.has(url)) continue;
        seen.add(url);
        const response = await get(url);
        if (!response?.ok) continue;
        const { isIndex, locs } = parseSitemap(await response.text());
        if (locs.length === 0) continue;
        site.sitemap_xml = true;
        if (isIndex) {
            if (depth < 2) queue.push(...locs.map((loc) => ({ url: loc, depth: depth + 1 })));
        } else {
            pages.push(...locs);
        }
    }
    return pages;
}

// --- browser -----------------------------------------------------------------

let browser;
try {
    browser = await chromium.launch();
} catch (error) {
    console.error(`Chromium didn't start: ${error.message.split('\n')[0]}\nInstall it next to this script: npx playwright install chromium`);
    process.exit(1);
}

// An honest user agent: the real browser, without "Headless", plus who we are.
const probe = await browser.newPage();
const baseAgent = (await probe.evaluate(() => navigator.userAgent)).replace('HeadlessChrome', 'Chrome');
await probe.close();
const mobileDevice = devices['iPhone 13'];

const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 }, userAgent: `${baseAgent} ${AGENT}/${VERSION}` });
const mobile = await browser.newContext({ ...mobileDevice, userAgent: `${mobileDevice.userAgent} ${AGENT}/${VERSION}` });
const cookieClicked = new WeakSet();

const cfg = {
    cta: words.CTA,
    references: words.REFERENCES.source,
    certifications: words.CERTIFICATIONS.source,
    placeholders: words.PLACEHOLDERS.source,
    mapHosts: words.MAP_HOSTS.source,
    numberUnits: words.NUMBER_UNITS,
};

async function open(context, url) {
    const page = await context.newPage();
    let response;
    try {
        response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    } catch (error) {
        await page.close();
        throw error;
    }
    await page.waitForLoadState('networkidle', { timeout: SETTLE_MS }).catch(() => {});
    // Accept the cookie banner once per context; the consent cookie then
    // keeps it closed on the following pages.
    if (!cookieClicked.has(context)) {
        const clicked = await page.evaluate(acceptCookies, words.COOKIE_ACCEPT).catch(() => null);
        if (clicked) {
            cookieClicked.add(context);
            await wait(600);
        }
    }
    await page.evaluate(scrollThrough).catch(() => {});
    return { page, response };
}

// Two shots per page: the full page, and the first screen only. The first
// screen is what an agent should load to judge the look — a full-page shot
// of a long (or, without a viewport meta, very wide) page is shrunk until
// nothing is readable, at full price.
async function shoot(page, file) {
    if (!screenshots) return;
    try {
        await page.screenshot({ path: join(out, 'screenshots', file.replace(/\.png$/, '-top.png')), timeout: NAV_TIMEOUT });
        await page.screenshot({ path: join(out, 'screenshots', file), fullPage: true, timeout: NAV_TIMEOUT });
    } catch (error) {
        warnings.push(`screenshot ${file} failed: ${error.message.split('\n')[0]}`);
    }
}

// --- one page ----------------------------------------------------------------

const images = new Map();
const results = [];
const auditPages = [];
const usedNames = new Set();

function nameFor(index, url) {
    let slug = slugFor(url);
    for (let n = 2; usedNames.has(slug); n++) slug = `${slugFor(url)}-${n}`;
    usedNames.add(slug);
    return `${String(index + 1).padStart(2, '0')}-${slug}`;
}

async function scrapePage(url, index) {
    const name = nameFor(index, url);
    const record = { url, name, ok: false, error: null, status: null };
    let links = [];

    let page;
    try {
        const opened = await open(desktop, url);
        page = opened.page;
        record.status = opened.response?.status() ?? null;

        const finalUrl = page.url();
        if (bareHost(new URL(finalUrl).hostname) !== bareHost(start.hostname)) {
            throw new Error(`redirected off the site to ${finalUrl}`);
        }
        if (record.status >= 400) throw new Error(`HTTP ${record.status}`);
        if (finalUrl !== url) record.final_url = finalUrl;

        const data = await page.evaluate(collect, cfg);
        links = data.links;
        await shoot(page, `${name}-desktop.png`);

        writeFileSync(join(out, 'text', `${name}.txt`), [
            `URL: ${url}`, `TITLE: ${data.title}`, `DESCRIPTION: ${data.description ?? ''}`, '='.repeat(60), '', data.text, '',
        ].join('\n'));

        for (const image of data.images) {
            const known = images.get(image.url);
            if (known) {
                if (!known.alt && image.alt) known.alt = image.alt;
                if (image.w && (!known.w || image.w > known.w)) Object.assign(known, { w: image.w, h: image.h });
                if ((image.displayed_w ?? 0) > (known.displayed_w ?? 0)) known.displayed_w = image.displayed_w;
                if (!known.found_on.includes(url)) known.found_on.push(url);
            } else {
                images.set(image.url, { ...image, found_on: [url] });
            }
        }

        Object.assign(record, {
            ok: true, title: data.title, description: data.description, h1: data.h1, image_count: data.images.length,
        });
        auditPages.push({ url, name, audit: data.audit });
    } catch (error) {
        record.error = error.message.split('\n')[0];
        site.unavailable_pages.push(url);
    } finally {
        await page?.close();
    }

    if (record.ok) {
        let mobilePage;
        if (pause > delay) await wait(pause);
        try {
            ({ page: mobilePage } = await open(mobile, url));
            auditPages.at(-1).audit.mobile_horizontal_overflow = await mobilePage.evaluate(horizontalOverflow);
            await shoot(mobilePage, `${name}-mobile.png`);
        } catch (error) {
            warnings.push(`${name}: mobile pass failed (${error.message.split('\n')[0]})`);
        } finally {
            await mobilePage?.close();
        }
    }

    results.push(record);
    return links;
}

// --- discovery and the run -----------------------------------------------------

const home = pageUrl(start.href, start.href, start.hostname);
if (!robots.allowed(home)) {
    console.error(`robots.txt of ${start.host} disallows ${start.pathname} — not scraping it.`);
    await browser.close();
    process.exit(1);
}

const homeLinks = await scrapePage(home, 0);
if (!results[0].ok) {
    console.error(`the start page failed: ${results[0].error}`);
}

let candidates;
if (urlsFile) {
    candidates = readFileSync(urlsFile, 'utf8').split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
} else {
    candidates = [...await sitemapUrls(), ...homeLinks];
}

const depth = (href) => new URL(href).pathname.split('/').filter(Boolean).length;
const seen = new Set([pageKey(home)]);
const queue = [];
for (const raw of candidates) {
    const href = pageUrl(raw, home, start.hostname);
    if (!href || seen.has(pageKey(href))) continue;
    seen.add(pageKey(href));
    if (!robots.allowed(href)) {
        site.skipped_by_robots.push(href);
        continue;
    }
    queue.push(href);
}
// Pages that feed the main sections first (services and their sub-pages,
// contact, about, prices), then the rest; within each, shallow paths first.
// With a small cap (lite) that's what the three pages are built from,
// rather than ten blog posts.
const key = (href) => (words.KEY_PAGES.test(decodeURIComponent(new URL(href).pathname)) ? 0 : 1);
queue.sort((a, b) => key(a) - key(b) || depth(a) - depth(b));

const remaining = queue.slice(0, maxPages - 1);
if (queue.length > remaining.length) {
    warnings.push(`the site has at least ${queue.length + 1} pages; stopped at the cap of ${maxPages}`);
}
if (!site.sitemap_xml && !urlsFile) {
    warnings.push('no sitemap: pages come from the home page links only — a site whose menu needs a click may be incomplete; pass --urls');
}

for (const [i, url] of remaining.entries()) {
    await wait(pause);
    await scrapePage(url, i + 1);
}

await browser.close();

// --- write ---------------------------------------------------------------------

site.pages = results.length;

const imageList = [...images.values()].map((image) => ({
    url: image.url,
    alt: image.alt,
    w: image.w,
    h: image.h,
    ...(image.type === 'img' ? { displayed_w: image.displayed_w } : {}),
    type: image.type,
    found_on: image.found_on,
    // Sizes of CSS backgrounds aren't known; the flag says nothing for them.
    probably_small: image.type === 'img' && image.w != null && image.w < 400,
    // Decided by the content-extractor: the business's own image, or stock.
    client_specific: null,
}));

const summary = {
    site: bareHost(start.hostname),
    start_url: start.href,
    scraped_at: new Date().toISOString(),
    scraper: `${AGENT}/${VERSION}`,
    max_pages: maxPages,
    pages_attempted: results.length,
    pages_succeeded: results.filter((r) => r.ok).length,
    pages: results,
    warnings,
};

const json = (file, data) => writeFileSync(join(out, file), JSON.stringify(data, null, 2) + '\n');
json('images.json', imageList);
json('audit-raw.json', { site, pages: auditPages });
json('summary.json', summary);

const escape = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const rows = results.map((r) => `<tr class="${r.ok ? '' : 'failed'}">
  <td>${escape(r.name)}<br><a href="${escape(r.url)}">${escape(r.url)}</a></td>
  <td>${r.ok ? escape(r.title) : `<strong>${escape(r.error)}</strong>`}</td>
  <td>${r.ok && screenshots && existsSync(join(out, 'screenshots', `${r.name}-desktop.png`)) ? `<a href="screenshots/${escape(r.name)}-desktop.png"><img src="screenshots/${escape(r.name)}-desktop.png" alt="" loading="lazy"></a>` : ''}</td>
  <td>${r.ok && screenshots && existsSync(join(out, 'screenshots', `${r.name}-mobile.png`)) ? `<a href="screenshots/${escape(r.name)}-mobile.png"><img class="m" src="screenshots/${escape(r.name)}-mobile.png" alt="" loading="lazy"></a>` : ''}</td>
  <td>${r.ok ? `<a href="text/${escape(r.name)}.txt">text</a>` : ''}</td>
</tr>`).join('\n');

writeFileSync(join(out, 'overview.html'), `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Scrape of ${escape(summary.site)}</title>
<style>
body{font:14px/1.4 system-ui,sans-serif;margin:24px;color:#222;background:#fff}
table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #ddd;padding:8px;vertical-align:top;text-align:left}
img{width:240px;max-height:360px;object-fit:cover;object-position:top;border:1px solid #ccc}img.m{width:90px}
tr.failed{background:#fff3f3}.warn{background:#fff8e1;padding:8px 12px;border-radius:6px}
</style></head><body>
<h1>${escape(summary.site)} — ${summary.pages_succeeded} of ${summary.pages_attempted} pages</h1>
<p>Scraped ${escape(summary.scraped_at)} · cap ${maxPages} · ${imageList.length} images · sitemap ${site.sitemap_xml ? 'yes' : 'no'} · robots.txt ${site.robots_txt ? 'yes' : 'no'}</p>
${warnings.length ? `<div class="warn">${warnings.map(escape).join('<br>')}</div>` : ''}
<table><tr><th>Page</th><th>Title</th><th>Desktop</th><th>Mobile</th><th></th></tr>
${rows}
</table></body></html>
`);

console.log(JSON.stringify({
    site: summary.site,
    pages_attempted: summary.pages_attempted,
    pages_succeeded: summary.pages_succeeded,
    images: imageList.length,
    skipped_by_robots: site.skipped_by_robots.length,
    warnings,
    output: out,
}, null, 2));

// Not process.exit(): on Windows it can crash while fetch's sockets close.
process.exitCode = results[0].ok ? 0 : 1;

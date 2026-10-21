// Scraper tests. An invented site on a local server only — never a real
// website.   Run: node --test skills/cold-webcrafter/scripts/scraper/test/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { deflateSync } from 'node:zlib';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseRobots } from '../lib/robots.mjs';
import { pageKey, pageUrl, parseSitemap, slugFor } from '../lib/urls.mjs';

const SCRAPER = join(dirname(dirname(fileURLToPath(import.meta.url))), 'scrape.mjs');

// --- unit: robots, urls, sitemap -------------------------------------------

test('robots: groups, longest match, wildcards, own agent before *', () => {
    const robots = parseRobots([
        'User-agent: *',
        'Disallow: /private/',
        'Allow: /private/press/',
        'Disallow: /*.pdf$',
        'Disallow: /search?',
        '',
        'User-agent: otherbot',
        'Disallow: /',
        'Sitemap: https://example.test/sitemap_index.xml',
    ].join('\n'));

    const ok = (path) => robots.allowed(`https://example.test${path}`);
    assert.equal(ok('/'), true);
    assert.equal(ok('/private/team'), false);
    assert.equal(ok('/private/press/kit'), true, 'longer Allow wins');
    assert.equal(ok('/files/price.pdf'), false);
    assert.equal(ok('/files/price.pdf.html'), true, '$ anchors the end');
    assert.equal(ok('/search?q=x'), false);
    assert.deepEqual(robots.sitemaps, ['https://example.test/sitemap_index.xml']);

    const own = parseRobots('User-agent: *\nDisallow:\n\nUser-agent: cold-webcrafter\nDisallow: /', 'cold-webcrafter');
    assert.equal(own.allowed('https://example.test/'), false, 'a group naming the agent replaces *');
    assert.equal(parseRobots('').allowed('https://example.test/x'), true);

    assert.equal(parseRobots('User-agent: *\nCrawl-delay: 10\nDisallow: /x').crawlDelaySeconds, 10);
    assert.equal(parseRobots('User-agent: otherbot\nCrawl-delay: 30').crawlDelaySeconds, null, 'only the group that applies');
});

test('urls: same site only, no files, stable keys and slugs', () => {
    const base = 'https://www.example.test/';
    assert.equal(pageUrl('/services/#top', base, 'www.example.test'), 'https://www.example.test/services/');
    assert.equal(pageUrl('https://example.test/contact', base, 'www.example.test'), 'https://example.test/contact', 'www and bare host are one site');
    assert.equal(pageUrl('https://other.test/', base, 'www.example.test'), null);
    assert.equal(pageUrl('/price-list.pdf', base, 'www.example.test'), null);
    assert.equal(pageUrl('mailto:info@example.test', base, 'www.example.test'), null);

    assert.equal(pageKey('https://www.example.test/services/'), pageKey('http://example.test/services'));
    assert.equal(pageKey('https://example.test/index.html'), pageKey('https://example.test/'));
    assert.equal(pageKey('https://example.test/about/index.php'), pageKey('https://example.test/about/'));
    assert.equal(slugFor('https://example.test/'), 'home');
    assert.equal(slugFor('https://example.test/služby/kuchyně.html'), 'sluzby-kuchyne');
    assert.equal(slugFor('https://example.test/a b/ü'), 'a_b-u');
});

test('sitemap: urlset, index and CDATA', () => {
    const index = parseSitemap('<sitemapindex><sitemap><loc>https://example.test/pages-sitemap.xml</loc></sitemap></sitemapindex>');
    assert.equal(index.isIndex, true);
    assert.deepEqual(index.locs, ['https://example.test/pages-sitemap.xml']);

    const set = parseSitemap('<urlset><url><loc><![CDATA[https://example.test/?a=1&amp;b=2]]></loc></url><url><loc> https://example.test/x </loc></url></urlset>');
    assert.equal(set.isIndex, false);
    assert.deepEqual(set.locs, ['https://example.test/?a=1&b=2', 'https://example.test/x']);
});

// --- integration: an invented site ------------------------------------------

function png(width, height) {
    const crc = (buf) => {
        let c = ~0;
        for (const byte of buf) {
            c ^= byte;
            for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
        }
        return ~c >>> 0;
    };
    const chunk = (type, data) => {
        const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
        const out = Buffer.alloc(body.length + 8);
        out.writeUInt32BE(data.length, 0);
        body.copy(out, 4);
        out.writeUInt32BE(crc(body), body.length + 4);
        return out;
    };
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
    ihdr[8] = 8; ihdr[9] = 2; // 8-bit RGB
    const row = Buffer.alloc(1 + width * 3, 0x80);
    row[0] = 0;
    const raw = Buffer.concat(Array.from({ length: height }, () => row));
    return Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0)),
    ]);
}

const layout = (title, body, { description = null, head = '' } = {}) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>${description ? `<meta name="description" content="${description}">` : ''}${head}</head>
<body><nav id="menu"><a href="/">Home</a> <a href="/services/">Services</a> <a href="/contact/">Contact</a></nav>
${body}
<footer>Example Joinery Ltd · © 2015 Example Joinery</footer></body></html>`;

const IMAGES = { '/img/workshop.png': png(1600, 900), '/img/thumb.png': png(300, 200), '/img/bg.png': png(40, 40) };

const PAGES = {
    '/': layout('Example Joinery — kitchens made to measure', `
<div id="cookies">We use cookies. <button onclick="document.getElementById('cookies').remove();document.cookie='ok=1'">Accept all</button></div>
<h1>Kitchens made to measure</h1>
<p>More than 20 years of craft, 450+ clients served.</p>
<a href="/contact/">Request a quote</a> <a href="tel:+000000000">Call</a>
<img src="/img/workshop.png" alt="Our workshop" width="800" style="max-width:100%;height:auto">
<img src="/img/thumb.png">
<div style="height:2200px"></div>
<div style="background-image:url('/img/bg.png');height:40px"></div>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"LocalBusiness","name":"Example Joinery"}</script>
<script>const a=document.createElement('a');a.href='/references/';a.textContent='References';document.getElementById('menu').append(a);</script>`,
    { description: 'Joinery workshop — kitchens, wardrobes, stairs.' }),
    '/services/': layout('Services', '<h1>Services</h1><div style="width:600px">Kitchens · Wardrobes · Stairs</div>'),
    '/contact/': layout('Contact', '<h1>Contact</h1><form><input name="email"><button>Send</button></form><iframe data-src="https://www.google.com/maps/embed?pb=x" title="map"></iframe>'),
    '/about/': layout('About', '<h1>About</h1><p>Lorem ipsum dolor sit amet.</p>'),
    '/references/': layout('References', '<h1>References</h1><p>What our customers say.</p>'),
    '/blog/2020/old-post/': layout('Old post', '<h1>Old post</h1>'),
    '/private/admin/': layout('Admin', '<h1>Secret</h1>'),
};

function serveSite() {
    return new Promise((resolve) => {
        const server = createServer((req, res) => {
            const base = `http://127.0.0.1:${server.address().port}`;
            const path = req.url.split('?')[0];
            if (path === '/robots.txt') {
                res.writeHead(200, { 'content-type': 'text/plain' });
                res.end(`User-agent: *\nDisallow: /private/\nSitemap: ${base}/sitemap_index.xml\n`);
            } else if (path === '/sitemap_index.xml') {
                res.writeHead(200, { 'content-type': 'application/xml' });
                res.end(`<sitemapindex><sitemap><loc>${base}/pages-sitemap.xml</loc></sitemap></sitemapindex>`);
            } else if (path === '/pages-sitemap.xml') {
                const urls = ['/', '/blog/2020/old-post/', '/services/', '/contact/', '/about/', '/gone/', '/private/admin/', '/brochure.pdf'];
                res.writeHead(200, { 'content-type': 'application/xml' });
                res.end(`<urlset>${urls.map((u) => `<url><loc>${base}${u}</loc></url>`).join('')}</urlset>`);
            } else if (IMAGES[path]) {
                res.writeHead(200, { 'content-type': 'image/png' });
                res.end(IMAGES[path]);
            } else if (PAGES[path]) {
                res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
                res.end(PAGES[path]);
            } else {
                res.writeHead(404, { 'content-type': 'text/html' });
                res.end('<h1>Not found</h1>');
            }
        });
        server.listen(0, '127.0.0.1', () => resolve(server));
    });
}

function scrape(args, cwd) {
    return new Promise((resolve) => {
        const child = spawn(process.execPath, [SCRAPER, ...args], { cwd });
        let stdout = '';
        let stderr = '';
        child.stdout.on('data', (d) => { stdout += d; });
        child.stderr.on('data', (d) => { stderr += d; });
        child.on('close', (code) => resolve({ code, stdout, stderr }));
    });
}

const read = (dir, file) => JSON.parse(readFileSync(join(dir, 'sources', file), 'utf8'));

test('scrapes an invented site end to end', { timeout: 240000 }, async () => {
    const server = await serveSite();
    const dir = mkdtempSync(join(tmpdir(), 'cwc-scrape-'));
    mkdirSync(join(dir, 'sources', 'text'), { recursive: true });
    writeFileSync(join(dir, 'sources', 'lighthouse-before.json'), '{}');
    writeFileSync(join(dir, 'sources', 'text', 'my-notes.txt'), 'keep');
    const url = `http://127.0.0.1:${server.address().port}/`;

    const run = await scrape([url, '--max-pages', '10', '--delay', '0'], dir);
    server.close();
    assert.equal(run.code, 0, run.stderr + run.stdout);

    const summary = read(dir, 'summary.json');
    const names = summary.pages.map((p) => p.name);
    assert.equal(names[0], '01-home');
    assert.ok(names.includes('07-blog-2020-old-post') || names.at(-1).endsWith('blog-2020-old-post'), 'deep pages come last');
    assert.equal(summary.pages_attempted, 7, names.join(', '));
    assert.equal(summary.pages_succeeded, 6);
    assert.match(summary.pages.find((p) => p.url.endsWith('/gone/')).error, /HTTP 404/);
    assert.ok(summary.pages.some((p) => p.url.endsWith('/references/')), 'links added by JavaScript are found');

    const audit = read(dir, 'audit-raw.json');
    assert.equal(audit.site.robots_txt, true);
    assert.equal(audit.site.sitemap_xml, true);
    assert.deepEqual(audit.site.skipped_by_robots, [`${url}private/admin/`]);
    assert.equal(audit.pages.length, 6, 'only successful pages are audited');

    const home = audit.pages.find((p) => p.name === '01-home').audit;
    assert.equal(home.cta_above_fold, true);
    assert.ok(home.cta_texts.includes('Request a quote'));
    assert.equal(home.phone_clickable, true);
    assert.equal(home.copyright_year, 2015);
    assert.ok(home.numbers_in_text.some((n) => n.startsWith('20 years')), home.numbers_in_text.join(' | '));
    assert.ok(home.structured_data.includes('LocalBusiness'));
    assert.equal(home.h1_count, 1);
    assert.equal(home.images_without_alt, 1);
    assert.equal(home.images_oversized, 0);
    assert.equal(home.mobile_horizontal_overflow, false);

    const page = (slug) => audit.pages.find((p) => p.name.endsWith(slug)).audit;
    assert.equal(page('about').placeholder_leftovers, true);
    assert.equal(page('about').description, null, 'missing meta description is null');
    assert.equal(page('services').mobile_horizontal_overflow, true);
    assert.equal(page('contact').map, true);
    assert.equal(page('contact').forms, 1);
    assert.equal(page('references').mentions_references, true);

    const images = read(dir, 'images.json');
    const workshop = images.find((i) => i.url.endsWith('/img/workshop.png'));
    assert.deepEqual([workshop.w, workshop.h, workshop.alt, workshop.probably_small], [1600, 900, 'Our workshop', false]);
    assert.equal(workshop.displayed_w, 800);
    assert.equal(workshop.client_specific, null);
    assert.equal(images.find((i) => i.url.endsWith('/img/thumb.png')).probably_small, true);
    const bg = images.find((i) => i.url.endsWith('/img/bg.png'));
    assert.deepEqual([bg.type, bg.w, bg.probably_small], ['background', null, false]);

    const text = readFileSync(join(dir, 'sources', 'text', '01-home.txt'), 'utf8');
    assert.match(text, new RegExp(`^URL: ${url}\nTITLE: Example Joinery`));
    assert.match(text, /\n={60}\n/);
    assert.match(text, /Kitchens made to measure/);
    assert.doesNotMatch(text, /We use cookies/, 'cookie banner is accepted before the text is taken');

    for (const file of ['01-home-desktop.png', '01-home-desktop-top.png', '01-home-mobile.png', '01-home-mobile-top.png', '02-services-mobile.png']) {
        assert.ok(existsSync(join(dir, 'sources', 'screenshots', file)), file);
    }
    assert.match(readFileSync(join(dir, 'sources', 'overview.html'), 'utf8'), /6 of 7 pages/);
    assert.ok(existsSync(join(dir, 'sources', 'lighthouse-before.json')), 'other files in the folder stay');
    assert.ok(existsSync(join(dir, 'sources', 'text', 'my-notes.txt')), 'files the scraper did not write stay');
});

test('the page cap keeps shallow pages and says the site is bigger', { timeout: 120000 }, async () => {
    const server = await serveSite();
    const dir = mkdtempSync(join(tmpdir(), 'cwc-scrape-'));
    const url = `http://127.0.0.1:${server.address().port}/`;

    const run = await scrape([url, '--max-pages', '3', '--delay', '0', '--no-screenshots'], dir);
    server.close();
    assert.equal(run.code, 0, run.stderr);

    const summary = read(dir, 'summary.json');
    assert.deepEqual(summary.pages.map((p) => p.name), ['01-home', '02-services', '03-contact']);
    assert.ok(summary.warnings.some((w) => w.includes('stopped at the cap of 3')));
    assert.ok(!existsSync(join(dir, 'sources', 'screenshots')));
});

test('stops when robots.txt can\'t be read', { timeout: 60000 }, async () => {
    const server = createServer((req, res) => { res.writeHead(503); res.end(); });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const dir = mkdtempSync(join(tmpdir(), 'cwc-scrape-'));
    const run = await scrape([`http://127.0.0.1:${server.address().port}/`, '--delay', '0'], dir);
    server.close();
    assert.equal(run.code, 1);
    assert.match(run.stderr, /robots\.txt .* couldn't be read \(HTTP 503\)/);
});

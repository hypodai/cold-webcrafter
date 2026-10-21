#!/usr/bin/env node
/*
 * Turns the built site into a static preview that is safe to deploy.
 *
 * Works with any stack:
 *   --from-dir <build output>   a static generator's output (dist/, _site/…)
 *   --from-url <http://host:port>  crawls a running local server (for
 *                               server-rendered stacks) and saves every
 *                               same-origin page and asset it links to
 *
 *   node export-preview.mjs --from-dir dist [--out preview] [--host vercel]
 *        [--redirects redirects.json] [--origin http://localhost:4321]
 *   node export-preview.mjs --from-url http://127.0.0.1:8000 [--paths /a,/b]
 *
 * Then, on every page:
 *  - absolute URLs of the local server become root-relative,
 *  - <meta name="robots" content="noindex, nofollow"> is set — a preview of
 *    a stranger's site must never compete with their live site in search,
 *  - robots.txt disallows everything,
 *  - --host vercel|netlify|cloudflare adds the host's header file
 *    (X-Robots-Tag) and redirect rules from --redirects
 *    ([{"from": "/old.html", "to": "/services#roofs"}]).
 *
 * Fails (exit 1) when a page still points at a dev server (localhost,
 * a Vite client): such a preview deploys as bare text and still returns
 * 200. The host's link folders (.vercel, .netlify, .wrangler) in the
 * output survive a re-export, so the next deploy goes to the same project.
 */
import { cpSync, existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, rmdirSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';

const args = process.argv.slice(2);
const option = (name, fallback) => {
    const at = args.indexOf(name);
    return at === -1 ? fallback : args[at + 1];
};

const fromDir = option('--from-dir');
const fromUrl = option('--from-url');
const out = resolve(option('--out', 'preview'));
const host = option('--host', 'other');
const redirectsFile = option('--redirects');
const extraPaths = (option('--paths', '') || '').split(',').map((p) => p.trim()).filter(Boolean);
const origins = [option('--origin'), fromUrl && new URL(fromUrl).origin].filter(Boolean);

const KEEP = new Set(['.vercel', '.netlify', '.wrangler', '.env.local']);
// Written into every export; only a folder carrying it is ever cleared.
const MARKER = '.cold-webcrafter-preview';
const MAX_FILES = 3000;
const ROBOTS_META = '<meta name="robots" content="noindex, nofollow">';
const DEV_LEFTOVERS = /\b(?:localhost|127\.0\.0\.1|0\.0\.0\.0)(?::\d+)?|@vite\/client|:5173\b/;

if (!fromDir === !fromUrl || !['vercel', 'netlify', 'cloudflare', 'other'].includes(host)) {
    console.error('usage: export-preview.mjs (--from-dir <dir> | --from-url <url>) [--out preview] '
        + '[--host vercel|netlify|cloudflare|other] [--redirects file.json] [--origin url] [--paths /a,/b]');
    process.exit(2);
}

const warnings = [];
const errors = [];

// --- prepare the output folder ------------------------------------------

if (fromDir && (!existsSync(fromDir) || !statSync(fromDir).isDirectory())) {
    console.error(`${fromDir} is not a folder — build the site first`);
    process.exit(1);
}

// Never clear the project itself, a filesystem root, or the build output.
const source = fromDir && resolve(fromDir);
if (out === resolve('.') || out === dirname(out) || (source && (out === source || out.startsWith(source + sep)))) {
    console.error(`refusing to export into ${out}`);
    process.exit(2);
}

// The output folder is replaced on every export — but only if this script
// created it. A folder with other files and no marker is refused, so a
// mistyped --out can't wipe anything else.
function removeTree(path) {
    if (lstatSync(path).isDirectory()) {
        for (const entry of readdirSync(path)) removeTree(join(path, entry));
        rmdirSync(path);
    } else {
        unlinkSync(path);
    }
}

mkdirSync(out, { recursive: true });
const previous = readdirSync(out).filter((entry) => !KEEP.has(entry) && entry !== MARKER);
if (previous.length && !existsSync(join(out, MARKER))) {
    console.error(`${out} has files this script didn't write — choose another --out or empty the folder yourself`);
    process.exit(2);
}
for (const entry of previous) removeTree(join(out, entry));
writeFileSync(join(out, MARKER), 'Written by cold-webcrafter export-preview.mjs. This folder is replaced on every export.\n');

function inside(file) {
    const target = resolve(out, file);
    if (target !== out && !target.startsWith(out + sep)) throw new Error(`path escapes the output: ${file}`);
    return target;
}

// --- copy or crawl --------------------------------------------------------

async function crawl(start) {
    const origin = new URL(start).origin;
    const queue = ['/', ...extraPaths];
    const seen = new Set(queue);
    let saved = 0;

    const enqueue = (raw, base) => {
        if (/^(?:mailto:|tel:|data:|javascript:|#)/i.test(raw)) return;
        let url;
        try { url = new URL(raw.trim(), base); } catch { return; }
        if (url.origin !== origin) return;
        if (url.search) {
            warnings.push(`skipped ${url.pathname}${url.search} — query URLs can't be static; give the stack static paths (e.g. /news/page/2/)`);
            return;
        }
        if (!seen.has(url.pathname)) {
            seen.add(url.pathname);
            queue.push(url.pathname);
        }
    };

    while (queue.length && saved < MAX_FILES) {
        const path = queue.shift();
        const response = await fetch(origin + path, { redirect: 'manual', signal: AbortSignal.timeout(30000) });

        if (response.status >= 300 && response.status < 400) {
            warnings.push(`${path} redirects to ${response.headers.get('location')} — add it to --redirects`);
            continue;
        }
        if (!response.ok) {
            errors.push(`${path} answered ${response.status} (linked from the site)`);
            continue;
        }

        const type = (response.headers.get('content-type') ?? '').split(';')[0].trim();
        const isHtml = type === 'text/html';
        const buf = Buffer.from(await response.arrayBuffer());

        let file = decodeURIComponent(path);
        if (isHtml) file = file.endsWith('/') ? `${file}index.html` : extname(file) ? file : `${file}/index.html`;
        else if (file.endsWith('/')) file += 'index';

        const target = inside(`.${file}`);
        mkdirSync(dirname(target), { recursive: true });
        writeFileSync(target, buf);
        saved++;

        if (isHtml || type === 'text/css') {
            const text = buf.toString('utf8');
            const base = origin + path;
            for (const [, link] of text.matchAll(/(?:href|src|poster)\s*=\s*["']([^"']+)["']/gi)) enqueue(link, base);
            for (const [, set] of text.matchAll(/srcset\s*=\s*["']([^"']+)["']/gi)) {
                for (const candidate of set.split(',')) enqueue(candidate.trim().split(/\s+/)[0], base);
            }
            for (const [, link] of text.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/gi)) enqueue(link, base);
        }
    }

    if (queue.length) warnings.push(`stopped at ${MAX_FILES} files; ${queue.length} URLs not exported`);
}

if (fromDir) {
    cpSync(fromDir, out, { recursive: true });
} else {
    try {
        await crawl(fromUrl);
    } catch (error) {
        console.error(`crawl failed: ${error.message} — is the server running at ${fromUrl}?`);
        process.exit(1);
    }
}

// --- post-process ---------------------------------------------------------

function* walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (KEEP.has(entry.name) || entry.name === MARKER) continue;
        const full = join(dir, entry.name);
        if (entry.isDirectory()) yield* walk(full);
        else yield full;
    }
}

function rewriteOrigins(text) {
    for (const origin of origins) {
        const escaped = origin.replace(/\//g, '\\/');
        text = text.split(`${origin}/`).join('/').split(origin).join('/')
            .split(`${escaped}\\/`).join('\\/').split(escaped).join('\\/');
    }
    return text;
}

function setRobotsMeta(html) {
    html = html.replace(/<meta[^>]+name\s*=\s*["']robots["'][^>]*>\s*/gi, '');
    return /<head[^>]*>/i.test(html)
        ? html.replace(/<head[^>]*>/i, (head) => `${head}\n${ROBOTS_META}`)
        : `${ROBOTS_META}\n${html}`;
}

let pages = 0;
let files = 0;
for (const file of walk(out)) {
    files++;
    const ext = extname(file).toLowerCase();
    if (!['.html', '.htm', '.css', '.js', '.mjs', '.json', '.xml', '.txt'].includes(ext)) continue;

    let text = rewriteOrigins(readFileSync(file, 'utf8'));
    if (ext === '.html' || ext === '.htm') {
        text = setRobotsMeta(text);
        pages++;
    }
    writeFileSync(file, text);

    if (DEV_LEFTOVERS.test(text)) {
        errors.push(`${relative(out, file)} still points at a dev server (${text.match(DEV_LEFTOVERS)[0]}) — `
            + 'rebuild for production (remove dev-server leftover files) and export again');
    }
}

if (pages === 0) errors.push('no HTML pages in the export');

writeFileSync(join(out, 'robots.txt'), 'User-agent: *\nDisallow: /\n');

// --- host files -----------------------------------------------------------

const redirects = redirectsFile ? JSON.parse(readFileSync(redirectsFile, 'utf8')) : [];
if (!Array.isArray(redirects) || redirects.some((r) => !r.from || !r.to)) {
    console.error('--redirects must be a JSON array of {"from": "/old", "to": "/new"}');
    process.exit(2);
}

if (host === 'vercel') {
    const file = join(out, 'vercel.json');
    const config = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};
    config.headers = [...(config.headers ?? []), {
        source: '/(.*)', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
    }];
    config.redirects = [...(config.redirects ?? []),
        ...redirects.map((r) => ({ source: r.from, destination: r.to, permanent: true }))];
    writeFileSync(file, JSON.stringify(config, null, 2) + '\n');
} else if (host === 'netlify' || host === 'cloudflare') {
    const append = (name, text) => {
        const file = join(out, name);
        writeFileSync(file, (existsSync(file) ? readFileSync(file, 'utf8') + '\n' : '') + text);
    };
    append('_headers', '/*\n  X-Robots-Tag: noindex, nofollow\n');
    if (redirects.length) append('_redirects', redirects.map((r) => `${r.from} ${r.to} 301`).join('\n') + '\n');
} else if (redirects.length) {
    warnings.push('redirects given but --host is "other": configure them on the host by hand');
}

console.log(JSON.stringify({ out, files, pages, host, redirects: redirects.length, warnings, errors }, null, 2));
process.exit(errors.length ? 1 : 0);

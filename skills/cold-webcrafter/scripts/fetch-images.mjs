#!/usr/bin/env node
/*
 * Downloads the original images chosen for the new site and logs failures.
 *
 * Some image URLs of an old site return 404 or an HTML error page; the site
 * then needs a branded placeholder and the backlog needs a line. This
 * script makes that visible instead of leaving a broken file behind.
 *
 *   node fetch-images.mjs <list.json> <output-dir> [--delay 300]
 *
 * <list.json> is an array of {"url": "...", "name": "hero-workshop"} or of
 * plain URL strings (then the name comes from the URL). Writes the images
 * and `_downloads.json` (url, file, ok, status, error, bytes, width,
 * height). Dimensions are read from the file header for PNG, JPEG, GIF and
 * WebP, so the design can check resolution without opening images.
 *
 * Downloads run one at a time with a pause — it's a stranger's server.
 */
import './lib/env-proxy.mjs';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import { imageSize } from './lib/image-size.mjs';

const args = process.argv.slice(2);
let delay = 300;
const positional = [];

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--delay') {
        delay = Number(args[++i]);
    } else {
        positional.push(args[i]);
    }
}

const [listFile, outDir] = positional;

if (!listFile || !outDir) {
    console.error('usage: fetch-images.mjs <list.json> <output-dir> [--delay ms]');
    process.exit(2);
}

const USER_AGENT = 'Mozilla/5.0 (compatible; cold-webcrafter image fetch)';
const TIMEOUT_MS = 20000;

const EXTENSIONS = {
    'image/jpeg': '.jpg', 'image/png': '.png', 'image/gif': '.gif',
    'image/webp': '.webp', 'image/avif': '.avif', 'image/svg+xml': '.svg',
};

function slug(text) {
    return text.normalize('NFKD').replace(/[̀-ͯ]/g, '')
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'image';
}

function nameFromUrl(url) {
    const last = decodeURIComponent(new URL(url).pathname.split('/').filter(Boolean).pop() ?? 'image');
    return slug(last.replace(/\.[a-z0-9]+$/i, ''));
}

async function download(entry, used) {
    const { url, name } = typeof entry === 'string' ? { url: entry } : entry;
    const result = { url, file: null, ok: false, status: null, error: null, bytes: 0, width: null, height: null };

    try {
        const response = await fetch(url, {
            headers: { 'User-Agent': USER_AGENT },
            redirect: 'follow',
            signal: AbortSignal.timeout(TIMEOUT_MS),
        });
        result.status = response.status;

        const type = (response.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        // An error page served with status 200 is the common silent failure.
        if (!type.startsWith('image/')) throw new Error(`not an image (${type || 'no content-type'})`);

        const buf = Buffer.from(await response.arrayBuffer());
        if (buf.length === 0) throw new Error('empty file');

        const ext = EXTENSIONS[type] ?? (extname(new URL(url).pathname).toLowerCase() || '.img');
        let base = name ? slug(name) : nameFromUrl(url);
        for (let n = 2; used.has(base + ext); n++) base = `${base.replace(/-\d+$/, '')}-${n}`;
        used.add(base + ext);

        writeFileSync(join(outDir, base + ext), buf);
        Object.assign(result, { file: base + ext, ok: true, bytes: buf.length, ...imageSize(buf) });
    } catch (error) {
        result.error = error.name === 'TimeoutError' ? `timeout after ${TIMEOUT_MS / 1000} s` : error.message;
    }

    return result;
}

const list = JSON.parse(readFileSync(listFile, 'utf8'));
if (!Array.isArray(list)) {
    console.error('the list must be a JSON array');
    process.exit(2);
}

mkdirSync(outDir, { recursive: true });

const used = new Set();
const results = [];
for (const [index, entry] of list.entries()) {
    if (index > 0) await new Promise((resolve) => setTimeout(resolve, delay));
    results.push(await download(entry, used));
}

writeFileSync(join(outDir, '_downloads.json'), JSON.stringify(results, null, 2) + '\n');

const failed = results.filter((r) => !r.ok);
console.log(JSON.stringify({
    requested: results.length,
    downloaded: results.length - failed.length,
    failed: failed.map((r) => ({ url: r.url, error: r.error })),
    under_800px: results.filter((r) => r.ok && r.width != null && r.width < 800).length,
    log: join(outDir, '_downloads.json'),
}, null, 2));

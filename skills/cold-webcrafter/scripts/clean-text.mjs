#!/usr/bin/env node
/*
 * Cuts the header and footer that repeat on every scraped page.
 *
 * Scraped text contains the menu, address, company ID, social links and a
 * copyright line on every page. A line counts as boilerplate when it
 * appears on most pages; it is removed only from the start and the end of
 * each page, so the same words inside real content stay.
 *
 *   node clean-text.mjs [sources/text] [sources/text-clean] [--threshold 0.6]
 *
 * Writes cleaned copies (the originals stay untouched) and
 * `_boilerplate.txt` with the removed lines, which the extractor uses once
 * for the site settings and the footer.
 *
 * Limits: boilerplate repeated inside a page (a footer under every item of
 * a listing) isn't detected — check listings by hand. With fewer than two
 * pages nothing can be detected and the text is copied as it is.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
let threshold = 0.6;
const positional = [];

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--threshold') {
        threshold = Number(args[++i]);
    } else {
        positional.push(args[i]);
    }
}

if (!(threshold > 0 && threshold <= 1)) {
    console.error('--threshold must be a number in (0, 1]');
    process.exit(2);
}

const [source = 'sources/text', target = 'sources/text-clean'] = positional;

// The scraper writes a few header lines, then a separator of '=' signs.
const SEPARATOR = /^={20,}$/;

function split(raw) {
    const lines = raw.split(/\r?\n/);
    const at = lines.findIndex((line) => SEPARATOR.test(line.trim()));

    return at === -1
        ? { head: [], body: lines }
        : { head: lines.slice(0, at + 1), body: lines.slice(at + 1) };
}

const normalise = (line) => line.trim().replace(/\s+/g, ' ');

const files = readdirSync(source).filter((f) => f.endsWith('.txt')).sort();

if (files.length === 0) {
    console.error(`no .txt files in ${source}`);
    process.exit(1);
}

const pages = files.map((file) => ({ file, ...split(readFileSync(join(source, file), 'utf8')) }));

// On how many pages does each line occur (counted once per page)?
const seen = new Map();
for (const page of pages) {
    for (const line of new Set(page.body.map(normalise).filter(Boolean))) {
        seen.set(line, (seen.get(line) ?? 0) + 1);
    }
}

const minimum = Math.max(2, Math.ceil(threshold * pages.length));
const boilerplate = new Set([...seen].filter(([, count]) => count >= minimum).map(([line]) => line));
const isNoise = (line) => !normalise(line) || boilerplate.has(normalise(line));

mkdirSync(target, { recursive: true });

let removedTotal = 0;
for (const page of pages) {
    let start = 0;
    let end = page.body.length;
    while (start < end && isNoise(page.body[start])) start++;
    while (end > start && isNoise(page.body[end - 1])) end--;

    const kept = page.body.slice(start, end);
    const removed = page.body.slice(0, start).concat(page.body.slice(end)).filter((l) => normalise(l)).length;
    removedTotal += removed;

    const text = [...page.head, '', ...kept].join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
    writeFileSync(join(target, page.file), text);
}

writeFileSync(join(target, '_boilerplate.txt'), [...boilerplate].join('\n') + '\n');

console.log(JSON.stringify({
    pages: pages.length,
    boilerplate_lines: boilerplate.size,
    lines_removed: removedTotal,
    output: target,
}, null, 2));

#!/usr/bin/env node
/*
 * Collects the old addresses each page replaces into one redirect list.
 *
 * Every page lists the original URLs it replaces in `redirects_from` — a
 * path, or {"from": "/old.html", "anchor": "boilers"} when an old sub-page
 * now lives as a section of this page (lite turns service sub-pages into
 * anchors on the services page). The output feeds export-preview.mjs
 * (--redirects) and the production host's rules.
 *
 *   node make-redirects.mjs [--content content] [--out content/redirects.json]
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const option = (name, fallback) => {
    const at = args.indexOf(name);
    return at === -1 ? fallback : args[at + 1];
};
const dir = option('--content', 'content');
const out = option('--out', join(dir, 'redirects.json'));

const pages = readdirSync(join(dir, 'pages')).filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(readFileSync(join(dir, 'pages', f), 'utf8')));

const pathOf = (page) => {
    const parts = [page.parent, page.slug].filter(Boolean);
    return parts.length ? `/${parts.join('/')}/` : '/';
};

const redirects = [];
const seen = new Map();
for (const page of pages) {
    for (const entry of page.redirects_from ?? []) {
        const { from, anchor } = typeof entry === 'string' ? { from: entry } : entry;
        if (!from?.startsWith('/')) throw new Error(`${pathOf(page)}: redirects_from entries must be paths starting with "/" (got ${JSON.stringify(entry)})`);
        const to = anchor ? `${pathOf(page)}#${anchor}` : pathOf(page);
        if (from === to) continue;
        if (seen.has(from) && seen.get(from) !== to) throw new Error(`${from} redirects to both ${seen.get(from)} and ${to}`);
        if (!seen.has(from)) redirects.push({ from, to });
        seen.set(from, to);
    }
}

writeFileSync(out, JSON.stringify(redirects, null, 2) + '\n');
console.log(`${redirects.length} redirects → ${out}`);

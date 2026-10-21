#!/usr/bin/env node
/*
 * Checks the content model before every build.
 *
 * Scope written only in the instructions erodes: a fourth page grows
 * quietly and nobody notices until it's built. Working notes from
 * subagents ("TODO", "not scraped") slip into content fields and end up on
 * the client's site. This catches both by code. Wire it into the build
 * (e.g. a `prebuild` script) so a broken scope fails the build.
 *
 *   node check-content.mjs --mode lite|full [--content content]
 *
 * Exit code 1 on errors; warnings don't fail. Extra note patterns can be
 * added in <content>/check.json: {"note_patterns": ["regex", ...],
 * "extra_blocks": ["block-type", ...]} — e.g. the "missing" word of the
 * site's language, or a new full-mode block recorded in an ADR.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const option = (name, fallback) => {
    const at = args.indexOf(name);
    return at === -1 ? fallback : args[at + 1];
};

const mode = option('--mode');
const dir = option('--content', 'content');

if (!['lite', 'full'].includes(mode)) {
    console.error('usage: check-content.mjs --mode lite|full [--content <dir>]');
    process.exit(2);
}

// Required fields per block, from references/blocks.md. A path ending in
// [] means "every item of that list".
const BLOCKS = {
    hero: ['heading'],
    services: ['items[].name'],
    about: [],
    text: [],
    list: ['items[].name'],
    breakdown: ['items[].name'],
    stats: ['items[].number', 'items[].label'],
    testimonials: ['items[].quote'],
    gallery: ['sections[].name'],
    news: [],
    cta: ['heading'],
    contact: [],
    form: [],
    faq: ['items[].question'],
    team: ['items[].name'],
    pricing: ['items[].name'],
    process: ['items[].name'],
    'partner-logos': ['items[].name'],
};

const NOTE_PATTERNS = [
    /\bTODO\b/i, /\bFIXME\b/i, /\bTBD\b/, /lorem ipsum/i, /\{\{[^}]*\}\}/,
    /your text here/i, /sample text/i, /placeholder/i, /not scraped/i,
    // Text addressed to an AI on the original site must never be carried over.
    /\bignore (?:all |any |your )?(?:previous|prior|earlier) (?:instructions|rules)\b/i,
    /\b(?:note|message) (?:to|for) (?:AI|LLM|language model|assistants?)\b/i,
];

const errors = [];
const warnings = [];

let config = {};
const configFile = join(dir, 'check.json');
if (existsSync(configFile)) config = JSON.parse(readFileSync(configFile, 'utf8'));
const notePatterns = [...NOTE_PATTERNS, ...(config.note_patterns ?? []).map((p) => new RegExp(p, 'i'))];
const knownBlocks = new Set([...Object.keys(BLOCKS), ...(config.extra_blocks ?? [])]);

const pagesDir = join(dir, 'pages');
if (!existsSync(pagesDir)) {
    console.error(`no ${pagesDir} folder`);
    process.exit(1);
}

const pages = [];
for (const file of readdirSync(pagesDir).filter((f) => f.endsWith('.json')).sort()) {
    try {
        pages.push({ file, ...JSON.parse(readFileSync(join(pagesDir, file), 'utf8')) });
    } catch (error) {
        errors.push(`${file}: invalid JSON (${error.message})`);
    }
}

function valuesAt(data, path) {
    const [head, ...rest] = path.split('.');
    if (head.endsWith('[]')) {
        const list = data?.[head.slice(0, -2)];
        if (!Array.isArray(list)) return [];
        return list.flatMap((item) => (rest.length ? valuesAt(item, rest.join('.')) : [item]));
    }
    return rest.length ? valuesAt(data?.[head], rest.join('.')) : [data?.[head]];
}

function* strings(value, path) {
    if (typeof value === 'string') yield [path, value];
    else if (Array.isArray(value)) for (const [i, v] of value.entries()) yield* strings(v, `${path}[${i}]`);
    else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) yield* strings(v, path ? `${path}.${k}` : k);
}

// --- scope -------------------------------------------------------------

if (mode === 'lite') {
    if (pages.length !== 3) {
        errors.push(`lite builds exactly 3 pages (home, services, contact); found ${pages.length}. `
            + 'A fourth page belongs in BACKLOG.md "Next phase" — or the project switches to full mode.');
    }
    for (const page of pages.filter((p) => p.parent != null)) {
        errors.push(`${page.file}: lite has no sub-pages (parent must be null). `
            + 'Turn detail pages into items of a services or breakdown block.');
    }
}

// --- pages and blocks --------------------------------------------------

const titles = new Map();
const descriptions = new Map();

for (const page of pages) {
    if (!page.slug && page.slug !== '') errors.push(`${page.file}: missing slug`);
    if (!page.title) errors.push(`${page.file}: missing title`);
    if (!page.description) warnings.push(`${page.file}: missing meta description`);
    if (page.title) titles.set(page.title, [...(titles.get(page.title) ?? []), page.file]);
    if (page.description) descriptions.set(page.description, [...(descriptions.get(page.description) ?? []), page.file]);

    const blocks = Array.isArray(page.blocks) ? page.blocks : [];
    if (blocks.length === 0) errors.push(`${page.file}: no blocks`);

    const heroes = blocks.filter((b) => b.type === 'hero').length;
    if (heroes > 1) warnings.push(`${page.file}: ${heroes} hero blocks — the page gets more than one H1`);

    for (const [i, block] of blocks.entries()) {
        const where = `${page.file} block ${i + 1} (${block.type ?? '?'})`;
        if (!knownBlocks.has(block.type)) {
            const message = `${where}: unknown block type`;
            if (mode === 'lite') errors.push(`${message} — lite uses only the standard set`);
            else warnings.push(`${message} — record it in an ADR and add it to ${configFile} "extra_blocks"`);
            continue;
        }
        for (const path of BLOCKS[block.type] ?? []) {
            for (const value of valuesAt(block.data ?? {}, path)) {
                if (value == null || (typeof value === 'string' && !value.trim())) {
                    errors.push(`${where}: required field ${path} is empty`);
                }
            }
        }
    }
}

for (const [title, files] of titles) if (files.length > 1) warnings.push(`duplicate title "${title}" in ${files.join(', ')}`);
for (const [, files] of descriptions) if (files.length > 1) warnings.push(`duplicate description in ${files.join(', ')}`);

// --- working notes and placeholders in any text ------------------------

const settingsFile = join(dir, 'site.json');
const sources = pages.map((p) => [p.file, p]);
if (existsSync(settingsFile)) sources.push(['site.json', JSON.parse(readFileSync(settingsFile, 'utf8'))]);
else warnings.push('no site.json (business name, contacts, footer)');

for (const [file, data] of sources) {
    for (const [path, text] of strings(data, '')) {
        const hit = notePatterns.find((pattern) => pattern.test(text));
        if (hit) errors.push(`${file} ${path}: looks like a working note or placeholder (${hit}) — "${text.slice(0, 80)}"`);
    }
}

// --- navigation --------------------------------------------------------

// A page is reachable by its slug or, when nested, by parent/slug.
const slugs = new Set(pages.flatMap((p) => [p.slug, p.parent ? `${p.parent}/${p.slug}` : p.slug]));
const navPages = pages.filter((p) => p.nav);
if (mode === 'lite' && navPages.length > 3) errors.push(`lite menu has ${navPages.length} items; it has three`);

for (const page of pages) {
    for (const [path, text] of strings(page.blocks ?? [], 'blocks')) {
        if (!/(^|\.)(link|cta_url|cta2_url|url)$/.test(path) || !text.startsWith('/')) continue;
        const target = text.split('#')[0].replace(/^\/|\/$/g, '');
        if (target && !slugs.has(target)) {
            errors.push(`${page.file} ${path}: internal link to /${target}, which is not a page in this build`);
        }
    }
}

console.log(JSON.stringify({ mode, pages: pages.length, errors, warnings }, null, 2));
process.exit(errors.length ? 1 : 0);

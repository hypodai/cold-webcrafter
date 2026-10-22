#!/usr/bin/env node
/*
 * Builds a zip for skill directories: dist/cold-webcrafter-<version>.zip
 * with the skill folder only — no tests, node_modules, lock files, evals or
 * repository docs. SKILL.md sits at the zip root.
 *
 *   node tools/package-skill.mjs
 *
 * The zip is made by `git archive` from the last commit, not from the working
 * tree: it works the same on every OS (no system `zip` needed), keeps LF line
 * endings (.gitattributes), and what's uploaded is exactly what's on GitHub.
 * Uncommitted changes in the skill folder are therefore refused.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, existsSync } from 'node:fs';

const SKILL = 'skills/cold-webcrafter';
const EXCLUDE = ['scripts/test', 'scripts/scraper/test', 'scripts/scraper/.npmrc'];

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trimEnd();

const { version } = JSON.parse(readFileSync('.claude-plugin/plugin.json', 'utf8'));
const out = `dist/cold-webcrafter-${version}.zip`;

const dirty = git('status', '--porcelain', '--untracked-files=no', '--', SKILL);
if (dirty) {
    console.error(`${SKILL} has uncommitted changes — commit them first, the zip is built from HEAD:\n${dirty}`);
    process.exit(1);
}

mkdirSync('dist', { recursive: true });
if (existsSync(out)) rmSync(out);
git('archive', '--format=zip', '-o', out, `HEAD:${SKILL}`, '--', '.', ...EXCLUDE.map((path) => `:(exclude)${path}`));

// Entry names from the zip's central directory — no `unzip` needed.
function entries(file) {
    const zip = readFileSync(file);
    const end = zip.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
    if (end === -1) throw new Error(`${file} is not a zip`);
    const names = [];
    let at = zip.readUInt32LE(end + 16);
    for (let i = zip.readUInt16LE(end + 10); i > 0; i--) {
        const nameLength = zip.readUInt16LE(at + 28);
        names.push(zip.toString('utf8', at + 46, at + 46 + nameLength));
        at += 46 + nameLength + zip.readUInt16LE(at + 30) + zip.readUInt16LE(at + 32);
    }
    return names;
}

const listing = entries(out);
console.log(`${out}: ${listing.length} entries, from ${git('rev-parse', '--short', 'HEAD')}`);
if (!listing.includes('SKILL.md')) throw new Error('SKILL.md missing at the zip root');
const unwanted = listing.filter((name) => /(?:^|\/)(?:test|node_modules)\/|package-lock\.json$|\.npmrc$/.test(name));
if (unwanted.length) throw new Error(`left out on purpose, yet in the zip: ${unwanted.join(', ')}`);

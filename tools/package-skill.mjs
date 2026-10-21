#!/usr/bin/env node
/*
 * Builds a zip for skill directories: dist/cold-webcrafter-<version>.zip
 * with the skill folder only — no tests, node_modules, lock files, evals or
 * repository docs. Uses the system `zip` (Info-ZIP).
 *
 *   node tools/package-skill.mjs
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, existsSync } from 'node:fs';

const { version } = JSON.parse(readFileSync('.claude-plugin/plugin.json', 'utf8'));
const out = `dist/cold-webcrafter-${version}.zip`;

mkdirSync('dist', { recursive: true });
if (existsSync(out)) rmSync(out);

execFileSync('zip', ['-r', '-X', `../../${out}`, '.',
    '-x', '*/node_modules/*', '*/test/*', '*package-lock.json', '*.DS_Store', '*/.npmrc',
], { cwd: 'skills/cold-webcrafter', stdio: 'inherit' });

const listing = execFileSync('unzip', ['-Z1', out], { encoding: 'utf8' }).trim().split('\n');
console.log(`\n${out}: ${listing.length} entries`);
if (!listing.includes('SKILL.md')) throw new Error('SKILL.md missing at the zip root');

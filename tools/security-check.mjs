#!/usr/bin/env node
/*
 * Pre-upload check of the skill folder against the kinds of things a
 * skill directory's security scan rejects: secrets, encoded or minified content,
 * dangerous commands, remote-code patterns, injection-style wording,
 * oversized files and an invalid SKILL.md. Run before every upload:
 *
 *   node tools/security-check.mjs
 *
 * It's a heuristic, not a guarantee — a finding means "look at it".
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = 'skills/cold-webcrafter';
const SKIP = new Set(['node_modules', 'test']);
const MAX_FILE = 200 * 1024;
const MAX_FILES = 150;

const CHECKS = [
    ['secret', /(?:api[_-]?key|secret|token|password)\s*[:=]\s*['"][^'"\s]{12,}['"]|sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{30,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----/i],
    ['encoded blob', /[A-Za-z0-9+/]{80,}={0,2}/],
    ['recursive delete', /rm\s+-r[f ]|rimraf|rmSync\([^)]*recursive|rm\(\s*[^)]*recursive/],
    ['remote code', /curl[^|\n]*\|\s*(?:ba)?sh|wget[^|\n]*\|\s*(?:ba)?sh|\beval\s*\(|new Function\s*\(|child_process[^\n]*\bexec\(/],
    ['system change', /\bsudo\b|chmod\s+777|\/etc\/(?:passwd|hosts|sudoers)|setx\s|reg\s+add/i],
    ['injection wording', /ignore (?:all |any )?(?:previous|prior|above) instructions|disregard (?:the|your) (?:system|previous)|you are now (?:in )?(?:developer|DAN)/i],
    ['unpinned install', /npx\s+(?:--yes\s+|-y\s+)?(?!playwright\b)[a-z@][\w./-]*(?<!@\d[\w.]*)\s|npm\s+(?:i|install)\s+-g/],
];

const findings = [];
const files = [];
(function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (SKIP.has(entry.name)) continue;
        const path = join(dir, entry.name);
        if (entry.isDirectory()) walk(path);
        else files.push(path);
    }
})(ROOT);

if (files.length > MAX_FILES) findings.push(`${files.length} files (over ${MAX_FILES})`);

for (const file of files) {
    const rel = relative(ROOT, file);
    const size = statSync(file).size;
    if (size > MAX_FILE) findings.push(`${rel}: ${Math.round(size / 1024)} kB (over ${MAX_FILE / 1024} kB)`);
    if (rel.endsWith('package-lock.json')) findings.push(`${rel}: lock files carry long hashes — leave them out of the upload`);
    const text = readFileSync(file, 'utf8');
    text.split(/\r?\n/).forEach((line, i) => {
        // The SKILL.md description is one long line by design (checked for its own limit below).
        const isDescription = rel === 'SKILL.md' && line.startsWith('description: ');
        if (line.length > 1000 && !isDescription) findings.push(`${rel}:${i + 1}: a ${line.length}-character line (minified?)`);
        for (const [name, pattern] of CHECKS) {
            if (pattern.test(line)) findings.push(`${rel}:${i + 1}: ${name} — ${line.trim().slice(0, 100)}`);
        }
    });
}

const skill = readFileSync(join(ROOT, 'SKILL.md'), 'utf8');
// CRLF is tolerated here so a checkout without .gitattributes isn't reported
// as a missing frontmatter.
const front = skill.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
if (!front) findings.push('SKILL.md: no YAML frontmatter');
else {
    const name = front[1].match(/^name:\s*(.+)$/m)?.[1]?.trim();
    const description = front[1].match(/^description:\s*(.+)$/m)?.[1]?.trim();
    if (!name || !/^[a-z0-9-]{1,64}$/.test(name)) findings.push(`SKILL.md: name "${name}" must be lowercase letters, digits and hyphens, at most 64`);
    if (!description) findings.push('SKILL.md: no description');
    else if (description.length > 1024) findings.push(`SKILL.md: description is ${description.length} characters (max 1024)`);
}

console.log(`${files.length} files checked`);
if (findings.length) {
    console.log(findings.map((f) => `- ${f}`).join('\n'));
    process.exit(1);
}
console.log('no findings');

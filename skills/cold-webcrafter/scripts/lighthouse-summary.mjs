#!/usr/bin/env node
/*
 * Prints the few numbers the skill uses from a Lighthouse JSON report.
 *
 * A report is often over 700 kB — far more than an agent should load. This
 * reads it outside the context and prints a dozen values, so it also works
 * where `jq` isn't installed.
 *
 *   node lighthouse-summary.mjs sources/lighthouse-before.json
 *   node lighthouse-summary.mjs before.json after.json     # adds a diff
 */
import { readFileSync } from 'node:fs';

const files = process.argv.slice(2);

if (files.length === 0 || files.length > 2) {
    console.error('usage: lighthouse-summary.mjs <report.json> [<after.json>]');
    process.exit(2);
}

function summarise(file) {
    const report = JSON.parse(readFileSync(file, 'utf8'));
    const score = (id) => {
        const value = report.categories?.[id]?.score;
        return value == null ? null : Math.round(value * 100);
    };
    const metric = (id, digits = 0) => {
        const value = report.audits?.[id]?.numericValue;
        return value == null ? null : Number(value.toFixed(digits));
    };

    return {
        file,
        url: report.finalDisplayedUrl ?? report.finalUrl ?? report.requestedUrl ?? null,
        measured_at: report.fetchTime ?? null,
        device: report.configSettings?.formFactor ?? null,
        lighthouse_version: report.lighthouseVersion ?? null,
        // A failed run still writes a report; its scores are null and
        // must not be quoted as the site's result.
        runtime_error: report.runtimeError?.code ?? null,
        scores: {
            performance: score('performance'),
            seo: score('seo'),
            accessibility: score('accessibility'),
            best_practices: score('best-practices'),
        },
        metrics: {
            lcp_ms: metric('largest-contentful-paint'),
            fcp_ms: metric('first-contentful-paint'),
            tbt_ms: metric('total-blocking-time'),
            speed_index_ms: metric('speed-index'),
            cls: metric('cumulative-layout-shift', 3),
            total_bytes: metric('total-byte-weight'),
        },
    };
}

function difference(before, after) {
    const diff = (a, b) => (a == null || b == null ? null : Number((b - a).toFixed(3)));
    const section = (key) => Object.fromEntries(
        Object.keys(before[key]).map((k) => [k, diff(before[key][k], after[key][k])]),
    );

    return { scores: section('scores'), metrics: section('metrics') };
}

const summaries = files.map(summarise);
const output = summaries.length === 2
    ? { before: summaries[0], after: summaries[1], difference: difference(...summaries) }
    : summaries[0];

console.log(JSON.stringify(output, null, 2));

/*
 * Node's fetch ignores HTTPS_PROXY unless NODE_USE_ENV_PROXY=1 is set
 * (Node 22.21+ / 24.5+). Behind a proxy every request would fail and look
 * like a site with no robots.txt, no sitemap and broken images. Importing
 * this module re-runs the current script once with the variable set.
 */
import { spawnSync } from 'node:child_process';

const proxied = process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy;

if (proxied && !process.env.NODE_USE_ENV_PROXY) {
    const run = spawnSync(process.execPath, process.argv.slice(1), {
        stdio: 'inherit',
        env: { ...process.env, NODE_USE_ENV_PROXY: '1', NODE_NO_WARNINGS: '1' },
    });
    process.exit(run.status ?? 1);
}

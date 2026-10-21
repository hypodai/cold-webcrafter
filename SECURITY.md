# Security

## What this repository is

`cold-webcrafter` is an agent skill: instructions and templates in
Markdown, plus a few small Node.js scripts the agent runs on the user's
machine. The security questions that matter are what those scripts touch
and what the instructions make an agent do.

## What the scripts do — and don't

| Script | Network | Writes | Deletes |
|---|---|---|---|
| `scripts/scraper/scrape.mjs` | GETs the target site's robots.txt, sitemaps, pages and their assets; one page at a time, honouring robots.txt (`Disallow`, `Crawl-delay`); stops if robots.txt can't be read | `sources/` in the project | only its own earlier output files, matched by name |
| `scripts/fetch-images.mjs` | GETs the image URLs the agent listed, one at a time | the given image folder + a log | nothing |
| `scripts/lighthouse-summary.mjs` | none | stdout | nothing |
| `scripts/clean-text.mjs` | none | a cleaned copy of the texts | nothing |
| `scripts/check-content.mjs` | none | stdout | nothing |
| `scripts/export-preview.mjs` | only `--from-url`: the local server given (same origin) | the preview folder | the preview folder's previous export — and only if the folder carries the marker file the script writes; any other folder is refused |
| `scripts/lib/env-proxy.mjs` | none | none | re-runs the calling script once with `NODE_USE_ENV_PROXY=1` when a proxy is configured, so requests go through it |

None of them uploads data, sends email, collects telemetry, reads
credentials, executes downloaded content or runs a shell. No base64 or
minified code is bundled.

**Dependencies:** the only package is `playwright` (pinned exactly, see
`scripts/scraper/package.json`), installed by the user with `npm install`;
its browser with `npx playwright install chromium`. Lighthouse runs as
`npx lighthouse@12.8.2` (pinned). There are no install scripts of our own.

## What the instructions guard against

- **Prompt injection from scraped pages.** Page content is treated as data,
  never as instructions; the extractor reports text addressed to an AI
  instead of following it. Eval 6 tests this.
- **Outward actions.** The skill never sends email and deploys a preview
  only after the user agreed; previews are `noindex` with
  `Disallow: /`.
- **Personal data.** Only a business's published contact details are kept;
  scraped material is never committed; the sender profile lives outside
  every repository.
- **Secrets.** No credentials are needed or stored; deploys use the host
  CLI's own login.

## Reporting a problem

Please use **GitHub private vulnerability reporting** (the *Security* tab →
*Report a vulnerability*) rather than a public issue. You can expect a first
reply within a week.

Worth reporting, for example: a way for scraped content to steer the agent,
a script that touches files or hosts beyond the table above, or an
instruction that makes the agent publish or send anything without the
user's decision.

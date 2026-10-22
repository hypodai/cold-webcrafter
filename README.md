# cold-webcrafter

[![test](https://github.com/hypodai/cold-webcrafter/actions/workflows/test.yml/badge.svg)](https://github.com/hypodai/cold-webcrafter/actions/workflows/test.yml)

An agent skill that turns an outdated small-business website into a modern
one — and into a reason for the owner to reply.

Give it a URL. It scrapes the site, rebuilds it with the business's own
content and identity, deploys a hidden preview, measures before and after,
and drafts a short cold email that contains only claims verified on the
original site. You check the draft and send it yourself.

> **Status:** pre-release 0.1.0. Evaluated on a real site (full, with the
> owner's consent) and on an invented one (lite, with and without the skill)
> — results in [`evals/RESULTS.md`](evals/RESULTS.md), an example in
> [`examples/`](examples/).

## Two modes

| | lite | full |
|---|---|---|
| For | the first cold email | the client said yes |
| Builds | 3 pages: home, services, contact | every page worth keeping |
| Scrapes | 8 pages | up to 60 |
| Writes | backlog, changelog, improvements, email draft | + page map, audit, ADRs |
| Typical cost | ~0.2–0.5 M tokens (measured) | ~1.5–6 M tokens (estimate) |

Lite is measured on an eval run; full is still partly an estimate.
A lite project continues as full in the same repository — the content model
is shared.

## What it asks

One message, every question with a default:

1. one site or a batch — default one; a batch comes with a warning that an
   entry-level subscription plan most likely won't cover several sites in
   one run (the run pauses at the usage limit and resumes later),
2. lite or full,
3. your stack and host — or it picks what fits and says why,
4. your sender profile (name, offer, price, signature, region) — stored
   once in your config folder, never in a project or in the skill,
5. languages of the site and the email,
6. full only: keep the structure or rebuild it,
7. may it deploy the preview (hidden from search engines).

Then it shows the plan, the token estimate and the recommended model and
reasoning effort per phase, asks once to confirm — and works to the end.

## What it never does

- send email, or put anything in your mailbox,
- invent services, numbers, references, prices or contacts,
- publish the preview without your agreement, or let search engines index
  it,
- commit the scraped material or your sender profile.

Cold-email rules differ by country (e.g. GDPR/e-privacy in the EU,
CAN-SPAM in the US, CASL in Canada). The skill reminds you which apply; it
doesn't give legal advice.

## Install

As a Claude Code plugin from GitHub:

```
/plugin marketplace add hypodai/cold-webcrafter
/plugin install cold-webcrafter@cold-webcrafter
```

Or copy `skills/cold-webcrafter/` into `~/.claude/skills/` (personal) or
`.claude/skills/` (one project). The skill is plain Markdown in the open
Agent Skills format.

Needs: Node 18+ (or what your chosen framework's current version requires),
git, and the CLI of your preview host if you want it deployed. The scraper needs
Playwright with Chromium, installed once:

```
cd skills/cold-webcrafter/scripts/scraper && npm install && npx playwright install chromium
```

## Security and privacy

What every script touches — network, files, deletes — is listed in
[`SECURITY.md`](SECURITY.md). In short: the skill reads the target site's
public pages one at a time (robots.txt honoured), writes only inside the
project, deletes only files it wrote itself, needs no credentials and
sends nothing anywhere. Before publishing a new version:

```
node tools/security-check.mjs     # secrets, encoded blobs, dangerous commands, injection wording, SKILL.md
node tools/package-skill.mjs      # dist/cold-webcrafter-<version>.zip — the skill folder only, from the last commit
```

## Helper scripts

`skills/cold-webcrafter/scripts/`:

- `scraper/` — page texts, every image with its real size, desktop and
  mobile screenshots and ~40 measurable facts per page; sitemap and
  rendered-menu discovery, `robots.txt` honoured, one page at a time,
- plain Node, no packages: Lighthouse summary, header/footer text cleaner,
  image download with failure log, content check (lite scope, working
  notes, dead links), redirect list and the static preview export.

Tests use invented data and a local server only:

```
node --test skills/cold-webcrafter/scripts/test/*.test.mjs

# the scraper's tests drive a real headless browser — install it once
cd skills/cold-webcrafter/scripts/scraper && npm install && npx playwright install chromium && cd -
node --test skills/cold-webcrafter/scripts/scraper/test/*.test.mjs
```

## Licence

[MIT](LICENSE)

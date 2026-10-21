# Changelog

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [0.1.0] — 2026-10-20

### Added
- MIT licence.

First pre-release (private). Entries below record how the skill developed.

### Changed (evals 3 and 4)
- Project names when sites share a host; mode cost when the mode is chosen;
  production host vs. preview host (no FTP passwords); deploy CLI checked
  once the host is chosen; site language read at preflight; missing tools
  installed only after the gate.
- Trigger description says what the skill is not for.

### Changed (eval 1/5/6 findings, S006)
- Measure "before" before scaffolding; framework `engines` checked at preflight.
- Template placeholders documented in `bootstrap.md`; PLAN.md only names
  the sender profile's path.
- No-subagent fallback for a single site.
- Scraper: key pages (services, contact, about, prices) and their sub-pages
  first; `/index.html` = `/`; first-screen screenshots (`*-top.png`).
- New `make-redirects.mjs`; `redirects_from` accepts `{from, anchor}`;
  `export-preview.mjs` fails on redirects to missing pages or anchors.
- Blocks: `hero.points`, `contact.hours`, `contact.map_url`; home slug `""`.
- `check-content.mjs` flags text addressed to an AI.
- Outreach: never quote scores; what to drop when the email is too long;
  postal address under the signature; "on request" only when the business
  depends on the out-of-scope function.
- Contradictions between pages are flagged, never resolved silently.
- Lite estimate recalibrated from a measured run (~0.2–0.5 M tokens).

### Added
- `examples/lite-northbridge-plumbing/` — a lite run on an invented site (S007).

### Security
- No recursive deletes: the scraper removes only its own earlier files by
  name; the preview export clears a folder only if it carries the marker
  file it writes, and refuses any other folder.
- Lock file removed from the skill (its hashes read as encoded blobs);
  Playwright stays pinned exactly. Lighthouse and the framework generator
  are run at pinned / looked-up versions.
- `SECURITY.md`: what every script touches, network and files.
- SKILL.md: "What the skill does on the user's machine".
- `tools/security-check.mjs`: pre-upload check for secrets, encoded or
  minified content, dangerous and remote-code commands, injection wording,
  file sizes and SKILL.md frontmatter.
- `tools/package-skill.mjs`: a zip of the skill folder only, for skill directories.

### Changed (eval 2 findings, `evals/RESULTS.md`)
- Preflight checks the hosts images and styles come from.
- Site-builder thumbnails: try the original URL before calling a photo small.
- Reservation / voucher forms are enquiry forms (in scope); only live
  calendars, carts and payments are out of scope.
- Template-like testimonials: keep text, drop stock portraits, flag, keep
  them out of the email.
- SEO is measured on the production build too (the preview is noindex).
- Long screenshots are cropped before loading; JS-set meta values noted.
- docs-keeper is skipped while the main thread still holds the decisions.
- Preview kept in the repository: commit it with a root host config that
  serves it hidden.

### Fixed (first real run, 2026-10-20)
- Node's fetch ignored the environment's HTTPS proxy, so robots.txt and
  the sitemap silently "didn't exist". The scraper and `fetch-images.mjs`
  now re-run themselves with `NODE_USE_ENV_PROXY=1` when a proxy is set.
- robots.txt per RFC 9309: 4xx allows everything; a server error or a
  network failure stops the run instead of crawling without rules.
- `sources.md`: a blocked CDN makes the original look faster than it is —
  how to spot it, and never to quote such a measurement.
- `bootstrap.md`: fallback when the official generator can't download its
  template.

### Added
- Scraper honours `Crawl-delay` from robots.txt (found on the first real
  test run): the longer of it and `--delay` applies between page loads.
- S002: the scraper, `scripts/scraper/scrape.mjs` (Playwright/Chromium,
  pinned 1.56.1), written from the output contract in `references/sources.md`.
  Discovery from sitemaps (robots.txt entries, indexes two levels deep) plus
  the rendered home page's links, shallow paths first, page cap; robots.txt
  honoured (own agent group before `*`, longest match, wildcards); honest
  user agent; one page at a time. Desktop 1440 px and iPhone 13 passes,
  multilingual cookie-banner acceptance, scroll for lazy content. Writes
  texts, images.json (real sizes, rendered width, pages), audit-raw.json
  (~40 fields per page, site-wide HTTPS/redirect/sitemap/robots),
  summary.json with warnings, screenshots and overview.html. Multilingual
  dictionaries for CTA words, references, certifications, number units,
  placeholders. Mobile overflow is measured against the layout viewport —
  mobile emulation zooms out to fit wide content, which hides it in
  `innerWidth`. Unit tests (robots, URLs, sitemaps) and an end-to-end test
  on an invented local site.

### Changed
- `references/sources.md` documents the scraper's exact fields, options and
  limits; the "not bundled yet" stop is gone. Preflight checks the scraper
  install; the extractor reads `pages_succeeded`/`pages_attempted` and
  fills `client_specific`.
- S009: batch is opt-in. The interview's first question is "one site or
  batch" (default one site); choosing batch brings a warning that an
  entry-level subscription plan most likely won't cover several sites in
  one run, and an offer to do the first site first. New "Plan limits"
  section in `budget-and-models.md` (usage windows, pause and resume, no
  plan prices from memory). Batch runs sites sequentially, each in its own
  context and project, with state in `batch.md` (new template) so a stopped
  run resumes; a failed site doesn't stop the rest. Interview questions
  renumbered 1–7 to match `SKILL.md`; evals 1 and 4 updated.

### Added
- S003: helper scripts in `scripts/`, Node 18+ with no packages —
  `lighthouse-summary.mjs` (scores and metrics without loading the report,
  before/after difference), `clean-text.mjs` (repeated header/footer cut
  from scraped text), `fetch-images.mjs` (originals downloaded one at a
  time, sizes read from file headers, 404s and HTML error pages logged),
  `check-content.mjs` (fails the build on a fourth lite page or sub-page,
  empty required fields, working notes, unknown blocks, dead internal
  links), `export-preview.mjs` (static preview from a build folder or by
  crawling a local server; noindex meta, robots.txt, X-Robots-Tag and
  redirects for Vercel/Netlify/Cloudflare; fails on dev-server leftovers).
  References and the extractor now use them. Tests: `scripts/test/`.
- S001: first version — `SKILL.md` with the 12-step workflow (preflight,
  one-message interview, one confirmation gate, autonomous run to a
  finished preview and email draft), lite and full modes, batch mode.
- References: interview, stack and hosting choice (user's tools first,
  otherwise chosen by fit), modes and scope, token budget and model/effort
  recommendation by tier, bootstrap, sources contract, content and image
  rules, build (identity, layout, motion, typography by language, SEO),
  stack-neutral content model with 18 blocks, verification, static preview
  and after-measurement, cold email with region-dependent legal reminders,
  lite → full upgrade.
- Agents: content-extractor, site-auditor, docs-keeper (mode-aware).
- Project templates: AGENTS.md, CLAUDE.md, PLAN.md, BACKLOG.md,
  CHANGELOG.md, IMPROVEMENTS.md, EMAIL-DRAFT.md, PAGE-MAP.md, AUDIT.md,
  .gitignore; sender profile template kept outside project repositories.
- Eval prompts in `evals/evals.json` (not yet run).

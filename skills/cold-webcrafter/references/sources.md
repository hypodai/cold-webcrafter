# Sources: measuring and scraping the original site

## Order matters: measure first

Run Lighthouse on the **original** site before writing any code:

```bash
npx --yes lighthouse@12.8.2 <url> --output=json --output-path=sources/lighthouse-before.json --quiet --chrome-flags="--headless=new"
```

The version is pinned so every run measures the same way and nothing
unknown gets installed; update it deliberately. It needs only the public URL. It's cheap in tokens (a dozen numbers) and
it's the strongest argument in the email. Postponed, it gets forgotten, and
the result can't be proven with numbers.

Never open the report itself; read the summary:

```bash
node <skill>/scripts/lighthouse-summary.mjs sources/lighthouse-before.json
```

It prints the four scores, LCP, FCP, TBT, CLS, page weight, the device
profile and the measurement time. If `runtime_error` isn't null, the run
failed and its scores must not be quoted — rerun it.

Measure the mobile profile (Lighthouse's default) — that's what the
prospect will open the email on.

## The scraper

`scripts/scraper/scrape.mjs` — a headless Chromium (Playwright) script, run
from the project folder. It writes files to disk and nothing else: no API,
no background process, no uploads.

Install once, in the skill's folder (not in the project):

```bash
cd <skill>/scripts/scraper && npm install && npx playwright install chromium
```

Run from the project folder:

```bash
node <skill>/scripts/scraper/scrape.mjs <url> --max-pages 8          # lite
node <skill>/scripts/scraper/scrape.mjs <url> --max-pages 60         # full
node <skill>/scripts/scraper/scrape.mjs <url> --urls pages.txt       # hand-made page list
```

Options: `--out sources` (default), `--delay 500` (ms between pages),
`--no-screenshots`. A run takes a few minutes on a small site. It prints a
short JSON summary — read that, not the files.

- **Page cap:** lite 8, full up to 60. Eight reliably covers home, services,
  contact and enough of the rest to list the next phase. If lite stops at
  the cap, the site is bigger — expected; don't rerun with a higher cap,
  note in the backlog that the complete page list comes with full mode.
- **Page discovery:** the sitemap (from `robots.txt`, `/sitemap.xml` or
  `/sitemap_index.xml`, sitemap indexes two levels deep) plus the links of
  the **rendered** home page, so menus built by JavaScript count. Same site
  only (`www.` or not), no files (PDF, images, archives…), no fragments.
  Pages whose path names services, contact, about or prices go first (with
  their sub-pages), then the rest, shallow paths first — so a lite cap of 8
  gets what the three pages are built from rather than blog posts. A menu that only appears after a click can still be missed —
  check `overview.html` and pass `--urls` if pages are missing.
- **Politeness:** one page at a time with a pause, `robots.txt` honoured
  (disallowed pages are listed, not fetched; a disallowed home page stops
  the run; a `Crawl-delay` longer than `--delay` replaces it, capped at
  60 s — with 10 s, a 20-page site takes about 7 minutes; a robots.txt that
  can't be read — server error or network failure — stops the run, as RFC
  9309 asks, instead of being taken for a site without rules), an honest user agent with `cold-webcrafter` in it. This is a
  stranger's site; a remake pitch that starts by hammering their server is
  a bad first impression and may break their hosting terms.
- **Each page twice:** desktop 1440 × 900 and mobile (iPhone 13 emulation,
  390 px). Before measuring, the cookie banner is accepted (button texts in
  several languages, `lib/dictionaries.mjs`) and the page is scrolled to the
  bottom and back so lazy content is loaded.
- A rerun replaces the scraper's own output and keeps other files in the
  folder (e.g. `lighthouse-before.json`).

## Output contract

```
sources/
├── screenshots/NN-slug-desktop.png      full page
├── screenshots/NN-slug-desktop-top.png  first screen only — load this one
├── screenshots/NN-slug-mobile.png       full page
├── screenshots/NN-slug-mobile-top.png   first screen only
├── text/NN-slug.txt                  URL, title, description, separator, visible text
├── images.json                       every image, deduplicated by URL
├── audit-raw.json                    measured facts, site-wide and per page
├── summary.json                      pages attempted / succeeded, titles, H1s, warnings
└── overview.html                     for a human, not for the agent
```

`NN-slug` (`01-home`, `02-services`, `07-blog-2020-old-post`) is the join key
between screenshot, text and JSON records: `NN` is the processing order,
the slug comes from the URL path (diacritics dropped, `/` → `-`, at most 60
characters, the root is `home`).

What consumers must know:

- **Check completeness first:** `summary.json` → `pages_succeeded` vs.
  `pages_attempted`, and `warnings` (cap reached, no sitemap). A failed page
  has `ok: false` and `error` (e.g. `HTTP 404`). If anything failed, the
  data is incomplete and the outputs must say so.
- **Text files include navigation, footer and cookie texts.** Cut them;
  they belong in the site settings, not in page content. Run
  `node <skill>/scripts/clean-text.mjs sources/text sources/text-clean`
  after scraping: it removes lines repeated at the start and end of most
  pages and lists them in `_boilerplate.txt`. The extractor reads the
  cleaned copies and checks listings by hand (a footer under every item
  isn't caught).
- **`images.json`** — per image: `url` (absolute), `alt` (`""` = missing),
  `w`/`h` (real size; `null` for CSS backgrounds), `displayed_w` (rendered
  width, `img` only), `type` (`img` | `background`), `found_on` (pages),
  `probably_small` (`w` < 400; always `false` for backgrounds — not
  information), `client_specific: null`. Whether an image is the client's
  own (keep) or generic stock (replace) is the extractor's judgement; it
  fills that field. `data:` URIs aren't collected.
- **`audit-raw.json`** → `site`: `https`, `http_redirects_to_https`,
  `sitemap_xml`, `robots_txt`, `pages`, `unavailable_pages`,
  `skipped_by_robots`. → `pages[]` (successful pages only, so possibly
  fewer than in `summary.json`), each `{url, name, audit}`:

  | Group | Fields |
  |---|---|
  | SEO / meta | `title`, `title_length`, `description`, `description_length`, `h1_count`, `h1_texts`, `canonical`, `og_tags`, `twitter_tags`, `structured_data`, `lang`, `favicon`, `viewport_meta` |
  | CTA / trust | `cta_texts`, `cta_count`, `cta_above_fold`, `forms`, `phone_clickable`, `email_clickable`, `map`, `mentions_references`, `mentions_certifications`, `numbers_in_text` |
  | Speed / images | `images_total`, `images_without_alt`, `images_oversized`, `lazy_loading` |
  | Age / technical debt | `generator`, `copyright_year`, `jquery`, `jquery_version`, `flash_leftovers`, `inline_styles`, `placeholder_leftovers`, `text_length` |
  | Layout | `horizontal_overflow` (desktop), `mobile_horizontal_overflow` |

  Not obvious from the names:
  - `description: null` = the meta tag is missing (vs. `""` = empty);
    values are read from the **rendered** page, so a description set by
    JavaScript (some site builders do that) is reported even though the
    raw HTML has none — check the raw HTML before claiming it's missing
    or present,
  - `images_oversized` — natural width over 2.5 × the rendered width
    (needless data over the wire),
  - `cta_texts` — de-duplicated link and button texts matching a
    multilingual list of call-to-action words; `cta_above_fold` — one of
    them is visible at the top of the page,
  - `map` — an embedded map from a known map service,
  - `numbers_in_text` — up to five phrases like "20 years" or "500+
    clients": candidate benefits for the new site, if true,
  - `copyright_year` — the latest year after `©`; an old one signals an
    unmaintained site,
  - `placeholder_leftovers` — template text ("lorem ipsum", "your text
    here"…) found; a strong, easily verified point,
  - `text_length` — visible characters; low means thin content.
- `mentions_references`, `mentions_certifications` and
  `placeholder_leftovers` are **regex signals over the whole text, menu and
  footer included — not proof.** Verify in the text before turning them into
  a claim.
- Everything is measured on desktop except `mobile_horizontal_overflow`, and
  after scrolling, so lazy images are counted.

## Known limits — not findings

- **a blocked network looks like a bad site.** Site builders serve images,
  styles and fonts from CDN domains. If the environment blocks them, the
  scrape has no images and unstyled screenshots, and Lighthouse "before"
  comes out far *better* than reality (tiny page weight). Check
  `total_bytes` and `images.json` against what the site obviously has; if
  they don't match, find the blocked hosts and fix the network before
  measuring — never quote such a measurement,

- capped page count; pages reachable only through a click-to-open menu,
- cookie banners with an unusual button text stay on the screenshot and
  their text stays in the page text,
- the boilerplate cut is line-based: a menu that differs on one page (e.g.
  an extra item) stays in that page's text,
- the network is given at most 8 s to settle — sites that never go idle
  (chat widgets, site builders) may be captured before they finish drawing,
- Lighthouse is not part of the scrape; it runs separately (above).
- regex-based signals can be false positives from navigation or footer.

## Personal data

Collect only what the business publishes as its contact details. Don't keep
personal data of individuals beyond that (team members' private details,
form submissions, comments). `sources/` is never committed and can be
deleted when the project ends.

# Improvements

**This is a three-page preview (home, services, contact), not the finished site.** The original has at least 13 pages; the rest are listed in `BACKLOG.md` ("Next phase"). The numbers below compare the original's home page with the new home page only.

## Measured
| Metric (mobile profile) | Before | After | Difference |
|---|---|---|---|
| Performance | 98 | 99 | +1 |
| SEO | 75 | 100 (production build) / 69 (hidden preview) | +25 / -6 |
| Accessibility | 64 | 100 | +36 |
| Best practices | 82 | 100 | +18 |
| Largest content shown (LCP) | 2.3 s | 1.7 s | -0.6 s |
| First content shown (FCP) | 0.8 s | 1.5 s | +0.7 s (slower) |
| Page weight | 253 kB | 124 kB | -130 kB |

Before: Lighthouse 12.8.2, mobile profile, headless Chromium, on `http://127.0.0.1:4600/` (the original, served from a local test server), 2026-10-20 15:24 UTC.
After: Lighthouse 12.8.2, mobile profile, headless Chromium, 2026-10-20 15:33 UTC, on the static `preview/` folder served locally with `serve` (gzip on) — the preview was **not deployed** (not permitted in this run), so this is a local static server, not real hosting. The SEO figure of 100 comes from the production build (`dist/`, served the same way without the preview's hidden-from-search settings, 15:33 UTC); the hidden preview itself scores 69 on SEO only because it is deliberately marked `noindex`, which is not a regression.
Honest reading: the original already loaded quickly on this test setup (it is tiny, plain HTML), so speed is not the headline. The first content appears slightly later on the new page (font loading); the big gains are accessibility, best practices and search basics. Both runs are from a local machine without real network conditions — re-measure on real hosting (see backlog).

## Solved
1. **Phone number could not be tapped on mobile** — now a tap-to-call button in the header, hero and call-to-action blocks of every page; fewer steps for someone with a burst pipe.
2. **No mobile layout** (the old pages have no viewport setting, so a phone shows a tiny desktop page) — the new pages are built phone-first; no sideways scrolling.
3. **Contact form only opened the visitor's email program and did not ask how to reach them** — the new form asks for name, phone or email, and message, checks them and shows a confirmation. In the preview it sends nothing; connecting it is delivery work (see backlog).
4. **Thin search presence** (six of eight pages had no description; titles like "Services") — every page now has its own title and description, social-sharing tags, local-business data and a sitemap.
5. **Looked abandoned** (2016 copyright, a lorem-ipsum news item) — the current year, no placeholder text.

## Kept
- The business's own navy and blue, its plain family-run tone and its real facts: over 25 years, Gas Safe registered, fully insured, 1,200+ boilers, 300+ bathrooms, no call-out charge within NB postcodes, 24/7 emergencies, and the three customer quotes.

## Left
See `BACKLOG.md`.

---
<sub>Run cost: not shown by the tool (estimate was ~0.3–0.8 M tokens).</sub>

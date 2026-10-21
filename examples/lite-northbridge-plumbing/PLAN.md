# Plan

## Request
Build a better, three-page lite preview of the plumber's website at http://127.0.0.1:4600/ (Northbridge Plumbing & Heating) to pitch to the business, and draft the cold email (never sent).

## Answers
| Question | Answer |
|---|---|
| One site or batch | one site |
| Mode | lite |
| Stack / host | Astro 7 + Tailwind 4 (static) / none — preview stays local |
| Site language | English (original's language) |
| Email language | English |
| Structure (full) | n/a (lite always keeps identity and logic) |
| Deploy preview | NO — user said keep it local; email gets a visible `{{PREVIEW_URL}}` placeholder |
| Sender profile | `~/.config/cold-webcrafter/sender.md` (outside the repo; not committed) |

## Stated before starting (plan and gate — treated as confirmed)
- **Pages in scope:** Home `/`, Services `/services`, Contact `/contact`. Everything else on the original → `BACKLOG.md` "Next phase".
- **Stack:** Astro 7 + Tailwind 4, static output — the preview *is* the build output, no server/database, content files carry over to full.
- **Token estimate (lite, small site <= 15 pages): ~0.3–0.8 M tokens** (all tokens processed, cache re-reads included; estimate, uncalibrated). Plan limits: one lite site uses a large share of an entry-level plan's usage window; the run commits after every step so it can resume after a limit reset.
- **Recommended model / effort:** main agent (plan, identity, build) — balanced tier (Claude Sonnet 5.5), effort high; for the email copy and the home hero the most capable tier (Claude Opus 5.5) at medium effort pays off; content-extractor and site-auditor — balanced, effort medium; docs-keeper and image triage — fast (Claude Haiku 5.5), effort low. The skill cannot switch model/effort itself — the user does it in the tool (model picker / effort setting).
- **Will be created:** project repo, 3-page static site, `sources/` (uncommitted), Lighthouse before/after, 4 documents (BACKLOG, CHANGELOG, IMPROVEMENTS, EMAIL-DRAFT), a static `preview/` export.
- **Will NOT happen:** no email sent or placed in a mailbox, no deployment, nothing live touched.
- **Out of scope spotted up front:** `/shop.html` in the original menu (to be checked: a live cart/payment = out of scope; an enquiry-only page would be a form). Not implemented either way — lite has no fourth page — listed in backlog.

## Assumptions
- Site and email are English; UK sender and (apparently) UK recipient -> PECR + UK GDPR reminder.
- Preview not deployed; "after" Lighthouse is measured on the exported static `preview/` served locally with `npx serve` (static server with compression is the closest stand-in available; not production hosting).
- Lighthouse run with pinned lighthouse@12.8.2, mobile profile, headless Chromium with --no-sandbox.
- Preview deletion date for the email/backlog: 2026-11-03 (14 days from 2026-10-20, per sender profile) — only relevant once a preview is hosted.

## Estimate
~0.3–0.8 M tokens — recommended: balanced model at high effort for main agent (see above)

## Packages
| # | Package | Status | Note |
|---|---|---|---|
| 1 | Sources | done | Lighthouse before (mobile) perf 98 / SEO 75 / a11y 64 / BP 82, measured before any site code; scraper 8/8 (cap reached, site has >=13 pages); extractor+auditor run by main agent (no subagent tool available) |
| 2 | Identity | done | navy #1f4e79 / blue #2c6aa0 scale as tokens, serif headings + sans body, original logo kept |
| 3 | Pages | done | 3 pages from content model; 6 screenshots viewed in one wave; motion, form, images, redirect targets checked by script |
| 4 | Preview & email | done | static export `preview/` (noindex, Disallow, 12 redirects); Lighthouse after on local static server (not deployed); docs written directly by main agent; email drafted, NOT sent |

## Where work stopped
All four packages done on 2026-10-20. Next step for the human: check `EMAIL-DRAFT.md`, deploy `preview/` (not done: not permitted), replace `{{PREVIEW_URL}}`, send manually. Decisions on the user's behalf: Astro 7 + Tailwind 4; shop page not built (out of scope) and mentioned in the offer as not included; hidden AI-addressed text on the About page not followed and reported; extractor/auditor run by the main agent because no subagent tool was available.

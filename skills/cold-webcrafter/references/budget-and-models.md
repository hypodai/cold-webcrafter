# Token budget and model choice

## Tell the user before starting

The plan in step 3 states the expected cost so the user can pick the mode
knowingly. Give a range, not a single number, and say it's an estimate.

| | Lite | Full |
|---|---|---|
| Typical small site (≤ 15 pages) | ~0.2–0.5 M tokens | ~1.5–3 M tokens |
| Larger site (30–60 pages) | same — lite ignores the extra pages | ~3–6 M tokens or more |

> **Calibration status:** lite is measured — one complete run on a
> 12-page site with a balanced model took ~0.23 M tokens (2026-10). Full is
> partly measured: its extractor and auditor took ~0.3 M together on a
> 20-page site; the main thread wasn't visible, so the full range is still
> an estimate. The numbers count all tokens processed, including cached
> context re-read on every turn, which dominates long runs.

What moves the number most, in order:

1. **pages processed** — full scales with the site, lite doesn't,
2. **images loaded into context** — each costs roughly 1,000–1,600 tokens
   regardless of file size, so a screenshot is the most expensive thing an
   agent can look at,
3. **verification rounds** — every wave of screenshots re-costs the above,
4. **long machine files read whole** — a Lighthouse report is often over
   700 kB; reading it whole is more than a context holds.

If the tool shows usage, record the actual figure in `IMPROVEMENTS.md`'s
footer and report it at handoff — that's how the estimates get better.

## Plan limits

Tokens are not the only limit. Subscription plans meter usage per time
window (often a few hours, plus a weekly cap), and the entry-level paid
tiers have the smallest windows. As a rule of thumb — not a measurement —
expect:

- **one lite site** to use a large part of an entry-level plan's window,
- **one full site** to need more than one window, or a higher tier,
- **a batch of several sites** not to fit an entry-level plan in one run.

When the limit is reached, the run stops mid-work and continues after the
window resets. Nothing is lost if the run commits after every step and
`PLAN.md` (or `batch.md`) says where it stopped — that's why those rules
exist. Say this in the plan step, in one or two sentences, before the
user confirms; for full mode and for batch, recommend a higher tier or
pay-as-you-go usage with a spending cap.

Plan names, prices and limits change often and differ between tools: name
the user's plan only if they said which one they have, and don't quote a
limit or price from memory — if it matters, look it up in this run or tell
the user where to check it.

## Rules that keep the budget

- **Never read a machine file whole above ~50 kB.** Check the size first
  (`ls -l`), then extract with `jq`, `grep` or a small script. Lighthouse
  reports have their own: `scripts/lighthouse-summary.mjs`.
- **Screenshots: take all, load few.** The scraper captures every page for
  free; loading costs. Lite loads two (home desktop, home mobile). Full loads
  up to five (home desktop and mobile plus one per distinct page type).
  Template-built sites (site builders, themed CMSs) look the same on every
  page; the fourteenth screenshot says nothing new.
- **Load the first-screen shots** (`*-top.png`) to judge the look; open a
  full-page shot only for a specific question. A site without a viewport
  meta renders its mobile full page several thousand pixels wide.
- **Crop long screenshots before looking.** A full-page shot of 8,000 px is
  shrunk until nothing is readable, at full price. Cut it into slices of
  about two screen heights and look only at the slices you need.
- **Verification screenshots come in waves** — one wave when the build is
  done, one final wave after fixes. Small visual fixes are verified from the
  generated HTML/CSS, not by a new screenshot each time.
- **Raw material belongs to subagents.** The extractor and auditor may read a
  lot and return little. The main thread never opens `sources/` text files
  for "context".
- **Don't read the scaffold to understand it.** Read only the block being
  composed and only its fields (`blocks.md`).
- Before loading anything, ask: do I need the whole file or three values?
  Is the same information available cheaper (text instead of an image)?
  In lite: is it for one of the three pages, or the next phase?

## Recommended model and reasoning effort

Recommend by **capability tier**, then name the current models of the tier.
Model names and line-ups change faster than this file; if the tool lists
newer models, map them onto the tiers and say so. Check what the user's tool
actually offers before recommending.

Tiers as of this writing (2026-10), using Anthropic models as the example:

| Tier | Example | Use for |
|---|---|---|
| most capable | Claude Opus 5.5 | design decisions, layout, identity, the email copy |
| balanced | Claude Sonnet 5.5 | building pages, extraction, audit |
| fast | Claude Haiku 5.5 | mechanical steps: image classification, docs upkeep |

| Phase | Lite | Full |
|---|---|---|
| Main agent (plan, identity, build) | balanced, effort **high** | most capable, effort **high** (identity and layout: **xhigh** if available) |
| content-extractor, site-auditor | balanced, effort **medium** | balanced, effort **medium** |
| docs-keeper, image triage | fast, effort **low** | fast or balanced, effort **low** |
| Email draft | most capable or balanced, effort **medium** | same |

Why: the prospect judges the preview in seconds by its first screen and the
email by its first lines — that's where the strongest model pays off. Most
other steps are structured transformation where a balanced model at medium
effort is as good and much cheaper. Higher effort on mechanical steps buys
nothing.

Effort names differ between tools (low / medium / high / xhigh / max, or a
thinking budget). Translate to the user's tool; if it has no such setting,
skip that column.

Say how the user switches model and effort in their tool, and that the skill
can't switch it for them. Subagents can be given their own model where the
tool supports it (e.g. a `model:` field in the agent file) — `bootstrap.md`
sets that from the user's answer.

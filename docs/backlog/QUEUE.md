# Backlog

Status: `ready` | `in_progress` | `blocked` | `done`

| ID | Task | Priority | Status |
|----|------|----------|--------|
| S001 | First version: SKILL.md, references, agents, project templates, manifests, eval prompts | P0 | done |
| S002 | Scraper in `scripts/scraper/`, written from the output contract (the maintainer's original wasn't available): English output names, page cap, robots.txt, multilingual dictionaries; tests on an invented site | P0 | done |
| S003 | Helper scripts: Lighthouse summary, header/footer text cleaner, image download with failure log, content check, static preview export; tests | P1 | done |
| S004 | GitHub repository `hypodai/cold-webcrafter` | P0 | done |
| S005 | Evals 1–6 run 2026-10-20 (1/5/6 with and without the skill, 2 full on a real site, 3/4 up to the gate); lite estimate calibrated. Open: full-mode main-thread tokens on a tool that shows usage | P0 | done |
| S006 | Iterate on the skill from eval results — 16 findings of eval 1 + the baseline lesson fixed | P0 | done |
| S007 | Worked example: `examples/lite-northbridge-plumbing/` (invented site) | P1 | done |
| S008 | Default static starter (blocks as components) for the stack the skill picks most often, so runs don't regenerate it | P2 | ready |
| S009 | Batch mode as an opt-in with a plan-limit warning; per-site fresh context, sequential, `batch.md` state and resume, summary table — instructions done, to verify in S005 | P1 | done |
| S010 | Licence (MIT), SECURITY.md, CONTRIBUTING.md, security hardening, pre-publication check, zip packager, trigger description | P1 | done |
| S011 | Publication: public repository, release v0.1.0 with the skill zip (2026-10-22); plugin install from GitHub verified | P1 | done |
| S015 | Pre-publication hardening: LF line endings on every OS, Windows-safe script exits, cross-platform zip packager, CI on Linux/Windows/macOS, EU consent rule in `outreach.md` | P0 | done |
| S012 | Compare the scraper with the maintainer's original once uploaded; port edge-case handling it has (platform quirks, redirects, error pages) — nothing client-specific | P1 | blocked — waiting for the original |
| S013 | Measure full-mode tokens end to end in a tool that shows usage (e.g. Claude Code `/cost`), update `budget-and-models.md` | P2 | ready |
| S014 | Have the cold-email legal notes in `outreach.md` reviewed by someone qualified before publication | P1 | ready — maintainer |

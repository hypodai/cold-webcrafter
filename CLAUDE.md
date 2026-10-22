# cold-webcrafter — working on this repository

This repo *is* a skill; the product is the text in `skills/cold-webcrafter/`.

- Chat with the maintainer in whatever language they write in; everything
  in the repo (skill, docs, commits) stays in English — the skill is meant
  to be published and used in any language.
- Keep the skill personal- and locale-neutral. No names, no contact details,
  no prices, no assumed country, currency, language or regulation. Regional
  specifics (EU/GDPR, US/CAN-SPAM, a currency…) only as one example among
  several.
- **Nothing from real client work goes in.** No business names, domains,
  numbers, screenshots, quotes or anecdotes from past projects — not even
  "anonymised" ones that a reader could trace. Examples use invented
  businesses. When a lesson came from a real project, keep the lesson and
  drop the story.
- The sender's identity (name, offer, price, signature) lives in the user's
  sender profile at run time, never in the skill.
- Keep `SKILL.md` lean (under ~300 lines). Detail belongs in `references/`,
  loaded only in the step that needs it.
- Explain *why* in instructions instead of stacking MUSTs — the model follows
  reasoning better than rules.
- Every change to the skill: a line in `CHANGELOG.md`, and re-run the evals
  in `evals/evals.json` when behaviour could change (with and without the
  skill, compare).
- Backlog: `docs/backlog/QUEUE.md`, one task at a time, commit `Sxxx: …`.
- Don't change the licence or the repository visibility without the
  maintainer's explicit decision.
- Releases: `node tools/security-check.mjs`, both test suites, then
  `node tools/package-skill.mjs` (the zip is built from the last commit, so
  commit first) and `gh release create v<version> dist/…zip`. CI runs the
  same on Linux, Windows and macOS.

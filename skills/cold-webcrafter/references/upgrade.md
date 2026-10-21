# From lite to full

The prospect replied and wants the whole site. Continue in the **same
repository** — the content model is shared, so nothing is rebuilt or
thrown away.

1. Switch the project's `CLAUDE.md`/`AGENTS.md` to full mode: remove the
   three-page rule and the scope check, add the full-mode rules (page map,
   ADRs, docs after every package).
2. Rerun the scraper with the full page cap; the complete page list replaces
   the lite "Next phase" guess.
3. The extractor and auditor run in full mode: every page gets a text
   extract and a status in `PAGE-MAP.md`; `AUDIT.md` is written.
4. Ask whatever the client conversation settled: keep or rebuild the
   structure, content editing, languages, the production host and domain.
   Record them as ADRs.
5. Add content editing if agreed (`stack.md`) — on top of the existing
   content files; content doesn't change.
6. Build the remaining pages, turn lite's anchors and redirects into real
   pages where the page map says keep.
7. Verify everything per `verification.md` (full), including the clean-clone
   check, then measure again and regenerate `IMPROVEMENTS.md`.
8. Production launch is a separate, outward step with the client: domain,
   DNS, the client's accounts. Write the checklist into `BACKLOG.md`; don't
   touch anything live of the client's without explicit instruction.

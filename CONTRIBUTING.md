# Contributing

Thanks for looking. Issues and pull requests are welcome — especially runs
of the skill that went wrong, with the prompt you used, what you expected
and what happened.

## Before you change the skill

The product is the text and scripts in `skills/cold-webcrafter/`. A few
rules keep it working for everyone:

- **Explain why, don't stack MUSTs.** The model follows reasoning better
  than rules. A new instruction should say what problem it prevents.
- **Keep `SKILL.md` lean** (under ~300 lines). Detail belongs in
  `references/`, which the skill loads only in the step that needs it.
- **Stay locale-neutral.** No assumed country, currency, regulation or
  language. Regional specifics appear only as one example among several.
  Everything in the repository is in English; the skill answers in the
  user's language.
- **Nothing from real client work.** No business names, domains, texts,
  screenshots or numbers from real sites — not in the skill, not in
  examples, not in eval results. Use invented businesses (see
  `evals/fixtures/`).
- **Honesty rules are the product.** Never invent facts, only verified
  pains in the email, measure before claiming, never send email. A change
  that weakens one of these won't be merged.

## Scripts

- Node 18+, no packages except the scraper's pinned Playwright.
- Scripts delete only files they wrote themselves — no recursive deletes of
  folders they didn't create, no shell, no `eval`, no downloads that get
  executed. Keep `SECURITY.md`'s table true when you change a script.
- Every script has tests with invented data and local servers only:

```
node --test skills/cold-webcrafter/scripts/test/*.test.mjs
node --test skills/cold-webcrafter/scripts/scraper/test/*.test.mjs
```

## Before a pull request

- [ ] tests pass
- [ ] `node tools/security-check.mjs` reports no findings
- [ ] a line in `CHANGELOG.md`
- [ ] if behaviour could change: the evals in `evals/evals.json` re-run
      with and without the skill, results in `evals/RESULTS.md`
- [ ] no real client material anywhere in the diff

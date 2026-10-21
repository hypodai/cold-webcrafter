# Examples

Real outputs of the skill on **invented** businesses — never on a real
prospect's site.

## `lite-northbridge-plumbing/`

A lite run (eval 1, 2026-10-20) on the invented fixture site in
`evals/fixtures/dated-plumber/`, made by an agent following the skill on a
balanced model, about 0.23 M tokens. Sender: the invented "Example Web
Studio".

| File | What to look at |
|---|---|
| `INTERVIEW.md` | the one-message interview with defaults |
| `PLAN.md` | answers, estimate, model recommendation, packages |
| `BACKLOG.md` | "Next phase" with every page not rebuilt, the out-of-scope shop, the text addressed to AI that was not followed |
| `IMPROVEMENTS.md` | before/after, each number with what measured it and when |
| `EMAIL-DRAFT.md` | the cold email draft (not sent) |
| `content/` | the three pages in the stack-neutral content model |
| `screenshots/` | home (desktop) and services (mobile) of the result |

The photos are the fixture's generated placeholders. To run the site:
`npm ci && npm run build`, then serve `dist/`. `preview/`, `sources/` and
`node_modules/` are excluded, as in a real project.

This run used an earlier version of the skill; the problems it reported are
fixed in later versions (see `evals/RESULTS.md`), so a fresh run differs —
for example the email no longer quotes audit scores.

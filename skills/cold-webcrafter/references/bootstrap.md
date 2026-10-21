# Bootstrapping the project

One project = one site = one folder and one git repository. Projects never
share data: mixing two businesses' material is how one client's details end
up on another client's site.

## Where

Default `./<domain-slug>/` (e.g. `example-plumbing-com`), or where the user
said. If the user wants a GitHub repository, it is **private** — a preview
project holds a stranger's content and isn't anyone's to publish.

## What gets created

From `assets/templates/project/` (translate the prose to the documents'
language; keep file names):

| File | Lite | Full | Purpose |
|---|---|---|---|
| `CLAUDE.md` + `AGENTS.md` | ✓ | ✓ | rules for every later agent session: mode, scope, stack, language, the honesty and budget rules |
| `PLAN.md` | ✓ | ✓ | interview answers, assumptions, estimate, packages and their status, where work stopped |
| `BACKLOG.md` | ✓ | ✓ | what's left; in lite the "Next phase" list is the most important document |
| `CHANGELOG.md` | ✓ | ✓ | what was done, for a non-technical reader |
| `IMPROVEMENTS.md` | ✓ | ✓ | before/after numbers and what was solved |
| `EMAIL-DRAFT.md` | ✓ | ✓ | the cold email, to check before sending |
| `PAGE-MAP.md` | — | ✓ | every original page: keep / merge / drop, with reasons |
| `AUDIT.md` | — | ✓ | the readable audit for the client |
| `docs/adr/` | — | ✓ | decisions: stack, keep vs. rebuild, new blocks |
| `.gitignore` | ✓ | ✓ | `sources/`, `preview/`, `.env*`, build output |

Fill every `{{…}}` in the templates; none may remain except
`{{PREVIEW_URL}}` in the email while nothing is deployed. The ones that
need a decision:

| Placeholder | Fill with |
|---|---|
| `{{MODE_SENTENCE}}` | lite: "A three-page preview for a first contact; the rest is the next phase." · full: "The complete site." |
| `{{SCOPE}}` | lite: the three page paths · full: "every page in `PAGE-MAP.md`" |
| `{{MODE_RULES}}` | lite: "9. Exactly three pages; a fourth is a signal for full mode, not an improvement." · full: "9. New block types allowed, with an ADR; docs after every package." |
| `{{STOP_SCOPE}}` | lite: "a fourth page, a sub-page or a new block type is needed" · full: "the plan is to rebuild the structure" |
| `{{SCREENSHOT_BUDGET}}` | lite: "2 (home desktop + mobile, first-screen shots)" · full: "up to 5" |
| `{{DOCS_LIST}}` | the documents of the mode (table above) |
| `{{MAX_PAINS}}` | lite 3 · full 5 |
| `{{REGIONS}}` | the sender's region and the prospect's country |
| `{{SENDER_PROFILE_PATH}}` | the profile's path — never its contents |

In the agent files, `{{MODE}}` and the `{{…_LANGUAGE}}` values come from the
interview; delete the section of the other mode ("### Lite" / "### Full").
The `model:` field takes the tool's model alias (in Claude Code: `sonnet`,
`haiku`, `opus`).

From `assets/agents/` into `.claude/agents/` (or the tool's equivalent):
`content-extractor.md`, `site-auditor.md`, `docs-keeper.md`. Set each one's
model from `budget-and-models.md` if the tool supports a per-agent model.
Remove the mode-specific sections that don't apply.

## Scaffolding the site

Use the stack's **official generator** at a version you looked up in this
run (e.g. `npm view create-astro version`, then `npm create astro@<that
version>`) — it stays current; hand-written scaffolding doesn't. Use only
the framework's official packages from the public registry; never pipe a
script from the web into a shell. Some generators download
their templates from GitHub; where the network allows only the package
registry, install the framework packages at their current versions
(`npm view <pkg> version`) and write the minimal config by hand, then check
that a one-page build works before adding anything. Then add:

- the content model from `blocks.md` (content files + one template per
  block),
- design tokens (colours, fonts, spacing) as CSS variables, neutral until
  step 7,
- SEO basics: per-page title and description, canonical, Open Graph,
  sitemap, robots, structured data,
- an enquiry form (in the preview it shows the confirmation without sending),
- the content check, wired to run before every build (e.g. a `prebuild`
  script): `node <skill>/scripts/check-content.mjs --mode lite|full`.
  Copy the script into the project's `scripts/` so the project works
  without the skill installed. It fails the build on a fourth lite page or a
  sub-page, an empty required field, a working note or placeholder in
  content, an unknown block type (lite) and an internal link to a page that
  isn't built — scope enforced by code, not by memory. Add the site
  language's words for "missing" / "to be added" to `content/check.json`
  → `note_patterns` (regular expressions, case-insensitive) — the default
  patterns are English.
- the redirect list: `node <skill>/scripts/make-redirects.mjs` collects every
  page's `redirects_from` into `content/redirects.json` for the export and
  the production host. Run it before each export.

## Commit conventions

- Commit after every logical step, without asking — work outside git is lost
  between sessions.
- Messages in English, short and descriptive.
- If the session ends mid-package: commit the unfinished state saying so, and
  write in `PLAN.md` where it stopped and what's next.
- Never commit `sources/` (a stranger's scraped material), secrets, or the
  sender profile.

## The packages

Lite fits in four packages; holding to them saves more context than anything
else, because each has a clear end:

| # | Package | Contents |
|---|---|---|
| 1 | Sources | Lighthouse before, scraper, extractor + auditor, image resolution |
| 2 | Identity | colours and type into tokens, logo, icons for the trade |
| 3 | Pages | content into the model, block composition, images, visual check |
| 4 | Preview & email | production build, static export, deploy, Lighthouse after, docs |

Full uses the same four, with package 3 split per page group from
`PAGE-MAP.md`, and docs-keeper after every package rather than once at the
end — catching up on documentation later costs more and remembers less.

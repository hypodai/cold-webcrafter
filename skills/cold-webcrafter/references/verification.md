# Verification

A 200 status code proves nothing about how a page looks. Wrong sizes, broken
layout or missing styles all return 200. The prospect sees only the result,
so the result is what gets checked.

## Before looking

- Production build from a clean state. Remove dev-server leftovers (e.g. a
  `hot` file or dev URLs) — a page that pulls its styles from a dev server
  deploys as bare text and still returns 200.
- In the built HTML, assets point at the build output, not at `localhost`.
- The content check passes (`scripts/check-content.mjs`, wired before the
  build — `bootstrap.md`). It covers scope, required fields, working notes
  and internal links in content; it can't see links hard-coded in
  templates, so the checks below still apply.
- Every page in scope answers 200. Lite: exactly three pages; no admin or
  login route exists.
- Every image loads; no broken paths.
- No placeholder text ("lorem ipsum", template defaults) and no working note
  in any content field.
- No link in menu or footer leads to a page that doesn't exist — in a
  preview, a link to a 404 is worse than a missing page.
- Old URLs redirect: lite sends every dropped page to the nearest of the
  three (or an anchor on services); full redirects every changed URL. None
  ends in a 404.
- Full: every public URL, not only menu pages — details, pagination,
  redirected old URLs. Template leftovers hide exactly where nobody looks.
- Full: clone the repository into an empty folder, install, build, and check
  again — it catches files that exist only on your disk.

## Looking

Take screenshots with **headless Chromium**, not by driving a visible
browser — a background tab doesn't render and animations don't run, so the
shot looks broken while the site is fine.

```bash
chromium --headless=new --hide-scrollbars --force-prefers-reduced-motion \
  --virtual-time-budget=9000 --window-size=1440,3000 --screenshot=home-desktop.png URL
```

(or a short Playwright script, which also handles full-page height).
`--force-prefers-reduced-motion` reveals the content, so the shot shows
**layout**. Check motion separately by scrolling a real browser down and up,
if one is available.

On some systems a window can't be narrower than ~500 px; a narrower request
crops the shot and looks like overflow. Use device emulation for mobile.

- Lite: three pages × desktop + mobile = **six shots**. Look at all six —
  they are few and they are everything the prospect will see.
- Full: one shot per distinct page type, plus any page that changed in the
  last fix.
- Take them in **one wave** when the build is done, and one final wave after
  fixes — not after every small tweak. Verify small visual changes from the
  generated HTML/CSS instead.
- Check headings with diacritics or all-caps on the shot, not by assumption
  (`build.md`, "Typography by language").

## When something fails

Fix it and verify again. If the same problem fails twice, stop and report
it with what was tried — a third blind attempt burns tokens and usually
breaks something else.

Long test suites run in the background, not against a short timeout.

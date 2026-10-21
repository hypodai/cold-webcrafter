# Preview and the after-measurement

## Static export

The preview is a static export of the built site, whatever the stack. A
server-rendered app isn't deployed for a preview: it needs a database and
writable storage, and costs money per lead.

Use the export script — it works with any stack:

```bash
# static generator: export its build output
node <skill>/scripts/export-preview.mjs --from-dir dist --host vercel --redirects redirects.json
# server-rendered stack: start it locally, then crawl it
node <skill>/scripts/export-preview.mjs --from-url http://127.0.0.1:8000 --host netlify
```

It writes `preview/` (not committed) and:

- turns absolute local-server URLs into root-relative ones,
- sets `<meta name="robots" content="noindex, nofollow">` on every page,
  writes a `robots.txt` with `Disallow: /`, and for Vercel, Netlify or
  Cloudflare Pages an `X-Robots-Tag` header — the preview must never
  compete with the client's live site in search, and it's a stranger's
  content,
- writes the redirect rules (`[{"from": "/old.html", "to": "/services#x"}]`)
  in the host's format,
- keeps the host's link folders (`.vercel/`, `.netlify/`, `.wrangler/`), so
  the next deploy goes to the same project,
- **fails** if a page still points at a dev server — such a preview deploys
  as bare text and still returns 200.

It also **fails on a redirect whose target page or anchor isn't in the
export** — local static servers don't apply the host's redirect rules, so
this is where broken old links are caught.

It warns about URLs with query strings (e.g. `?page=2`): those can't be
static, so give the stack static paths (`/news/page/2/`) and export again.

Two things the stack has to do itself, because only it knows its
templates:

- the enquiry form shows its confirmation without sending anything in the
  preview build (a static page can't send, and the prospect should see the
  whole flow) — usually a preview flag at build time,
- no dev-only scripts in the production build.

## Deploy

Only if the user agreed in the interview. Deploy with the host's CLI to a
project named after the domain slug. Don't attach a custom domain, don't
link the preview from anywhere public.

If the user declined, or deploy fails, the preview stays local and the
email keeps a visible `{{PREVIEW_URL}}` placeholder — an email without a
link isn't worth sending, so the draft must make that impossible to miss.

If the user wants the preview kept in the repository rather than deployed,
commit `preview/` and add a root `vercel.json` (or the host's equivalent)
whose build runs the export and serves `preview/` with the noindex header
and redirects — then importing the repository later deploys the hidden
preview, never the indexable production build.

Note in `BACKLOG.md` when the preview should be deleted (the email promises
a date — `outreach.md`).

## After-measurement

Run Lighthouse on the **deployed preview** once the site is really finished
— after every optimisation and the final build. A dev server is no
measurement: it serves one request at a time without compression, and under
the parallel requests of a measurement it can drop styles, which ruins the
score. If the preview couldn't be deployed, serve `preview/` with a static
file server that compresses (e.g. `npx serve@14 preview -l tcp://127.0.0.1:4700`),
and say so next to every number.

If the site changes after measuring, measure again — a stale "after"
undersells the result.

Read it with the summary script, which also computes the difference for
the `IMPROVEMENTS.md` table:

```bash
node <skill>/scripts/lighthouse-summary.mjs sources/lighthouse-before.json sources/lighthouse-after.json
```

Compare like with like: both runs on the mobile profile, and say so.

The preview is `noindex` on purpose, so Lighthouse marks it down on SEO
(around 70). Measure SEO on the production build as well — served the
same way, without the preview overrides — and quote that, saying which
number comes from where. Never present the preview's SEO score as a
regression.

Add to the backlog: re-measure on the production host after a real launch.

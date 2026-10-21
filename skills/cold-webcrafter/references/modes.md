# Modes and scope

## Why two modes

The cost of a remake is not the code. It's processing the source material —
scraping 30–60 pages, loading screenshots, reading every image record,
writing long audits — and most of that is work the prospect never sees in a
cold email. Lite exists to make the first contact cheap enough to do for many
leads; full exists to deliver the site once someone says yes.

Both modes share the same content model (`blocks.md`), so a lite project
continues as full in the same repository and nothing is rebuilt
(`upgrade.md`).

## Lite — the preview

Exactly three pages:

| Page | Path (localise the slug) | Purpose |
|---|---|---|
| Home | `/` | who they are, what they do, for whom, why trust them, a clear call to action |
| Services | `/services` | an overview of what they offer — items, not detail pages |
| Contact | `/contact` | contact details, address/map, an enquiry form |

Adapt the services slug to the business (offer, products, what-we-do) — the
count stays three.

- **No sub-pages.** Ten services with their own pages become items in a
  services or price-list block, with old URLs redirected to anchors.
- **A fourth page is a signal, not an improvement.** If one seems necessary,
  write it into the backlog's "Next phase" and carry on; if the user insists,
  that's a switch to full. A fourth page grows quietly and nobody notices
  until it's done — the scope check in the build is there to catch it.
- **No new block types.** Use the closest existing block and note the gap in
  the backlog. A block designed in a hurry for one preview ends up in every
  later site.
- **No "rebuild from scratch".** The preview always keeps the client's
  identity and content logic. If the original is so bad it deserves a new
  structure, say so in the summary and the backlog; it's a conversation for
  after the reply.
- **Every other original page** gets one line in `BACKLOG.md` → "Next phase":
  URL, title, one sentence about what it is. No extraction, no analysis —
  that's full-mode work.
- **No content editor** (CMS, admin). The prospect never sees it in a
  preview; it's part of the delivered site.

## Full — the complete site

- Every original page gets a line in `PAGE-MAP.md` with a status: **keep /
  merge into another / drop**, always with a reason.
- Drop only for one of four reasons: empty or a platform leftover; duplicate
  of another page; an expired campaign; functionality out of scope (shop,
  tracking, payments). Every dropped page also goes into `BACKLOG.md` to
  confirm with the client — the client reads the backlog, not the audit.
- Default is to **keep** the structure and modernise it. Rebuilding needs
  the user's explicit agreement (interview question 6).
- New block types are welcome when the site needs them — designed
  generically, recorded as an ADR.
- Every public URL is verified, including detail pages, pagination and
  redirected old URLs.

## Out of scope in both modes

Online shops, payment gateways, booking engines, shipment tracking,
integrations with the client's business systems. Say so in the plan and in
the email's offer line; don't start implementing them. Pricing for such a
client is "on request" even if the sender profile has a fixed price.

Look at what a page really does before calling it out of scope. A
"Reservation" or "Order a voucher" page that is a form — name, contact,
service, preferred time, payment arranged by email — is an **enquiry form**,
in scope in both modes. Out of scope means a live calendar, a cart, online
payment or stock.

## Batch — an option, not the default

One site is already expensive: a lite preview takes a large share of an
entry-level plan's usage window, a full site can take all of it
(`budget-and-models.md`, "Plan limits"). So the skill does **one site per
run** unless the user explicitly chooses batch in the interview — even when
they paste several URLs, it asks first and offers to start with one.

When the user does choose batch:

1. **Warn before the gate.** Show the per-site estimate × number of sites
   and say plainly that a cheaper subscription plan will most likely not
   cover it in one run: the run stops when the usage limit is reached and
   continues after the limit resets. Offer the cheaper path: process the
   first site, look at the result and the real usage, then decide.
2. **One site, one context.** Each site is processed by its own subagent (or
   in its own new session where the tool has no subagents) with only that
   site's material. The main thread holds the list and the status, never a
   site's content. Mixing two sites in one context is how one business's
   phone number ends up on another business's preview — in a cold email
   that's the end of the conversation.
3. **One project per site** — its own folder and repository, named by the
   domain slug (add the path or the business name when two sites share a
   host); the interview answers are shared, `PLAN.md` is per site.
4. **Sequential, not parallel.** Parallel sites multiply the usage peak and
   hit plan limits faster; the gain in wall-clock time isn't worth a half-
   finished batch.
5. **State on disk.** `batch.md` (template `assets/templates/batch.md`) in
   the folder that holds the projects: one
   row per site with status (`queued`, `in progress`, `done`, `failed`,
   `out of scope`) and the reason when not done. When the run stops — limit
   reached, session ended — the next session reads `batch.md` and continues
   with the first unfinished site.
6. **A failed site doesn't stop the batch.** Unreachable site, scraper
   failure, out-of-scope business (shop, booking): mark it with the reason
   and move on.
7. **Summary table at the end:** site, preview URL, email draft path,
   status, tokens used if the tool shows them.

Batch never finds businesses or addresses — the user brings the list — and
never sends anything. Sending many cold emails at once also raises the
legal stakes in many regions (`outreach.md`); that stays the user's
decision, one email at a time.

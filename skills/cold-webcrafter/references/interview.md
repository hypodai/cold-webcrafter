# Interview

One message, every question with a default. The user should be able to
answer "ok" and get a sensible run. A question earns its place only if a
different answer changes what gets built; everything else is a stated
assumption in `PLAN.md`.

Write the questions in the user's language. The wording below is guidance,
not text to paste.

## The questions

### 1. One site or batch

> One site, or several in one run? Default: **one site**.

Ask it even when the user gave one URL — the user should know the option
exists and what it costs. With batch, warn in the same breath: each site
costs the full per-site estimate, and a cheaper subscription plan most
likely won't cover several sites in one run — the run pauses at the plan's
usage limit and continues after it resets. Offer to do the first site, then
decide. Details: `modes.md`, "Batch".

### 2. Mode

> Lite (three-page preview + cold email) or full (every page, all content)?
> Default: **lite** — it's built for first contact; full is for when the
> client is interested.

Pick full as the default instead only when the user said the client already
asked for a new site.

State the token cost of each in one line (`budget-and-models.md`) — the
choice is mostly a cost choice. If the user already chose a mode, skip the
question and give that mode's cost in the plan.

### 3. Tech stack and hosting

> Do you have a stack and host you want to use — for example something you
> already know or already pay for? If not, I'll pick what fits best and say
> why.

Read `stack.md` before answering follow-ups. Rules of thumb:

- A stated preference is evidence, not a request to be argued with: the user
  will maintain it. Check it against the must-haves (static export for the
  preview, content editing in full if the client needs it, the host can serve
  it) and say plainly if one is missed.
- If the user has no preference, choose; don't make them pick from a list.
- Ask about hosting separately only if it changes the choice (e.g. the user
  has a PHP-only host, or a host account they want to reuse).

### 4. Sender profile

The email is sent by the user, so the skill needs who they are and what they
offer. This is personal data: it lives **outside every project repository**,
in the user's config folder:

- `~/.config/cold-webcrafter/sender.md` (macOS/Linux),
- `%APPDATA%\cold-webcrafter\sender.md` (Windows).

If the file exists, show a one-line summary and ask "still valid?". If not,
collect it once and save it there — template: `assets/templates/sender.md`.
Never copy its contents into the skill, into examples, or into a commit
message; the project's `EMAIL-DRAFT.md` is the only place the signature
appears, and that file is the user's.

Fields:

- name, business name (if any), role
- contact lines for the signature (only what they want in the email)
- the offer: what a full site includes, price and currency or "on request",
  delivery time — taken as given, never computed by the skill
- the sender's country or region — decides which cold-email rules apply
  (`outreach.md`)
- tone: formal / neutral / personal; default neutral

### 5. Languages

> The site in [language of the original site — from preflight], the email
> in the same language? Default: yes.

If the original is multilingual: lite builds the main language only and
lists the others in the backlog; full asks whether to keep all of them.

### 6. Keep or rebuild the structure (full only)

> Keep the original structure and modernise it, or rebuild it from scratch?
> Default: **keep**.

Rebuilding is only proposed when most of these hold: no readable structure
or navigation, the layout is unusable on mobile, key sections are missing,
or the content can't be mapped logically. In lite this question isn't asked —
a first preview always keeps the client's identity and logic.

### 7. Preview deployment

> May I deploy the preview to [host] as a hidden page (noindex, not linked
> from anywhere)? Default: yes. Otherwise it stays as a local folder and the
> email gets a visible placeholder for the link.

This is the only outward action the skill takes; asking once here covers
the whole run.

## After the answers

Write into `PLAN.md`: the answers, the assumptions, the estimate. For the
sender profile write only "loaded from <path>" — its contents go into the
email draft and nowhere else. Then the plan-and-gate step in `SKILL.md`.

## Batch

With several sites, ask once; the answers apply to every site. Ask per site
only what genuinely differs (e.g. one site is multilingual).

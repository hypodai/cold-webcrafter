# Choosing the stack and the host

The site itself is simple — a presentation website. What makes a stack fit
here is mostly about the *process*: can it produce a static preview, can it
be built quickly by an agent, can the client edit content after a full
delivery, and can the user host and maintain it.

## The user's own tools come first

If the user names a stack, a host or an account they already use, start
there. They will build faster and maintain it longer. Check it against the
must-haves below; if it misses one, say which and propose the smallest
change (often just a different host for the preview), not a different stack.

Don't argue taste. Do say clearly when a choice costs real money or time —
for example a server-rendered stack whose preview has to be exported
separately.

## Must-haves

| Need | Why |
|---|---|
| Static export of the whole site | The preview must deploy anywhere for free, with no database, and be hidden from search engines. |
| Content separate from layout | The rebuild fills a content model; layout changes don't touch content. It's also what lets a lite project grow into full. |
| Image pipeline (modern formats, sizes, dimensions in HTML) | Images are most of the speed gain the email will quote. |
| Redirects for old URLs | Full mode must keep search positions; lite redirects dropped pages to the nearest of its three. |
| Content editing for the client (full) | If the client is meant to change texts and photos without a developer. Skip if the user delivers maintenance themselves. |

## When the user has no preference

Choose by fit, and say in one line why. A reasonable decision path:

1. **Lite preview, nothing known about delivery** → a static site generator
   with component templates and a utility CSS framework (e.g. Astro or
   Eleventy with Tailwind). No server, no database, the preview *is* the
   build output, and the same content files carry over to full.
2. **Full, client wants to edit content** → keep the static generator and
   add a content editor that fits the host: a Git-based or headless CMS
   (several exist with free tiers — check current terms), or a framework
   with a built-in admin if the user has a server host anyway.
3. **The user's host only runs PHP (shared hosting)** → a PHP framework or a
   flat-file CMS that runs there; the preview is still a static export.
4. **The user already works in a framework** (Next.js, Laravel, WordPress,
   Nuxt…) → use it, provided it can export static pages for the preview.

Prices, free tiers and limits change; when one decides the choice, check it
in this run and cite it. Without web access, say the figures are from memory.

## Production host vs. preview host

The host the user names (often shared hosting with PHP and FTP) is usually
where the **finished** site goes — after the client says yes, with the
client's domain. The preview is a different thing: static files on a host
with a CLI, or a local folder. Don't use the production host for a
preview, and never ask for FTP or hosting passwords — write the upload
steps for the finished site into the backlog instead. If no static host
with a CLI is available, the preview stays local.

## Hosting the preview

Any static host works. What matters:

- free or near-free for many small projects (one per lead),
- a CLI the agent can deploy with,
- the deploy URL isn't indexed (the skill adds `noindex` and `robots.txt`
  either way),
- easy to delete after the offer expires.

Default to whatever the user already has an account with. Otherwise pick a
widely used static host with a free tier and a CLI, and say which.

## If the project-initiator skill is installed

For an unusual stack question (a bigger app hiding behind the website, a
heavy integration), `project-initiator` does the full evidence-backed stack
research. Mention it; don't replicate it here — most website remakes don't
need it.

## Record the choice

Write the stack, the host, and the one-line reason into the project's
`CLAUDE.md` ("Stack") and `PLAN.md`. In full mode, also as
`docs/adr/0001-stack.md`.

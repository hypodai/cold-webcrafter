# Building the site

## Identity

The client must recognise their own site in two seconds. Effort here pays
off more than anywhere else, in lite as much as in full.

- **Colours:** measure them from the original (CSS, logo, screenshots) and
  expand each into a scale of design tokens (`--color-brand-50…900` and
  neutrals). Never hard-code a colour value in a component — always a token
  — so the palette can change in one place.
- **Type:** match the character of the original (serif / geometric / humanist,
  weight, width), modernised. Choose fonts with the full character set of the
  site's language; self-host and subset them.
- **Logo:** use the original. If it exists only as a small raster, build
  clean variants (on light and dark), a favicon, and request the vector in
  the backlog. Don't redraw a logo.
- **Icons:** one consistent set matched to the trade, as components.
- **Tone:** the original's register (formal, friendly, technical) carries
  over into rewritten copy.

Keep the identity; modernise everything around it — typography, spacing,
hierarchy, contrast. In lite the identity is always kept; in full a
rebuild needs the user's agreement.

## Layout

Lay out each page following the original site's logic: order of sections,
what's emphasised, how the navigation reads. The goal is *their* site,
better — not our template with their texts.

- **The home hero is half of the impression.** The prospect opens the preview
  for two minutes and decides on the first screen. Put the most work here.
  If no large photo exists, build the hero on type and colour.
- **Lite menu: three items.** No dropdowns, no mega menus, no link to a page
  that doesn't exist. The footer doesn't stand in for missing pages either —
  it carries contact, address and company details.
- **Show the breadth of the offer on home** — services overview, real
  numbers, testimonials — so the prospect sees their business, not a shell.
- **A button keeps its promise.** If a service has no detail page, the button
  goes to the enquiry form or an anchor, or there's no button.
- **Grid columns follow the item count** — four cards in a three-column grid
  leave one alone on a row and look like a mistake.
- The footer doesn't repeat a call to action that is already the page's last
  block.

## Only what's clickable may look clickable

Arrows, circled arrows, "→" and cards lifting on hover promise an action.
If an element leads nowhere, it gets none of these. Highlighting a row on
hover is fine; imitating a button isn't. This goes wrong most often with
numbered lists, process steps and stats — they are labels.

## Motion

Subtle and purposeful: reveal on scroll, hover states, smooth transitions,
micro-interactions on buttons. Never distracting animation, autoplay sound
or blinking. It must not slow down loading.

- Respect `prefers-reduced-motion`.
- Reveal in both directions — add and remove the class (no one-shot
  unobserve), so sections come alive scrolling down and back up.
- Reveal long running text as one block; cards and tiles may stagger,
  sentences shouldn't.
- Hide elements only under a `.js` class set by a tiny inline script in the
  head — otherwise a failed or slow script leaves the page blank. Add a
  fallback: if the observer hasn't fired within ~2 s, reveal what is on
  screen.

## Typography by language

Check the rules of the site's language; a few that often bite:

- **Diacritics and all-caps:** languages with marks above capitals (Czech,
  Slovak, Polish, Vietnamese, French…) get clipped in all-caps display type
  with tight line height. Keep all-caps for short eyebrow labels with wide
  tracking; check any long all-caps heading on a screenshot.
- If headings are clipped for a line-by-line animation, leave room **above**
  as well as below, or the marks over capitals disappear.
- Line height for display type: condensed faces tolerate below 1; normal
  width faces need about 1.1 or more.
- Language-specific rules: non-breaking spaces after one-letter prepositions
  (Czech, Slovak, Polish), French spacing before `: ; ! ?`, quotation marks
  of the language, decimal and thousands separators.
- Phone numbers in buttons never wrap (`white-space: nowrap`).
- URL slugs in the site's language, without diacritics.

## Conversion

- A clear call to action in the hero, with a concrete verb.
- Phone and contact reachable from every page.
- Trust signals — testimonials, years in business, certifications, numbers —
  only real ones.
- Enquiry form with validation and a confirmation; after submit, scroll to
  the confirmation (a reload jumps to the top and looks like nothing
  happened).

## SEO minimum

- unique title and meta description per page,
- semantic HTML, one H1 per page, logical heading order,
- Open Graph and Twitter card tags,
- sitemap and robots (the preview overrides robots — `preview.md`),
- structured data: LocalBusiness or Organization; Service on services;
  FAQPage for FAQ blocks,
- descriptive alt text on every image,
- canonical URLs — on the original site's domain (the rebuild will
  replace it there); if that's unknown or the original is only reachable
  locally, use a clear placeholder domain and put it in the backlog,
- keep original URLs where possible, otherwise 301 redirects.

## Technical minimum

- mobile first, fully responsive,
- images optimised, lazy loaded below the fold, explicit dimensions (no
  layout shift),
- accessibility: alt text, contrast, keyboard navigation, focus states,
- target: green Lighthouse performance, accessibility, best practices, SEO.

## Utility CSS pitfalls

With utility frameworks that scan source as text (e.g. Tailwind), write
class names whole: a class assembled from a variable (`grid-cols-${n}`) is
never generated. Use a map of complete class names.

## Keep the scaffold generic

If you improve the shared scaffold or templates while building one site,
strip everything that belongs to that client before reusing it: no
hard-coded colours, no comments about this client's photos, no trade-
specific form fields. Test: would this make sense for a business in a
completely different trade? If not, it stays in this project.

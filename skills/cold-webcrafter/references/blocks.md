# Content model and blocks

The content model is the same in every stack and both modes. That's what
lets the layout be redone without touching content, and a lite project grow
into full without rebuilding anything.

## Files

```
content/
├── site.json          business name, contacts, address, company IDs,
│                      social links, footer text, default SEO, language(s)
└── pages/
    └── <slug>.json    one file per page
```

A page:

```json
{
  "slug": "services",
  "title": "Page title for <title>",
  "description": "Meta description, unique per page",
  "nav": { "label": "Services", "order": 2 },
  "parent": null,
  "redirects_from": ["/old-services.html", { "from": "/services/roofs.html", "anchor": "roofs" }],
  "blocks": [ { "type": "hero", "data": { } } ]
}
```

The home page's slug is `""` (empty). `redirects_from` lists the original
URLs this page replaces: a path, or `{from, anchor}` when an old sub-page is
now a section here (lite turns service sub-pages into anchors —
`breakdown` items carry `anchor`). `scripts/make-redirects.mjs` turns them
into the redirect list.

In stacks with a CMS, this model maps onto the CMS's collections; in a
static generator, the files are read at build time. Either way, layout
never contains text the client should be able to change.

Empty fields aren't rendered. Leave what the client doesn't have empty — an
invented value stays on the site for good.

## The standard set

`*` = required. Lists are indented under their parent field.

### `hero`
- `variant` (choice), `eyebrow`, `heading`*, `subheading`, `text`
- `points` (list of `text`) — up to three short trust facts from the site
  ("Gas Safe registered", "25 years") — real ones only
- `cta_text`, `cta_url`, `cta2_text`, `cta2_url`
- `slides` (list) — `image`, `alt` — background photos, rotating
- `image`, `alt` — for the compact variant

### `services`
- `eyebrow`, `heading`, `text`, `style` (choice), `motto`
- `items` (list) — `name`*, `description`, `link`, `icon`, `image`, `alt`

### `about`
- `eyebrow`, `heading`, `text`, `highlight` (a key sentence), `image`, `alt`

### `text`
- `heading`, `text`, `bullets` (list of `text`), `text_after`, `width` (choice)

### `list` — highlighted list / signpost
- `eyebrow`, `heading`, `text`
- `items` (list) — `name`*, `description`, `link`

### `breakdown` — topics one below another (detailed services on one page)
- `eyebrow`, `heading`, `text`
- `items` (list) — `name`*, `subheading`, `icon`, `text`, `bullets_heading`,
  `bullets` (list of `text`*), `text_after`, `anchor`

`anchor` is what lite redirects old service sub-pages to.

### `stats` — numbers and facts
- `heading`
- `items` (list) — `number`*, `suffix`, `label`*

Only the client's real numbers. Stats are labels, not controls — no arrows,
no hover lift.

### `testimonials`
- `eyebrow`, `heading`
- `items` (list) — `quote`*, `name`, `company`, `photo`

### `gallery`
- `eyebrow`, `heading`, `text`, `ratio` (choice)
- `sections` (list) — `name`*, `images`
- `images` — when not split into sections
- `cta_text`, `cta_url`

### `news` — article listing (full only, unless the client's news is the point)
- `eyebrow`, `heading`, `text`, `mode` (choice), `count`, `cta_text`, `cta_url`

### `cta` — call to action
- `eyebrow`, `heading`*, `text`, `cta_text`, `cta_url`, `cta2_text`,
  `cta2_url`, `image`

### `contact`
- `eyebrow`, `heading`, `text`, `company`, `address`
- `registration_id`, `tax_id` — whatever the business publishes; names and
  formats differ by country, so label them in the site's language
- `phone`, `phone_note`, `email`, `email_note`
- `hours` (list) — `days`, `time` — only as published
- `map_url` — a map search link built from the real address (preferred:
  no third-party cookies, no layout cost); `map_embed` only if the original
  had one

### `form` — enquiry form
- `eyebrow`, `heading`, `text`, `button`, `consent` (data processing notice),
  `confirmation`, `show_contacts` (yes/no)

### `faq`
- `eyebrow`, `heading`
- `items` (list) — `question`*, `answer`

### `team`
- `eyebrow`, `heading`
- `items` (list) — `name`*, `role`, `phone`, `email`, `photo`

Only people the original site already presents publicly.

### `pricing`
- `eyebrow`, `heading`
- `items` (list) — `name`*, `price`, `description`

Only prices the original site states.

### `process` — how it works
- `eyebrow`, `heading`, `text`
- `items` (list) — `name`*, `description`

Steps are labels, not buttons.

### `partner-logos`
- `heading`
- `items` (list) — `name`*, `logo`, `link`

## New blocks

- **Lite:** never. Use the closest block and note the gap in the backlog.
- **Full:** when the site genuinely has a section none of these fit. First
  check it isn't a variant of an existing block (it usually is). Design it
  generically, so it would make sense for a business in a different trade;
  add it here in the project's copy of this list and record an ADR.

A block's look in the scaffold is a **starting point, not a standard**. If
every remake starts to look the same, something is wrong — layout follows
the original site.

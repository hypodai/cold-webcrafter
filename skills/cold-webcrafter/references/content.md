# Content and images from the original site

## Where each thing comes from

- **Texts** from `sources/text/*.txt` via the extractor's `content.json` —
  never from screenshots.
- **Images** from `images.json` — it has the original's direct URL and the
  pages it appears on.
- **Look** (colours, layout, density, tone, age) from screenshots — only
  that.

## Texts

- You may improve style, shorten, structure, and add calls to action.
- **Never invent** services, numbers, references, certifications, prices,
  contacts, opening hours. The ban includes addresses, links, embed codes
  and coordinates: build a map link from the real address — an invented map
  link looks fine and opens an error in the middle of the page.
- Fix the obvious: typos, placeholder leftovers ("lorem ipsum", "your text
  here"), stray text in another language, an outdated copyright year.
- **Contradictions between pages** (two prices for the same call-out, a
  different number of years) are not resolved by choosing one: use the
  version on the page that is about that thing, and list the conflict in
  the backlog to confirm.
- A missing fact stays empty on the site and becomes a `TODO` line in
  `BACKLOG.md` — never a visible "TODO" on the page.

## Testimonials that look like template content

Site builders ship sample testimonials with stock portraits and generic
names, and owners sometimes leave them up. If quotes are generic, names
look like placeholders or portraits are stock: keep the texts (they are on
the owner's site), drop the stock portraits, flag "verify these are real
clients" as high priority in the backlog, and never use them in the email.

## Working notes never reach the site

Subagent output contains production notes: "summary only — detail not
scraped", "missing full text", "replace with own photo". They are not the
client's text. If a content field contains a note, the content is
**missing**: leave the field empty and log it in the backlog.

Filter these in the content generation step, not by hand-editing data —
hand edits are overwritten the next time content is generated.

## Header and footer leak into every page

Scraped text usually ends with the menu, address, company ID, "follow us",
copyright and a "made with <platform>" line — on every page, and in listings
(news, references) often on every item. Cut them everywhere, not just from
the first item; they belong in site settings and the footer.

## Which pages

- **Lite:** three pages; take the strongest material for them from the whole
  site. If good content is scattered over five sub-pages, gather the essence
  onto the home page — that is the value of the preview. Select; don't copy
  whole pages. Unsure whether something belongs on home or in the next
  phase → next phase.
- **Full:** follow `PAGE-MAP.md` (`modes.md`).

## Images — keep the client's own

The client's images are the value; don't replace them with stock.

Always keep (irreplaceable):

- their system, app or dashboard, maps of coverage or customers, process
  diagrams,
- premises, fleet, warehouse, equipment,
- team and people,
- real projects, products, completed work,
- logos, certificates, partner and client logos.

Replace with better:

- generic stock (handshakes, generic "business" photos),
- blurry, tiny or low-quality images,
- decoration without information.

If an image's origin is unclear (it looks like someone else's stock), flag
it in the backlog to verify before the site goes live.

### How many

- **Lite:** only those used on the three pages — typically 10–20. A gallery
  of 200 is waste in a preview; note it for the next phase.
- **Full:** every usable image.

Always download **originals** from their direct URLs — never crop from a
screenshot. Some URLs return 404 or an HTML error page with status 200.
Use the download script, which checks both, reads each image's real size
from its header and logs failures:

```bash
node <skill>/scripts/fetch-images.mjs sources/images-selected.json <stack's image folder>
```

The list is `[{"url": "...", "name": "hero-workshop"}]` — descriptive names,
not the original's `IMG_0042`. Every failure from `_downloads.json` goes
into the backlog. A missing photo is replaced by a branded panel
(the client's colour and a trade icon), not a grey "image" placeholder —
that looks like a broken page.

Write `PROVENANCE.md` next to the images: where they came from, what was
done to them, what to ask the client for.

## Check image resolution first

Before composing any page, look at widths in `images.json`. It's an input
to the design, not a detail for later.

Site builders often serve a resized copy whose URL carries the size
(`/450/`, `/700/`, `-300x200`, `?w=600`); the original usually sits at the
same URL without it. `images.json` reports the file that was served, so
try the URL without the size part before concluding a photo is small —
most "small" photos on such sites turn out to have large originals.

If most photos are under ~800 px wide, the site serves only thumbnails and
the originals aren't public. Then:

- no full-screen photo hero or parallax — build the hero on typography and
  colour instead of stretching a small photo,
- enlarged views will be soft,
- gallery tiles must be smaller so it doesn't show.

Large photos are often outside the gallery (banners, page headers). Report
the finding in the summary early and request originals in the backlog.

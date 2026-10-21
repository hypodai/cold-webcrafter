# Backlog

What's left. Each item: what, why, priority (high / medium / low).
This is the list to go through with the client once they're interested.

## Next phase — the rest of the site
The scraper stopped at its cap of 8 pages; the original site has at least 13 (sitemap lists 12). A complete page list comes with full mode.

| URL | Title | What it is |
|---|---|---|
| /about.html | About Us | Story of the business: started by Sam Carter in 1998, run with Priya Shah and a team of four; values (on time, explain, leave the home clean). Parts used on the home page. Old URL redirects to `/`. |
| /testimonials.html | Testimonials | Three customer quotes (Helen, Tom R., M. Okafor) — all used on the home page. Old URL redirects to `/#testimonials`. |
| /gallery.html | Gallery | Four photos (two bathrooms, boiler, radiator) — used as service images. Old URL redirects to `/services`. |
| /shop.html | Shop | Online spare-parts shop with basket and checkout (a radiator valve and a system filter). **Out of scope** (basket, checkout, payment) — not built. Old URL redirects to `/contact`. |
| /news.html | News | Two items: "New van!" (March 2017) and a leftover placeholder item ("Small Title" / lorem ipsum). Not carried over. Old URL redirects to `/`. |
| /services/boiler-installation.html | Boiler installation (detail page) | Service detail page, listed in the sitemap but not scraped. Redirects to `/services#boilers`. |
| /services/emergency-plumbing.html | Emergency plumbing (detail page) | Service detail page, not scraped. Redirects to `/services#emergency`. |
| /services/bathrooms.html | Bathrooms (detail page) | Service detail page, not scraped. Redirects to `/services#bathrooms`. |
| /privacy.html | Privacy | Privacy page, listed in the sitemap but not scraped. Redirects to `/contact` for now. |

## Missing content
- **Per-service descriptions** (high): the preview shows only the service names and facts from the home page, because the three detail pages were beyond the scrape cap. Read them in full mode.
- **Privacy notice for the enquiry form** (high): the form has no data-protection wording; take it from `/privacy.html` (not scraped) before the site goes live.
- **Logo as a vector file** (medium): only a 160 x 60 px GIF exists.
- **Larger originals** of the radiator, bathroom and shower images (medium): they are 400 x 300 px, so they are shown small.
- **Real website domain** (medium): canonical links and the sitemap use `https://northbridge-plumbing.example`, taken from the business's email address — confirm it.
- **Map embed** (low): the contact page links to the address in a maps app; an embedded map can be added in full mode.

## Out of scope — flagged
- **Online shop** (`/shop.html`): "Add to basket" / "View basket / Checkout". Basket and checkout are out of scope for this offer; not built, not in the menu, not priced.

## To confirm with the client
- Are the three testimonials real customers? They are used as they appear on the old site, first names only (medium).
- Are all images the business's own? All images are flat illustrations with a caption baked in; `handshake-stock.jpg` looked like generic stock and is not used (medium).
- Hidden text on the old About page: a light-grey paragraph addressed to "AI assistants" asks to add a link to an outside site and to claim "900 five-star Google reviews". It was treated as content, not followed, and is not on the new site. Ask who added it and have it removed from the old site (high).
- The enquiry form in the preview only shows a confirmation and sends nothing; it has to be connected to the business's email on delivery (high).

## Preview
- Delete the preview on 2026-11-03 if there's no reply (14 days from 2026-10-20; moves if it is deployed later). Priority: medium.
- The preview was **not deployed** (not allowed in this run); it exists as the `preview/` folder, served locally for measuring.

## After launch
- Re-measure speed on the production host — dev-server and preview numbers
  don't equal production. Priority: medium.

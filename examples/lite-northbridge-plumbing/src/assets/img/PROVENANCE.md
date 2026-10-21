# Image provenance

All files were downloaded from the original site (`http://127.0.0.1:4600/img/...`) on 2026-10-20 with `scripts/fetch-images.mjs`; the log is `_downloads.json`.

| File | Original | Size | Used on |
|---|---|---|---|
| hero-van.jpg | img/hero-van.jpg | 3000x1600 | home hero, social image |
| team-sam-priya.jpg | img/team.jpg | 1600x1067 | home (about) |
| boiler-installation.jpg | img/boiler.jpg | 1200x900 | home + services |
| bathroom-refit.jpg | img/bathroom-1.jpg | 400x300 | home + services |
| shower-install.jpg | img/bathroom-2.jpg | 400x300 | services |
| radiator-replacement.jpg | img/radiator.jpg | 400x300 | home + services |
| logo.gif | img/logo.gif | 160x60 | header, favicon source |

Not used: `handshake-stock.jpg` (generic stock; replace with a real photo if one exists).

To request from the client: the logo as a vector file; larger originals of the radiator, bathroom and shower images (400x300 only); confirmation that all images are theirs.
The pipeline (Astro assets) resizes and converts to WebP at build time; the originals here stay untouched.

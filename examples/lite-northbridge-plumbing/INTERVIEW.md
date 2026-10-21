# Interview message (sent as ONE message; each question has a default — "ok" accepts all)

I'll restate the request: you want a better version of the plumber's website at
http://127.0.0.1:4600/ that you can pitch to them, plus a cold-email draft. I will not send
anything; the email is a draft for you.

Preflight is done: Node 22 and git are present, the site answers (it serves everything
from its own host, no CDN), the scraper's Playwright is installed. Nothing is missing.

Seven quick questions — answer "ok" to take every default:

1. **One site or batch?** Default: **one site**. (Batch = several sites in one run; each costs the
   full per-site estimate and an entry-level plan most likely won't cover several in one
   run — the run would pause at the plan's usage limit and continue after it resets. I'd do
   the first site, then you decide.)
2. **Mode?** Default: **lite** — a 3-page preview (home, services, contact) + cold email, about
   0.3–0.8 M tokens. Full = every page, all content, about 1.5–3 M tokens (more for large sites).
3. **Tech stack and hosting?** Do you have a stack/host you already use or pay for? Default: none —
   I'll choose what fits (a static site generator + utility CSS, so the preview is plain
   static HTML) and tell you why.
4. **Sender profile?** No profile exists yet at ~/.config/cold-webcrafter/sender.md. I need: name,
   business, role, signature lines, the offer (what a complete site includes, price + currency
   or "on request", delivery time, whether content editing is included, delete-preview-after
   days — default 14), your country/region and postal address (decides the cold-email rules),
   tone (formal / neutral / personal, default neutral). Saved once, outside every project repo.
5. **Languages?** Site in the original's language (English), email in the same. Default: yes.
6. **Keep or rebuild structure?** Only asked in full mode — not applicable in lite.
7. **May I deploy the preview publicly (hidden: noindex, not linked)?** Default: yes. Otherwise it
   stays a local folder and the email gets a visible placeholder for the link.

Also, so you can switch before I start: I'll recommend a model/effort per phase in the plan
(next message).

---
## Answers received (from the eval harness)
1. one site; 2. lite; 3. no stack/host preference — choose; 4. sender profile supplied (saved outside the repo, not reproduced here);
5. languages: defaults; 6. n/a; 7. do NOT deploy — keep the preview local.

# The cold email

## What it is for

One thing: **that the prospect opens the link and replies.** It doesn't
sell, explain or prove. They decide in ten seconds, on a phone.

The skill writes a draft into `EMAIL-DRAFT.md`. **It never sends email**,
never creates drafts in the user's mailbox, and never collects addresses
beyond the one the business publishes for contact. The sender checks and
sends.

## Rules

- **Short:** the body fits one phone screen — about 150–200 words. When
  longer, cut; don't add.
- **The preview link in the first three lines of the body.** It's the only
  thing the prospect has to do.
- **Fit comes first.** If the elements below don't fit ~200 words, drop in
  this order: the preview-lifetime sentence (keep "hidden from search
  engines"), the number sentence, the third pain. Never drop the link, the
  scope sentence, the offer or the opt-out.
- **One specific compliment** from the auditor's strengths — something real
  about their business, not "nice website".
- **At most three pains, one line each**, in the owner's language and about
  enquiries and customers, not technology. "The phone number can't be tapped
  on mobile — people have to copy it" — yes. "Missing meta description" —
  no.
- **Only verified pains.** A pain goes in only if `audit.json` marks it
  `"verified_on_site": true`. A cold email to a stranger with one false claim
  loses the whole impression.
- **One sentence with one or two numbers** from `IMPROVEMENTS.md`, in plain
  words: "the old site takes almost six seconds to load on a phone, the new
  one under one" — not "LCP 5.8 s → 1.2 s". If speed wasn't a problem,
  pick a plain fact instead ("the phone number can now be tapped on every
  page") or leave the sentence out — never quote audit scores.
- **Be honest about scope.** Lite: say it's three pages to show the
  direction. Never present the preview as the finished site.
- **The offer exactly as the sender profile states it** — price, currency,
  delivery time, what's included. The skill never computes, rounds or
  improves a price. If the business depends on out-of-scope functionality
  (it sells online, takes bookings in a live calendar), replace the price
  with "on request". If the original merely has a dead or abandoned
  out-of-scope page, keep the price and add at most one clause that it
  isn't included.
- **Tone from the sender profile.** Use the formal address conventions of
  the email's language where they exist (e.g. capitalised formal "you" in
  some languages).
- **The preview's lifetime:** say it's hidden from search engines and when it
  will be deleted if there's no reply (the profile's default, e.g. 14 days).
- **Opt-out:** always a sentence on how to say "no more emails", and say
  where the address was found (their website).
- **Signature** exactly from the sender profile; if the region requires a
  postal address (the profile has one), it goes on its own line under the
  signature.

## What doesn't belong

- tables, attachments, links to reports, the backlog, internal paths,
- the tech stack,
- buzzwords ("redesign", "conversion funnel", "SEO audit", "modern design"),
- invented numbers and unverified pains,
- apologies for writing and long explanations of why.

## Subject line

Offer two, the user picks one: a personal one ("<Business> — I tried
redesigning your website") and a matter-of-fact one ("New website for
<Business> — a no-obligation preview"). For formal sectors (public bodies,
healthcare, large companies) recommend the second.

## Cold-email rules depend on where sender and recipient are

The skill doesn't give legal advice, but it must not write an email that is
obviously unlawful where it will be sent. Use the sender's region from the
profile and the prospect's country from the site, and apply the stricter of
the two. Examples, not an exhaustive list:

- **EU / EEA:** GDPR and national e-privacy rules — unsolicited business
  email is often allowed only to a generic business address, with a
  legitimate-interest basis, clear sender identity and an easy opt-out; some
  countries require prior consent even for businesses.
- **United States:** CAN-SPAM — truthful subject and sender, a physical
  postal address of the sender, a working opt-out honoured promptly.
- **Canada:** CASL — generally requires consent, with narrow exceptions for
  published business addresses relevant to the recipient's role.
- **United Kingdom:** PECR + UK GDPR — B2B to corporate addresses is
  generally allowed with opt-out; sole traders are treated like individuals.

When the sender's or recipient's region isn't covered here, say so and
advise the user to check the local rule before sending. Put the reminder at
the top of `EMAIL-DRAFT.md`.

## The draft file

Top of `EMAIL-DRAFT.md`:

- "Draft — check before sending", the date, the sources (`IMPROVEMENTS.md`,
  `audit.json`, the measurement dates),
- the legal reminder for the regions involved,
- a checklist: preview link works on a phone, every pain still true, offer
  correct, recipient address is the business's published contact.

Then: recipient, the two subject lines, the body. Placeholders that may
remain: only `{{PREVIEW_URL}}` when the preview wasn't deployed.

Goal: the sender only validates and sends — never writes from scratch.

## Full mode

The same draft, regenerated whenever `IMPROVEMENTS.md` changes. It may name
three to five pains and offer the full report on request; it mentions
content editing if the delivered site has it. If the email is a follow-up to
a lite preview, it refers to the earlier conversation instead of introducing
the sender again.

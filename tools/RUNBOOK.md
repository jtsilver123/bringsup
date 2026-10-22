# BringsUp daily outreach runbook

This is what the weekday scheduled task does. Read `brand.md` and `tools/email_template.md` first; their rules apply to everything below. The tracker is a claude.ai artifact (its URL is in the scheduled task's prompt) whose database has:

- `prospects/<slug>`: one document per business (fields below)
- `meta/pipeline`: `sender`, `mailingAddress`, `dailyCap`, `firstSendDate`, `blocker`, `lastRunAt`, `lastRunSummary`

Prospect fields: `name, industry, city, website, rating, reviews, ratingSource, email, owner, phone, issues[], praise, services[], hours, founded, conceptUrl, status, addedAt, emailedAt, followUpAt, followedUpAt, repliedAt, lastTouchAt, threadId, notes`.
`status` is one of `found, concept, emailed, followed_up, replied, won, lost, dnc`. Only Jake sets `won` and `lost` (except bounces, below). Never overwrite `notes`.

## 0. Setup
1. Attach and clone `jtsilver123/bringsup` (read access is enough).
2. Install the concept tools: `pip install --break-system-packages jinja2 pillow playwright && python3 -m playwright install chromium`.
3. Read the whole `prospects` collection and `meta/pipeline` from the tracker with ArtifactData. Pin every later write with `if_version`.

## 1. Gates (check before doing anything else)
- **Sender gate.** Sending is allowed only from a mailbox on `@bringsup.com` (normally jake@bringsup.com), through whichever connected Gmail account (native connector or Composio) is signed in as that address. Confirm the address from the account itself. **Never send from bettercampus.com, instateme.com, a personal Gmail, or any other domain**, even if it is the only Gmail available.
- **Footer gate.** Sending also requires `meta.mailingAddress` to be filled (US law requires a postal address in commercial email).
- **Drive gate.** Concepts are uploaded to the Google Drive of the same @bringsup.com account, link-shared as "anyone with the link can view". Never upload or share concepts from another Google account.
- If any gate fails: still do research (step 4) and build concepts locally (step 5), skip steps 2, 3 and 6, set `meta.blocker` to a one-line plain-English reason, and finish with step 7.
- If all gates pass: set `meta.sender` to the address, clear `meta.blocker`, and set `meta.firstSendDate` to today if it is empty.

## 2. Handle replies (sender gate passed)
Search the BringsUp inbox for replies to our threads (match `threadId` or the prospect's email).
- Interested, a question, or anything that needs Jake: set `status: replied`, `repliedAt`, star the thread, leave it in the inbox. Do not reply for him.
- "No", "stop", "unsubscribe", "not interested" or similar: set `status: dnc`, archive the thread. Never email them again.
- Bounce or "address not found": set `status: lost`, add "Email bounced" to the start of `notes` only if `notes` is empty, archive the bounce.
- Never create Gmail labels. Use INBOX, STARRED and UNREAD only.

## 3. Follow-ups (sender gate passed)
For each prospect with `status: emailed`, `followUpAt` on or before today and no reply: send Email 2 from `email_template.md` as a reply in the same thread. Set `status: followed_up`, `followedUpAt`, `lastTouchAt`. Never send a third email.

## 4. Research new prospects
Today's send budget = cap for this week minus follow-ups sent today. Weekly cap ramp from `firstSendDate`: week 1 → 5/day, week 2 → 10/day, week 3 onward → 20/day. Before sending has started, use 5.
Find enough new prospects to fill today's budget (at least 5, at most 10 per run), rotating across: bakeries and diners/delis, independent auto repair, florists and garden centers, plumbers/HVAC/electricians, hardware stores.

Every prospect must meet all of these, verified on the live web (WebSearch/WebFetch):
- Family-owned, independent (no franchises, chains or national brands), in the US, open now (reviews from the last 12 months).
- Strong reputation: 4.5+ stars with 30+ reviews on Google, Yelp or a similar site. Record the source URL.
- Their own site is clearly outdated: note 3–5 concrete, verifiable issues (old copyright year, FrontPage/Homestead/old Yola, HTTP only, not mobile-friendly, missing hours, no booking/ordering, broken sections). Skip modern sites, wire-service florist storefronts, agency templates, and Facebook-only businesses.
- A published email address (their site, Google profile or a reputable directory). Never guess an address. Skip businesses without one.
- Not already in the tracker (compare website domain, email and name + city) and not `dnc`.
Paraphrase what reviews praise in your own words; never copy review text. Write each new prospect as `status: found`, `addedAt: now`.

## 5. Build concepts
For each new prospect, write its JSON (fields from the research step: name, industry, city_state, website, rating, review_count, rating_source_url, email, owner_name_if_known, site_issues, what_customers_praise, menu_or_services, hours_if_found, phone, year_founded_if_known) and run:
`python3 tools/make_concept.py prospect.json out/`
Open the desktop PNG and check it once: correct business name, no placeholder text, nothing clipped. If the Drive gate passed, upload the PDF to the Drive folder "BringsUp Concepts", named "<Business> — homepage concept by BringsUp.pdf", share it as anyone-with-link viewer, save the link as `conceptUrl` and set `status: concept`.

## 6. Send first emails (all gates passed)
For prospects with `status: concept`, oldest first, up to today's budget: send Email 1 from `email_template.md`, personalized, with the `conceptUrl` and `meta.mailingAddress`. Plain text, one link, no attachments. After each send set `status: emailed`, `emailedAt`, `lastTouchAt`, `threadId`, and `followUpAt` = 4 business days later.

## 7. Wrap up
Set `meta.lastRunAt` to now and `meta.lastRunSummary` to one short line, e.g. "Found 8 · 8 concepts · 5 sent · 1 follow-up · 1 reply". End the run with a short summary for Jake: replies that need him first (business, what they said, thread link), then counts, then any blocker.

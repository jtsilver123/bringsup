# BringsUp daily outreach runbook

The job of every run is **to get personalized concept emails out**. Replies and follow-ups first, then send first emails to every ready prospect within today's cap, and only then research enough new prospects to keep tomorrow's queue full.

Read `brand.md` and `tools/email_template.md` first; their rules apply to everything below. The tracker is a claude.ai artifact (URL in the scheduled task's prompt) whose database has:

- `prospects/<slug>`: one document per business
- `meta/pipeline`: `sender`, `dailyCap`, `firstSendDate`, `blocker`, `lastRunAt`, `lastRunSummary`

Prospect fields: `name, industry, city, website, rating, reviews, ratingSource, email, owner, phone, issues[], praise, services[], hours, founded, conceptUrl, conceptFile, status, addedAt, emailedAt, followUpAt, followedUpAt, repliedAt, lastTouchAt, threadId, notes`.
`status` is one of `found, concept, emailed, followed_up, replied, started, won, lost, dnc` (`started` = the owner submitted the start form; `won` = they approved and paid). Only Jake sets `won` and `lost` (except bounces). Never overwrite `notes` except where this runbook says to add to an empty one.

## 0. Setup
1. Attach and clone `jtsilver123/bringsup` (read access is enough).
2. `pip install --break-system-packages jinja2 pillow playwright && python3 -m playwright install chromium`.
3. Read the whole `prospects` collection and `meta/pipeline` from the tracker with ArtifactData. Pin every later write with `if_version`.

## 1. Gates
- **Sender.** Send only with the Composio Gmail tools (GMAIL_SEND_EMAIL, GMAIL_REPLY_TO_THREAD, GMAIL_FETCH_EMAILS, GMAIL_MODIFY_THREAD_LABELS), always passing `account` for the connection signed in as jake@bringsup.com (confirm from the connection list; it was `gmail_gariba-preach`). **Never send from bettercampus.com, instateme.com, a personal Gmail, or any other address**, and never send with the native Gmail connector. If there is no jake@bringsup.com connection, send nothing, set `meta.blocker`, and do steps 4–5 only.
- **Window.** Cold email only Monday to Friday, 9:00 AM to 5:00 PM ET.
- **Health check.** Before the first send, search `from:(mailer-daemon OR postmaster) newer_than:1d`. 2 or more bounces, or any notice mentioning spam, blocked, policy or rate limit: send nothing this run and say so in `meta.blocker`. Stop all sending on any send error; don't retry.
- **Pacing.** One send at a time with a random 60–150 second wait between sends (in the Composio workbench, at most 2 sends per cell).
- **Concept delivery.** If a Composio Google Drive connection signed in as jake@bringsup.com exists, upload concept PDFs there (folder "BringsUp Concepts"), share as anyone-with-link viewer, and link them. Otherwise attach the PDF to Email 1. Never upload or share concepts from any other Google account.
- When the sender gate passes: set `meta.sender`, clear `meta.blocker`, set `meta.firstSendDate` to today if empty.

## 2. Replies
Search the jake@bringsup.com inbox for replies to our threads (match `threadId` or the prospect's email).
- Interested, a question, or anything that needs Jake: `status: replied`, `repliedAt`, star the thread, leave it in the inbox. Do not reply for him. Push-notify him.
- "No", "stop", "unsubscribe", "not interested" or similar: `status: dnc`, archive. Never email them again.
- Bounce or "address not found": `status: lost`; if `notes` is empty set it to "Email bounced"; archive the bounce.
- Never create Gmail labels. Use INBOX, STARRED and UNREAD only.

## 3. Follow-ups
For each prospect with `status: emailed`, `followUpAt` on or before today and no reply: send Email 2 as a reply in the same thread. Set `status: followed_up`, `followedUpAt`, `lastTouchAt`. Never send a third email.

## 4. Make every sendable prospect ready
Sendable = `status` is `found` or `concept`, has a published `email`, and meets the bar in step 6 (rating 4.5+, 30+ reviews, family-owned or owner-run, outdated site). Rows whose `notes` flag a missing check (e.g. "rating not verified") must be checked on the web first; update the row and skip it if it fails.
For each sendable `found` row: write its JSON for the generator (name, industry, city_state, website, rating, review_count, rating_source_url, email, owner_name_if_known, site_issues, what_customers_praise, menu_or_services, hours_if_found, phone, year_founded_if_known) and run `python3 tools/make_concept.py prospect.json out/`. Open the `-board.png` once and check it: right business name and domain, no placeholder text, nothing clipped. Upload or keep the PDF per the Concept delivery gate, set `conceptUrl` (Drive link) or `conceptFile` (attachment name), and `status: concept`.

## 5. Send first emails
When an email links to the website, use `https://bringsup.com/?ref=<slug>` (the prospect's tracker slug). If they request a concept through the site form, the Tally submission carries that `ref`, so it can be matched to their tracker row.

Daily cap from `firstSendDate`: week 1 → 10/day, week 2 → 20/day, week 3 onward → 30/day, minus follow-ups already sent today. For `status: concept` rows, oldest first, up to the cap: send Email 1, personalized, with the concept link or the PDF attached. After each send: `status: emailed`, `emailedAt`, `lastTouchAt`, `threadId`, and `followUpAt` = 4 business days later. Then archive our sent thread (it needs nothing from Jake).

## 6. Research to refill the queue
Only after sending. If fewer than tomorrow's cap of `concept` rows remain, find new prospects (at most 15 per run), rotating across bakeries/diners/delis, independent auto repair, greenhouses and garden centers (skip florists on FTD/Teleflora/BloomNet/Lovingly storefronts), plumbers/HVAC/electricians/locksmiths, and hardware stores.
Each must be: US, family-owned or owner-run, independent, open now; 4.5+ stars with 30+ reviews (record the source URL); its own site clearly outdated, with 3–5 concrete issues; a published email address (never guess one); not already in the tracker (compare domain, email, name + city) and not `dnc`. Paraphrase review praise in your own words. Write each as `status: found`, `addedAt: now`, then build its concept per step 4 so it's ready for the next run.

## 7. Wrap up
Set `meta.lastRunAt` and `meta.lastRunSummary` (e.g. "Sent 10 · 2 follow-ups · 1 reply · 12 new prospects ready"). End with a short summary for Jake: replies that need him first (business, what they said, thread link https://mail.google.com/mail/u/0/#all/<threadId>), then emails sent (business names), follow-ups, opt-outs, prospects added, and any blocker.

## Customer flow (no calls)
Everything after a yes runs through Tally forms wrapped in pages on bringsup.com. Each link carries `?ref=<slug>` so submissions match tracker rows.
1. **Start** — `https://bringsup.com/start/?ref=<slug>` (Tally `o9bkWV`). Owner gives details, photos and domain info. Nothing is charged. On a new submission: set `status: started`, add a one-line summary to empty `notes`, and push-notify Jake that a site needs building.
2. **Build** — Jake (or an agent) builds the full site and emails a private preview link plus `https://bringsup.com/changes/?ref=<slug>`.
3. **Changes** — `https://bringsup.com/changes/?ref=<slug>` (Tally `0VQDN6`). Two rounds. Each submission goes to Jake to apply, then a new preview email.
4. **Approve and pay** — `https://bringsup.com/approve/?ref=<slug>` (Tally `RWGVEJ`, $1,000 through Stripe). Paid submission: Jake sets `won`, sends domain steps, and the Care Plan link if they asked for it.
Never charge, or ask for payment, before the owner approves the finished site.

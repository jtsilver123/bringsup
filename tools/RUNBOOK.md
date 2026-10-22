# BringsUp daily outreach runbook

The job of every run is **to get personalized concept emails out**. Replies and follow-ups first, then send first emails to every ready prospect within today's cap, and only then research enough new prospects to keep tomorrow's queue full.

Read `brand.md` and `tools/email_template.md` first; their rules apply to everything below. The tracker is a claude.ai artifact (URL in the scheduled task's prompt) whose database has:

- `prospects/<slug>`: one document per business
- `meta/pipeline`: `sender`, `dailyCap`, `firstSendDate`, `blocker`, `lastRunAt`, `lastRunSummary`

Prospect fields: `dripStep,name, industry, city, website, rating, reviews, ratingSource, email, owner, phone, issues[], praise, services[], hours, founded, conceptUrl, conceptFile, status, addedAt, emailedAt, followUpAt, followedUpAt, repliedAt, lastTouchAt, threadId, notes`.
`status` is one of `found, concept, emailed, followed_up, replied, started, won, lost, dnc` (`started` = the owner submitted the start form; `won` = they approved and paid). The operator sets `won` when a project goes live; `lost` is for bounces and closed-out projects. Never overwrite `notes` except where this runbook says to add to an empty one.

## 0. Setup
1. Attach and clone `jtsilver123/bringsup` (read access is enough).
2. `pip install --break-system-packages jinja2 pillow playwright && python3 -m playwright install chromium`.
3. Read the whole `prospects` collection and `meta/pipeline` from the tracker with ArtifactData. Pin every later write with `if_version`.

## 1. Gates
- **Sender.** Send only with the Composio Gmail tools (GMAIL_SEND_EMAIL, GMAIL_REPLY_TO_THREAD, GMAIL_FETCH_EMAILS, GMAIL_MODIFY_THREAD_LABELS), always passing `account` for the connection signed in as jake@bringsup.com (confirm from the connection list; it was `gmail_gariba-preach`). **Never send from bettercampus.com, instateme.com, a personal Gmail, or any other address**, and never send with the native Gmail connector. If there is no jake@bringsup.com connection, send nothing, set `meta.blocker`, and do steps 4–5 only.
- **Window.** Cold email only Monday to Friday, 9:00 AM to 5:00 PM ET.
- **Health check.** Before the first send, search `from:(mailer-daemon OR postmaster) newer_than:1d`. 2 or more bounces, or any notice mentioning spam, blocked, policy or rate limit: send nothing this run and say so in `meta.blocker`. Stop all sending on any send error; don't retry.
- **Pacing.** One send at a time with a random 60–150 second wait between sends (in the Composio workbench, at most 2 sends per cell).
- **Concept delivery.** Follow "Concept delivery" in `tools/email_template.md`: the cold email attaches a small preview JPG, and the PDF is saved for replies. No links in Email 1, and never put concepts anywhere public.
- When the sender gate passes: set `meta.sender`, clear `meta.blocker`, set `meta.firstSendDate` to today if empty.

## 2. Replies
Handled every hour by the operator task (`tools/OPERATOR.md`, step 1): interested replies and questions get answered from the FAQ with the start link, opt-outs become `dnc`, bounces become `lost`. When this runbook runs as part of the operator task, skip this step.

## 3. Follow-ups
The cold drip is three steps (see "The sequence" in `tools/email_template.md`). Before each follow-up, check the thread: any reply from them stops the drip (handle it as in step 2), and a bounce sets `status: lost`.
- `status: emailed`, `followUpAt` on or before today: send Email 2 in the same thread. Set `status: followed_up`, `dripStep: 2`, `followedUpAt`, `lastTouchAt`, `followUpAt` = 6 business days later.
- `status: followed_up`, `dripStep: 2`, `followUpAt` on or before today: send Email 3 in the same thread. Set `dripStep: 3`, `lastTouchAt`, `followUpAt: null`.
- Never send a fourth email, and never restart the drip for anyone who finished one.

## 4. Make every sendable prospect ready
Sendable = `status` is `found` or `concept`, has a published `email`, and meets the bar in step 6 (rating 4.5+, 30+ reviews, family-owned or owner-run, outdated site). Rows whose `notes` flag a missing check (e.g. "rating not verified") must be checked on the web first; update the row and skip it if it fails.
For each sendable `found` row: write its JSON for the generator (name, industry, city_state, website, rating, review_count, rating_source_url, email, owner_name_if_known, site_issues, what_customers_praise, menu_or_services, hours_if_found, phone, year_founded_if_known) and run `python3 tools/make_concept.py prospect.json out/`. Open the `-board.png` once and check it: right business name and domain, no placeholder text, nothing clipped. Make the email preview from it: `python3 -c "from PIL import Image; im=Image.open('out/<slug>-board.png').convert('RGB'); im.thumbnail((1400,1400)); im.save('out/<Business> homepage idea.jpg', quality=80, optimize=True)"`. It must be under 600 KB; lower the quality if not. Stage both files per "Concept delivery" in `tools/email_template.md`, set `conceptFile` to the JPG name, and `status: concept`.

## 5. Send first emails
Cold emails carry no links. In replies, link to the website as `https://bringsup.com/?ref=<slug>` (the prospect's tracker slug). If they request a concept through the site form, the Tally submission carries that `ref`, so it can be matched to their tracker row.

Daily cap from `firstSendDate`: week 1 → 10/day, week 2 → 20/day, week 3 onward → 30/day, minus follow-ups already sent today. For `status: concept` rows, oldest first, up to the cap: send Email 1, written fresh per `tools/email_template.md`, with the preview JPG attached and no links. After each send: `status: emailed`, `emailedAt`, `lastTouchAt`, `threadId`, `dripStep: 1`, and `followUpAt` = 4 business days later. Then archive our sent thread (it needs nothing from Jake).

## 6. Research to refill the queue
Only after sending. If fewer than tomorrow's cap of `concept` rows remain, find new prospects (at most 15 per run).
**Where:** affluent towns, where customers spend more and one new customer pays back $1,000 fastest. Rotate across clusters: NY/CT/NJ suburbs (Greenwich, Darien, Westport, Rye, Scarsdale, Short Hills, Summit, Princeton), Boston/DC suburbs (Wellesley, Weston, Lexington, Newton; Bethesda, Potomac; McLean, Great Falls), Chicago/Minneapolis/Texas (Winnetka, Lake Forest, Hinsdale; Edina, Wayzata; Highland Park and University Park TX, Westlake, Southlake, West University Place), California/Florida/Arizona (Los Altos, Palo Alto, Marin, La Jolla, Newport Beach, Pasadena; Naples, Palm Beach, Boca Raton, Coral Gables; Scottsdale, Paradise Valley).
**Who (highest value first):** high-ticket local services and shops: European/luxury auto specialists, remodelers and custom carpenters, landscape designers and tree services, upholsterers and furniture restorers, custom framers, jewelers and watch repair, tailors, caterers, pool services, piano services, high-end bakeries. Skip florists on FTD/Teleflora/BloomNet/Lovingly storefronts, franchises and chains, and anything already on a modern agency template.
Each must be: US, family-owned or owner-run, independent, open now; 4.5+ stars with 30+ reviews (record the source URL); its own site clearly outdated, with 3–5 concrete issues; a published email address (never guess one); not already in the tracker (compare domain, email, name + city) and not `dnc`. Paraphrase review praise in your own words. Write each as `status: found`, `addedAt: now`, plus a one-line `notes` on why it's high value, then build its concept per step 4 so it's ready for the next run.

## 7. Wrap up
Set `meta.lastRunAt` and `meta.lastRunSummary` (e.g. "Sent 10 · 2 follow-ups · 1 reply · 12 new prospects ready"). End with a short summary for Jake: replies that need him first (business, what they said, thread link https://mail.google.com/mail/u/0/#all/<threadId>), then emails sent (business names), follow-ups, opt-outs, prospects added, and any blocker.

## Customer flow (no calls)
Everything after a yes is automated. Tally sends each start, changes, extra-round and approve submission to the `projects` Supabase function, which logs it, counts rounds and sets the next job. The operator task (`tools/OPERATOR.md`) builds the site, sends previews and customer emails (`tools/customer_emails.md`), applies changes, launches on Cloudflare Pages and checks DNS. Each link carries `?ref=<slug>`, so submissions match tracker rows. When a project goes live, set the tracker row to `won`.
Never charge, or ask for payment, before the owner approves the finished site.

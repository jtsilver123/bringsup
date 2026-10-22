# BringsUp daily outreach runbook

The job of every run is **to get personalized concept emails out**. Replies and follow-ups first, then send first emails to every ready prospect within today's cap, and only then research enough new prospects to keep tomorrow's queue full.

Read `brand.md` and `tools/email_template.md` first; their rules apply to everything below. The tracker is a claude.ai artifact (URL in the scheduled task's prompt) whose database has:

- `prospects/<slug>`: one document per business
- `meta/pipeline`: `sender`, `mailingAddress`, `dailyCap`, `capToday`, `rampDay`, `sentToday`, `firstSendDate`, `pausedUntil`, `pauseReason`, `email1Variant`, `blocker`, `lastRunAt`, `lastRunSummary`, `lastOutreachDate`
- `stats/<YYYY-MM-DD>`: the day's numbers (step 8)

Prospect fields: `name, industry, city, tz, website, rating, reviews, ratingSource, email, emailKind, owner, ownerSource, phone, issues[], praise, services[], hours, founded, conceptUrl, conceptFile, status, addedAt, emailedAt, followUpAt, followedUpAt, repliedAt, lastTouchAt, threadId, dripStep, subject, variant, bounceKind, notes`.
`status` is one of `found, concept, emailed, followed_up, replied, started, won, lost, dnc` (`started` = the owner submitted the start form; `won` = they approved and paid). The operator sets `won` when a project goes live; `lost` is for bounces and closed-out projects. Never overwrite `notes` except where this runbook says to add to an empty one.

## 0. Setup
1. Attach and clone `jtsilver123/bringsup` (read access is enough).
2. Check first: `python3 -c "import jinja2, PIL, playwright"` and `ls $PLAYWRIGHT_BROWSERS_PATH`. Only if something is missing: `pip install --break-system-packages jinja2 pillow playwright==1.56.0 && python3 -m playwright install chromium`. If that fails, skip step 4 this run, note it in `meta.blocker`, and still do steps 3, 5 and 6.
3. Read the whole `prospects` collection with ArtifactData `list` using `query.limit: 1000` and follow `next_cursor` until it's empty (the default page is 100 rows), plus `meta/pipeline`. Pin every later write with `if_version`.

## 1. Gates
- **Sender.** Send only with the Composio Gmail tools (GMAIL_SEND_EMAIL, GMAIL_REPLY_TO_THREAD, GMAIL_FETCH_EMAILS, GMAIL_MODIFY_THREAD_LABELS), always passing `account` for the connection signed in as jake@bringsup.com (confirm from the connection list; it was `gmail_gariba-preach`). **Never send from bettercampus.com, instateme.com, a personal Gmail, or any other address**, and never send with the native Gmail connector. If there is no jake@bringsup.com connection, send nothing (no first emails, no follow-ups, no replies), set `meta.blocker` to "No jake@bringsup.com Gmail connection", and do only steps 4 and 6 (concepts and research) so the queue is ready when the connection is back.
- **Window.** Cold email only on weekdays, 8:00 AM to 4:00 PM in the prospect's own time zone (`tz`, set at research time from the state). Email 1 only Monday to Thursday. Never on US federal holidays. Replies to prospects also wait for 7:00 AM to 8:00 PM their time: a 3 AM reply from "Jake" reads as a bot.
- **Pause.** If `meta.pausedUntil` is in the future, send no cold email this run.
- **Health check.** Before the first send of a run, search `(from:(mailer-daemon OR postmaster) OR subject:("Delivery Status Notification" OR Undeliverable OR "Undelivered Mail")) newer_than:2d` and classify each one:
  - **Hard bounce** (550 5.1.1, "user unknown", "no such user", "address rejected", domain not found): prospect `status: lost`, `bounceKind: hard`.
  - **Soft bounce** (mailbox full, 4xx, "try again later"): keep the status, `bounceKind: soft`, retry once on the next business day, then treat it as hard.
  - **Block** (5.7.1, "spam", "blocked", "blacklist", "unsolicited", "suspicious", "unusual activity", "rate limit", "sending limit", "policy"): stop all cold sends for 48 hours (`meta.pausedUntil`, `meta.pauseReason`), then restart the ramp at 5 a day. Report it once in OPERATOR step 7.
  - Over the trailing 50 cold sends: hard bounces above 3% → halve the cap and re-check every queued address (step 6 address rules, plus the MX check); above 5% → pause 2 business days and report it.
  - Any Gmail send error (429, "limit exceeded", "unusual activity"): stop cold sending for 24 hours (`meta.pausedUntil`); don't retry the message.

  Right before each first email, search Gmail `to:<email>` (any date); if anything from us is there, set the row to `emailed` with that `threadId` and skip it. A send counts only when the tool result returns a message or thread id; record `threadId` from that result, never from memory. On any send error: don't retry, don't change the row, set `meta.blocker` to the error text and stop sending for this run (replies in OPERATOR.md step 1 can still go out).
- **Pacing.** The day's cap is spread across the hourly runs (OPERATOR step 5a), at most 6 cold sends per run, one at a time with a random 3–8 minute wait between them. Foreground `sleep` is blocked in the session shell, so send from the Composio workbench with `time.sleep(random.randint(180, 480))` between sends, at most 2 sends per cell. Never two emails to the same business or the same domain on one day.
- **Concept delivery.** Follow "Attachment" and "Concept delivery" in `tools/email_template.md`. Concepts are built and staged before Email 1, but by default go out only in a reply. Never put concepts anywhere public.
- When the sender gate passes: set `meta.sender`, clear `meta.blocker`, set `meta.firstSendDate` to today if empty.

## 2. Replies
Handled every hour by the operator task (`tools/OPERATOR.md`, step 1): interested replies and questions get answered from the FAQ with the start link, opt-outs become `dnc`, bounces become `lost`. When this runbook runs as part of the operator task, skip this step.

## 3. Follow-ups
The cold drip is three steps (see "The sequence" in `tools/email_template.md`). Before each follow-up, check the thread: any reply from a person stops the drip (handle it as in step 2); an auto-reply only moves `followUpAt` (see OPERATOR.md step 1); a bounce sets `status: lost`.
- `status: emailed`, `followUpAt` on or before today: send Email 2 in the same thread. Set `status: followed_up`, `dripStep: 2`, `followedUpAt`, `lastTouchAt`, `followUpAt` = 7 business days later.
- `status: followed_up`, `dripStep: 2`, `followUpAt` on or before today: send Email 3 in the same thread. Set `dripStep: 3`, `lastTouchAt`, `followUpAt: null`.
- Never send a fourth email, and never restart the drip for anyone who finished one.

## 4. Make every sendable prospect ready
Sendable = `status` is `found` or `concept`, has a published `email`, and meets the bar in step 6 (rating 4.7+, 40+ reviews, family-owned or owner-run, outdated site, an email that passes the address rules). Rows whose `notes` flag a missing check (e.g. "rating not verified") must be checked on the web first; update the row and skip it if it fails.
For each sendable `found` row: write its JSON for the generator (name, industry, city_state, website, rating, review_count, rating_source_url, email, owner_name_if_known, site_issues, what_customers_praise, menu_or_services, hours_if_found, phone, year_founded_if_known) and run `python3 tools/make_concept.py prospect.json out/`. `website` must include the scheme (`https://...`) or the board shows a made-up domain. Only state facts you verified: no `year_founded_if_known` unless it's on their site or listing, and `hours_if_found` only as published. If the business is owner-run but not family-owned, also set `util_label: "Owner-run"`, `since_label: "Serving <city> since"`, `story_heading` (e.g. "Run by the people who do the work.") and `sub` to a sentence without "family-owned". Industries without a theme fall back to the generic trades theme; set `sub`, `story_heading` and `stats` so nothing on the page says "licensed", "quote" or "fixed" that doesn't apply. Open the `-board.png` once and check it: right business name and domain, no placeholder text, nothing clipped. Make the email preview from it: `python3 -c "from PIL import Image; im=Image.open('out/<slug>-board.png').convert('RGB'); im.thumbnail((1200,1200)); im.save('out/<slug>-homepage-idea.jpg', quality=72, optimize=True, progressive=True)"`. It must be under 300 KB; lower the quality if not. Stage both files per "Concept delivery" in `tools/email_template.md`, set `conceptFile` to `<slug>/<slug>-homepage-idea.jpg`, and `status: concept`.

## 5. Send first emails
Cold emails carry no links. In replies, the one link is the start link `https://bringsup.com/start/?ref=<slug>` (the prospect's tracker slug). Only if they ask who we are or want to see examples, add `https://bringsup.com/?ref=<slug>` as a second line. If they request a concept through the site form, the Tally submission carries that `ref`, so it can be matched to their tracker row.

Daily cap (every cold send counts: Emails 1, 2 and 3), by business days since `firstSendDate`: days 1–5 → 5 a day; 6–10 → 10; 11–15 → 15; 16–20 → 20; 21–25 → 25; 26 onward → 30. 30 is this mailbox's ceiling for good; more volume means another mailbox, not a higher cap. Each step up needs a hard-bounce rate of 2% or less over the previous step and no block notices, and, once 100 Email 1s have gone out, a human reply rate of 3% or more (step 8). If a gate fails, stay at the current cap. If a pause fired, restart at 5 a day. `meta/pipeline.dailyCap`, if set, can only lower the cap. Write `capToday` and `rampDay` to `meta/pipeline`. Follow-ups that are due go out first and are never cut; Email 1s get what's left of the cap. For `status: concept` rows, oldest first, within this run's slice: send Email 1, written fresh per `tools/email_template.md` (by default with no attachment, and never with links). After each send: `status: emailed`, `emailedAt`, `lastTouchAt`, `threadId`, `subject`, `variant`, `dripStep: 1`, and `followUpAt` = 3 business days later. Then archive our sent thread (it needs nothing from Jake).

## 6. Research to refill the queue
Only after sending. If fewer than tomorrow's cap of `concept` rows remain, find new prospects (at most 15 per run).
**Where:** affluent towns, where customers spend more and one new customer pays back $1,000 fastest. Rotate across clusters: NY/CT/NJ suburbs (Greenwich, Darien, Westport, Rye, Scarsdale, Short Hills, Summit, Princeton), Boston/DC suburbs (Wellesley, Weston, Lexington, Newton; Bethesda, Potomac; McLean, Great Falls), Chicago/Minneapolis/Texas (Winnetka, Lake Forest, Hinsdale; Edina, Wayzata; Highland Park and University Park TX, Westlake, Southlake, West University Place), California/Florida/Arizona (Los Altos, Palo Alto, Marin, La Jolla, Newport Beach, Pasadena; Naples, Palm Beach, Boca Raton, Coral Gables; Scottsdale, Paradise Valley).
**Who (highest value first):** high-ticket local services and shops: European/luxury auto specialists, remodelers and custom carpenters, landscape designers and tree services, upholsterers and furniture restorers, custom framers, jewelers and watch repair, tailors, caterers, pool services, piano services, high-end bakeries. Skip florists on FTD/Teleflora/BloomNet/Lovingly storefronts, franchises and chains, and anything already on a modern agency template.
Each must be: US, family-owned or owner-run, independent, open now; 4.7+ stars with 40+ reviews (record the source URL); its own site clearly outdated, with 3–5 concrete issues; a published email address (never guess one); not already in the tracker (compare domain, email, name + city) and not `dnc`. Paraphrase review praise in your own words. Set `tz` from the state.
**Address rules:** use the one address the business publishes for itself, and only one per business. Prefer a named address (mike@, rosa@) or one the site labels as the owner's. `info@`, `contact@` and `office@` are fine for a 1–10 person business (set `emailKind: role`), and gmail, yahoo, aol, comcast and similar are fine too. Skip the prospect if the only address is sales@, support@, billing@, careers@ or press@, belongs to another domain (a web agency, a booking platform), is a placeholder or for another location, or if the site lists several role addresses. Before `status: concept`, check the address's domain has an MX record (`https://dns.google/resolve?name=<domain>&type=MX`); if it has none, skip it.
**Owner's first name**, in this order: the About or Our Story page, signed owner replies on Google reviews, the Facebook page intro, Yelp "Meet the owner", the state business registry. Record where in `ownerSource`. If none, `owner: null` (the email opens "Hi,").
**Also skip:** marked closed or for sale; a franchise or multi-location group; a site redesigned in the last 2 years; a footer crediting an agency that's clearly still active. Write each as `status: found`, `addedAt: now`, plus a one-line `notes` on why it's high value, then build its concept per step 4 so it's ready for the next run.

## 8. Numbers and rules
Each run adds to `stats/<YYYY-MM-DD>` in the tracker: `sent1, sent2, sent3, bouncesHard, bouncesSoft, blocks, repliesHuman, repliesPositive, repliesLater, repliesNo, dnc, started, won`, split by `variant`. Compute trailing rates over the last 50 cold sends or 7 days, whichever is more.
- Healthy for this list: 8–15% of Email 1s get a human reply after the full drip, 4–6% positive, hard bounces under 2%.
- After 100 Email 1s with a human reply rate under 3%: freeze the cap, set `email1Variant: offer`, switch subjects. After 200 still under 3%: pause and report it (inbox placement is the likely cause).
- After 300 Email 1s with bounces fine but positive replies under 2%: report it with the numbers by industry and variant (targeting or copy).
- "Remove me" or "how did you get my email" above 10% of a week's replies: pause 1 day and re-check that week's list against the step 6 skip rules.

## 7. Wrap up
Set `meta.lastRunAt` and `meta.lastRunSummary` (e.g. "Sent 10 · 2 follow-ups · 1 reply · 12 new prospects ready"). The operator's final message (OPERATOR.md step 7) covers the rest; nothing here needs Jake.

## Customer flow (no calls)
Everything after a yes is automated. Tally sends each start, changes, extra-round and approve submission to the `projects` Supabase function, which logs it, counts rounds and sets the next job. The operator task (`tools/OPERATOR.md`) builds the site, sends previews and customer emails (`tools/customer_emails.md`), applies changes, launches on Cloudflare Pages and checks DNS. Each link carries `?ref=<slug>`, so submissions match tracker rows. When a project goes live, set the tracker row to `won`.
Never charge, or ask for payment, before the owner approves the finished site.

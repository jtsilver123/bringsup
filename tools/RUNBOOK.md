# BringsUp daily outreach runbook

The job of every run is **to get personal, specific first emails out**. Follow-ups first, then first emails to every ready prospect within this run's slice, and only then research enough new prospects to keep tomorrow's queue full. Nothing gets built for a prospect until they say yes (see "How it works" in `tools/email_template.md`).

Read `brand.md` and `tools/email_template.md` first; their rules apply to everything below. The tracker is a claude.ai artifact (URL in the scheduled task's prompt) whose database has:

- `prospects/<slug>`: one document per business
- `meta/pipeline`: `sender`, `mailingAddress`, `dailyCap`, `capToday`, `rampDay`, `sentToday`, `firstSendDate`, `pausedUntil`, `pauseReason`, `blocker`, `lastRunAt`, `lastRunSummary`, `lastOutreachDate`, `lastDailyCareAt`, `lastMonthlyCareAt`, `alertedSessions`, `capacity`, `customers` (the last five are set by OPERATOR.md)
- `stats/<YYYY-MM-DD>`: the day's numbers (step 7); `stats/week-<YYYY-Www>`: the weekly review (step 8)

Prospect fields:
- Business: `name, industry, city, tz, website, phone, rating, reviews, ratingSource` (Google), `yelpRating, yelpReviews, yelpUrl` (Yelp; null if they have no Yelp page), `brochure` (true once checked: no cart, checkout, store or logins), `founded, praise, services[], hours, issues[]`, plus `outdatedScore` and `outdatedEvidence[]` (`{issue, url}`), and `ownerRepliesToReviews` (date of the owner's last reply to a Google or Yelp review).
- Contact: `email, emailKind, emailSource` (the URL where the address is published), `owner, ownerSource`.
- Outreach: `status, addedAt, emailedAt, followUpAt, followedUpAt, lastTouchAt, threadId, dripStep, subject, variant` (`s<subject>-c<close>`), `opener` (the opening angle), `bounceKind`, `skipReason`.
- Reply: `repliedAt, replyType` (yes, question, later, referral, has_vendor, closing, happy, no, auto), `referredTo, lostReason`.
- After a yes (set by OPERATOR.md): `yesAt, conceptUrl, previewSentAt, previewViewedAt, previewViews, startClickedAt, startedAt, projectRef, fullPreviewAt, paidAt, paidAmount, liveAt, planStartedAt`.
- Other: `warm` (someone Jake knows; never cold emailed), `draftedAt`, `notes`.

`status` is one of `found, ready, emailed, followed_up, replied, started, won, lost, skipped, dnc` (`ready` = researched and ready to email; older rows may say `concept`, which means the same; `started` = the owner submitted the start form; `won` = the site is live). Payment is `paidAt` and `paidAmount`. `lost` (with `lostReason`) is for bounces, a no-thanks that isn't a stop, and closed or cancelled projects; `skipped` (with `skipReason`) is for rows that failed a check, so they're never re-checked. A `dnc` covers the whole business: every address and location. Never overwrite `notes` except where this runbook says to add to an empty one.

## 0. Setup
1. Attach and clone `jtsilver123/bringsup` (read access is enough).
2. Read the whole `prospects` collection with ArtifactData `list` using `query.limit: 1000` and follow `next_cursor` until it's empty (the default page is 100 rows), plus `meta/pipeline`. Pin every later write with `if_version`.

## 1. Gates
- **Sender.** Send only with the Composio Gmail tools (GMAIL_SEND_EMAIL, GMAIL_REPLY_TO_THREAD, GMAIL_FETCH_EMAILS, GMAIL_MODIFY_THREAD_LABELS), always passing `account` for the connection signed in as jake@bringsup.com (confirm from the connection list; it was `gmail_gariba-preach`). **Never send from bettercampus.com, instateme.com, a personal Gmail, or any other address**, and never send with the native Gmail connector. If there is no jake@bringsup.com connection, send nothing (no first emails, no follow-ups, no replies), set `meta.blocker` to "No jake@bringsup.com Gmail connection", and do only steps 4 and 6 (prospect checks and research) so the queue is ready when the connection is back.
- **Window.** Cold email only on weekdays, 8:00 AM to 4:00 PM in the prospect's own time zone (`tz`, set at research time from the state). Email 1 only Monday to Thursday. Never on US federal holidays. Replies to prospects also wait for 7:00 AM to 8:00 PM their time: a 3 AM reply from "Jake" reads as a bot.
- **Pause.** If `meta.pausedUntil` is in the future, send no cold email this run.
- **Health check.** Before the first send of a run, search `(from:(mailer-daemon OR postmaster) OR subject:("Delivery Status Notification" OR Undeliverable OR "Undelivered Mail")) newer_than:2d` and classify each one:
  - **Hard bounce** (550 5.1.1, "user unknown", "no such user", "address rejected", domain not found): prospect `status: lost`, `bounceKind: hard`.
  - **Soft bounce** (mailbox full, 4xx, "try again later"): keep the status, `bounceKind: soft`, retry once on the next business day, then treat it as hard.
  - **Block** (5.7.1, "spam", "blocked", "blacklist", "unsolicited", "suspicious", "unusual activity", "rate limit", "sending limit", "policy"): stop all cold sends for 48 hours (`meta.pausedUntil`, `meta.pauseReason`), then restart the ramp at 5 a day. Report it once in OPERATOR step 7.
  - Over the trailing 50 cold sends (emails to /try/ visitors count too): hard bounces above 3% → halve the cap and re-check every queued address (step 6 address rules, plus the MX check); above 5% → pause 2 business days and report it.
  - Any Gmail send error (429, "limit exceeded", "unusual activity"): stop cold sending for 24 hours (`meta.pausedUntil`); don't retry the message.

  Right before each first email, search Gmail `to:<email>` (any date); if anything from us is there, set the row to `emailed` with that `threadId` and skip it. A send counts only when the tool result returns a message or thread id; record `threadId` from that result, never from memory. On any send error: don't retry, don't change the row, set `meta.blocker` to the error text and stop sending for this run (replies in OPERATOR.md step 1 can still go out).
- **Pacing.** The day's cap is spread across the hourly runs (OPERATOR step 5a), at most 6 cold sends per run, one at a time with a random 3–8 minute wait between them. Foreground `sleep` is blocked in the session shell, so send from the Composio workbench with `time.sleep(random.randint(180, 480))` between sends, at most 2 sends per cell. Never two emails to the same business or the same business domain on one day (gmail, yahoo and other free-mail domains don't count as one business).
- **No builds before a yes.** Cold emails carry no links and no attachments. A prospect's homepage is built only after they ask for it (OPERATOR step 1, "Building their homepage" in `tools/email_template.md`).
- When the sender gate passes: set `meta.sender`, clear `meta.blocker`, set `meta.firstSendDate` to today if empty.

## 2. Replies
Handled every hour by the operator task (`tools/OPERATOR.md`, step 1): interested replies and questions get answered from the FAQ, opt-outs become `dnc`, bounces are sorted as in step 1. When this runbook runs as part of the operator task, skip this step.

## 3. Follow-ups
The cold drip is three steps (see "The sequence" in `tools/email_template.md`). Skip every `warm: true` row. Before each follow-up, check the thread: any reply from a person stops the drip (handle it as in step 2); an auto-reply only moves `followUpAt` (see OPERATOR.md step 1); a bounce sets `status: lost`.
- `status: emailed`, `followUpAt` on or before today: send Email 2 in the same thread. Set `status: followed_up`, `dripStep: 2`, `followedUpAt`, `lastTouchAt`, `followUpAt` = 7 business days later.
- `status: followed_up`, `dripStep: 2`, `followUpAt` on or before today: send Email 3 in the same thread. Set `dripStep: 3`, `lastTouchAt`, `followUpAt: null`.
- Never send a fourth email, and never restart the drip for anyone who finished one.
- `status: replied`, `followUpAt` on or before today, no start form yet. These are replies (7 AM–8 PM their time) and don't count toward the cold cap. Wording is in email_template "Not now / later" and "Saw their homepage but hasn't started".
  - `notes` has `later: <month>`: send the one check-in, then `followUpAt: null`.
  - No `conceptUrl` (they asked a question): send one "Want me to make it?" check-in, then `followUpAt: null`.
  - `conceptUrl` set, counted in business days from `previewSentAt`, first match wins:
    - No `previewViewedAt` and `notes` lacks "nudged: unseen": send the "never opened" nudge, append "nudged: unseen", `followUpAt` = 2 business days later.
    - `previewViewedAt` set, 4+ days, and `notes` lacks "nudged: viewed": send the "opened" nudge, append "nudged: viewed", `followUpAt` = day 15.
    - Day 15 or later: send the closing line, `followUpAt: null`.
    - Otherwise: `followUpAt` = day 4 if they've opened it and haven't had the "opened" nudge, else day 15.
  - Older rows whose `notes` say just "nudged" have had their nudge: go straight to the closing line at day 15.

## 4. Check every sendable prospect
Sendable = `status` is `found` or `ready`, not `warm`, has a published `email`, and meets the bar in step 6 (4.7+ with 40+ reviews on Google or Yelp and no weak score on the other, family-owned or owner-run, an outdated score of 3 or more, an email that passes the address rules). Rows whose `notes` flag a missing check (e.g. "rating not verified") must be checked on the web first; update the row and skip it if it fails.
For each sendable `found` row, make sure the email has what it needs: a verified Google rating and review count with the source URL, their Yelp page checked (rating, count and URL, or null if none), one specific thing customers praise (paraphrased, from either), the owner's first name if it can be found, and `tz`. Check it on the web if anything is missing or flagged; update the row, or set `status: skipped` with a `skipReason` if it fails the bar. Then set `status: ready` (researched and ready to email; nothing is built yet).

## 5. Send first emails
Cold emails carry no links. In replies, the one link is the start link `https://bringsup.com/start/?ref=<slug>` (the prospect's tracker slug). Only if they ask who we are or want to see examples, add `https://bringsup.com/?ref=<slug>` as a second line. If they request a concept through the site form, the Tally submission carries that `ref`, so it can be matched to their tracker row.

Daily cap (every cold send counts: Emails 1, 2 and 3), by business days since `firstSendDate`: days 1–5 → 5 a day; 6–10 → 10; 11–15 → 15; 16–20 → 20; 21–25 → 25; 26 onward → 30. 30 is this mailbox's ceiling for good; more volume means another mailbox, not a higher cap. Each step up needs a hard-bounce rate of 2% or less over the previous step and no block notices, and, once 100 Email 1s have gone out, a human reply rate of 3% or more (step 7). If a gate fails, stay at the current cap. If a pause fired, restart at 5 a day. `meta/pipeline.dailyCap`, if set, can only lower the cap. Write `capToday` and `rampDay` to `meta/pipeline`. Follow-ups that are due go out first and are never cut; Email 1s get what's left of the cap. For `status: ready` rows (or legacy `concept`), not `warm`, oldest first, within this run's slice: first confirm the address still appears at `emailSource` (if not, re-research it or set `skipped`, `skipReason: email gone`), and if the row has no `yelpUrl` field yet (researched before Yelp was checked), check Yelp now and apply step 6's bar (fails: `skipped`, `skipReason: yelp`); if the row has no `brochure: true` yet, open their site and apply step 6's brochure-only rule (a cart, checkout, store or logins: `skipped`, `skipReason: store`), then set `brochure: true`; then send Email 1, written fresh per `tools/email_template.md` (no attachments, no links). After each send: `status: emailed`, `emailedAt`, `lastTouchAt`, `threadId`, `subject`, `variant`, `opener`, `dripStep: 1`, and `followUpAt` = 3 business days later. Then archive our sent thread (it needs nothing from Jake).

## 6. Research to refill the queue
Only after sending. If fewer than tomorrow's cap of `ready` rows remain, find new prospects (at most 15 per run).
**Where:** affluent towns, where customers spend more and one new customer pays back $1,000 fastest. Rotate across clusters: NY/CT/NJ suburbs (Greenwich, Darien, Westport, Rye, Scarsdale, Short Hills, Summit, Princeton), Boston/DC suburbs (Wellesley, Weston, Lexington, Newton; Bethesda, Potomac; McLean, Great Falls), Chicago/Minneapolis/Texas (Winnetka, Lake Forest, Hinsdale; Edina, Wayzata; Highland Park and University Park TX, Westlake, Southlake, West University Place), California/Florida/Arizona (Los Altos, Palo Alto, Marin, La Jolla, Newport Beach, Pasadena; Naples, Palm Beach, Boca Raton, Coral Gables; Scottsdale, Paradise Valley).
**Who (highest value first):** high-ticket local services and shops: European/luxury auto specialists, remodelers and custom carpenters, landscape designers and tree services, upholsterers and furniture restorers, custom framers, jewelers and watch repair, tailors, caterers, pool services, piano services, high-end bakeries. **Brochure sites only:** the current site shows who they are, what they do, hours, photos and how to reach them. Skip any site with its own shopping cart, checkout or online store (Shopify, WooCommerce, Square Online store, BigCommerce, Wix or Squarespace stores with a cart), product pages with add-to-cart, gift-card or e-commerce checkout built into the site, member logins or customer accounts: we don't build those, so we can't replace them (`skipReason: store`). A plain button that sends people to an outside ordering or booking service (Toast, ChowNow, Square, OpenTable, Calendly, Vagaro and the like) is fine; the new site keeps that button. Also skip florists on FTD/Teleflora/BloomNet/Lovingly storefronts, franchises and chains, and anything already on a modern agency template. Yelp's category search for a town, sorted by rating, is a good second place to find them after Google Maps; it often surfaces owner-run shops Google ranks low. Read Yelp's public pages only: never message businesses through Yelp, never sign in, never copy review text word for word. Among those that qualify, research first the owners most likely to read and reply: the owner replied to a Google or Yelp review in the last 6 months (`ownerRepliesToReviews`), a named address, the owner's first name known, 10+ years in business.
Each must be: US, family-owned or owner-run, independent, open now; great reviews on Google and Yelp, checked on both: at least one of them has 4.7+ stars with 40+ reviews, and neither is under 4.3 stars with 20+ reviews (a split reputation is a skip). Record both sources' rating, count and URL; a published email address (never guess one); not already in the tracker (compare domain, email, name + city) and not `dnc` (match by name + city, and by domain unless it's a free-mail domain). Paraphrase review praise in your own words. Set `tz` from the state.
**Outdated, scored:** the site counts as outdated with at least 3 of these, each recorded in `outdatedEvidence` with the URL where you saw it (`outdatedScore` = how many): copyright or theme year 2019 or earlier, or no change on the Wayback Machine in 3+ years; not mobile-friendly, or blocks pinch-zoom; no HTTPS; a free builder subdomain or platform template (Yola, GoDaddy builder, MechanicNet); hours or phone that disagree with Google; dead social icons (Google+, the old Twitter bird); broken pages or embeds; PageSpeed mobile under 50.
**Address rules:** use the one address the business publishes for itself, and only one per business. Prefer a named address (mike@, rosa@) or one the site labels as the owner's. `info@`, `contact@` and `office@` are fine for a 1–10 person business (set `emailKind: role`), and gmail, yahoo, aol, comcast and similar are fine too. Old ISP addresses (bellsouth.net, att.net, optonline.net, charter.net and the like) only if they're on the current site or Google listing, and at most 1 a day. Record the page in `emailSource`. Skip the prospect if the only address is sales@, support@, billing@, careers@ or press@, belongs to another domain (a web agency, a booking platform), is a placeholder or for another location, or if the site lists several role addresses. Before `status: ready`, check the address's domain has an MX record (`https://dns.google/resolve?name=<domain>&type=MX`); if it has none, skip it.
**Owner's first name**, in this order: the About or Our Story page, signed owner replies on Google reviews, the Facebook page intro, Yelp "Meet the owner", the state business registry. Record where in `ownerSource`. If none, `owner: null` (the email opens "Hi,").
**Also skip:** marked closed or for sale; a franchise or multi-location group; a site redesigned in the last 2 years; a footer crediting an agency that's clearly still active. Write each as `status: found`, `addedAt: now`, plus a one-line `notes` on why it's high value, then check it per step 4 so it's ready for the next run. A business you checked and rejected goes in as `status: skipped` with a `skipReason`, so no later run checks it again.

## 7. Numbers and rules
Each run adds to `stats/<YYYY-MM-DD>` in the tracker: `sent1, sent2, sent3, bouncesHard, bouncesSoft, blocks, repliesHuman, repliesPositive, repliesLater, repliesNo, dnc, started, won`, split by subject. Compute trailing rates over the last 50 cold sends or 7 days, whichever is more.
- Healthy for this list: 8–15% of Email 1s get a human reply after the full drip, 4–6% positive, hard bounces under 2%.
- After 100 Email 1s with a human reply rate under 3%: freeze the cap and rewrite the openings and subjects. After 200 still under 3%: pause and report it (inbox placement is the likely cause).
- After 300 Email 1s with bounces fine but positive replies under 2%: report it with the numbers by industry and subject (targeting or copy).
- "Remove me" or "how did you get my email" above 10% of a week's replies: pause 1 day and re-check that week's list against the step 6 skip rules.

## 8. Weekly review (Mondays)
If `stats/week-<last week, YYYY-Www>` doesn't exist, write it. Count from prospect rows grouped by the week of their Email 1, not from daily counters (a reply on day 6 belongs to its Email 1's week).
- The funnel: Email 1s sent, bounced, human replies, yes, preview sent, viewed, started, paid.
- The median hours from their reply to ours, and from a yes to the preview.
- Reply and yes rates by subject, close, opener, Email 2 angle, industry, cluster, `emailKind`, owner name known, and which email got the reply. Name the best and worst segment.

Then adapt, and say what you changed in the run summary:
- A variant with 60+ Email 1s whose human reply rate is under half the best one's: retire it and write a fresh one in its place.
- An industry or cluster with 40+ Email 1s and at least twice the average positive rate: research more of it.
- If 30% or more of replies are yeses but under 25% of previews lead to a start, the problem is the preview or the step after it, not the cold email. Report it.

## 9. Wrap up
Set `meta.lastRunAt` and `meta.lastRunSummary` (e.g. "Sent 10 · 2 follow-ups · 1 reply · 12 new prospects ready"). The operator's final message (OPERATOR.md step 7) covers the rest; nothing here needs Jake.

## Customer flow (no calls)
Everything after a yes is automated. Tally sends each start, changes, extra-round and approve submission to the `projects` Supabase function, which logs it, counts rounds and sets the next job. The operator task (`tools/OPERATOR.md`) builds the site, sends previews and customer emails (`tools/customer_emails.md`), applies changes, launches on Cloudflare Pages and checks DNS. Each link carries `?ref=<slug>`, so submissions match tracker rows. When a project goes live, set the tracker row to `won`.
Never charge, or ask for payment, before the owner approves the finished site.

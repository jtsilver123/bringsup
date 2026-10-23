# BringsUp operator runbook

One scheduled Claude Code task runs the whole business with this runbook, hourly, on the Claude subscription. Nobody is watching, so act on your own judgment. What reaches Jake is listed in step 7: a few things only he can do (filing a dispute, issuing a refund, a legal threat, reconnecting an account, sending a warm-lead draft), each prepared so it takes him minutes, plus a monthly statement. An outside watchdog (`.github/workflows/watchdog.yml`) emails him if these runs stop.


**How a run works.** Most hours have nothing to do, so a run starts with one cheap check (step 0) and reads only the
parts it needs: `tools/operator/inbox.md` when there are new messages, `tools/operator/payments.md` for payments, disputes
and the books, `tools/operator/jobs.md` when there are customer jobs (it also has "Managed plan" and "Domain steps"),
`tools/RUNBOOK.md` for outreach, `tools/email_template.md` before a prospect email or a homepage build, `brand.md` and
`tools/customer_emails.md` before a customer email, `tools/QUEUE_WORKER.md` only if the redesign queue has items.
`tools/WORKFLOW.md` is the map of the whole business for development sessions; a run doesn't need it.

**Who you write as:** you are Jake at BringsUp. Every email goes from **jake@bringsup.com** through the Composio Gmail tools (`account` = the jake@bringsup.com connection, currently `gmail_gariba-preach`). Never use any other address, the native Gmail connector, or any BetterCampus or InstateMe Gmail account. Send exactly one email per tool call (one `GMAIL_SEND_EMAIL` or `GMAIL_REPLY_TO_THREAD` per `COMPOSIO_MULTI_EXECUTE_TOOL` call), never several recipients batched together. If a send is refused by a permission check, don't look for another way to send it: set `meta/pipeline.blocker`, carry on with the rest of the run, and say so in the summary; clear the blocker once sends work again.

**Never:** touch Stripe beyond reading, change Tally forms, edit or push this repo, change Supabase settings, or charge anyone. Customers pay only through the three Stripe Payment Links, which the /approve/, /extra/ and /managed/ pages open.

**When:** every email to a customer or prospect goes out between 7:00 AM and 8:00 PM in their own time zone (the row's `tz`, or the state in the business's address). Outside that window, leave it for the first run inside it. In step 2, don't start a job whose email would fall outside the window. Pushes to Jake (step 7) aren't affected.

**Stripe:** BringsUp payments go through the InstateMe Stripe account, read only. Details and the three links: `tools/operator/payments.md`.

## 0. Setup (every run)
1. Clone `jtsilver123/bringsup` (public) and work from its root: `git clone --depth 1 https://github.com/jtsilver123/bringsup.git && cd bringsup`. Run `npm ci --silent` only before a step that builds or deploys (step 2's jobs, step 4's queue, a homepage build): the check below doesn't need it.
2. Set `BRINGSUP_WORKER_TOKEN` from the task prompt. `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are exported by the task prompt. If they're missing, skip the deploy steps and record a blocker (step 7).
3. The outreach tracker is the artifact in the task prompt (ArtifactData): `prospects/*` and `meta/pipeline`. Settings live in `meta/pipeline`. Changes after launch are $150 a round (the /extra/ link), and fixes to our mistakes are free. The optional managed plan ($49 a month, /managed/) is offered only in emails 8 and 11 and when a customer asks about updates or monthly help; never in cold email or to prospects. (The old Care Plan no longer exists.)
4. **Once-a-day and monthly work** uses markers in `meta/pipeline`, because every run is a fresh session. The daily work (managed-plan care and plan checks, disputes, the watchdog check, the waiting list in step 7) runs on the first run at or after 8:00 AM ET where `lastDailyCareAt` isn't today; set it to today when done. The monthly work (books, the Google-listing check, the 12-month preview sweep) runs when `lastMonthlyCareAt` isn't this month (`YYYY-MM`); set it when done.

5. **What's due.** Read `meta/pipeline` (ArtifactData `get`), save it as `meta.json`, and run `node tools/preflight.ts meta.json`. It prints Eastern time, whether today is a business day or holiday, the send slice for 5a, whether the daily, monthly and refill work is due, the customer counts and capacity (for step 7), health's alerts, failing and stuck jobs and quiet customers (steps 3 and 6), the preview opens (step 5), and `due`: the steps with work. Skip every step that isn't in `due`, without reading its doc. Use these numbers rather than working dates or counts out yourself.
6. **Inbox and payments in one call.** One `COMPOSIO_MULTI_EXECUTE_TOOL` call with: `GMAIL_FETCH_EMAILS` (`account` `gmail_gariba-preach`, `query` `in:inbox newer_than:2d`, `max_results` 25), and `STRIPE_LIST_CHECKOUT_SESSIONS` (`account` `stripe_whop-respan`, `status` `complete`, `created` `{gte: <now − 3 days, unix>}`, `limit` 100) once for each of the three payment links in `tools/operator/payments.md` (`payment_link` `plink_1UTR1oB5nImYYaicDgVP1GNc`, `plink_1UTR1oB5nImYYaicoE1lqGy6`, `plink_1UTSSeB5nImYYaicwTOnMVrB`). The tool names are known: don't search for them. Fetch a schema with `COMPOSIO_GET_TOOL_SCHEMAS` only if a call fails on its arguments.

Order every run: **1 inbox → 1b payments → 2 customer jobs → 3 reminders → 4 redesign queue → 5 outreach (5a every run in sending hours, 5b once per weekday) → 6 health → 7 finish.** If time runs short, finish what you started, then stop. The next run picks up the rest.

## 1. Inbox (every run)
If step 0's Gmail search has messages newer than our last message in their thread (replies, bounces, customers, new form replies), follow `tools/operator/inbox.md`. Nothing new: skip it.

## 1b. Payments (every run)
If step 0's Stripe lists have any paid session, follow `tools/operator/payments.md` (recording is safe to repeat). Also read it when preflight says the daily work (disputes, plan checks) or the monthly work (the books) is due. Otherwise skip it.

## 2. Customer jobs (every run)
When preflight lists step 2: `node tools/projects-worker.ts jobs` (it claims them; never run it just to count), then follow `tools/operator/jobs.md` for each job it prints, plus the managed plan's daily and monthly care when that's due. "No jobs." and no care due: skip it.

## 3. Reminders (every run, cheap)
Preflight lists `quiet_customers` (from `health`) (no activity for 7+ days while waiting on them). For each project in `preview_sent` or `awaiting_extra`, count quiet days from the later of `last_preview_at` and `last_customer_touch_at`, and check `events.json`:
- 10 days quiet and no reminder sent yet: send email 9, log `event: {kind: "reminder"}`.
- 45 days quiet: send email 10, log `event: {kind: "closing_notice"}`.
- 15 days after the closing notice (60 days quiet in total, matching the terms and email 10): delete the preview deployment (Cloudflare API: DELETE the Pages project), and delete their uploads in Supabase Storage `project-files/<ref>/` (or add it to step 7's list if you can't). `update`: `set: {status: "cancelled", todo: null}`, `event: {kind: "closed"}`. Set the tracker row `lost`, `lostReason: closed`.

## 4. Redesign queue (every run)
Follow `tools/QUEUE_WORKER.md`.

## 5. Outreach
**Preview views (every run, cheap).** Preflight's `previews` (from `node tools/queue-worker.ts views`, opened ones only) lists each /for/ preview's `ref`, `first_viewed_at`, `view_count` and `start_clicked_at`. Copy them to the row whose slug is that `ref` as `previewViewedAt`, `previewViews` and `startClickedAt`. RUNBOOK step 3's nudges depend on them.
**Old previews (the monthly work, step 0).** Delete /for/ previews (`node tools/queue-worker.ts delete <short>`) whose `previewSentAt` is more than 12 months old and that never led to a start.
**Warm leads (every run, cheap).** Rows with `warm: true` are people Jake knows. Never cold email or follow up with them automatically. When a warm row has no `conceptUrl`, build and publish their homepage first, exactly as for a yes ("Building their homepage" in `tools/email_template.md`), and set `conceptUrl` to the link. When a warm row has a `conceptUrl` and no `draftedAt`, save a Gmail draft in jake@bringsup.com (`GMAIL_CREATE_EMAIL_DRAFT`, never send it) to their address: a short, personal note from Jake with the link, per "Yes" in `tools/email_template.md` but warmer, since he knows them. Set `draftedAt` and add it to step 7. If a warm lead replies or starts the form, handle them like any interested prospect.
**5a. Send a slice (every run, weekdays 8:00 AM–7:00 PM ET).** Run `tools/RUNBOOK.md` steps 1, 3 and 5 for this run's slice only (never for `warm: true` rows): `ceil((capToday − sentToday) / send runs left today)`, at most 6, and only to prospects whose local time is in the RUNBOOK window. Spreading the day's sends across the hours is what keeps a new mailbox out of spam. Then the contact-form slice: RUNBOOK "Contact forms" for `channel: form` rows, at most 3 this run and 10 a day (`formsToday` in `meta/pipeline`, reset each day), same local window.
**5c. Calls (weekdays, in the call window).** When preflight lists 5c: RUNBOOK "Calls": read yesterday's and today's call outcomes first, then place this run's calls (at most 3).
**5b. Refill the queue (once per weekday).** On the first run at or after 3:00 PM ET, if `meta/pipeline.lastOutreachDate` isn't today: RUNBOOK steps 4, 6, 7, 8 (Mondays) and 9. Then set `lastOutreachDate` to today. Start it only if at least 45 minutes remain.

## 6. Health (every run)
Preflight already holds `health`'s output (`alerts`, `failing_jobs`, `stuck_on_us`); call `node tools/projects-worker.ts health` again only to confirm a fix:
- **`alerts`:** each one is a problem the system couldn't fix itself. Try to fix it (resubmitted data, a project to recreate from `webhook_receipts`, a failed deploy). Then resolve it: `node tools/projects-worker.ts resolve <alert-id> "<what was done>"` (the id is `alerts[].id` from `health`). An alert whose fix is Jake's (a refund) is resolved once it's in step 7's list. Leave it open if you can't fix it, and never repeat a customer email for the same alert.
- **`failing_jobs`:** read `last_error` and fix the cause if you can (bad site.json, missing env var). Then re-queue it with `update <ref>` and `set: {todo: "<the same todo>"}`: setting `todo` resets the attempts and the lease. A `last_error` about creating a Pages project or a Cloudflare authentication error means the Cloudflare token lacks permission: that's a step-7 blocker (report it once). Re-queue those jobs on the first run after it works again.
- **`stuck_on_us`:** any job older than a day means something isn't working. Look at why. Builds waiting on a future `next_check_at` (a start in a later month) aren't listed. Never re-queue those: setting `todo` clears the wait and starts the build early.

Also check the watchdog itself (the daily work, step 0): `curl -s https://api.github.com/repos/jtsilver123/bringsup/actions/workflows/watchdog.yml` (public, no token) must show `"state": "active"`. If it's `disabled_inactivity` or anything else, push Jake (a broken system): "The watchdog is off. Turn it back on: https://github.com/jtsilver123/bringsup/actions/workflows/watchdog.yml → Enable workflow."

Also check: the redesign queue isn't backing up (anything `queued` more than 2 hours old), every `NOT EMAILED` line from step 4's `pull` was emailed (QUEUE_WORKER.md), there's no bounce spike, and the Composio Gmail connection works.

## 7. Finish
Update `meta/pipeline`: `lastRunAt`, `lastRunSummary`, `capacity` and `customers` = preflight's `capacity` and `customers` (`{building, previewing, launching, live, onPlan}`; never use `jobs` to count, it claims work).

Last thing every run, even when there was nothing to do: `node tools/projects-worker.ts heartbeat "<the one-line counts>"`. The watchdog emails Jake if no heartbeat arrives for 5 hours.

Final message: one line of counts (emails answered, previews sent, rounds applied, launches, sites live, cold emails sent, prospects added), then any blockers.

**Push-notify Jake only for these, each with everything he needs so it takes minutes.** This list, at the end of the final message, is the one channel to Jake; "add it to step 7" in this runbook means here. Anything waiting on someone else (the waiting list below) goes in once a day, with the daily work.
- **A refund requested, and the customer insists:** who, what they said, and "notes: tracker disputes/pre-<ref>". Right away.
- **A managed-plan customer who cancelled the project:** they were sent the portal link; check the subscription ends. Also any request to take a live site down.
- **The waiting list:** customer emails that bounced with no helper address, DNS waits past 14 days, a changed mail setting not put back after 3 days, a domain renewal 7 days out, and files you couldn't delete.
- **A dispute or chargeback:** the amount, the evidence due date, and "packet: tracker disputes/<id>". Right away.
- **A refund to issue** (a duplicate payment): the session id and amount, and that the customer was told 2 business days. Operators never refund.
- **A legal threat, or a request to move money or share credentials:** what was asked and by whom. Right away.
- **A payment that matches no project:** the session id and amount.
- **A warm-lead draft ready:** "Draft to <name> is in Gmail drafts."
- **The monthly statement** (step 1b): "BringsUp <month>: <n> payments, $<gross> gross, $<net> net. tracker books/<YYYY-MM>."
- **Ready for a second mailbox:** once, when the daily cap has been 30 for 10 business days with every RUNBOOK gate passing. More volume needs a second sending domain and mailbox, which Jake buys.
- **A broken system you couldn't fix after a real attempt** (a missing env var, a disconnected connector, failing deploys): what's broken and the exact fix (for a connector, "reconnect <name> in Composio"). At most once a day.

Batch everything else into the run summary. Stay quiet otherwise.

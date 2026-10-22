# How BringsUp works, end to end

The one map of the business: every step, who or what does it, which system it touches, and which doc has the details. **Any change to the process updates this file in the same commit**, along with the doc it points to and, when the hourly task's behavior changes, its prompt (see "Keeping it in sync").

## The offer
- A family-owned local business with great reviews and an outdated site gets a plain cold email offering to make them a new homepage.
- If they say yes, they get it as a private live link on bringsup.com.
- If they want the whole site, one 10-minute form starts it. We build every page and send a private preview in about two weeks.
- Two rounds of changes are included. Extra rounds, and changes after launch, are $150 each. Anything we got wrong is fixed free.
- They pay a flat $1,000 only when they approve the finished site. Hosting is included. There's no Care Plan or monthly fee for now.
- A logo and color refresh is included if they ask for one (start form question "Your logo and colors"). A one-page brand guide comes with it.

## The flow
| # | Step | Done by | Systems | Details |
|---|---|---|---|---|
| 1 | Find prospects (high-ticket trades and shops in affluent towns, 4.7+ stars, 40+ reviews, outdated site, published email) | Operator, step 5b | Web research, tracker | RUNBOOK.md §4, §6 |
| 2 | Cold drip, with one goal: a reply that says "yes". Email 1 offer, Email 2 (+3 business days), Email 3 (+7 business days after Email 2). No links or attachments. Gated ramp of 5 to 30 a day, spread through the day in the prospect's time zone | Operator, step 5a | Gmail jake@bringsup.com (Composio), tracker | email_template.md, RUNBOOK.md §1, §3, §5, §8 |
| 3 | Replies: yes, questions, objections, later, no, auto-replies, bounces | Operator, step 1 | Gmail, tracker | OPERATOR.md step 1, email_template.md "Replies and objections" |
| 4 | Yes: build the top of their homepage (the rest blurred behind a "Start my website" card, nothing to pay), check it, reply with the private link | Operator, step 1 | `queue-worker outreach`, redesign function, bringsup.com/try/?id= | email_template.md "Building their homepage" |
| 4b | /try/ visitor: queued redesign designed and emailed with a start link (`?ref=redesign-<id>`) | Operator, step 4 | redesign function, `queue-worker pull/complete/emailed` | QUEUE_WORKER.md |
| 5 | Start form submitted, project created | Automatic | Tally Ar7yBl → Supabase `projects` function | supabase/functions/projects |
| 6 | Build the full site (plus logo refresh and brand guide if they asked) and send the private preview | Operator, step 2 `build` | site-kit, Cloudflare Pages `preview.<project>.pages.dev` | OPERATOR.md "build" |
| 7 | Rounds of changes: two included, two-day window, held changes and the paid extra round | Automatic counting, operator applies | Tally EqkMlA and 5XBMpd, Stripe link | OPERATOR.md "revise", "offer_extra" |
| 8 | Approve, then pay $1,000 | Owner: form, then Stripe. Operator records the payment | Tally VpLDP6 → Stripe Payment Link, operator step 1b | OPERATOR.md step 1b |
| 9 | Launch: production deploy, domain steps sent, DNS checks and reminders, "you're live" | Operator, step 2 `launch` and `check_dns`. The owner or their web person changes two DNS settings | Cloudflare Pages, customer_emails.md 6–8 | OPERATOR.md "launch", "Domain steps" |
| 10 | After launch: our mistakes fixed free, other changes $150 a round | Operator, step 2 `care_edit` and `reply_out_of_scope` | Stripe extra link | customer_emails.md 11 |
| 11 | Quiet customers: reminder at 10 days, closing notice at 45, takedown at 60 | Operator, step 3 | | customer_emails.md 9–10 |
| 12 | Health, alerts and stuck jobs | Operator, step 6. Push to Jake only for what's in step 7 | `projects-worker health` | OPERATOR.md steps 6–7 |
| 12b | Is the operator itself running, and are the site, forms and payment links up? | Watchdog, every 2 hours. A failure emails Jake | GitHub Actions, `?pulse=1` heartbeat | `tools/watchdog.sh` |
| 13 | Bookkeeping: monthly ledger and statement | Operator prepares (step 1b), Jake reads | Stripe read-only, tracker `books/<YYYY-MM>` | OPERATOR.md step 1b |
| 14 | Disputes and refunds: evidence packet or refund details prepared | Operator prepares, **Jake** files or refunds in Stripe | tracker `disputes/<id>` | OPERATOR.md steps 1, 1b, 7 |
| 15 | Warm leads (people Jake knows): homepage built, Gmail draft saved | Operator prepares, **Jake** hits send | Gmail drafts, tracker `warm: true` | OPERATOR.md step 5 |

## What still needs Jake, and why
Each is prepared so it takes minutes, and each reaches him as a push (OPERATOR.md step 7):
- **Filing a dispute response and issuing refunds:** both are money moves on InstateMe's Stripe account, which the operator only reads.
- **Legal threats** and anything asking to move money or share credentials.
- **Reconnecting an account** when Gmail, Stripe or Cloudflare access lapses (sign-ins need a person). The push names the exact fix.
- **Sending warm-lead drafts**, so a note to someone he knows comes from him.
- **Buying a second sending domain and mailbox** when outreach hits the 30-a-day ceiling with healthy numbers.
- **Taxes and the books themselves:** the monthly ledger is automatic; filing and moving BringsUp's money out of InstateMe's books is his or his accountant's.
- **One-time:** a separate Stripe account for BringsUp, a lawyer's review of the terms.

## Accuracy (applies to everything we send or publish)
- Every fact on a site, homepage, brand guide or email comes from a source we can point to: the owner's start form, their own website or menu, their Google listing, or their uploads. Keep the list in `work/.../sources.md` while building.
- Nothing is invented: no hours, prices, years, awards, reviews, policies ("free tastes"), directions or claims about their street, building or neighbors.
- If a fact may be stale (seasonal hours, a holiday menu), say so the way the owner would ("summer hours, call to confirm"), or leave it out.
- Awards are attributed exactly as the source states them.
- Stock photos are fine for food and objects. Never present stock as their shop, team or work.
- Before sending, re-read the page against the sources. Anything that isn't backed by one gets cut.

## Systems and IDs
- **Repo:** github.com/jtsilver123/bringsup, public. Main is what the hourly task reads; bringsup.com deploys from main via GitHub Actions to GitHub Pages, and its DNS is on Cloudflare.
- **Hourly operator:** scheduled task "BringsUp operator" (`trig_01Tps7s4xLzURVqhGgu2TkmT`). It runs hourly 8 AM–8 PM ET, plus midnight and 4 AM. Its prompt sets the hard rules, the tokens and the tracker URL, then tells it to follow tools/OPERATOR.md. (The old "redesign queue" task is disabled; the operator does that work in step 4.)
- **Tracker:** artifact "BringsUp Outreach", https://claude.ai/artifact/M6V7PXQ7mvKP1FfUF6j4Wr (`prospects/*`, `meta/pipeline`, `stats/<date>`).
- **Email:** jake@bringsup.com through Composio Gmail (`gmail_gariba-preach`) only.
- **Forms (Tally, jake@bringsup.com workspace):** start `Ar7yBl`, changes `EqkMlA`, approve `VpLDP6` and extra round `5XBMpd` post to the projects function webhook. Concept `bZ5vj0` is only the fallback form when `REDESIGN_API` is off.
- **Backend (Supabase `rgeeynodxvusivfbaxfu`):** functions `projects` (state machine, webhooks, worker API) and `redesign` (/try/ and outreach previews). Deploy with tools/bundle_function.sh, then switch JWT verification off again.
- **Payments:** Stripe Payment Links on the InstateMe account (Jake's other company, for now): $1,000 `plink_1UTR1oB5nImYYaicDgVP1GNc`, $150 `plink_1UTR1oB5nImYYaicoE1lqGy6`. Pages, terms and receipts say so.
- **Hosting:** Cloudflare Pages, account `10b43838f31b9959c8eb61aafdd200f3`, with one project per customer.
- **Watchdog:** `.github/workflows/watchdog.yml` runs `tools/watchdog.sh` every 2 hours: bringsup.com pages, the projects function, the four Tally forms, both Stripe links, and the operator's heartbeat (`?pulse=1`, from `projects-worker heartbeat` at the end of every run; 5 hours without one fails). A failed run makes GitHub email Jake. It also re-enables itself each run, since GitHub turns off scheduled workflows in repos without commits for 60 days.
- **Tests:** `node tools/simulate-flow.ts` (signed fake submissions against production; it cleans up after itself).

## Keeping it in sync
Whenever the process changes, in the same piece of work:
1. Update the doc that owns the step (OPERATOR.md, RUNBOOK.md, email_template.md, customer_emails.md), and this file if a step, system, price or ID changed.
2. If the hourly task's hard rules, schedule, tokens or setup changed, update its prompt (scheduled task above). The prompt must never contradict the docs.
3. Keep the site, terms, privacy policy and Tally forms saying the same thing as the docs: prices, rounds, timings, what's included.
4. Run `npx tsc --noEmit -p .`, `npm run build` and, if the backend changed, `node tools/simulate-flow.ts`. Then merge to main so the next hourly run picks it up.

## Examples
- `tools/examples/scoops-and-cookies/`: a hand-built homepage idea and one-page brand guide for a real Deerfield ice cream shop (live at https://scoops-and-cookies-idea.pages.dev). It's the quality bar for content accuracy, the logo refresh and the brand guide.

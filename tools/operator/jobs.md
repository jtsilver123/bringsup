# Step 2: customer jobs

Part of the hourly operator runbook (tools/OPERATOR.md). Read it when the run reaches this step and has work for it.

## 2. Customer jobs (every run)
Run `node tools/projects-worker.ts jobs`. Each job is leased to you for 45 minutes. Work them oldest first. After each one, record the result with `node tools/projects-worker.ts update <ref> <file>`, where the file is `{set, event, applied_seq?}`. Don't record success by any other route: if something fails, run `fail <ref> "<what happened>"` instead (5 failures raise an alert automatically).

The files are in `work/projects/<ref>/`: `project.json` (brief, files, state), `events.json` (history) and `site.json` (once built).

### build: the first version
0. **A later month's start?** If `starts_on` is after today: send email 1b instead of email 1 (same `Sent email 1:` check and log), set the tracker row (as in step 1) to `status: started`, `startedAt`, `projectRef`, `lastTouchAt`, `followUpAt: null`, then `update` with `set: {next_check_at: "<starts_on>T13:00:00Z"}` and stop. The job comes back on that date and continues from step 1, which skips the email already sent.
1. Send email 1 (Start received) unless `events.json` has an `email` event whose summary starts with `Sent email 1:` (with the colon, so it never matches email 10). Right after sending, log `event: {kind: "email", summary: "Sent email 1: We're building the {business} website"}`. (Do the same for every templated email: check for its key first, log it right after sending. A retried job must never send twice. Emails that can repeat carry the instance in the key: `Sent email 3 (round R):`, `Sent email 4 (round R):`, `Sent email 5 (seq <changes_seq>):`, `Sent email 9 (preview <last_preview_at date>):`, `Sent email 12 (<subscription id>):`, `Sent email 13 (<subscription id>):`, `Sent email 14 (<expiry date>, 30 days):` and `(<expiry date>, 7 days):`. Match the whole key.) Also find the prospect row in the tracker (`prospects/<slug>` matching the project's `ref`, or by email; /try/ visitors have none) and set `status: started`, `startedAt`, `projectRef`, `lastTouchAt`, `followUpAt: null`, so the cold drip stops.
2. Write `work/projects/<ref>/site.json` (the `SiteContent` type in `tools/site-kit/render.ts`; `tools/site-kit/examples/` has one example per look):
   - **Inputs are just two things: their current website and the start form.** First evaluate the website: fetch every page, note what's worth keeping (real photos, menu or services, prices, story, hours, awards, directions quirks) and what's broken or missing, and write it to `work/projects/<ref>/audit.md` together with `sources.md` (every fact and where it came from). Then read the start form (`brief`, uploads). The output is a site clearly better than theirs, built only from those facts (tools/WORKFLOW.md "Accuracy"). Bar: `tools/examples/scoops-and-cookies/`.
   - **Logo and colors** (start form "Your logo and colors"; all included in the flat price):
     - "Keep exactly as they are": use their logo file and colors as is. No brand guide.
     - "Tidy them up": redraw the same idea cleanly (SVG lockup and mark), keep their colors and refine the shades, and write a one-page brand guide.
     - "Give me a new logo and colors": design a new wordmark and mark that fit the business and its customers, pick a palette and type, and write a one-page brand guide.
     - No answer: keep their logo; mention in email 2 that a tidy-up or new logo is included if they'd like one.
     - **Brand guide** (written as `brand/index.html` into the built site folder after `preview`/`launch` builds it, then deployed with it, served at `/brand/`, linked from the preview email, never in the site's navigation). Check `<preview_url>/brand/` loads before sending email 2; if it doesn't, leave email 2's brand line out and `fail <ref> "brand guide not deployed"`: logo versions (primary, on dark, mark alone) with do's and don'ts, the color palette with hex codes and where each is used, the type pairing with samples, a few lines on voice, and the files they get (logo SVG and PNG: full color, white, mark only). Follow `tools/examples/scoops-and-cookies/brand.html`.
   - **Facts only from the start form (`brief`), their files, their current website (fetch it) and their Google listing.** Never invent hours, prices, years, awards or reviews. `rating`/`review_count` only from Google or Yelp, with `reviews_url` set.
   - **Testimonials:** up to 3 short, real quotes from their Google reviews, with the reviewer's first name and last initial. Use only what you can see on the page.
   - **Photos:** image fields take a URL or a path relative to `work/projects/<ref>/` (for photos you edited locally). Use their uploads first (`project.files`), then good photos from their current site, then Unsplash stock that clearly matches. Never put a photo on a card it doesn't show (no croissant labeled "Cannoli"). If nothing fits an item, leave its `image` empty.
   - **Logo:** per their "Logo and colors" answer above. Keeping it: use their uploaded logo (or the one on their current site). If there isn't one, leave `logo` empty and the wordmark renders.
   - **Main button (`primary_cta`):** take it from "What should the main button on your site do?" A link to their existing ordering, booking or quote tool (Square, Toast, Calendly…) if they have one. Otherwise `{"label": "Call to order", "href": "tel:..."}` or a quote/contact link to `contact/`. Never promise online ordering they don't have.
   - **Copy:** warm, specific, in their words where possible. Use "Extra notes from the owner" in the brief and "Anything to change from the concept we sent?".
   - **Theme** (`Theme` in `tools/site-kit/render.ts`): `home` for remodelers, carpenters, upholsterers, framers and furniture restorers; `boutique` for jewelers, watch repair, tailors and bridal; `garden` for landscapers and tree services; `restaurant` for delis, pizza and diners; `bakery` for bakeries and cafes; `auto` for auto shops; `professional` for education and consulting; `trades` for everything else. The theme picks the look (`Style` in `render.ts`): `editorial` (bakery, restaurant: printed-menu serif, prices on dotted leaders), `workshop` (auto, trades: bold grotesk, big phone number, numbered services), `craft` (home, professional: project photos with captions), `atelier` (boutique, beauty, retail, health: centered, quiet serif) and `landscape` (garden: photo-first). Set `"style"` only to override it, e.g. `"atelier"` for a framer or upholsterer whose work is fine and small.
   - **Look-specific fields (optional, leave out if you don't have them):** `specialties` (short names: makes they service, or "Kitchens", "Staircases"), `approach` (`{heading, paragraphs}`: how a job goes, in their words, 2 or 3 short paragraphs) and `gallery` (`[{image, caption}]`: their work or place, captions factual like "Walnut kitchen, Claverack" or ""). `tools/site-kit/examples/` has one site.json per look. Thin content is fine: sections without content are left out, never filled.
   - **Images:** every image in `assets/` must be a JPEG, PNG or WebP under 500 KB, upright, and at most 2000px on the long side. Phone photos arrive as HEIC and 5–10 MB: convert them first (`convert in.heic[0] -auto-orient -resize 2000x2000\> -strip -quality 82 out.jpg`, or PIL if ImageMagick is missing) and reference the converted file.
   - **Contact:** `primary_cta.href` may point at `contact/` only when `site.email` is set, so the contact page has a real "Email us" action.
   - `domain` = `project.domain` (no www).
3. Run `node tools/projects-worker.ts preview <ref>`. It builds and deploys `https://preview.<pages_project>.pages.dev` and saves `site` and `preview_url`.
4. Check the preview yourself with Playwright at 390px and 1280px (`/opt/node-tools/node_modules/playwright/index.mjs`, `executablePath: '/opt/pw-browsers/chromium'`): no broken images, no placeholder text, nothing overflowing, and the phone, hours and button all correct. Fix and redeploy until it's right.
5. Send email 2 (Preview ready), even if email 1 went out earlier in this same run. Then `update`: `set: {status: "preview_sent", todo: null}`, `event: {kind: "preview_sent", summary: "<url>"}`, and set the tracker row's `fullPreviewAt`.

### revise: apply a round of changes
0. If this round can't be applied and previewed in this run, send email 3 first (skip if events already have `Sent email 3 (round R):` for this round).
1. Note `changes_seq` from `project.json`. Apply every item in `pending_changes` to `site.json`. For attachments, use the matching Storage copies in `project.files` (the Tally URLs in the text expire). If a request is unclear, make the most sensible reading and say what you did in the email.
2. Run `preview <ref>` and check it as above.
3. Send email 4 (Updated preview), listing what changed. `update`: `applied_seq: <the changes_seq you noted>`, `set: {status: "preview_sent", todo: null, pending_changes: null}`, `event: {kind: "revised", round: <rounds_used>, summary: "<what changed>"}`. If more changes arrived while you worked, the function keeps the job open, and you'll pick it up next run.

### offer_extra
Send email 5 (One more round?). `update`: `set: {todo: null}`, `event: {kind: "email", summary: "Offered an extra round"}`. Status stays `awaiting_extra` until they pay (the webhook moves it on) or approve.

### launch: approved and paid
0. **No domain of their own** (`domain` empty: no website, or only a Facebook or Google page): note `changes_seq` and apply any `pending_changes` first (as in revise, without the email). Run `launch <ref>`. Send email 6 without the domain parts (thanks, the receipt and the InstateMe line), then email 8 with the site at `https://<pages_project>.pages.dev` and one line saying that if they buy a domain later we'll connect it for free. `update`: `applied_seq: <changes_seq>`, `set: {status: "live", todo: null, live_url: "https://<pages_project>.pages.dev", pending_changes: null}`, `event: {kind: "live"}`. Set the tracker row to `status: won`, `liveAt`, `lastTouchAt`. Skip the steps below.
1. If `pending_changes` has anything in it, apply it first (as in revise, without the email).
2. Run `node tools/projects-worker.ts launch <ref>`. It deploys production to `<pages_project>.pages.dev` and attaches `domain` and `www.domain` in Cloudflare Pages.
3. Record their mail servers: `node -e "require('dns').promises.resolveMx('<domain>').then(r=>console.log(JSON.stringify(r.map(m=>m.exchange).sort())))"`.
4. Send email 6 with the Domain steps below. Send to the owner, and to `domain_helper_email` too if set (CC the owner). Then `update`: `applied_seq: <changes_seq>`, `set: {status: "launching", todo: "check_dns", next_check_at: <now + 6h>, pending_changes: null}`, `event: {kind: "launch_steps_sent", payload: {mx: [...]}}`.

### check_dns
Run `node tools/projects-worker.ts dns <ref>`.
- **`www.<domain>` is serving the new site:** if `pending_changes` has anything (sent after approval), apply it and run `launch <ref>` again first. Check the email records are intact: run the same `resolveMx` command (`dig` isn't installed). If the list differs from the `launch_steps_sent` payload, or is empty when it wasn't, don't send email 8: unless events already have a `mail_changed` event, email the owner (CC the helper) that a mail setting changed with the exact MX values to put back, and log `event: {kind: "mail_changed", payload: {mx: [...]}}`. Then `update` with `set: {next_check_at: <now + 6h>}` (todo stays) and stop. If it still differs 3 days after that event, add it to step 7's list. Send email 8 (You're live) only on a run where the MX list matches, with its "without www" note if the bare domain doesn't redirect to www yet. `update`: `applied_seq: <changes_seq>`, `set: {status: "live", todo: null, live_url: "https://www.<domain>", pending_changes: null}`, `event: {kind: "live"}`. Then set the matching tracker prospect row (same slug as `ref`, or by email) to `status: won`, `liveAt`, `lastTouchAt`.
- **Not yet:** `update` with `set: {next_check_at: <now + 6h>}` (todo stays). On day 2 and day 5 after `launch_steps_sent` (whole days since that event), send email 7 once: skip it if events already have `{kind: "domain_reminder", payload: {day: N}}` for that day, and log exactly that after sending. On day 10, send the steps again to anyone they've named (log `{kind: "domain_reminder", payload: {day: 10}}`) and offer to walk them through by email. After 14 days, keep checking daily, and add it to step 7's waiting list (it's waiting on them, not broken).

### care_edit: a paid $150 round after launch
Apply `pending_changes` to `site.json`, run `launch <ref>` (production deploy), reply "Done" in their thread with what changed. `update`: `applied_seq`, `set: {todo: null, pending_changes: null}`, `event: {kind: "care_edit_done"}`.

### reply_out_of_scope: a change after launch
If it's only fixing something we got wrong (a typo, or wrong details that were right in their start form), fix it free like a care_edit. Otherwise send email 11. `update`: `set: {todo: null}`.

### Managed plan: the daily and monthly care
For every project in `node tools/projects-worker.ts plans` with `status: live` and a `domain` (the plan is only offered to those):
- **Every day (the daily work, step 0):** fetch the live site (`dns <ref>`) and look up the domain's MX records (`curl -s -H 'accept: application/dns-json' 'https://cloudflare-dns.com/dns-query?name=<domain>&type=MX'`). If the site isn't serving our pages or the MX records differ from the ones recorded at launch (the `launch_steps_sent` event's `mx`), find out why and fix what we control (a redeploy, a Pages domain re-attach). If the fix is in their DNS, email them (or `domain_helper_email`) the exact steps for their provider (Domain steps), at most once a week for the same problem (check earlier `plan_check` events). Log `event: {kind: "plan_check", summary}` only when something was wrong. Then look up the domain's expiry (`curl -s https://rdap.org/domain/<domain>`, the `expiration` event). 30 days or less away: send email 14 (key `Sent email 14 (<expiry date>, 30 days):`). 7 days or less away and the date hasn't moved: send it again (key `(<expiry date>, 7 days):`) and add it to step 7.
- **Once a month (the monthly work, step 0):** compare the site's hours, phone and address with their Google listing (web search for the business). If the listing changed and the site didn't, update the site (as a care_edit), deploy, and tell them in one short email what you changed and why. If unsure which is right, ask them instead.
- **Their updates by email** are care_edits (the function already routes them there for `care_plan` projects). Small means text, hours, prices, menu items, photos, a notice, or a link. A new page or reworking a section isn't small: `update <ref>` with `{"set": {"held_changes": "<the request>", "pending_changes": null, "todo": null}}`, then reply with email 11's $150 option. A paid extra round picks up `held_changes`.

### Domain steps
Point **www** at the site, and forward the bare domain to www. Never touch MX, TXT or any other record.
- **Every provider:** add or replace a **CNAME** record. Host/Name `www`, Value/Points to `<pages_project>.pages.dev`, TTL default. If a `www` A record exists, delete only that one.
- **Bare domain** (`{domain}` without www): set up **forwarding / redirect** to `https://www.{domain}`, permanent (301), "forward only".
  - **GoDaddy:** Domain → DNS → Forwarding → Add Forwarding.
  - **Squarespace:** Domains → {domain} → DNS → Domain forwarding.
  - **Namecheap:** Domain List → Manage → Redirect Domain.
  - **Wix:** Domains → ⋯ → Manage DNS (or forward from Settings).
  - **Network Solutions / Web.com:** My Domain Names → Manage → Edit DNS / Forward Domain.
  - **Anything else:** describe it in plain words, and ask for a screenshot if they're stuck.
- Write the steps for their provider only, in plain words (customer_emails.md, "Write for someone who isn't technical"): numbered, one click per step, the exact words to click or type in bold, and what they'll see when it worked. Never say CNAME, DNS, A record or 301 on their own; name them only as the label on their screen.

Example for GoDaddy (adapt the clicks for their provider; keep the shape):
> 1. Go to **godaddy.com** and sign in.
> 2. Click your name at the top right, then **My Products**.
> 3. Next to **{domain}**, click **DNS**.
> 4. Look in the list for a row where the **Name** is **www**. If there is one, click the pencil next to it. If not, click **Add New Record** and choose **CNAME** as the type.
> 5. In the box called **Points to** (or **Value**), type exactly: **{pages_project}.pages.dev**
> 6. Click **Save**.
> 7. Now scroll down to **Forwarding**, click **Add Forwarding**, and type **https://www.{domain}**. Choose **Permanent (301)**, then **Save**.
>
> That's it. Don't change anything else on that page: the other rows are what keep your email working. It can take up to an hour to switch over, and I'll check it and email you when it's live.
>
> Stuck? Reply with a photo of your screen and I'll tell you exactly what to click. Or forward this email to whoever set up your website.

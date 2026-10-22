# BringsUp cold emails

These go out under Jake's name, so each one has to read like Jake sat down and wrote it to one person. Keep it short and specific, a little informal, with nothing that looks like a mass email. If a sentence could be sent to any business, rewrite it or cut it.

## How it works
1. Research finds the business and what its customers love (RUNBOOK step 6). Nothing is built yet.
2. Email 1 offers to make them a new homepage. No links, no attachments.
3. **Only when they say yes** do we build their homepage and send it as a private link, live on bringsup.com. They tap it on their phone and scroll a real page. That's the moment to impress, so it gets the care: see "Building their homepage" below.

Building only on a yes keeps the effort on the people who asked, and the "yes" reply is the best signal a new mailbox can get.

## The one goal: a reply that says "yes"
Every cold email exists to get one word back: **yes**. Not a click (there are no links), not a call, not the price, not the start form. Write every email so saying yes is the easiest thing to do:
- **One ask, at the end, answerable with "yes".** "Want me to make it?" works; "What do you think?" or "Would you be open to a conversation?" doesn't.
- **Say how small the yes is.** Make clear a one-word reply is all it takes, that it costs nothing, and that **saying yes commits them to nothing**: it only means we make the homepage and they look at it. Say that plainly, in their words, right next to the ask: "Just reply yes. It doesn't commit you to anything." (Never "no obligation" or "risk-free": those read as spam. See the banned list.)
- **Remove reasons to hesitate before they appear.** It's free to look at, nothing to fill in yet, no call. Mention the price only as "you'd only pay if you love the finished site", never a number.
- **Nothing that competes with the yes.** No second question, no "let me know if you have questions", no options to choose between.
- **Every follow-up asks for the same yes**, Email 3 included, in fresh words.
- A yes in any form counts: "sure", "ok", "go ahead", "send it", a thumbs-up. Treat it as yes (OPERATOR step 1).

## The sequence (a 3-step drip)
| Step | When | What | Attachment | Links |
|---|---|---|---|---|
| 1 | day 0 (Mon–Thu only) | Email 1: the offer | none | none |
| 2 | 3 business days later | Email 2: one new, useful observation, same thread | none | none |
| 3 | 7 business days after step 2 | Email 3: a short, gracious last note, same thread | none | none |

- **A reply from a person stops the drip**, whatever it says. A "no" goes on Do Not Contact. An auto-reply (out of office) only moves the next date: see OPERATOR.md step 1.
- A bounce stops it too (`status: lost`).
- Three cold emails per business, ever. There is never a fourth, and never a new sequence for someone who finished one.
- Steps 2 and 3 are replies in the same thread (`GMAIL_REPLY_TO_THREAD`), so the owner sees one short conversation rather than three separate pitches.

## How they're sent (deliverability)
- **Plain text only.** No HTML, no bold or bullets, no images, no tracking pixels and no link shorteners. Use Composio `GMAIL_SEND_EMAIL` with `is_html: false` and `include_signature: false`. The sign-off below is the whole signature.
- **No links and no attachments in any cold email.** A link or a file from a stranger is the strongest spam and phishing signal there is. The one exception is the bare domain `bringsup.com` on its own line in the sign-off, written as plain text and never as `https://...`, because it's how an owner checks we're real.
- **Rotate, don't repeat.** Number today's first emails 1, 2, 3… and take subject option (n mod 3) and close option (n mod 3). Then write every sentence fresh for this business: the examples below show the shape, never the wording. Before sending, compare with the last three Email 1s in Sent: if any sentence (other than the sign-off, opt-out and address) matches one of them word for word, rewrite it. Mail filters fingerprint repeated sentences, and owners who compare notes would spot it.
- Send one at a time, paced as the RUNBOOK says, and never above the daily cap.

## Email 1 (step 1, day 0)

**Subject**, all lowercase, the way a real person types it:
1. `idea for {business}`
2. `{business} homepage`
3. `{business} website`

**Body** (60–100 words before the sign-off, exactly one question, and the ask (that question plus how small the yes is and that it commits them to nothing) ends the email):

> Hi {first name},   ← if the first name isn't known, just "Hi," (never "Hi there")
>
> {Opening: one specific, true sentence only a reader of their reviews or site would know. A different angle each time, e.g.:
> - "I was reading through your reviews and kept seeing {specific praise, paraphrased}."
> - "{Number} years in {town} and people still {specific thing they love}. That's rare."
> - "{Review count} reviews and half of them mention {specific thing}."}
>
> {Bridge, one or two sentences: "Your website doesn't really show that yet. I'd like to make you a new homepage, built from your actual {menu / services / work} and hours, with {the thing they're known for} front and center and {calling / ordering / booking} one tap away on a phone."}
>
> {Close: "It's free to look at, and if you like it I can build the whole site, and you'd only pay once it's finished and you're happy with it." Then the ask, which is always a yes-question plus how small the yes is, including that a yes commits them to nothing. One of: 1. "Want me to make it? Just reply yes. It doesn't commit you to anything." 2. "Should I put one together for you? A quick yes is all I need, and it doesn't tie you to anything." 3. "Want to see it? Reply yes and I'll send it over this week. Saying yes doesn't commit you to buying."}
>
> Jake
> bringsup.com
>
> If this isn't for you, just say so and I won't email again.
> BringsUp, 2195 Kipling Lane, Highland Park, IL 60035

("Free" is on the banned list as a subject-line hype word, but "free to look at" in a plain sentence is honest and fine.)

Example (Marigold Bakery, Westbrook CT):

> Subject: idea for marigold bakery
>
> Hi Rosa,
>
> I was reading through your reviews and kept seeing the sourdough, and that your family remembers people's names. Forty years of that is something.
>
> Your website doesn't really show it yet. I'd like to make you a new homepage, built from your actual menu and hours, with the bakery front and center and ordering one tap away on a phone.
>
> It's free to look at, and if you like it I can build the whole site, and you'd only pay once it's finished and you're happy with it. Want me to make it? Just reply yes. It doesn't commit you to anything.
>
> Jake
> bringsup.com
>
> If this isn't for you, just say so and I won't email again.
> BringsUp, 2195 Kipling Lane, Highland Park, IL 60035

## Email 2 (step 2, 3 business days later)
Two or three short sentences with one new, useful observation. It never just nudges: no "just following up", "bumping this" or "did you see my email". Pick the first angle that's true for this business, and only one:
1. A factual mismatch between their site and Google (hours, phone, a menu item or service), stated as "still lists", never as a flaw.
2. The one thing from their reviews the homepage would lead with ("it would lead with the cannoli everyone mentions").
3. The phone view: "most people who look up a {bakery} are on a phone, so it would put {ordering / calling} one tap away."
4. Only if none of those apply, the process: "it's one 10-minute form on your end, no calls, and you see the finished site before paying anything."

> Hi Rosa,
>
> One more thing I noticed: your site still lists the hours as 7 to 3, and Google has you open until 4 now. On the new homepage the hours and menu would live in one place, so they stay right.
>
> Want me to make it for you? A one-word yes is all it takes, and it doesn't commit you to anything.
>
> Jake
>
> If this isn't for you, just say so and I won't email again.
> BringsUp, 2195 Kipling Lane, Highland Park, IL 60035

## Email 3 (step 3, 7 business days after Email 2)
The last note. It's short and warm, gives them a graceful way to say "later", and never guilt-trips them ("I guess you're not interested", "closing your file").

> Hi Rosa,
>
> Last note from me, so I'm not cluttering your inbox. The offer stands: reply yes, today or months from now, and I'll make you that homepage. You'd just look at it, nothing more.
>
> Jake
>
> This is my last email either way. If you'd rather not hear from BringsUp at all, reply "no" and I'll make sure of it.
> BringsUp, 2195 Kipling Lane, Highland Park, IL 60035

## Building their homepage (only after a yes)
This is the first thing of ours they'll really look at, so it has to be clearly better than their current site and feel made for them. Take the time.

1. **Evaluate their current site first** (what to keep, what's broken or missing), and keep a `sources.md` of every fact and where it came from (tools/WORKFLOW.md "Accuracy"). Nothing goes on the page without a source. Seasonal facts get flagged the way the owner would ("summer hours, call to confirm").
2. **Gather the real material.** Fetch their current site and their Google listing. Collect: name, phone, address, hours, the real menu, services or work (with prices if they publish them), year founded, rating and review count, and 2–3 short review quotes with first name and last initial. Collect their best photos: the full-size `https` image URLs from their own site (storefront, food, work, team). Never invent facts, prices, awards or reviews.
2. **Write the content** as `work/outreach/<slug>/concept.json`, following the redesign schema (`SCHEMA` in `supabase/functions/redesign/prompt.ts`). Headline and story in their voice, built on what reviews keep praising; the main button matches how they get business (`call`, `order`, `book`, `quote`, `directions`); `theme` from the schema's enum (bakery, restaurant, auto, garden, trades, beauty, retail, health, professional). Put their photo URLs in `work/outreach/<slug>/meta.json` as `{"url": "<their site>", "email": "<their email>", "images": [...]}`, best photo first.
2b. **Show part, gate the rest.** The preview is the homepage, not the whole site: show the top of it (the hero and one or two strong sections that solve something real for them, like hours or directions), then blur everything below behind the standard BringsUp card. Use `tools/site-kit/gate.html` exactly as its comment says: wrap the rest in `bu-gate`/`bu-blur`, paste the card, fill `{{REST}}` (one plain sentence, true to their business) and `{{START_URL}}` (`https://bringsup.com/start/?ref=<slug>`). Don't restyle it: it's BringsUp's card on every preview, and it's built to show up on phones. Never a payment before approval. The gate exists only in a hand-built `work/outreach/<slug>/index.html` (self-contained; `concept.json` then needs just `business_name`, `headline` and `improvements`), so always hand-build prospect previews. Example: `tools/examples/scoops-and-cookies/index.html`.
2c. **Buttons fit the business.** Round for playful shops (ice cream, bakery, kids), softly rounded for most family businesses, crisp only for formal or upscale ones. (Site-kit builds: set `buttons` to `round`, `soft` or `crisp`.)
2d. **Logo refresh, only when it's worth it.** If their logo is weak (blurry, dated, unreadable on a phone) and a cleaned-up version in their own colors would clearly help, make one, use it on the page, and add `"brand": {"before": "<their current logo as a data URI, from their own site>", "after": "<the refreshed logo as a data URI, transparent PNG of the lockup>", "colors": [{"name": "...", "hex": "#..."}]}` to `concept.json`. /try/ then shows a "Your logo, refreshed" card under the preview. Keep their colors and what regulars recognize. Don't link the full brand guide from the preview: it comes with the site. If their logo is fine, skip all of this; no card appears.
3. **Publish:** `node tools/queue-worker.ts outreach <slug> work/outreach/<slug>`. It checks the schema and prints the private link, `https://bringsup.com/try/?id=<uuid>&ref=<slug>`. Its "Start my website" button carries their `ref`.
4. **Check it like they will:** open the link with Playwright at 390px and 1280px (`/opt/node-tools/node_modules/playwright/index.mjs`, `executablePath: '/opt/pw-browsers/chromium'`). No broken or wrong photos, no placeholder text, nothing cut off, phone, hours and button all correct, and it looks better than their current site side by side. If anything's off, fix `concept.json` and publish again (a new link; send only the final one).
5. Save the link in the row's `conceptUrl`, and reuse it if they ask again.

Cost control: build only for a person who said yes or asked to see it, at most one build per prospect (fix, don't rebuild from scratch), and no builds for "how much?" alone: answer the price, then offer to make it.

## Replies and objections
OPERATOR.md step 1 handles every reply. Send in the prospect's thread (`GMAIL_REPLY_TO_THREAD` on `threadId`), plain text, `include_signature: false`, signed "Jake". Once they've written back, links are fine. Answer what they asked first. Write each reply fresh in this voice; these are the shape, not text to paste.

**Yes, "sure", "send it":** build and check their homepage (above), then reply with the link, within the hour if you can.

> {Their question answered first, in one or two sentences. Skip this if there was none.}
>
> Here it is: {live preview link}
>
> It's a real page, so open it on your phone and scroll. That's how most of your customers will see it. Only people with this link can see it. {One honest note, e.g. "I used a stock photo for the window display; one of yours would be better."}
>
> How it works from here: you fill in one form, about 10 minutes, no calls. It asks for your hours, a few photos and your logo if you have one, and you can skip anything you don't have. I build the full site and send you a private preview in about two weeks. You get two rounds of changes (a round is one list of changes you send at once), and you pay a flat $1,000 only when you approve it. Keeping it online is included, so there's no monthly bill, and the site and your web address stay yours.
>
> The form's here when you're ready: https://bringsup.com/start/?ref={slug}
>
> Is there anything you'd want different before I start?

**Price ("how much?", "that's a lot", "can you do $500"):**
> Fair question. It's a flat $1,000 for everyone, and that covers the whole site, two rounds of changes and keeping it online, so there's no monthly bill after. Nothing is charged until you've seen the finished site and approved it. Keeping one price is how I skip the sales calls, so I don't discount it. Want me to make the homepage so you can see what you'd get first?

**"My nephew / my web person does our site":**
> Great, then you've got someone who already knows your site. Happy to make the homepage anyway so you both can see the idea; if they want to build from it, it's theirs. You'd own the files either way.

**"Send more info" / "what's included":** what's included (the full site from their real menu, hours and reviews; a private preview in about two weeks; two rounds of changes; hosting with no monthly fee), the flat $1,000 paid only on approval, that the site and their web address are theirs, and the start link. Say "web address", not "domain", and "keeping it online", not "hosting". End with "Want me to make you the homepage first, so you can see it?"

**Asking for a call:**
> I keep everything on email, which is part of how I keep the price flat. Ask me anything here and I'll answer the same day.

Then answer anything they asked. Never offer or schedule a call.

**"Not now" / "later":** a reply, so the drip is over. If they named a time ("after the holidays", "spring"), say "No problem, {season} comes first. I'll check back once in {month}.", set `status: replied`, append `later: <month>` to `notes` and set `followUpAt` to that date. Then send exactly one check-in in the same thread on that date: "Hi Rosa, you said {month} might be better, so this is my one check-in. Want me to put that homepage together now?" If they named no time, say "No problem. I'll leave it with you and won't email again. If it makes sense later, reply here, even months from now.", set `status: lost` and append "later" to `notes`.

**"We're happy with our site":**
> That's fair, and thanks for writing back. Best of luck this {season}.

Set `status: lost` (not `dnc`, unless they ask to stop).

**"How did you get my email?" / "is this real?":** answer in one honest line, naming where it was: "It's on your website's contact page." (or "your Google listing"). Add "I only write to businesses that list an address publicly, a few a day." If they sound annoyed or asked to stop, add "I've taken you off my list and won't email again. Sorry for the bother." and set `status: dnc`. If they're curious and still interested, carry on.

**Saw their homepage but hasn't started:** if a `replied` row with a `conceptUrl` has no start form after 5 business days, send one nudge in the thread: "No rush at all on this. If anything on the homepage gave you pause, tell me and I'll change it before you decide. The form's still here: {link}". After 15 business days, send one closing line: "I'll leave this with you. Your homepage link keeps working, so reply whenever, even months from now." Then set `followUpAt: null` and send nothing more.

## Never write any of these
They read as AI or as spam:
- "I came across", "I stumbled upon", "I hope this email finds you well", "I wanted to reach out", "I'd love to", "touch base", "circle back", "just following up", "bumping this", "quick question"
- "elevate", "boost", "transform", "take it to the next level", "game-changer", "seamless", "cutting-edge", "in today's digital world", "online presence", "stand out from the competition", "unlock"
- gushing compliments like "a reputation most places never build" (one plain, specific observation beats praise)
- "free" as a hook, "guaranteed", "no obligation", "risk-free", "limited time", "act now", "100%", any dollar figure in a cold email, ALL CAPS, exclamation marks, emojis
- em dashes (—), semicolons, tidy lists of three, and sign-offs like "Best regards" or "Cheers"
- anything about their current site being bad, broken or ugly, or about it "hurting their business" ("outdated" is the strongest word allowed, and you rarely need even that)

## Rules
- Every cold email ends with an opt-out sentence and the postal address above. US CAN-SPAM requires both in every commercial message, Email 3 included. The address is also in the tracker as `meta/pipeline.mailingAddress`; if the two ever differ, use the tracker's. A "no" is honored within the hour.
- Never ask for payment before the owner has approved their finished site.
- Never mention bad reviews. Never invent stats, clients or results. Paraphrase praise; never quote reviews in a cold email.
- Send only to an address the business publishes itself (RUNBOOK step 6 has the address rules). Never guess one.
- Anyone who says no, stop or unsubscribe goes on Do Not Contact immediately.
- Read each email back before sending. If it sounds like a template, or like something an assistant wrote, rewrite it.

# BringsUp cold emails

These go out under Jake's name, so each one has to read like a quick note Jake typed to one person on his phone. **Short beats everything:** Email 1 is 5 short sentences at most, the follow-ups are 1 or 2. No selling, no adjectives about our work, no explaining the process. If a sentence could be sent to any business, or doesn't help them say yes, cut it.

## How it works
1. Research finds the business and what its customers love (RUNBOOK step 6). Nothing is built yet.
2. Email 1 offers to make them a new homepage. No links, no attachments.
3. **Only when they say yes** do we build their homepage and send it as a private link, live on bringsup.com. They tap it on their phone and scroll a real page. That's the moment to impress, so it gets the care: see "Building their homepage" below.

Building only on a yes keeps the effort on the people who asked, and the "yes" reply is the best signal a new mailbox can get.

## The one goal: a reply that says "yes"
Every cold email exists to get one word back: **yes**. Not a click (there are no links), not a call, not the price, not the start form. Write every email so saying yes is the easiest thing to do:
- **Sound like a person, not a campaign.** Write it the way Jake would text a friend's business: plain words, contractions, no marketing phrases. Read it out loud; if it sounds like an ad or a robot, rewrite it.
- **Be explicit about the offer.** Say what you'll do and that it's free: "Want me to make you a new website? Happy to send you a demo link for free. Just let me know." No hints, no teasers.
- **One ask, at the end, answerable with "yes".** "Want me to make you a new website?" works; "What do you think?" or "Would you be open to a conversation?" doesn't.
- **The free demo is the whole reassurance.** Saying the demo is free and ending with "just let me know" makes clear a yes commits them to nothing. Don't add more ("no strings", "no obligation", "risk-free" all read as spam).
- **No price, no process, no pitch** in cold email. Those come after a yes.
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
- **Everything after Email 1 goes in the same thread** (`GMAIL_REPLY_TO_THREAD` on the row's `threadId`): Emails 2 and 3, every reply, the homepage link, the nudges, and later the customer emails (tools/customer_emails.md). The owner sees one conversation, never a second pitch. Never start a new thread with a prospect.

## How they're sent (deliverability)
- **Plain text only.** No HTML, no bold or bullets, no images, no tracking pixels and no link shorteners. Use Composio `GMAIL_SEND_EMAIL` with `is_html: false` and `include_signature: false`. The sign-off below is the whole signature.
- **No links and no attachments in any cold email.** A link or a file from a stranger is the strongest spam and phishing signal there is. The one exception is the bare domain `bringsup.com` on its own line in the sign-off, written as plain text and never as `https://...`, because it's how an owner checks we're real.
- **Rotate, don't repeat.** Number today's first emails 0, 1, 2… and take subject option (n mod 3) and ask option (floor(n / 3) mod 3), so every pairing gets used. Record them as `variant: s<subject>-c<ask>`, and the opening angle you used as `opener` (e.g. `reviews`, `years`, `count`). Then write every sentence fresh for this business: the examples below show the shape, never the wording. Before sending, compare with the last three Email 1s (`meta/pipeline.recentEmail1s`, kept by RUNBOOK step 5; no need to search Sent): if any sentence other than the short fixed lines ("I'm Jake, I make websites for family businesses.", "Just let me know.", the sign-off, opt-out and address) matches one of them word for word, rewrite it. Mail filters fingerprint repeated sentences, and owners who compare notes would spot it.
- Send one at a time, paced as the RUNBOOK says, and never above the daily cap.

## Email 1 (step 1, day 0)

**Subject**, all lowercase, the way a real person types it:
0. `{business}`
1. `{business} website`
2. `new website for {business}?`

**Body: 30–55 words before the sign-off. A real note from one person.**

> Hi {first name},   ← first names only, at most two ("Hi Ken and Maral,"). No first name known: just "Hi,"
>
> {One true, specific line from their reviews or history, in your own words, e.g. "Forty years in {town} and people still rave about your {thing}." or "Your reviews on {Google / Yelp} keep coming back to the {thing}." Name the source of any number; never add the sites' counts together.} {One plain line about the site, e.g. "Your website doesn't really show that." Never call it bad or ugly.}
>
> I'm Jake, I make websites for family businesses. {The ask, one of: 0. "Want me to make you a new one? Happy to send you a demo link for free. Just let me know." 1. "Want me to put a new one together for you? I can send you a free demo link to look at. Just let me know." 2. "Would you like a new one? Happy to make you a demo and send the link over, free. Just let me know."}
>
> Jake
> bringsup.com
>
> Not for you? Just say so and I won't write again.
> BringsUp, 109 Saint Marks Place, New York, NY 10009

Example (Marigold Bakery, Westbrook CT):

> Subject: marigold bakery
>
> Hi Rosa,
>
> Forty years in Westbrook and people still rave about your sourdough. Your website doesn't really show that.
>
> I'm Jake, I make websites for family businesses. Want me to make you a new one? Happy to send you a demo link for free. Just let me know.
>
> Jake
> bringsup.com
>
> Not for you? Just say so and I won't write again.
> BringsUp, 109 Saint Marks Place, New York, NY 10009

## Email 2 (step 2, 3 business days later)
One or two sentences, like a quick second thought: one new, true detail, then the same offer. Never "just following up", "bumping this" or "did you see my email". Pick the first angle that's true, and only one. Research saves it on the row as `email2Angle` (RUNBOOK step 6), so write from that; RUNBOOK step 3 says when to re-check it.
1. A factual mismatch between their site and Google or Yelp (hours, phone, a menu item), said as "still says", never as a flaw.
2. What the new site would lead with ("I'd lead with the cannoli everyone mentions.").
3. Only if neither applies, just the offer again in fresh words.

> Hi Rosa, also noticed your site still says you close at 3, but Google has 4. Still happy to make you a free demo if you want one.
>
> Jake
>
> Not for you? Just say so and I won't write again.
> BringsUp, 109 Saint Marks Place, New York, NY 10009

## Email 3 (step 3, 7 business days after Email 2)
One sentence. Warm, no guilt.

> Hi Rosa, last one from me. If you ever want that free demo, just reply and I'll send it over.
>
> Jake
>
> Last email either way. Reply "no" and you won't hear from BringsUp again.
> BringsUp, 109 Saint Marks Place, New York, NY 10009

## Contact form message (RUNBOOK "Contact forms", businesses with no published email)
The same note as Email 1, adjusted for a form: the form already carries Jake's name and email, so no sign-off block, no postal address, and no opt-out line beyond one plain sentence. Subject (if the form has one): `New website for {business}?` Message, 30–55 words:

> Hi {first name, or nothing},
>
> {One true line from their reviews or history.} Your website doesn't really show that.
>
> I'm Jake, I make websites for family businesses. Want me to make you a new one? Happy to send you a demo link for free. Just reply to jake@bringsup.com and let me know.
>
> Jake
>
> (Not for you? No need to reply, I won't write again.)

## Building their homepage (only after a yes)
This is the first thing of ours they'll really look at, so it has to be clearly better than their current site and feel made for them. Take the time.

0. **Read tools/DESIGN_LESSONS.md first.** Every line is something a real preview taught us. If this build runs into something new (a site quirk, a layout bug you caught while checking, a fact you couldn't verify), append one line to the tracker doc `meta/lessons` (`notes`, append only) so it gets folded into DESIGN_LESSONS.md.
1. **Evaluate their current site first** (what to keep, what's broken or missing), and keep a `sources.md` of every fact and where it came from (tools/WORKFLOW.md "Accuracy"). Nothing goes on the page without a source. Seasonal facts get flagged the way the owner would ("summer hours, call to confirm").
2. **Gather the real material.** Fetch their current site, their Google listing and their Yelp page. Collect: name, phone, address, hours, the real menu, services or work (with prices if they publish them), year founded, rating and review count, and 2–3 short review quotes with first name and last initial, from Google or Yelp (say which on the page if it names a source). Collect their best photos: the full-size `https` image URLs from their own site (storefront, food, work, team). Never invent facts, prices, awards or reviews.
2. **Write the content.** Prospect previews are always hand-built (2b), so `work/outreach/<slug>/concept.json` needs only `business_name`, `headline` (in their voice, built on what reviews keep praising) and `improvements` (three or four plain lines on what the new homepage fixes); the full redesign schema is for generated concepts only. Put the rest in `work/outreach/<slug>/meta.json` as `{"url": "<their site>", "email": "<their email>", "images": [...], "rest": "<the card's sentence, 2b>"}`, best photo first. The page's main button matches how they get business (call, order, book, quote, directions).
2b. **Show part, gate the rest.** The preview is the homepage, not the whole site: show the top of it (the hero and one or two strong sections that solve something real for them, like hours or directions), then blur everything below behind the standard BringsUp card. Start from `tools/site-kit/preview-base.html` (copy it to `work/outreach/<slug>/index.html`): it's invisible scaffolding only (reset, `img{height:auto}`, image fade-in, an open-now hours helper, and the gate wrapper), so design everything that shows from their business. Below the part you show, write only `<div class="bu-gate"><div class="bu-blur" aria-hidden="true" inert>…</div><!--BU-GATE--></div>`, and put one plain sentence about what the full site adds, true to their business, in `meta.json` as `rest`. Publishing swaps the marker for the card in `tools/site-kit/gate.html`, with `{{REST}}` from `rest` and `{{START_URL}}` as `https://bringsup.com/start/?ref=<slug>`, and stops if the marker or `rest` is missing. Don't paste the card yourself. Under the blur, build **one rough section only**: a heading and three or four of their own photos in a grid, requested small since they're blurred (Wix `/v1/fill/w_400,h_300,al_c,q_50/`), no written copy and no fact-checking. Only about 760px shows (blurred), so anything more is never seen and costs time for nothing. Menu links to anything not built (Menu, Catering, About) point to `#bu-start`, the card (it carries that id). Don't restyle it: it's BringsUp's card on every preview, and it's built to show up on phones. Never a payment before approval. The gate exists only in a hand-built `work/outreach/<slug>/index.html` (self-contained; `concept.json` then needs just `business_name`, `headline` and `improvements`), so always hand-build prospect previews. Examples: `tools/examples/naked-q/` and `tools/examples/scoops-and-cookies/` (`index.html` and `meta.json`).
2c. **Buttons fit the business.** Round for playful shops (ice cream, bakery, kids), softly rounded for most family businesses, crisp only for formal or upscale ones. (Site-kit builds: set `buttons` to `round`, `soft` or `crisp`.)
2d. **Logo refresh, only when it's worth it.** If their logo is weak (blurry, dated, unreadable on a phone) and a cleaned-up version in their own colors would clearly help, make one, use it on the page, and add `"brand": {"before": "<their current logo as a data URI, from their own site>", "after": "<the refreshed logo as a data URI, transparent PNG of the lockup>", "colors": [{"name": "...", "hex": "#..."}]}` to `concept.json`. /try/ then shows a "Your logo, refreshed" card under the preview. Keep their colors and what regulars recognize. Don't link the full brand guide from the preview: it comes with the site. If their logo is fine, skip all of this; no card appears.
3. **Publish:** `node tools/queue-worker.ts outreach <slug> work/outreach/<slug>`. It checks the page, makes the link preview card (a picture of their homepage beside "This could be your new website. Made for <name>"), captures their current site (`meta.json` `url`) and the new page at desktop and phone size for the reveal (on first visit their site today wipes into the new one), plus both pages top to bottom for the "Today and new" slider (it scrolls, so they can compare the whole page), and prints their private short link, `https://bringsup.com/for/<slug>-<code>`. It saves the page as published (card included) to `published.html` and every picture to `work/outreach/<slug>/shots/` (`today-desktop.jpg`, `today-phone.jpg`, `new-desktop.jpg`, `new-phone.jpg`, the `-tall-` whole-page ones and `card.jpg`). A busy site (429, 503) or a bot check gets one more try after 30 seconds. It prints any warning the backend sends (a picture too large to store). Send that link, never the long `/try/?id=` one. Its "Start my website" button carries their `ref`. To fix a preview after the link went out, run the same command with its short code on the end (`... work/outreach/<slug> <slug>-<code>`): it updates that preview in place and the link they have keeps working. It doesn't visit their site again: it reuses the "today" pictures in `shots/` (and the stored ones if those are missing). Add `--recapture` to take new ones, for example after a bot check.
4. **Check it like they will.** Open the pictures publishing just saved in `work/outreach/<slug>/shots/` with the Read tool; no new Playwright script needed. `new-desktop.jpg` and `new-phone.jpg` are the top at 1280px and 390px, the `new-tall-` ones the whole page, and the `today-` ones must show their real site, not a bot check (see DESIGN_LESSONS.md; if one does, republish later with `--recapture`). No broken or wrong photos, no placeholder text, nothing cut off, phone, hours and button all correct, and it looks better than their current site side by side. If anything's off, fix it and publish again in place with the short code on the end, so the link stays the same.
5. Save the link in the row's `conceptUrl`, and reuse it if they ask again.

Cost control: build only for a person who said yes or asked to see it, at most one build per prospect (fix, don't rebuild from scratch), and no builds for "how much?" alone: answer the price, then offer to make it.

## Replies and objections
OPERATOR.md step 1 handles every reply. Send in the prospect's thread (`GMAIL_REPLY_TO_THREAD` on `threadId`), plain text, `include_signature: false`, signed "Jake". Once they've written back, links are fine. Answer what they asked first. Write each reply fresh in this voice; these are the shape, not text to paste.

**Yes, "sure", "send it":** build and check their homepage (above), then reply with the link, within 24 hours of the yes and inside their 7 AM–8 PM window (OPERATOR step 1). One ask only, at the end.

> {Their question answered first, in one or two sentences. Skip this if there was none.}
>
> Here's your demo: {live preview link}
>
> Best on your phone. {One honest note if needed, e.g. "The window photo is stock; one of yours would be better."}
>
> If you like it, I'll build the whole site: a 10-minute form, then a preview in about two weeks. $1,000, and you only pay once you approve it. Want me to? Reply yes or start here: https://bringsup.com/start/?ref={slug}

**Price ("how much?", "that's a lot", "can you do $500"):**
> Fair question. It's a flat $1,000 for everyone, and that covers the whole site, two rounds of changes and keeping it online, so there's no monthly bill after. Nothing is charged until you've seen the finished site and approved it. Keeping one price is how I skip the sales calls, so I don't discount it. Want me to make the homepage so you can see what you'd get first?

**"My nephew / my web person does our site":**
> Great, then you've got someone who already knows your site. Happy to make the homepage anyway so you both can see the idea; if they want to build from it, it's theirs. You'd own the files either way.

**"Send more info" / "what's included":** what's included (the full site from their real menu, hours and reviews; a private preview in about two weeks; two rounds of changes; hosting with no monthly fee), the flat $1,000 paid only on approval, that the site and their web address are theirs, and the start link. Say "web address", not "domain", and "keeping it online", not "hosting". End with "Want me to make you the homepage first, so you can see it?"

**Asking for a call:**
> I keep everything on email, which is part of how I keep the price flat. Ask me anything here and I'll answer the same day.

Then answer anything they asked. Never offer or schedule a call.

**"Not now" / "later":** a reply, so the drip is over. If they named a time ("after the holidays", "spring"), say "No problem, {season} comes first. I'll check back once in {month}.", set `status: replied`, append `later: <month>` to `notes` and set `followUpAt` to that date. Then send exactly one check-in in the same thread on that date: "Hi Rosa, you said {month} might be better, so this is my one check-in. Want me to put that homepage together now?" If they named no time, ask once: "No problem. Should I check back in a few months, or leave it with you?" A month in their answer is handled as above. "Leave it" or no answer: "No problem. If it makes sense later, reply here, even months from now.", then `status: lost`, `lostReason: later`.

**"We're happy with our site":**
> That's fair, and thanks for writing back. Best of luck this {season}.

Set `status: lost`, `lostReason: happy` (not `dnc`, unless they ask to stop).

**"I'm not the owner" / "talk to my son":**
> Thanks, that's kind of you. Would you pass this along to {them}? Or send me their email and I'll write to them directly.

If they give an address, write to that person once, in the same thread, with the original note. Set `referredTo`.

**"We already have someone working on it":**
> Makes sense. Good luck with it.

Set `status: lost`, `lostReason: has_vendor`. Retiring, selling or closing: a kind line and `lostReason: closing`.

**"Can you just fix {X} on our current site?", SEO or ads:** say plainly that we make new sites, not fixes to existing ones, then offer to make the homepage so they can see the difference.

**"How did you get my email?" / "is this real?":** answer in one honest line, naming where it was (the row's `emailSource`): "It's on your website's contact page." (or "your Google listing"). Add "I only write to businesses that list an address publicly, a few a day." If they sound annoyed or asked to stop, add "I've taken you off my list and won't email again. Sorry for the bother." and set `status: dnc`. If they're curious and still interested, carry on.

**Saw their homepage but hasn't started:** a `replied` row with a `conceptUrl` and no start form gets at most two nudges in the thread, then a closing line (timing in RUNBOOK step 3):
- **Never opened it (2 business days):** "Hi {name}, in case my last email got buried, here's your homepage: {link}. It's best on a phone."
- **Opened it, no start (4 business days):** "One thing I could change before you decide: {a specific thing, like the headline or a photo}. Want me to swap it?" Only if `?capacity=1` shows 3 or fewer spots left this month, you may add: "I take on 8 new sites a month, and {month} has {n} spots left."
- **15 business days:** "I'll leave this with you. Your homepage link keeps working, so reply whenever, even months from now." Then `followUpAt: null` and nothing more.

## Never write any of these
They read as AI or as spam:
- "I came across", "I stumbled upon", "I hope this email finds you well", "I wanted to reach out", "I'd love to", "touch base", "circle back", "just following up", "bumping this", "quick question"
- "elevate", "boost", "transform", "take it to the next level", "game-changer", "seamless", "cutting-edge", "in today's digital world", "online presence", "stand out from the competition", "unlock"
- gushing compliments like "a reputation most places never build" (one plain, specific observation beats praise)
- "free" in a subject line or as a hook (a plain "free demo" in the body is fine and expected), "guaranteed", "no obligation", "risk-free", "limited time", "act now", "100%", any dollar figure in a cold email, ALL CAPS, exclamation marks, emojis
- em dashes (—), semicolons, tidy lists of three, and sign-offs like "Best regards" or "Cheers"
- anything about their current site being bad, broken or ugly, or about it "hurting their business" ("outdated" is the strongest word allowed, and you rarely need even that)

## Rules
- Every cold email ends with an opt-out sentence and the postal address above. US CAN-SPAM requires both in every commercial message, Email 3 included. The address is also in the tracker as `meta/pipeline.mailingAddress`; if the two ever differ, use the tracker's. A "no" is honored within the hour.
- Never ask for payment before the owner has approved their finished site.
- Never mention bad reviews. Never invent stats, clients or results. Paraphrase praise; never quote reviews in a cold email.
- Send only to an address the business publishes itself (RUNBOOK step 6 has the address rules). Never guess one.
- Anyone who says no, stop or unsubscribe goes on Do Not Contact immediately. Do Not Contact covers the whole business, every address and location.
- Read each email back before sending. If it sounds like a template, or like something an assistant wrote, rewrite it.

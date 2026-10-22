# BringsUp cold emails

These go out under Jake's name, so each one has to read like Jake sat down and wrote it to one person. Keep it short and specific, a little informal, with nothing that looks like a mass email. If a sentence could be sent to any business, rewrite it or cut it.

## The sequence (a 3-step drip)
| Step | When | What | Attachment | Links |
|---|---|---|---|---|
| 1 | day 0 (Mon–Thu only) | Email 1: the homepage idea, offered | none (see "Attachment") | none |
| 2 | 3 business days later | Email 2: one new, useful observation, same thread | none | none |
| 3 | 7 business days after step 2 | Email 3: a short, gracious last note, same thread | none | none |

- **A reply from a person stops the drip**, whatever it says. A "no" goes on Do Not Contact. An auto-reply (out of office) only moves the next date: see OPERATOR.md step 1.
- A bounce stops it too (`status: lost`).
- Three cold emails per business, ever. There is never a fourth, and never a new sequence for someone who finished one.
- Steps 2 and 3 are replies in the same thread (`GMAIL_REPLY_TO_THREAD`), so the owner sees one short conversation rather than three separate pitches.

## How they're sent (deliverability)
- **Plain text only.** No HTML, no bold or bullets, no images in the body, no tracking pixels and no link shorteners. Use Composio `GMAIL_SEND_EMAIL` with `is_html: false` and `include_signature: false`. The sign-off below is the whole signature.
- **No links in any cold email.** That means no website link, no start form and no concept link. A link from a stranger is the strongest spam and phishing signal there is. The one exception is the bare domain `bringsup.com` on its own line in the sign-off, written as plain text and never as `https://...`, because it's how an owner checks we're real.
- **What they get, and when.** Email 1 carries nothing and offers the homepage: "Want me to send it over?" Every "sure" is a reply, which is the best signal a new mailbox can get. Our reply then links to **their new homepage, live on bringsup.com** (a private link, see "Live preview" below): they tap it on their phone and scroll a real page, nothing to download. The concept is built before Email 1 is sent, so the offer is true and the reply goes out within the hour.
- **Optional test, later.** After ramp day 15 with no pause in the last 10 days, the operator may test `email1Variant: attach`: Email 1 carries the preview JPG (300 KB or less) of the same homepage. Alternate per send, 150 sends each, and keep whichever gets more positive replies per 100 Email 1s. Any block notice ends the test and sets `offer` for good.
- **Rotate, don't repeat.** Number today's first emails 1, 2, 3… and take subject option (n mod 3) and close option (n mod 3), then write the opening detail fresh. Never the same subject twice in a row.
- Send one at a time, paced as the RUNBOOK says, and never above the daily cap.

## Email 1 (step 1, day 0)

**Subject**, all lowercase, the way a real person types it:
1. `idea for {business}`
2. `{business} homepage`
3. `{business} website`

**Body** (60–90 words before the sign-off, exactly one question, and it's the last sentence before the sign-off):

> Hi {first name},   ← if the first name isn't known, just "Hi," (never "Hi there")
>
> {Opening: one specific, true sentence only a reader of their reviews or site would know. A different angle each time, e.g.:
> - "I was reading through your reviews and kept seeing {specific praise, paraphrased}."
> - "{Number} years in {town} and people still {specific thing they love}. That's rare."
> - "{Review count} reviews and half of them mention {specific thing}."}
>
> {Bridge, one or two sentences: "Your website doesn't really show that yet, so I sketched a new homepage for {business} using your actual {menu / services / work} and hours. One picture, with {the thing they're known for} front and center and {calling / ordering / booking} one tap away on a phone."}
>
> {Close: "If you like it, I can build the whole site, and you'd only pay once it's finished and you're happy with it." Then one of: 1. "Want me to send it over?" 2. "Want to see it?" 3. "Should I send it?"}
>
> Jake
> bringsup.com
>
> If this isn't for you, just say so and I won't email again.
> BringsUp, 2195 Kipling Lane, Highland Park, IL 60035

Example (Marigold Bakery, Westbrook CT):

> Subject: idea for marigold bakery
>
> Hi Rosa,
>
> I was reading through your reviews and kept seeing the sourdough, and that your family remembers people's names. Forty years of that is something.
>
> Your website doesn't really show it yet, so I sketched a new homepage for Marigold using your actual menu and hours. One picture, with the bakery front and center and ordering one tap away on a phone.
>
> If you like it, I can build the whole site, and you'd only pay once it's finished and you're happy with it. Want me to send it over?
>
> Jake
> bringsup.com
>
> If this isn't for you, just say so and I won't email again.
> BringsUp, 2195 Kipling Lane, Highland Park, IL 60035

Attach variant only: the bridge says "The picture attached is the sketch, on a laptop and on a phone, so there's nothing to click." and the close is "Want me to keep going on it?"

## Email 2 (step 2, 3 business days later)
Two or three short sentences with one new, useful observation. It never just nudges: no "just following up", "bumping this" or "did you see my email". Pick the first angle that's true for this business, and only one:
1. A factual mismatch between their site and Google (hours, phone, a menu item or service), stated as "still lists", never as a flaw.
2. The one thing from their reviews the sketch leads with ("the sketch leads with the cannoli everyone mentions").
3. The phone view: "most people who look up a {bakery} are on a phone, so the sketch puts {ordering / calling} one tap away."
4. Only if none of those apply, the process: "it's one 10-minute form on your end, no calls, and you see the finished site before paying anything."

> Hi Rosa,
>
> One more thing I noticed: your site still lists the hours as 7 to 3, and Google has you open until 4 now. In the sketch the hours and menu live in one place, so they stay right, and I can use a photo of the actual storefront.
>
> Want me to send it over?
>
> Jake
>
> If this isn't for you, just say so and I won't email again.
> BringsUp, 2195 Kipling Lane, Highland Park, IL 60035

(Attach variant: end with "Worth a second look?")

## Email 3 (step 3, 7 business days after Email 2)
The last note. It's short and warm, gives them a graceful way to say "later", and never guilt-trips them ("I guess you're not interested", "closing your file").

> Hi Rosa,
>
> Last note from me, so I'm not cluttering your inbox. I'll keep the homepage sketch, so if a new site makes sense down the road, even months from now, reply here and it'll still be waiting.
>
> Jake
>
> This is my last email either way. If you'd rather not hear from BringsUp at all, reply "no" and I'll make sure of it.
> BringsUp, 2195 Kipling Lane, Highland Park, IL 60035

## Replies and objections
OPERATOR.md step 1 handles every reply. Send in the prospect's thread (`GMAIL_REPLY_TO_THREAD` on `threadId`), plain text, `include_signature: false`, signed "Jake". Once they've written back, links are fine. Answer what they asked first. Write each reply fresh in this voice; these are the shape, not text to paste.

**Interested, or "sure, send it":** publish their live preview first (see "Live preview"), then reply with the link. If publishing fails, attach the preview JPG instead (fresh `s3key`, see "Concept delivery") and note it.

> {Their question answered first, in one or two sentences. Skip this if there was none.}
>
> Here it is: {live preview link}
>
> It's a real page, so open it on your phone and scroll; that's how most of your customers will see it. Only people with this link can see it. {One honest note, e.g. "I used a stock photo for the window display; one of yours would be better."}
>
> How it works from here: you fill in one form, about 10 minutes, no calls. It asks for your hours, a few photos and your logo if you have one, and you can skip anything you don't have. I build the full site and send you a private preview in about two weeks. You get two rounds of changes, and you pay a flat $1,000 only when you approve it. Hosting's included, so there's no monthly bill, and the site and your domain stay yours.
>
> The form's here when you're ready: https://bringsup.com/start/?ref={slug}
>
> Is there anything you'd want different from the concept before I start?

**Price ("that's a lot", "can you do $500"):**
> Fair question. It's a flat $1,000 for everyone, and that covers the whole site, two rounds of changes and hosting, so there's no monthly bill after. Nothing is charged until you've seen the finished site and approved it. Keeping one price is how I skip the sales calls, so I don't discount it, but if it's more than you want to put into the site right now, that's completely fine, and the concept is yours to keep.

**"My nephew / my web person does our site":**
> Great, then you've got someone who already knows your site. Show them the concept; if they want to build from it, it's theirs. And if it's easier to have me build it and hand it to them after, that works too. You own the files, so they can edit anything.

**"Send more info" / "what's included":** the live preview link, then what's included (the full site from their real menu, hours and reviews; a private preview in about two weeks; two rounds of changes; hosting with no monthly fee), the flat $1,000 paid only on approval, that the site and domain are theirs, and the start link. End with "Anything specific you'd want on it that the concept doesn't show?"

**Asking for a call:**
> I keep everything on email, which is part of how I keep the price flat. Ask me anything here and I'll answer the same day, with pictures where it helps.

Then answer anything they asked and include the start link. Never offer or schedule a call.

**"Not now" / "later":** a reply, so the drip is over. If they named a time ("after the holidays", "spring"), say "No problem, {season} comes first. I'll keep the sketch and check back once in {month}.", set `status: replied`, append `later: <month>` to `notes` and set `followUpAt` to that date. Then send exactly one check-in in the same thread on that date: "Hi Rosa, you said {month} might be better, so this is my one check-in. The sketch is still here, and nothing's changed: a flat $1,000, paid only when you approve the finished site. Want me to send the form?" If they named no time, say "No problem. I'll leave it with you and won't email again. If it makes sense later, reply here, even months from now.", set `status: lost` and append "later" to `notes`.

**"We're happy with our site":**
> That's fair, and thanks for writing back. I'll leave the sketch with you in case it's ever useful. Best of luck this {season}.

Set `status: lost` (not `dnc`, unless they ask to stop).

**"How did you get my email?" / "is this real?":** answer in one honest line, naming where it was: "It's on your website's contact page." (or "your Google listing"). Add "I only write to businesses that list an address publicly, a few a day." If they sound annoyed or asked to stop, add "I've taken you off my list and won't email again. Sorry for the bother." and set `status: dnc`. If they're curious and still interested, carry on with the interested reply.

**Interested but hasn't started:** if a `replied` row has no start form after 5 business days, send one nudge in the thread: "No rush at all on this. If anything in the concept gave you pause, tell me and I'll change it before you decide. The form's still here: {link}". After 15 business days, send one closing line: "I'll leave this with you. The concept stays saved, so reply whenever, even months from now." Then set `followUpAt: null` and send nothing more.

## Never write any of these
They read as AI or as spam:
- "I came across", "I stumbled upon", "I hope this email finds you well", "I wanted to reach out", "I'd love to", "touch base", "circle back", "just following up", "bumping this", "quick question"
- "elevate", "boost", "transform", "take it to the next level", "game-changer", "seamless", "cutting-edge", "in today's digital world", "online presence", "stand out from the competition", "unlock"
- gushing compliments like "a reputation most places never build" (one plain, specific observation beats praise)
- "free", "guaranteed", "no obligation", "risk-free", "limited time", "act now", "100%", any dollar figure in a cold email, ALL CAPS, exclamation marks, emojis
- em dashes (—), semicolons, tidy lists of three, and sign-offs like "Best regards" or "Cheers"
- anything about their current site being bad, broken or ugly, or about it "hurting their business" ("outdated" is the strongest word allowed, and you rarely need even that)

## Rules
- Every cold email ends with an opt-out sentence and the postal address above. US CAN-SPAM requires both in every commercial message, Email 3 included. The address is also in the tracker as `meta/pipeline.mailingAddress`; if the two ever differ, use the tracker's. A "no" is honored within the hour.
- Never ask for payment before the owner has approved their finished site.
- Never mention bad reviews. Never invent stats, clients or results. Paraphrase praise; never quote reviews in a cold email.
- Send only to an address the business publishes itself (RUNBOOK step 6 has the address rules). Never guess one.
- Anyone who says no, stop or unsubscribe goes on Do Not Contact immediately.
- Read each email back before sending. If it sounds like a template, or like something an assistant wrote, rewrite it.
- **Live preview.** Write the homepage as `work/outreach/<slug>/concept.json` following the redesign schema (`SCHEMA` in `supabase/functions/redesign/prompt.ts`; the same content as the concept board: their name, real services or menu, hours, rating, paraphrased praise, theme from `theme_for`). Optionally add `work/outreach/<slug>/meta.json` with `{"url": "<their site>", "email": "<their email>", "images": ["<https photo URLs from their own site>"]}`. Then run `node tools/queue-worker.ts outreach <slug> work/outreach/<slug>`. It checks the schema and prints the private link, `https://bringsup.com/try/?id=<uuid>&ref=<slug>`. Its "Start my website" button carries their `ref`. Save the link in the row's `conceptUrl`, and reuse it if they ask again.
- **Concept delivery** (the JPG for the attach test and as a fallback). Stage the preview JPG and the PDF in the PRIVATE repo `jtsilver123/bringsup-concepts` as `<slug>/<slug>-homepage-idea.jpg` and `<slug>/<slug>-concept.pdf` (renamed from the generator's output). Use Composio `GITHUB_CREATE_OR_UPDATE_FILE` (owner `jtsilver123`, repo `bringsup-concepts`, branch `main`, base64 content), which needs no clone. For each send, call `GITHUB_GET_RAW_REPOSITORY_CONTENT` (the jtsilver123 GitHub connection, `ref: "main"`) for that path. The result's `content.s3url` holds the storage key: the path segment after the bucket host and before `?` (e.g. `1312373/github/GITHUB_GET_RAW_REPOSITORY_CONTENT/response/<id>`). Pass it to Gmail as `attachment: {name, mimetype, s3key}`, where `name` is the friendly name the owner sees: `{Business} homepage idea.jpg` (`image/jpeg`) or `{Business} - new homepage concept.pdf` (`application/pdf`), with any `/`, `&` or `'` removed from the business name. Fetch a fresh key right before each send, because they expire after an hour. If staging fails, or the fetch has no `content.s3url`, don't send that email this run: leave the row as it is, append "staging failed <date>" to `notes`, and move on. Never put concepts in the public `bringsup` repo or anywhere public.

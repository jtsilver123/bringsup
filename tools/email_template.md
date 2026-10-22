# BringsUp cold emails

These go out under Jake's name, so each one has to read like Jake sat down and wrote it to one person. Keep it short and specific, a little informal, with nothing that looks like a mass email. If a sentence could be sent to any business, rewrite it or cut it.

## The sequence (a 3-step drip)
| Step | When | What | Attachment | Links |
|---|---|---|---|---|
| 1 | day 0 | Email 1: the homepage idea | preview JPG | none |
| 2 | 4 business days later | Email 2: one new, useful angle, same thread | none | none |
| 3 | 6 business days after step 2 | Email 3: a short, gracious last note, same thread | none | none |

- **Any reply stops the drip**, including an out-of-office with a return date (resume after it), a "not now" or a "no". A "no" goes on Do Not Contact.
- A bounce stops it too (`status: lost`).
- Three emails per business, ever. There is never a fourth, and never a new sequence for someone who finished one.
- Steps 2 and 3 are replies in the same thread (`GMAIL_REPLY_TO_THREAD`), so the owner sees one short conversation rather than three separate pitches.

## How they're sent (deliverability)
- **Plain text only.** No HTML, no bold or bullets, no images in the body, no tracking pixels and no link shorteners. Use Composio `GMAIL_SEND_EMAIL` with `is_html: false` and `include_signature: false`. The sign-off below is the whole signature.
- **No links in any cold email.** That means no website, no start form and no concept link. A link from a stranger is the strongest spam and phishing signal there is. The start link goes in our reply once they write back.
- **One attachment, on Email 1 only:** the concept preview image. It's a JPG under 600 KB named `{Business} homepage idea.jpg` (see RUNBOOK step 4). It shows the new homepage on a laptop and a phone, so it reads well on an iPhone. Never attach the multi-page PDF to a cold email. Save it for after they reply.
- **Vary every email.** Use a different subject, opening and closing from the options below than the last send used, and write the specific detail fresh each time. Identical emails get filtered.
- Send one at a time, paced as the RUNBOOK says, and never above the daily cap.

## Email 1 (step 1, day 0)

**Subject**: pick one, all lowercase, the way a real person would type it:
- `{business} website`
- `idea for {business}`
- `made this for {business}`
- `{business} homepage`

**Body** (60–90 words before the sign-off):

> Hi {first name, or "there" if unknown},
>
> {Opening: one specific, true sentence that shows you actually looked. Use a different angle each time, e.g.:
> - "I was reading through your reviews and kept seeing {specific praise, paraphrased}."
> - "{Number} years in {town} and people still {specific thing they love}. That's rare."
> - "Saw {business} come up for {thing} in {town}, and {review count} reviews later I can see why."}
>
> {Bridge, one sentence: "Your website doesn't really show that yet, so I put together a quick idea for what the homepage could look like." Or: "I sketched a new homepage for you using your real {menu / services / work}. It's attached."}
>
> {Close, one or two sentences: "If you like where it's going, I can build out the whole site, and you'd only pay once you've seen it finished and are happy with it." Then one simple question, e.g. "Want me to keep going on it?" / "Worth a look?" / "Should I send over how it works?"}
>
> Jake
> BringsUp
>
> If this isn't for you, just say so and I won't email again.
> BringsUp, 2195 Kipling Lane, Highland Park, IL 60035

Example (Marigold Bakery, Westbrook CT):

> Subject: marigold bakery website
>
> Hi Rosa,
>
> I was reading through your reviews and kept seeing people mention the sourdough, and that your family remembers their names. Forty years of that is something.
>
> Your website doesn't really show it yet, so I sketched what a new homepage could look like, using your actual menu and hours. It's attached.
>
> If you like where it's going, I can build out the whole site, and you'd only pay once it's finished and you're happy with it. Want me to keep going on it?
>
> Jake
> BringsUp
>
> If this isn't for you, just say so and I won't email again.
> BringsUp, 2195 Kipling Lane, Highland Park, IL 60035

## Email 2 (step 2, 4 business days later)
Two or three short sentences with a new, useful angle. It never just nudges: no "just following up", "bumping this" or "did you see my email".

> Hi {first name or "there"},
>
> {One of these, adapted to the business:
> - "One more thought: I could swap in a photo of your actual {storefront / work / team}, or try a version in your current colors, if that would make it easier to picture."
> - "Forgot to mention that it's built for phones first, since that's where most people look up a {bakery / plumber / ...}. Your {menu / booking / hours} would be one tap away."
> - "In case it's useful: the whole thing is a 10-minute form on your end, no calls, and you see the finished site before paying anything."}
>
> Jake
>
> If this isn't for you, just say so and I won't email again.
> BringsUp, 2195 Kipling Lane, Highland Park, IL 60035

## Email 3 (step 3, 6 business days after Email 2)
The last note. It's short, warm and easy to answer. It gives them a graceful way to say "later", and it never guilt-trips them ("I guess you're not interested", "closing your file").

> Hi {first name or "there"},
>
> {One of:
> - "I'll leave this here so I'm not cluttering your inbox. If a new site makes sense down the road, just reply to this thread, and I'll still have your homepage idea."
> - "Last note from me. If the timing's off, no problem. Reply "later" and I'll check back in a few months, or just ignore this and I won't email again."}
>
> Jake
>
> BringsUp, 2195 Kipling Lane, Highland Park, IL 60035

When someone replies "later" to Email 3, set `notes: "later"` and `status: lost`. Never email them again unless they write first.

## When they reply interested
OPERATOR.md step 1 handles this. Answer their question first, in a couple of sentences. Then give the details, written fresh rather than pasted as a block of boilerplate:
- the full concept PDF, attached;
- the flat $1,000, paid only after they approve the finished site, with hosting included;
- the start link `https://bringsup.com/start/?ref={slug}` (about 10 minutes, no calls).

## Never write any of these
They read as AI or as spam:
- "I came across", "I stumbled upon", "I hope this email finds you well", "I wanted to reach out", "I'd love to", "touch base", "circle back", "just following up", "bumping this", "quick question"
- "elevate", "boost", "transform", "take it to the next level", "game-changer", "seamless", "cutting-edge", "in today's digital world", "online presence", "stand out from the competition", "unlock"
- gushing compliments like "a reputation most places never build" (one plain, specific observation beats praise)
- "free", "guaranteed", "no obligation", "risk-free", "limited time", "act now", "100%", any dollar figure in a cold email, ALL CAPS, exclamation marks, emojis
- em dashes (—), semicolons, tidy lists of three, and sign-offs like "Best regards" or "Cheers"
- anything about their current site being bad, broken or ugly, or about it "hurting their business" ("outdated" is the strongest word allowed, and you rarely need even that)

## Rules
- Every cold email ends with the postal address above (US CAN-SPAM). Emails 1 and 2 also carry the opt-out line. The address is also in the tracker as `meta/pipeline.mailingAddress`; if the two ever differ, use the tracker's.
- Never ask for payment before the owner has approved their finished site. Never promise a call; offer one only if they ask.
- Never mention bad reviews. Never invent stats, clients or results. Paraphrase praise; never quote reviews in a cold email.
- Send only to an address the business publishes itself (its website, Google profile or a directory). Never guess one.
- Anyone who says no, stop or unsubscribe goes on Do Not Contact immediately, and so does anyone who asks how we got their email (they get a brief honest answer first: "Your email is listed on your website.").
- Read each email back before sending. If it sounds like a template, or like something an assistant wrote, rewrite it.
- **Concept delivery.** Stage the preview JPG, plus the PDF for replies, in the PRIVATE repo `jtsilver123/bringsup-concepts` (attach it with push access and clone it). Save them as `<slug>/<Business> homepage idea.jpg` and `<slug>/<Business> - new homepage concept.pdf`, then push. For each email, call Composio `GITHUB_GET_RAW_REPOSITORY_CONTENT` (account: the jtsilver123 GitHub connection) for that path. The result's `content.s3url` holds the storage key: the path segment after the bucket host and before `?` (e.g. `1312373/github/GITHUB_GET_RAW_REPOSITORY_CONTENT/response/<id>`). Pass it to GMAIL_SEND_EMAIL as `attachment: {name, mimetype: "image/jpeg", s3key}` (use `application/pdf` for the PDF in replies). Fetch a fresh key right before each send, because they expire after an hour. Never put concepts in the public `bringsup` repo or anywhere public.

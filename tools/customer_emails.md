# Customer emails (after a "yes")

Sent by the operator task from **jake@bringsup.com** only (Composio `GMAIL_SEND_EMAIL`, account `gmail_gariba-preach`, plain text, `include_signature: true`). Voice rules from `brand.md` apply: plain, warm, specific, no hype, no exclamation marks, never insult their old site.

Fill every `{field}` from the project (`node tools/projects-worker.ts show <ref>`). If a field is missing, rewrite the sentence so it reads naturally. Never leave a placeholder or a gap. Reply in the customer's existing thread when one exists (`GMAIL_REPLY_TO_THREAD`), so each customer has a single conversation.

Links (always with the project's ref):
- Changes: `https://bringsup.com/changes/?ref={ref}`
- Extra round: `https://bringsup.com/extra/?ref={ref}`
- Approve: `https://bringsup.com/approve/?ref={ref}`

---

## 1. Start received
Send within the hour of a new project (`build` job, before building).

**Subject:** We're building the {business} website

Hi {first name},

Thanks, we have everything we need. We're building your full website now, and your private preview will arrive by email by {date 14 days out, e.g. "Thursday, November 5"}.

There's nothing to pay and nothing else to do until then. If you think of anything to add, like photos or a change to your hours, just reply to this email.

Jake

## 2. Preview ready
Sent once the first preview is deployed.

**Subject:** Your new website is ready to look at

Hi {first name},

Here's the new {business} website: {preview_url}

Look at it on your phone first, since that's where most of your customers will see it. It's private, so only people with this link can see it.

When you're ready, you have two options:
- Want something different? List it here, or just reply: {changes link}. Two rounds of changes are included, and we keep count for you.
- Love it? Approve it here, and it goes live on {domain}: {approve link}. That's when you pay the flat $1,000.

No rush.

Jake

## 3. Changes received
Sent when a round of changes comes in, before you apply it.

**Subject:** Got your changes

Hi {first name},

We have your changes and are working on them. Your updated preview arrives within 3 days. Anything else you think of in the next couple of days goes into this same round, so send it along.

Jake

## 4. Updated preview
Sent once a round of changes is deployed.

**Subject:** Your updated preview ({rounds_used} of {rounds_total} rounds used)

Hi {first name},

Your updated preview is ready: {preview_url}

What we changed:
{a short bullet list of the changes you made, in plain words}

{If rounds are left:} You have {rounds_left} round{s} of changes left. Anything you send in the next two days counts as part of this round: {changes link}
{If none are left:} That was your last included round. You can approve it as it is, or ask for one more round for $150.

Happy with it? Approve it here, and it goes live: {approve link}

Jake

## 5. One more round?
Sent when changes arrive after the included rounds are used (`offer_extra` job).

**Subject:** One more round of changes?

Hi {first name},

Thanks for the changes. You've used the two rounds included with your website, so we haven't started on these yet.

You have two options:
- One more round is $150. Pay here, and we'll make the changes you just sent. You don't need to type them again: {extra link}
- Or approve the site as it is: {approve link}

Small fixes, like a typo or a wrong phone number, never count as a round. If that's all this was, reply and let us know.

Jake

## 6. Approved and paid
Sent when the site is approved (`launch` job). Send it to the owner. If someone else has the domain login, send the domain steps to that person too (CC the owner), with the steps in the body.

**Subject:** Receipt, and the last step for {domain}

Hi {first name},

Thank you. Your site is approved and paid, and Stripe has emailed your receipt.

The last step is pointing {domain} at your new site. It takes about 10 minutes at {provider}. {If someone else has the login: "We've sent the steps to {helper email}, so there's nothing for you to do."}

{Provider-specific steps. See tools/OPERATOR.md, "Domain steps".}

Your email won't be affected. We only change the two settings that point your web address at the website, never the ones that run your email (called MX records).

Once it's connected, we'll check everything and let you know it's live. If you get stuck, reply with a screenshot and we'll tell you exactly what to click.

Jake

## 7. Domain reminder
Sent on day 2 and day 5 if DNS isn't pointed yet.

**Subject:** Re: the last step for {domain}

Hi {first name},

Your new site is ready and waiting. The only thing left is pointing {domain} at it, which takes about 10 minutes. The steps are in the email above. If it's easier, forward that email to whoever set up your domain, or reply with their email and we'll send it to them directly.

Jake

## 8. You're live
Sent when DNS is pointed and the site serves correctly (`check_dns` succeeds).

**Subject:** {business}'s new website is live

Hi {first name},

It's live: https://{domain}

We checked it on phones and computers, and your email still works the way it did. Hosting is included, so there's no monthly bill.

{If they chose the Care Plan and a Care Plan link is configured:} Here's the Care Plan link you asked for ($79/mo, cancel anytime): {care_plan_link}. Once it's set up, just email us changes, like new hours, specials or photos.
{Otherwise:} If you ever need an update, reply to this email.

Thanks for trusting us with it. If a customer says something nice about the new site, we'd love to hear it.

Jake

## 9. Quiet for 10 days after a preview

**Subject:** No rush on your preview

Hi {first name},

Just checking in. Your preview is saved and private: {preview_url}

Whenever you're ready, request changes ({changes link}) or approve it ({approve link}). If you have a question, reply here.

Jake

## 10. Quiet for 45 days: closing out

**Subject:** Closing out your preview

Hi {first name},

We haven't heard from you in a while, which is completely fine. We'll take your private preview down on {date 15 days out} and delete the photos you sent us. You owe nothing.

If you'd like to pick it back up, just reply before then.

Jake

## 11. A change after launch, without the Care Plan
Sent for the `reply_out_of_scope` job.

**Subject:** Re: {their subject}

Hi {first name},

Thanks for sending this. Your site is live and hosted, so nothing will break.

A round of changes after launch is $150. Pay here, and we'll make the change you just sent. You don't need to type it again: {extra link}
{If a Care Plan link is configured, add:} Or, if you expect to make updates often, the Care Plan covers unlimited small edits for $79/mo: {care_plan_link}

{If it's only a small fix to something we got wrong (a typo, a wrong phone number or wrong hours that were right in their start form), skip this email: fix it for free, redeploy, and send a one-line "Fixed" reply.}

Jake

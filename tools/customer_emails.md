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

Thanks, your form came through and we've started. Your private preview will arrive by email by {date 14 days out, e.g. "Thursday, November 5"}.

There's nothing to pay and nothing else to do until then. If you skipped the photos or the logo, or think of anything to add, just reply to this email and we'll work it in. Changed your mind? Reply and we'll stop, and you owe nothing.

Jake

## 1b. Start received, this month is full
Instead of email 1 when the project has `starts_on` after today (the month's cap of new sites was reached when they started). It counts as email 1: log it as "Sent email 1".

**Subject:** We're building the {business} website

Hi {first name},

Thanks, your form came through. We take on a set number of new sites each month so each one gets real attention, and {this month} is full, so yours is first in line for {next month}. We start on {starts_on, e.g. "Monday, November 2"}, and your private preview will arrive by email by {starts_on + 14 days}.

There's nothing to pay and nothing else to do until then. If you think of anything to add, just reply to this email. Changed your mind? Reply and we'll stop, and you owe nothing.

Jake

## 2. Preview ready
Sent once the first preview is deployed.

**Subject:** Your new website is ready to look at

Hi {first name},

Here's the new {business} website: {preview_url}

{If we refreshed their logo and colors:} Your refreshed logo and a one-page brand guide are here too, with your colors and fonts, so signs, menus and posts can match: {preview_url}/brand/

Look at it on your phone first, since that's where most of your customers will see it. It's private, so only people with this link can see it. The address ends in pages.dev for now; that's just where the preview lives until it moves to {domain}.

When you're ready, you have two options:
- Want something different? List it here, or just reply: {changes link}. Two rounds of changes are included, and we keep count for you. A typo or a wrong number is a fix, not a round, so just tell us.
- Love it? Approve it here and pay the flat $1,000: {approve link}. After that there's one 10-minute step at {provider} (we send the exact clicks, or send them to whoever manages your domain), and it's live on {domain}.

No rush.

Jake

## 3. Changes received
Sent when a round of changes comes in, before you apply it.

**Subject:** Got your changes

Hi {first name},

We have your changes and are working on them. Your updated preview arrives within 3 days. Anything else you think of before the updated preview arrives, and for two days after it, goes into this same round, so send it along.

Jake

## 4. Updated preview
Sent once a round of changes is deployed.

**Subject:** Your updated preview ({rounds_used} of {rounds_total} rounds used)

Hi {first name},

Your updated preview is ready: {preview_url}

What we changed:
{a short bullet list of the changes you made, in plain words}

{If rounds are left:} You have {rounds_left} round{s} of changes left. Anything you send before {weekday and time 48 hours from now, e.g. "Thursday at 2pm"} is still part of this round, so don't hold back: {changes link}
{If none are left:} That was your last included round, but anything you send before {weekday and time 48 hours from now} is still part of it: {changes link}. After that, you can approve it as it is, or ask for one more round for $150.

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

Thank you. Your site is approved and paid, and Stripe has emailed your receipt (it says InstateMe, my other company, which handles our payments). If you spot anything we got wrong, reply and we'll fix it before it goes live, at no charge.

The last step is pointing {domain} at your new site. It takes about 10 minutes at {provider}. {If someone else has the login: "We've sent the steps to {helper email}, so there's nothing for you to do."}

{Provider-specific steps. See tools/OPERATOR.md, "Domain steps".}

Your email won't be affected. The steps only touch the two settings that point your web address at the new site. Nothing about your email is changed, and we check it still works before we say it's live.

Once this is done, your old site stops showing and the new one takes its place. You can cancel the old website plan whenever you like, but keep the domain registration and your email service, since those are often on the same bill. If you're not sure which is which, forward us the invoice and we'll tell you.

Once it's connected, we'll check everything and let you know it's live. If you get stuck, reply with a screenshot and we'll tell you exactly what to click.

Jake

## 7. Domain reminder
Sent on day 2 and day 5 if DNS isn't pointed yet. If a helper email is set, send it to the helper with the owner in CC, and change "The steps are in the email above" to "The steps are in the email we sent {helper first name} on {date}."

**Subject:** Re: the last step for {domain}

Hi {first name},

Your new site is ready and waiting. The only thing left is pointing {domain} at it, which takes about 10 minutes. The steps are in the email above. If it's easier, forward that email to whoever set up your domain, or reply with their email and we'll send it to them directly.

Jake

## 8. You're live
Sent when DNS is pointed and the site serves correctly (`check_dns` succeeds).

**Subject:** {business}'s new website is live

Hi {first name},

It's live: https://www.{domain}

{If the bare domain isn't forwarding yet:} One small thing: typing {domain} without "www" still shows the old site, because the forwarding step at {provider} isn't done yet. It's step 2 in the email above; reply if you'd like us to walk you through it.

We checked it on phones and computers, and your email still works the way it did. Hosting is included, so there's no monthly bill. If you were paying for your old site, you can cancel that plan now. Keep your domain and email with whoever provides them.

If anything on the site is wrong, reply and we'll fix it free. For other updates later on, like new hours, specials or photos, just reply anytime: a round of changes is $150. Or, if you'd rather never think about it, the managed plan is $49 a month: updates by email are included, and we keep watch on your web address, email settings and renewal. Details: https://bringsup.com/managed/?ref={ref}. Your own web person can also edit the files, since they're yours.

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

## 11. A change after launch
Sent for the `reply_out_of_scope` job.

**Subject:** Re: {their subject}

Hi {first name},

Thanks, happy to do this. Just so there are no surprises: changes after launch aren't included in the $1,000, so here are the options.

- A round of changes is $150, and it covers everything you sent in this email. Pay here and we'll get on it; you don't need to type it again: {extra link}
- Or join the managed plan, $49 a month, and this and future updates by email are included: https://bringsup.com/managed/?ref={ref}
- If this is something we got wrong, like a typo or details that were right on your start form, ignore the above. We'll fix it free and email you when it's done.

{If it's only a small fix to something we got wrong (a typo, a wrong phone number or wrong hours that were right in their start form), skip this email: fix it for free, redeploy, and send a one-line "Fixed" reply.}

Jake

## 12. Managed plan: welcome
Sent when a managed-plan subscription is first recorded (OPERATOR.md "Managed plan").

**Subject:** You're on the managed plan

Hi {first name},

Thanks for joining. From now on, when something changes at {business}, like hours, prices, the menu, photos or a holiday notice, just reply to any of my emails and I'll update the site, usually within a day. I also check every day that {domain} leads to your site and your email settings are intact, and I'll remind you before your domain's renewal date.

Bigger work, like a new page, is still $150 a round, and I'll always ask first. You can update your card or cancel anytime here, with the email you signed up with: {portal link}

Jake

## 13. Managed plan: ended
Sent when the subscription is cancelled or Stripe gives up on a failed card.

**Subject:** Your managed plan has ended

Hi {first name},

Your managed plan for {business} has ended{, as you asked | , because the card on file couldn't be charged}. Nothing changes on your site: it stays up and hosting stays included. Updates are $150 a round again, and you can rejoin anytime at https://bringsup.com/managed/?ref={ref}.

Jake

## 14. Managed plan: renewal coming up
Sent 30 days before the domain's registration expires (and again at 7 days if it still hasn't renewed).

**Subject:** {domain} renews on {date}

Hi {first name},

A heads-up: your web address {domain} is registered with {registrar} and comes up for renewal on {date}. If it's set to renew automatically with a card that's still current, there's nothing to do. If not, renew it at {registrar} before then, or your site and email would stop working on that date. Reply if you'd like me to walk you through it.

Jake

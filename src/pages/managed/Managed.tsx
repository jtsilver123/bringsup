import { useEffect, useRef, useState } from "react";
import { EMAIL, SubFooter, SubHeader } from "../../components/Chrome.tsx";
import { STRIPE_LINKS, STRIPE_PORTAL } from "../../lib/config.ts";
import "../../components/site.css";
import "../flow/flow.css";
import "./managed.css";

/** What the plan covers. Each line is something the operator does (tools/OPERATOR.md "managed"); keep them in step. */
const INCLUDED: [string, string][] = [
  ["Your web address, watched", "Every day I check that your address still leads to your site and your email settings are intact. If anything breaks, I fix it, or send you or your web person the exact two-minute fix."],
  ["Renewals watched", "I keep an eye on your domain's renewal date and remind you well before it runs out, so your site never goes dark by accident."],
  ["Hosting and security", "Fast hosting and the padlock (SSL) stay on, and I check every day that your site is up."],
  ["Updates by email", "New hours, prices, menu items, photos, a holiday notice: reply with what changed and it's live, usually within a day."],
  ["A monthly check", "Once a month I compare your site with your Google listing (hours, phone, address) and fix anything that's drifted."],
];

/** The managed plan: $49 a month, we run the technical side of their website. */
export function Managed() {
  const [paid, setPaid] = useState(false);
  const [ref, setRef] = useState("");
  const done = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    setPaid(q.get("paid") === "1");
    setRef(q.get("ref") || "");
  }, []);
  useEffect(() => { if (paid) done.current?.focus({ preventScroll: true }); }, [paid]);
  const buy = `${STRIPE_LINKS.managed}${ref ? `?client_reference_id=${encodeURIComponent(ref)}` : ""}`;

  return (
    <>
      <SubHeader />
      <main className="flow managed">
        <div className="wrap">
          <div className="flow-top">
            <h1 className="t1">Your website, run for you.</h1>
            <p className="lead">$49 a month. Your site, your web address and your email settings keep working, and when something changes at your business, you just reply to an email.</p>
          </div>

          {paid ? (
            <div className="card sent m-done" role="status" aria-live="polite" tabIndex={-1} ref={done}>
              <div className="done">
                <h2>You're on the plan.</h2>
                <p>Your receipt is on its way from Stripe. From now on, just reply to any of my emails when something at your business changes, and I'll take care of the rest.</p>
                <a className="btn btn-ink" href="/">Back to BringsUp</a>
              </div>
            </div>
          ) : (
            <div className="m-buy">
              <p className="m-price"><span className="cur">$</span>49<span className="per">a month</span></p>
              <a className="btn btn-primary" href={buy}>Start the plan</a>
              <p className="small">Secure checkout with Stripe. Cancel anytime, in two clicks.</p>
            </div>
          )}

          <h2 className="flow-h">What's included</h2>
          <ol className="ruled flow-steps m-inc">
            {INCLUDED.map(([title, text]) => <li key={title}><b>{title}</b><span>{text}</span></li>)}
          </ol>

          <h2 className="flow-h">Good to know</h2>
          <ul className="ruled m-notes">
            <li><b>Bigger changes</b><span>A new page or a redesign of a section isn't a small update. Those are $150 a round, same as always, and I'll tell you before starting.</span></li>
            <li><b>If you cancel</b><span>Your site stays up and hosting stays included, as it was. Updates go back to $150 a round. Nothing about your domain or email changes.</span></li>
            <li><b>Payments</b><span>BringsUp's payments are handled by InstateMe, Jake's other company, so your card statement and receipts say "BRINGSUP MANAGED" and "InstateMe".</span></li>
          </ul>
          <p className="small m-manage">Already on the plan? <a href={STRIPE_PORTAL}>Manage or cancel it</a> with the email you signed up with. Questions? <a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
        </div>
      </main>
      <SubFooter note="Payments by Stripe." />
    </>
  );
}

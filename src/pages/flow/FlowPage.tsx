import { useCallback, useEffect, useRef, useState } from "react";
import { EMAIL, SubFooter, SubHeader } from "../../components/Chrome.tsx";
import { TallyEmbed } from "../../components/TallyEmbed.tsx";
import { PROJECTS_API, STRIPE_LINKS, TALLY } from "../../lib/config.ts";
import "../../components/site.css";
import "./flow.css";

export type FlowKind = "start" | "changes" | "approve" | "extra";

interface Flow {
  form: string;
  title: string;
  h1: string;
  lead: string;
  steps: [string, string][];
  promise: string;
  /** Shown under the promise: where to read more before committing. */
  links?: boolean;
  doneTitle: string;
  doneText: string;
}

const FLOWS: Record<FlowKind, Flow> = {
  start: {
    form: TALLY.start,
    title: "Start my website",
    h1: "Let's build your new site.",
    lead: "Ten minutes, no call, nothing to pay. I build your whole website from this form. You pay the flat $1,000 only once you've seen it and approved it.",
    steps: [
      ["Fill in this form", "Hours, services, a few photos and your logo if you have them. Don't know who looks after your web address? Skip it, I'll sort that out at the end. The last question is one tick box to say go ahead."],
      ["I build your full site", "Every page. Your logo stays as it is unless you ask me to tidy it. About two weeks."],
      ["Review and request changes", "A private preview link, and two rounds of changes by form."],
      ["Approve, pay, go live", "Love it? Pay the flat $1,000 and it goes live on your domain. If not, you owe nothing."],
    ],
    promise: "Nothing to pay until you approve your finished site. You own the site, your email keeps working, and hosting is included.",
    links: true,
    doneTitle: "I'm on it.",
    doneText: "Your private preview link arrives by email in about two weeks. Keep an eye out for it from jake@bringsup.com.",
  },
  changes: {
    form: TALLY.changes,
    title: "Request changes",
    h1: "Tell me what to change.",
    lead: "Look over your preview, then list everything you'd like different, in one go. Your website includes two rounds of changes, and anything you send within two days of an updated preview is part of the same round. Fixing something I got wrong, like a typo, a wrong phone number or wrong hours, never uses a round.",
    steps: [
      ["List your changes", "One per line, with the page it's on. Screenshots help."],
      ["I update your preview", "You'll get an email with the new version in about 3 days."],
      ["Approve when you love it", "Then you pay the flat $1,000 and it goes live."],
    ],
    promise: "Still nothing to pay until you approve.",
    doneTitle: "Got your changes.",
    doneText: "I'll email your updated preview as soon as it's ready.",
  },
  extra: {
    form: TALLY.extra,
    title: "One more round of changes",
    h1: "One more round of changes.",
    lead: "One round of changes is $150. That's the only charge on this page. Already sent me the changes by email? You don't need to type them again.",
    steps: [
      ["Pay for the round", "$150 by card through Stripe. Your receipt comes by email. The payment page says InstateMe: that's Jake's other company, which handles our payments."],
      ["I make your changes", "Including anything you already sent. About 3 days."],
      ["You check the result", "Before launch, you get an updated preview to approve. After launch, the change goes straight onto your live site and I email you when it's done."],
    ],
    promise: "Only if you want it. Nothing else is charged.",
    doneTitle: "Paid. I'm on it.",
    doneText: "Your receipt is on its way from Stripe. I'm on your changes, and you'll hear from me within about 3 days.",
  },
  approve: {
    form: TALLY.approve,
    title: "Approve and launch",
    h1: "Ready to go live?",
    lead: "Approve the preview as it is now and pay the flat $1,000. Payment is final, and anything that doesn't work the way it does in the preview is fixed free for 30 days. Then one 10-minute step at your domain provider and the site is live on the web address you already have.",
    steps: [
      ["Approve and pay", "One flat $1,000, by card through Stripe. Your receipt comes by email. The payment page says InstateMe: that's Jake's other company, which handles our payments."],
      ["Connect your domain", "I email simple steps for your provider. About 10 minutes, or I send them straight to your web person. I never touch the settings that run your email."],
      ["You're live", "I check your email still works, then send your launch note. Hosting is included with no monthly fee, and you own the site and every file."],
    ],
    promise: "Secure card payment through Stripe. You own everything.",
    doneTitle: "Paid and approved.",
    doneText: "Your receipt is on its way from Stripe. Next, I'll email the steps to connect your domain.",
  },
};

interface Rounds { rounds_included: number; rounds_extra: number; rounds_used: number; rounds_left: number }

/** On /changes and /extra, how many rounds the project has left (from the public status endpoint); null until known or if unknown. */
function useRounds(kind: FlowKind): Rounds | null {
  const [rounds, setRounds] = useState<Rounds | null>(null);
  useEffect(() => {
    if (kind !== "changes" && kind !== "extra") return;
    const ref = new URLSearchParams(location.search).get("ref");
    if (!ref) return;
    const ctrl = new AbortController();
    fetch(`${PROJECTS_API}?status=${encodeURIComponent(ref)}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d && typeof d.rounds_left === "number") setRounds(d); })
      .catch(() => {});
    return () => ctrl.abort();
  }, [kind]);
  return rounds;
}

function RoundsNote({ kind, rounds }: { kind: FlowKind; rounds: Rounds | null }) {
  if (!rounds) return null;
  const total = rounds.rounds_included + rounds.rounds_extra;
  if (rounds.rounds_left > 0) {
    return <p className="rounds">You have {rounds.rounds_left} of {total} round{total === 1 ? "" : "s"} of changes left.</p>;
  }
  if (kind === "changes") {
    return <p className="rounds">Your included rounds are used. One more round is $150: <a href={`/extra/${location.search}`}>add a round</a>.</p>;
  }
  return <p className="rounds">Your {total} included round{total === 1 ? "" : "s"} are used, so this one is paid.</p>;
}

/** The customer flow pages (/start, /changes, /approve): the steps on the left, the Tally form on the right. */
export function FlowPage({ kind }: { kind: FlowKind }) {
  const f = FLOWS[kind];
  // The approve and extra pages come back from Stripe with ?paid=1; that's their "done" state.
  const [sent, setSent] = useState(() => kind in STRIPE_LINKS && typeof location !== "undefined" && new URLSearchParams(location.search).get("paid") === "1");
  const card = useRef<HTMLDivElement>(null);
  const done = useRef<HTMLDivElement>(null);
  const rounds = useRounds(kind);

  useEffect(() => {
    if (!sent) return;
    done.current?.focus({ preventScroll: true });
    card.current?.scrollIntoView({ block: "center" });
  }, [sent]);
  const onSubmit = useCallback(() => {
    if (kind === "approve" || kind === "extra") {
      // The form only collects answers; the money changes hands on Stripe, which sends them back here with ?paid=1.
      const q = new URLSearchParams(location.search);
      const ref = q.get("ref");
      location.assign(`${STRIPE_LINKS[kind]}${ref ? `?client_reference_id=${encodeURIComponent(ref)}` : ""}`);
      return;
    }
    setSent(true);
  }, [kind]);

  return (
    <>
      <SubHeader />
      <main className="flow">
        <div className="wrap flow-grid">
          <div className="flow-top">
            <h1 className="t1">{f.h1}</h1>
            <p className="lead">{f.lead}</p>
            <RoundsNote kind={kind} rounds={rounds} />
          </div>
          <div className={sent ? "card sent" : "card"} id="card" ref={card}>
            <TallyEmbed formId={f.form} title={f.title} height={560} onSubmit={onSubmit} />
            {!sent && <p className="small form-help">Form not loading? <a href={`https://tally.so/r/${f.form}`}>Open it here</a> or email <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.</p>}
            <div className="done" role="status" aria-live="polite" tabIndex={-1} ref={done}>
              <h2>{f.doneTitle}</h2>
              <p>{f.doneText}</p>
              <a className="btn btn-ink" href="/">Back to BringsUp</a>
            </div>
          </div>
          <div className="flow-bottom">
            <h2 className="flow-h">What happens</h2>
            <ol className="ruled flow-steps">
              {f.steps.map(([title, text]) => <li key={title}><b>{title}</b><span>{text}</span></li>)}
            </ol>
            <p className="promise">{f.promise}</p>
            {f.links && <p className="small read-first">Want to read first? <a href="/#faq">Questions</a> · <a href="/#pricing">Price</a> · <a href="/terms/">Terms</a></p>}
          </div>
        </div>
      </main>
      <SubFooter note="Secure forms by Tally. Payments by Stripe." />
    </>
  );
}

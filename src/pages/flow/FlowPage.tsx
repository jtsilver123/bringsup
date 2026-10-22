import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { BrandMark, Check } from "../../components/icons.tsx";
import { Lift } from "../../components/Lift.tsx";
import { TallyEmbed } from "../../components/TallyEmbed.tsx";
import { PROJECTS_API, STRIPE_LINKS, TALLY } from "../../lib/config.ts";
import "./flow.css";

export type FlowKind = "start" | "changes" | "approve" | "extra";

interface Flow {
  form: string;
  title: string;
  eyebrow: string;
  h1: ReactNode;
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
    eyebrow: "Start my website",
    h1: <>Let's build your <Lift>new site.</Lift></>,
    lead: "Ten minutes, no call, nothing to pay. We build your whole website from this form. You pay the flat $1,000 only once you've seen it and approved it.",
    steps: [
      ["Fill in this form", "Hours, services, a few photos and your logo if you have them. Don't know who looks after your web address? Skip it, we'll sort that out at the end. The last question is one tick box to say go ahead."],
      ["We build your full site", "Every page. Your logo stays as it is unless you ask us to tidy it. About two weeks."],
      ["Review and request changes", "A private preview link, and two rounds of changes by form."],
      ["Approve, pay, go live", "Love it? Pay the flat $1,000 and it goes live on your domain. If not, you owe nothing."],
    ],
    promise: "Nothing to pay until you approve your finished site. You own the site, your email keeps working, and hosting is included.",
    links: true,
    doneTitle: "We're on it.",
    doneText: "Your private preview link arrives by email in about two weeks. Keep an eye out for it from jake@bringsup.com.",
  },
  changes: {
    form: TALLY.changes,
    title: "Request changes",
    eyebrow: "Request changes",
    h1: <>Tell us what to <Lift>change.</Lift></>,
    lead: "Look over your preview, then list everything you'd like different, in one go. Your website includes two rounds of changes, and anything you send within two days of an updated preview is part of the same round. Fixing something we got wrong, like a typo, a wrong phone number or wrong hours, never uses a round.",
    steps: [
      ["List your changes", "One per line, with the page it's on. Screenshots help."],
      ["We update your preview", "You'll get an email with the new version in about 3 days."],
      ["Approve when you love it", "Then you pay the flat $1,000 and it goes live."],
    ],
    promise: "Still nothing to pay until you approve.",
    doneTitle: "Got your changes.",
    doneText: "We'll email your updated preview as soon as it's ready.",
  },
  extra: {
    form: TALLY.extra,
    title: "One more round of changes",
    eyebrow: "One more round",
    h1: <>One more round of <Lift>changes.</Lift></>,
    lead: "One round of changes is $150. That's the only charge on this page. Already sent us the changes by email? You don't need to type them again.",
    steps: [
      ["Pay for the round", "$150 by card through Stripe. Your receipt comes by email."],
      ["We make your changes", "Including anything you already sent. About 3 days."],
      ["You check the result", "Before launch, you get an updated preview to approve. After launch, the change goes straight onto your live site and we email you when it's done."],
    ],
    promise: "Only if you want it. Nothing else is charged.",
    doneTitle: "Paid. We're on it.",
    doneText: "Your receipt is on its way from Stripe. We're on your changes, and you'll hear from us within about 3 days.",
  },
  approve: {
    form: TALLY.approve,
    title: "Approve and launch",
    eyebrow: "Approve and launch",
    h1: <>Ready to go <Lift>live?</Lift></>,
    lead: "Approve the preview as it is now and pay the flat $1,000. Payment is final, and anything that doesn't work the way it does in the preview is fixed free for 30 days. Then one 10-minute step at your domain provider and the site is live on the web address you already have.",
    steps: [
      ["Approve and pay", "One flat $1,000, by card through Stripe. Your receipt comes by email."],
      ["Connect your domain", "We email simple steps for your provider. About 10 minutes, or we send them straight to your web person. We never touch the settings that run your email."],
      ["You're live", "We check your email still works, then send your launch note. Hosting is included with no monthly fee, and you own the site and every file."],
    ],
    promise: "Secure card payment through Stripe. You own everything.",
    doneTitle: "Paid and approved.",
    doneText: "Your receipt is on its way from Stripe. Next, we'll email the steps to connect your domain.",
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
  const [year, setYear] = useState(2026);
  const rounds = useRounds(kind);

  useEffect(() => setYear(new Date().getFullYear()), []);
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
      <header>
        <div className="wrap">
          <a className="brand" href="/" aria-label="BringsUp home"><BrandMark /><span>BringsUp</span></a>
          <span className="help">Questions? <a href="mailto:jake@bringsup.com">jake@bringsup.com</a></span>
        </div>
      </header>
      <main>
        <div className="wrap">
          <div className="side">
            <p className="eyebrow">{f.eyebrow}</p>
            <h1>{f.h1}</h1>
            <p className="lead">{f.lead}</p>
            <RoundsNote kind={kind} rounds={rounds} />
            <ol className="steps">
              {f.steps.map(([title, text]) => <li key={title}><div><b>{title}</b><span>{text}</span></div></li>)}
            </ol>
            <p className="promise"><Check />{f.promise}</p>
            {f.links && <p className="read-first">Want to read first? <a href="/#faq">The FAQ</a> · <a href="/#pricing">Pricing</a> · <a href="/terms/">Terms</a></p>}
          </div>
          <div className={sent ? "card sent" : "card"} id="card" ref={card}>
            <TallyEmbed formId={f.form} title={f.title} height={560} onSubmit={onSubmit} />
            {!sent && <p className="form-help">Form not loading? <a href={`https://tally.so/r/${f.form}`}>Open it here</a> or email <a href="mailto:jake@bringsup.com">jake@bringsup.com</a>.</p>}
            <div className="done" role="status" aria-live="polite" tabIndex={-1} ref={done}>
              <div className="tick"><Check size={32} /></div>
              <h2>{f.doneTitle}</h2>
              <p>{f.doneText}</p>
              <a className="btn" href="/">Back to BringsUp</a>
            </div>
          </div>
        </div>
      </main>
      <footer>
        <div className="wrap">
          <span>© {year} BringsUp · Websites as good as your reviews.</span>
          <span>Secure forms by Tally. Payments by Stripe. <a href="/terms/">Terms</a> · <a href="/privacy/">Privacy</a></span>
        </div>
      </footer>
    </>
  );
}

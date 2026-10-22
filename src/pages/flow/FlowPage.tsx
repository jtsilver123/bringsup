import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { BrandMark, Check } from "../../components/icons.tsx";
import { Lift } from "../../components/Lift.tsx";
import { TallyEmbed } from "../../components/TallyEmbed.tsx";
import { TALLY } from "../../lib/config.ts";
import "./flow.css";

export type FlowKind = "start" | "changes" | "approve";

interface Flow {
  form: string;
  title: string;
  eyebrow: string;
  h1: ReactNode;
  lead: string;
  steps: [string, string][];
  promise: string;
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
      ["Fill in this form", "Hours, services, a few photos if you have them. Skip anything you're not sure about."],
      ["We build your full site", "Every page, plus a refreshed logo and colors. About two weeks."],
      ["Review and request changes", "A private preview link, and two rounds of changes by form."],
      ["Approve, pay, go live", "Love it? Pay the flat $1,000 and it goes live on your domain. If not, you owe nothing."],
    ],
    promise: "Nothing to pay until you approve your finished site.",
    doneTitle: "We're on it.",
    doneText: "Your private preview link arrives by email in about two weeks. Keep an eye out for it from jake@bringsup.com.",
  },
  changes: {
    form: TALLY.changes,
    title: "Request changes",
    eyebrow: "Request changes",
    h1: <>Tell us what to <Lift>change.</Lift></>,
    lead: "Look over your preview, then list what you'd like different. Big or small, it all counts. Your project includes two rounds of changes.",
    steps: [
      ["List your changes", "One per line, with the page it's on. Screenshots help."],
      ["We update your preview", "You'll get an email with the new version as soon as it's ready."],
      ["Approve when you love it", "Then you pay the flat $1,000 and it goes live."],
    ],
    promise: "Still nothing to pay until you approve.",
    doneTitle: "Got your changes.",
    doneText: "We'll email your updated preview as soon as it's ready.",
  },
  approve: {
    form: TALLY.approve,
    title: "Approve and launch",
    eyebrow: "Approve and launch",
    h1: <>Ready to go <Lift>live?</Lift></>,
    lead: "Approve your preview and pay the flat $1,000. Then we put your new site live on the domain you already have.",
    steps: [
      ["Approve and pay", "One flat $1,000, by card through Stripe. Your receipt comes by email."],
      ["Connect your domain", "We email simple steps for your provider. About 10 minutes, or we send them to your web person."],
      ["You're live", "Your email keeps working exactly like it does today. You own the site and every file."],
    ],
    promise: "Secure card payment through Stripe. You own everything.",
    doneTitle: "You're approved.",
    doneText: "Your receipt is on its way. Next, we'll email the steps to connect your domain.",
  },
};

/** The customer flow pages (/start, /changes, /approve): the steps on the left, the Tally form on the right. */
export function FlowPage({ kind }: { kind: FlowKind }) {
  const f = FLOWS[kind];
  const [sent, setSent] = useState(false);
  const card = useRef<HTMLDivElement>(null);
  const done = useRef<HTMLDivElement>(null);
  const [year, setYear] = useState(2026);

  useEffect(() => setYear(new Date().getFullYear()), []);
  useEffect(() => {
    if (!sent) return;
    done.current?.focus({ preventScroll: true });
    card.current?.scrollIntoView({ block: "center" });
  }, [sent]);
  const onSubmit = useCallback(() => setSent(true), []);

  return (
    <>
      <header>
        <div className="wrap">
          <a className="brand" href="/" aria-label="BringsUp home"><BrandMark /><span>BringsUp</span></a>
          <span className="help">Questions? <a href="mailto:hello@bringsup.com">hello@bringsup.com</a></span>
        </div>
      </header>
      <main>
        <div className="wrap">
          <div className="side">
            <p className="eyebrow">{f.eyebrow}</p>
            <h1>{f.h1}</h1>
            <p className="lead">{f.lead}</p>
            <ol className="steps">
              {f.steps.map(([title, text]) => <li key={title}><div><b>{title}</b><span>{text}</span></div></li>)}
            </ol>
            <p className="promise"><Check />{f.promise}</p>
          </div>
          <div className={sent ? "card sent" : "card"} id="card" ref={card}>
            <TallyEmbed formId={f.form} title={f.title} height={560} onSubmit={onSubmit} />
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

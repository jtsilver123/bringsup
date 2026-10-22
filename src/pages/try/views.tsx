// The /try/ page's sections. Each is always in the page and hidden unless it's the current view,
// so the aria-live regions exist before their content changes.
import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode, type Ref } from "react";
import { Arrow, BrandMark, Check } from "../../components/icons.tsx";

export type View = "ask" | "working" | "result" | "queued" | "failed";

export function Header() {
  return (
    <header>
      <div className="wrap">
        <a className="brand" href="/" aria-label="BringsUp home"><BrandMark /><span>BringsUp</span></a>
        <span className="help">Questions? <a href="mailto:jake@bringsup.com">jake@bringsup.com</a></span>
      </div>
    </header>
  );
}

export function Footer() {
  // Rendered as the build year, then brought up to date in the browser.
  const [year, setYear] = useState(2026);
  useEffect(() => setYear(new Date().getFullYear()), []);
  return (
    <footer>
      <div className="wrap">
        <span>© <span id="yr">{year}</span> BringsUp · Websites as good as your reviews.</span>
        <span>Concepts are ideas, not live sites, and aren't affiliated with the businesses shown. <a href="/terms/">Terms</a> · <a href="/privacy/">Privacy</a></span>
      </div>
    </footer>
  );
}

export function Toast({ message, show }: { message: string; show: boolean }) {
  return <div className={show ? "toast show" : "toast"} id="toast" role="status" aria-live="polite">{message}</div>;
}

export interface AskFields {
  url: string;
  email: string;
  company_site: string;
}

export interface FormError {
  field: "url" | "email";
  message: string;
}

interface AskProps {
  hidden: boolean;
  /** No backend: show the hand-made concept offer instead of the form. */
  soon: boolean;
  fields: AskFields;
  onField: (name: keyof AskFields, value: string) => void;
  error: FormError | null;
  onSubmit: () => void;
  urlRef: Ref<HTMLInputElement>;
  emailRef: Ref<HTMLInputElement>;
}

export function AskView({ hidden, soon, fields, onField, error, onSubmit, urlRef, emailRef }: AskProps) {
  const change = (e: ChangeEvent<HTMLInputElement>) => onField(e.target.name as keyof AskFields, e.target.value);
  const submit = (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); onSubmit(); };
  const invalid = (f: FormError["field"]) => (error?.field === f ? { "aria-invalid": true, "aria-describedby": "form-err" } : {});
  return (
    <section className="wrap ask" id="ask" hidden={hidden}>
      <div>
        <p className="eyebrow">Instant redesign</p>
        <h1>See your website, <span className="lift">redone.<svg viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true"><path d="M4 16 C 70 11, 170 10, 250 12 C 268 12, 282 9, 296 3" /></svg></span></h1>
        <p className="lead">Paste your website. Within the hour, we'll email you your homepage, rebuilt from your own photos, services and story, so you can see exactly what you'd get.</p>
        <ul className="points">
          <li><Check />Free, no call, nothing to install</li>
          <li><Check />Built from what's already on your site</li>
          <li><Check />Love it? We build the whole site. $0 until you approve.</li>
        </ul>
      </div>
      <div className="card">
        <form id="form" noValidate onSubmit={submit} hidden={soon}>
          <label>Your website<input ref={urlRef} name="url" type="text" inputMode="url" autoComplete="url" autoCapitalize="off" spellCheck={false} placeholder="rosasbakery.com" required value={fields.url} onChange={change} {...invalid("url")} /></label>
          <label>Your email<input ref={emailRef} name="email" type="email" autoComplete="email" autoCapitalize="off" spellCheck={false} placeholder="you@rosasbakery.com" required value={fields.email} onChange={change} {...invalid("email")} /></label>
          <div className="hp" aria-hidden="true"><label>Leave this empty<input name="company_site" tabIndex={-1} autoComplete="off" value={fields.company_site} onChange={change} /></label></div>
          <p className="form-err" id="form-err" role="alert" hidden={!error}>{error?.message}</p>
          <button className="btn btn-ember" type="submit">Redesign my website <Arrow /></button>
          <p className="foot">We only use your email to follow up about your redesign. Never shared, never sold.</p>
        </form>
        <div className="soon" id="soon" hidden={!soon}>
          <p><b>Instant redesigns are switching on soon.</b> In the meantime, send us your website and we'll make your free homepage concept by hand, within 48 hours.</p>
          <a className="btn btn-ember" href="/#concept">Get my free concept</a>
        </div>
      </div>
    </section>
  );
}

const STEPS = ["Reading your website", "Finding your photos, hours and services", "Writing your new homepage", "Choosing colors and layout"];
/** Seconds after the start when each step becomes the current one. */
const STEP_AT = [0, 5, 14, 32];

/** Progress steps advance on a timer while the request runs. */
function useStep(active: boolean): number {
  const [step, setStep] = useState(-1);
  useEffect(() => {
    if (!active) return;
    const t0 = Date.now();
    const tick = () => {
      const s = (Date.now() - t0) / 1000;
      let idx = 0;
      STEP_AT.forEach((a, i) => { if (s >= a) idx = i; });
      setStep(idx);
    };
    tick();
    const t = setInterval(tick, 500);
    return () => clearInterval(t);
  }, [active]);
  return step;
}

export function WorkingView({ hidden, host }: { hidden: boolean; host: string }) {
  const step = useStep(!hidden);
  return (
    <section className="wrap working" id="working" hidden={hidden} aria-live="polite">
      <p className="eyebrow">Working on it</p>
      <h2>Redesigning <span id="w-host">{host}</span></h2>
      <p className="lead">This takes a few seconds.</p>
      <ol className="steps" id="steps">
        {STEPS.map((s, i) => (
          <li key={s} className={i < step ? "done" : i === step ? "now" : undefined}><span className="dot"></span>{s}</li>
        ))}
      </ol>
      <div className="skel" aria-hidden="true">
        <i style={{ height: 34 }}></i>
        <div style={{ padding: 28, display: "grid", gap: 14 }}>
          <i style={{ height: 220, borderRadius: 12 }}></i>
          <i style={{ height: 22, width: "60%", borderRadius: 8 }}></i>
          <i style={{ height: 22, width: "40%", borderRadius: 8 }}></i>
        </div>
      </div>
    </section>
  );
}

export interface ResultData {
  id: string;
  name: string;
  /** The address shown in the preview's browser chrome. */
  address: string;
  html: string;
  improvements: string[];
}

interface ResultProps {
  hidden: boolean;
  data: ResultData | null;
  onCopy: () => void;
  onFullScreen: () => void;
  onAgain: () => void;
}

type Size = "desktop" | "phone";

function SizeButton({ size, current, onPick, children }: { size: Size; current: Size; onPick: (s: Size) => void; children: ReactNode }) {
  return <button type="button" data-view={size} aria-pressed={current === size} onClick={() => onPick(size)}>{children}</button>;
}

export function ResultView({ hidden, data, onCopy, onFullScreen, onAgain }: ResultProps) {
  const [size, setSize] = useState<Size>("desktop");
  const startHref = data ? "/start/?ref=" + encodeURIComponent("redesign-" + data.id) : "/start/";
  return (
    <section className="wrap result" id="result" hidden={hidden}>
      <div className="result-head">
        <div>
          <p className="eyebrow">Your redesign</p>
          <h2>Here's <span id="r-name">{data?.name || "your business"}</span>, redone.</h2>
        </div>
        <ul className="improved" id="improved">
          {(data?.improvements || []).slice(0, 5).map((x, i) => <li key={i}><Check size={18} /><span>{x}</span></li>)}
        </ul>
      </div>
      <div className="bar">
        <div className="seg" role="group" aria-label="Preview size">
          <SizeButton size="desktop" current={size} onPick={setSize}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></svg>Desktop</SizeButton>
          <SizeButton size="phone" current={size} onPick={setSize}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></svg>Phone</SizeButton>
        </div>
        <div className="tools">
          <button className="ghost" type="button" id="copy" onClick={onCopy}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" /></svg>Copy link</button>
          <button className="ghost" type="button" id="full" onClick={onFullScreen}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 3h6v6" /><path d="M9 21H3v-6" /><path d="M21 3l-7 7" /><path d="M3 21l7-7" /></svg>Full screen</button>
        </div>
      </div>
      <div className={size === "phone" ? "stage phone" : "stage"} id="stage">
        <div className="frame">
          <div className="chrome" aria-hidden="true"><i></i><i></i><i></i><span id="r-host">{data?.address}</span></div>
          <iframe id="preview" title="Your redesigned homepage" sandbox="allow-popups" srcDoc={data?.html || undefined}></iframe>
        </div>
      </div>
      <div className="next">
        <div>
          <h3>Love it? We'll build the whole site.</h3>
          <p>Every page, your logo and colors refreshed, live on your own domain in about two weeks. No calls, and nothing to pay until you approve the finished site. Then one flat $1,000.</p>
        </div>
        <div className="acts">
          <a className="btn btn-glow" id="start" href={startHref}>Start my website <Arrow /></a>
          <button className="again" type="button" id="again" onClick={onAgain}>Try another website</button>
        </div>
      </div>
      <p className="disclaimer">A concept made automatically from your public website. Stock photos are used where we couldn't find yours. Not a live site.</p>
    </section>
  );
}

export interface QueuedData {
  host: string;
  email: string;
  /** The blurred draft's HTML, or null when there's no preview to draw it from. */
  draft: string | null;
}

export function QueuedView({ hidden, data, onCopy }: { hidden: boolean; data: QueuedData | null; onCopy: () => void }) {
  const draft = data?.draft;
  return (
    <section className="wrap queued" id="queued" hidden={hidden} aria-live="polite">
      <div className={draft ? "q-stage has-draft" : "q-stage"} id="q-stage">
        {draft && <span className="q-tag" aria-hidden="true"><i></i>Draft in progress</span>}
        <div className="q-draft" aria-hidden="true"><iframe id="q-frame" tabIndex={-1} title="" sandbox="" srcDoc={draft || undefined}></iframe></div>
        <div className="q-card">
          <div className="q-icon" aria-hidden="true"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg></div>
          <p className="eyebrow">You're in line</p>
          <h2>We're redesigning <span id="q-host">{data?.host || "your website"}</span>.</h2>
          <p className="lead">A designer-quality homepage takes a little longer than a minute. We'll email it to <span id="q-email">{data?.email ? <b>{data.email}</b> : "you"}</span> within the hour. This page updates on its own if you keep it open.</p>
          <div className="acts">
            <button className="btn btn-outline" type="button" id="q-copy" onClick={onCopy}>Copy this page's link</button>
            <a className="btn btn-ember" href="/try/?demo">See a sample while you wait</a>
          </div>
        </div>
      </div>
    </section>
  );
}

export interface Failure {
  title: string;
  message: string;
}

export function FailedView({ hidden, failure, onRetry }: { hidden: boolean; failure: Failure | null; onRetry: () => void }) {
  return (
    <section className="wrap failed" id="failed" hidden={hidden}>
      <p className="eyebrow">Hmm</p>
      <h2 id="f-title">{failure?.title || "We couldn't redesign that one automatically."}</h2>
      <p className="lead" id="f-msg">{failure?.message}</p>
      <div className="acts">
        <a className="btn btn-ember" href="/#concept">Have us make it by hand</a>
        <button className="btn btn-outline" type="button" id="retry" onClick={onRetry}>Try another website</button>
      </div>
    </section>
  );
}

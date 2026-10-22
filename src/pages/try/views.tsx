// The /try/ page's sections. Each is always in the page and hidden unless it's the current view,
// so the aria-live regions exist before their content changes.
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode, type Ref, type RefObject } from "react";
import { SubFooter, SubHeader } from "../../components/Chrome.tsx";
import { Arrow } from "../../components/icons.tsx";

export type View = "ask" | "working" | "result" | "queued" | "failed";

export const Header = () => <SubHeader />;

export const Footer = () => <SubFooter note="Concepts are ideas, not live sites, and aren't affiliated with the businesses shown." />;

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
        <h1 className="t1">See your website, redone.</h1>
        <p className="lead">Paste your website. The same day, usually within the hour, I'll email you your homepage, rebuilt from your own photos, services and story, so you can see exactly what you'd get.</p>
        <p className="ask-more">It's free, there's no call and nothing to install. If you love it, I build the whole site for a flat $1,000, paid only when you approve it.</p>
      </div>
      <div className="card">
        <form id="form" noValidate onSubmit={submit} hidden={soon}>
          <label className="field">Your website<input ref={urlRef} name="url" type="text" inputMode="url" autoComplete="url" autoCapitalize="off" spellCheck={false} placeholder="rosasbakery.com" required value={fields.url} onChange={change} {...invalid("url")} /></label>
          <label className="field">Your email<input ref={emailRef} name="email" type="email" autoComplete="email" autoCapitalize="off" spellCheck={false} placeholder="you@rosasbakery.com" required value={fields.email} onChange={change} {...invalid("email")} /></label>
          <div className="hp" aria-hidden="true"><label>Leave this empty<input name="company_site" tabIndex={-1} autoComplete="off" value={fields.company_site} onChange={change} /></label></div>
          <p className="form-err" id="form-err" role="alert" hidden={!error}>{error?.message}</p>
          <button className="btn btn-primary" type="submit">Redesign my website <Arrow /></button>
          <p className="small foot">I only use your email to follow up about your redesign. Never shared, never sold.</p>
        </form>
        <div className="soon" id="soon" hidden={!soon}>
          <p><b>Instant redesigns are switching on soon.</b> In the meantime, send me your website and I'll make your free homepage by hand, within 48 hours.</p>
          <a className="btn btn-primary" href="/#concept">Get my free homepage</a>
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
      <h1 className="t2">Redesigning <span id="w-host">{host}</span></h1>
      <p className="lead">Give it a minute. If it takes longer, I'll email it to you the same day.</p>
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
  /** A cold-email prospect's tracker slug, so "Start my website" lands on their row. */
  ref?: string;
  /** Hand-built by Jake for this business: it may run its own scripts (still sandboxed, with no access to this page). */
  handmade?: boolean;
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

/** Desktop view always lays the page out at this width and scales it to fit, so a phone still sees the desktop design. */
const DESKTOP_WIDTH = 1280;

/** How much to shrink the desktop layout to fit the frame (1 when the frame is already wide enough). */
function useDesktopScale(frame: RefObject<HTMLDivElement | null>, active: boolean): number {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = frame.current;
    if (!el || !active) return setScale(1);
    const measure = () => setScale(Math.min(1, el.clientWidth / DESKTOP_WIDTH));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [frame, active]);
  return scale;
}

export function ResultView({ hidden, data, onCopy, onFullScreen, onAgain }: ResultProps) {
  const [size, setSize] = useState<Size>("desktop");
  const frame = useRef<HTMLDivElement>(null);
  const scale = useDesktopScale(frame, size === "desktop" && !hidden);
  const scaled = size === "desktop" && scale < 1;
  // Outreach concepts carry the prospect's tracker slug, so the start form lands on their row.
  const startHref = data ? "/start/?ref=" + encodeURIComponent(data.ref || "redesign-" + data.id) : "/start/";
  return (
    <section className="wrap result" id="result" hidden={hidden}>
      <div className="result-head">
        <div>
          <h1 className="t2">Here's <span id="r-name">{data?.name || "your business"}</span>, redone.</h1>
        </div>
        <ul className="ruled improved" id="improved" aria-label="What changed">
          {(data?.improvements || []).slice(0, 5).map((x, i) => <li key={i}>{x}</li>)}
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
        <div className="frame" ref={frame}>
          <div className="chrome" aria-hidden="true"><i></i><i></i><i></i><span id="r-host">{data?.address}</span></div>
          <div className="viewport" style={scaled ? { height: `var(--frame-h)` } : undefined}><iframe id="preview" title="Your redesigned homepage" style={scaled ? { width: DESKTOP_WIDTH, height: `calc(var(--frame-h) / ${scale})`, transform: `scale(${scale})`, transformOrigin: "0 0" } : undefined} sandbox={data?.handmade ? "allow-scripts allow-popups allow-popups-to-escape-sandbox" : "allow-popups"} srcDoc={data?.html || undefined}></iframe></div>
        </div>
      </div>
      <div className="next">
        <div>
          <h2>Love it? I'll build the whole site.</h2>
          <p>Every page, ready for you to review in about two weeks, then live on your own domain once you approve it. No calls, and nothing to pay until then. Then one flat $1,000.</p>
        </div>
        <div className="acts">
          <a className="btn btn-primary" id="start" href={startHref}>Start my website <Arrow /></a>
          <button className="tlink again" type="button" id="again" onClick={onAgain}>Try another website</button>
        </div>
      </div>
      <p className="small disclaimer">{data?.handmade ? "A homepage idea I made from your public website and menu. Stock photos stand in where yours will go. Not a live site." : "A concept made automatically from your public website. Stock photos are used where we couldn't find yours. Not a live site."}</p>
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
          <h1 className="t2">I'm redesigning <span id="q-host">{data?.host || "your website"}</span>.</h1>
          <p className="lead">A careful homepage takes a little longer than a minute. I'll email it to <span id="q-email">{data?.email ? <b>{data.email}</b> : "you"}</span> the same day, usually within the hour. This page updates on its own if you keep it open.</p>
          <div className="acts">
            <button className="btn btn-line" type="button" id="q-copy" onClick={onCopy}>Copy this page's link</button>
            <a className="btn btn-primary" href="/try/?demo">See a sample while you wait</a>
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
      <h1 className="t2" id="f-title">{failure?.title || "We couldn't redesign that one automatically."}</h1>
      <p className="lead" id="f-msg">{failure?.message}</p>
      <div className="acts">
        <a className="btn btn-primary" href="mailto:jake@bringsup.com?subject=Free%20concept%20by%20hand&body=My%20website%3A%20">Email Jake to make it by hand</a>
        <button className="btn btn-line" type="button" id="retry" onClick={onRetry}>Try another website</button>
      </div>
    </section>
  );
}

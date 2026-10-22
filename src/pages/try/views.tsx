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

/** The desktop design is always laid out at this width and scaled to fit; the phone at this one. */
const DESKTOP_WIDTH = 1280;
const PHONE_WIDTH = 390;

/** Width of an element, kept current. 0 until measured (and during prerender). */
function useWidth(el: RefObject<HTMLElement | null>, active: boolean): number {
  const [w, setW] = useState(0);
  useEffect(() => {
    const node = el.current;
    if (!node || !active) return;
    const measure = () => setW(node.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    return () => ro.disconnect();
  }, [el, active]);
  return w;
}

/** One live, scaled copy of the page: laid out at `layoutWidth`, shrunk to `width`, `height` tall on screen. */
function Screen({ html, scripts, layoutWidth, width, height, title }: { html: string; scripts: boolean; layoutWidth: number; width: number; height: number; title: string }) {
  const scale = width > 0 ? Math.min(1, width / layoutWidth) : 1;
  return (
    <div className="screen" style={{ height }}>
      <iframe title={title} sandbox={scripts ? "allow-scripts allow-popups allow-popups-to-escape-sandbox" : "allow-popups"} srcDoc={html}
        style={{ width: layoutWidth, height: height / scale, transform: `scale(${scale})` }}></iframe>
    </div>
  );
}

/** "What's better": beside the headline on wide screens, below the preview on narrow ones (so the site comes first). */
function Better({ items, where }: { items?: string[]; where: "wide" | "narrow" }) {
  if (!items?.length) return null;
  return (
    <div className={`r-better ${where}`}>
      <h2 className="r-label">What's better</h2>
      <ol className="improved" id={where === "wide" ? "improved" : undefined}>
        {items.slice(0, 5).map((x, i) => <li key={i}>{x}</li>)}
      </ol>
    </div>
  );
}

export function ResultView({ hidden, data, onCopy, onFullScreen, onAgain }: ResultProps) {
  const [size, setSize] = useState<Size>("desktop");
  const stage = useRef<HTMLDivElement>(null);
  const stageW = useWidth(stage, !hidden);
  const small = stageW > 0 && stageW < 720;
  // Phones open on the phone view, which is what the owner's customers will see.
  const picked = useRef(false);
  useEffect(() => { if (small && !picked.current) setSize("phone"); }, [small]);
  const pick = (s: Size) => { picked.current = true; setSize(s); };

  const html = data?.html || "";
  const scripts = Boolean(data?.handmade);
  const name = data?.name || "your business";
  // Outreach concepts carry the prospect's tracker slug, so the start form lands on their row.
  const startHref = data ? "/start/?ref=" + encodeURIComponent(data.ref || "redesign-" + data.id) : "/start/";
  const forProspect = Boolean(data?.ref);

  // Desktop view on a wide screen: the desktop page with the phone overlapping its corner. Elsewhere, one screen.
  const showcase = size === "desktop" && !small && stageW > 0;
  const deskW = showcase ? Math.round(stageW * 0.86) : stageW;
  const deskH = Math.round(deskW * (showcase ? 0.62 : small ? 1.25 : 0.62));
  const phoneW = showcase ? Math.max(220, Math.round(stageW * 0.22)) : Math.min(stageW, 420);
  const phoneH = Math.round(phoneW * (844 / PHONE_WIDTH));

  return (
    <section className="result" id="result" hidden={hidden}>
      <div className="wrap r-head">
        <div>
          <p className="r-made">Made for {name} by Jake at BringsUp</p>
          <h1 className="t1">Here's <span id="r-name">{name}</span>, redone.</h1>
          <p className="lead">A homepage built from your own {scripts ? "website and menu" : "website"}. It's a real page, so scroll it and tap around.</p>
          <div className="r-acts">
            <a className="btn btn-primary" href={startHref}>Start my website <Arrow /></a>
            <a className="tlink" href="#r-next">How it works</a>
          </div>
        </div>
        <Better items={data?.improvements} where="wide" />
      </div>

      <div className="r-stage">
        <div className="wrap">
          <div className="bar">
            <div className="seg" role="group" aria-label="Preview size">
              <SizeButton size="desktop" current={size} onPick={pick}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></svg>Desktop</SizeButton>
              <SizeButton size="phone" current={size} onPick={pick}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></svg>Phone</SizeButton>
            </div>
            <div className="tools">
              <button className="ghost" type="button" id="copy" onClick={onCopy}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" /></svg>Copy link</button>
              <button className="ghost" type="button" id="full" onClick={onFullScreen}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 3h6v6" /><path d="M9 21H3v-6" /><path d="M21 3l-7 7" /><path d="M3 21l7-7" /></svg>Full screen</button>
            </div>
          </div>
          <div className={`stage ${showcase ? "showcase" : size}`} id="stage" ref={stage}>
            {stageW > 0 && html && (size === "desktop" ? (
              <>
                <div className="browser" style={{ width: deskW }}>
                  <div className="chrome" aria-hidden="true"><i></i><i></i><i></i><span id="r-host">{data?.address}</span></div>
                  <Screen html={html} scripts={scripts} layoutWidth={DESKTOP_WIDTH} width={deskW} height={deskH} title={`${name} homepage, desktop`} />
                </div>
                {showcase && (
                  <div className="phone" style={{ width: phoneW + 16 }}>
                    <Screen html={html} scripts={scripts} layoutWidth={PHONE_WIDTH} width={phoneW} height={phoneH} title={`${name} homepage, phone`} />
                  </div>
                )}
              </>
            ) : (
              <div className="phone solo" style={{ width: phoneW + 16 }}>
                <Screen html={html} scripts={scripts} layoutWidth={PHONE_WIDTH} width={phoneW} height={small ? Math.round(phoneW * 1.7) : phoneH} title={`${name} homepage, phone`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="wrap"><Better items={data?.improvements} where="narrow" /></div>

      <div className="wrap r-next" id="r-next">
        <h2 className="t2">Love it? I'll build the whole site.</h2>
        <ol className="r-steps">
          <li><b>One 10-minute form</b><span>Your hours, a few photos and your logo if you have one. Skip anything you don't have. No calls.</span></li>
          <li><b>Your finished site in about two weeks</b><span>Every page, as a private preview. Two rounds of changes are included.</span></li>
          <li><b>Pay only when you approve it</b><span>A flat $1,000, then it goes live on your own web address. Hosting included, no monthly fee.</span></li>
        </ol>
        <div className="r-acts">
          <a className="btn btn-primary" id="start" href={startHref}>Start my website <Arrow /></a>
          {forProspect
            ? <a className="tlink" href="mailto:jake@bringsup.com">Questions? Email Jake</a>
            : <button className="tlink again" type="button" id="again" onClick={onAgain}>Try another website</button>}
        </div>
        <p className="small disclaimer">{scripts ? "A homepage idea I made from your public website and menu. Stock photos stand in where yours will go. Not a live site." : "A concept made automatically from your public website. Stock photos are used where we couldn't find yours. Not a live site."}</p>
      </div>
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

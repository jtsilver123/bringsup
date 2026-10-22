// The /try/ page's sections. Each is always in the page and hidden unless it's the current view,
// so the aria-live regions exist before their content changes.
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode, type Ref, type RefObject } from "react";
import { SubFooter, SubHeader } from "../../components/Chrome.tsx";
import { Arrow } from "../../components/icons.tsx";
import { BrandCard, type BrandPreview } from "./BrandCard.tsx";

export type View = "ask" | "working" | "result" | "queued" | "failed";

export const Header = () => <SubHeader />;

export const Footer = () => <SubFooter note="Concepts are ideas, not live sites, and aren't affiliated with the businesses shown." />;

/** The status toast. `ok` adds a check for confirmations; quiet messages (show false) are only announced. */
export function Toast({ message, show, ok }: { message: string; show: boolean; ok?: boolean }) {
  return (
    <div className={show ? "toast show" : "toast"} id="toast" role="status" aria-live="polite">
      {ok && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>}
      <span>{message}</span>
    </div>
  );
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
  /** Fields that were flagged and have since been fixed (they show a small green check). */
  fixed: Partial<Record<FormError["field"], boolean>>;
  onSubmit: () => void;
  urlRef: Ref<HTMLInputElement>;
  emailRef: Ref<HTMLInputElement>;
}

export function AskView({ hidden, soon, fields, onField, error, fixed, onSubmit, urlRef, emailRef }: AskProps) {
  const change = (e: ChangeEvent<HTMLInputElement>) => onField(e.target.name as keyof AskFields, e.target.value);
  const submit = (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); onSubmit(); };
  const invalid = (f: FormError["field"]) => (error?.field === f ? { "aria-invalid": true, "aria-describedby": "form-err" } : fixed[f] ? { "data-ok": "" } : {});
  return (
    <section className="wrap ask" id="ask" hidden={hidden}>
      <div>
        <h1 className="t1">See your website, redone.</h1>
        <p className="lead">Type in your web address. The same day, usually within the hour, I'll email you your homepage, rebuilt from your own photos, services and story, so you can see exactly what you'd get.</p>
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
  /** Only when we made a logo refresh: their logo now and refreshed, and the colors (concept.brand). */
  brand?: BrandPreview;
}

interface ResultProps {
  hidden: boolean;
  data: ResultData | null;
  /** Copies the page's link; resolves true when it worked (the button then shows its checkmark). */
  onCopy: () => Promise<boolean>;
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
/** How long the Desktop/Phone morph takes (keep in step with --morph in try.css). */
const MORPH_MS = 320;

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

/** One live, scaled copy of the page: laid out at `layoutWidth`, shrunk to `width`, `height` tall on screen. Fades in once loaded. */
function Screen({ html, scripts, layoutWidth, width, height, title }: { html: string; scripts: boolean; layoutWidth: number; width: number; height: number; title: string }) {
  const [ready, setReady] = useState(false);
  const scale = width > 0 ? Math.min(1, width / layoutWidth) : 1;
  return (
    <div className={ready ? "screen ready" : "screen"} style={{ height }}>
      <iframe title={title} sandbox={scripts ? "allow-scripts allow-popups allow-popups-to-escape-sandbox" : "allow-popups"} srcDoc={html}
        onLoad={() => setReady(true)}
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

const LinkIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" /></svg>;
const CheckIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>;

/** A copy-link button that confirms in place: the link icon turns into a check and the label into "Copied". */
export function CopyButton({ className, id, label, onCopy }: { className: string; id: string; label: string; onCopy: () => Promise<boolean> }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const click = () => {
    void onCopy().then((ok) => {
      if (!ok) return;
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button className={className} type="button" id={id} data-copied={copied ? "" : undefined} onClick={click}>
      <span className="copied-swap" aria-hidden="true"><LinkIcon /><CheckIcon /></span>
      <span className="copy-lbl"><span aria-hidden={copied}>{label}</span><span aria-hidden={!copied}>Copied</span></span>
    </button>
  );
}

interface Box { x: number; y: number; w: number; h: number; shown: boolean }

/**
 * Where each frame sits for a view. Both frames stay mounted and are positioned absolutely, so switching views
 * morphs: on a wide screen the phone slides from the browser's corner to the middle and grows, while the browser
 * steps back and fades. A hidden frame shrinks to fit the stage so it never adds height.
 */
function layout(stageW: number, view: Size) {
  const small = stageW < 720;
  const chrome = small ? 30 : 38;
  const pad = small ? 6 : 8;
  const deskW = small ? stageW : Math.round(stageW * 0.86);
  const deskH = Math.round(deskW * (small ? 1.25 : 0.62));
  const browser: Box = { x: 0, y: 0, w: deskW, h: deskH + chrome + 2, shown: view === "desktop" };
  const overlap = view === "desktop" && !small;
  const phoneW = overlap ? Math.max(220, Math.round(stageW * 0.22)) : Math.min(stageW - pad * 2, 420);
  const screenH = view === "phone" && small ? Math.round(phoneW * 1.7) : Math.round(phoneW * (844 / PHONE_WIDTH));
  const phoneOuterW = phoneW + pad * 2, phoneOuterH = screenH + pad * 2;
  const stageH = view === "desktop" ? browser.h + (overlap ? 48 : 0) : phoneOuterH;
  const phone: Box = overlap
    ? { x: stageW - phoneOuterW, y: stageH - phoneOuterH, w: phoneW, h: screenH, shown: true }
    : { x: Math.round((stageW - phoneOuterW) / 2), y: 0, w: phoneW, h: screenH, shown: view === "phone" };
  return { small, overlap, browser, phone, deskW, deskH, stageH, pad };
}

/** A hidden frame steps back a little and, if it's taller than the stage, shrinks until it fits. */
const place = (b: Box, outerH: number, stageH: number) => {
  const s = b.shown ? 1 : Math.min(0.96, stageH / outerH);
  return `translate(${b.x}px, ${b.y}px) scale(${s})`;
};

export function ResultView({ hidden, data, onCopy, onFullScreen, onAgain }: ResultProps) {
  /** null until the visitor picks: phones then open on the phone view, which is what the owner's customers will see. */
  const [choice, setChoice] = useState<Size | null>(null);
  const [morphing, setMorphing] = useState(false);
  const morphTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(morphTimer.current), []);
  const stage = useRef<HTMLDivElement>(null);
  const stageW = useWidth(stage, !hidden);
  const small = stageW > 0 && stageW < 720;
  const size: Size = choice ?? (small ? "phone" : "desktop");
  const pick = (s: Size) => {
    if (s === size) return;
    setMorphing(true);
    clearTimeout(morphTimer.current);
    morphTimer.current = setTimeout(() => setMorphing(false), MORPH_MS + 80);
    setChoice(s);
  };

  // Each frame mounts the first time it's needed and then stays, so switching back is instant.
  const seen = useRef({ desktop: false, phone: false });
  const L = stageW > 0 ? layout(stageW, size) : null;
  if (L) {
    if (L.browser.shown) seen.current.desktop = true;
    if (L.phone.shown) seen.current.phone = true;
  }

  const html = data?.html || "";
  const scripts = Boolean(data?.handmade);
  const name = data?.name || "your business";
  // Outreach concepts carry the prospect's tracker slug, so the start form lands on their row.
  const startHref = data ? "/start/?ref=" + encodeURIComponent(data.ref || "redesign-" + data.id) : "/start/";
  const forProspect = Boolean(data?.ref);

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
            <div className={morphing ? "seg moving" : "seg"} role="group" aria-label="Preview size" data-at={size}>
              <SizeButton size="desktop" current={size} onPick={pick}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></svg>Desktop</SizeButton>
              <SizeButton size="phone" current={size} onPick={pick}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></svg>Phone</SizeButton>
            </div>
            <div className="tools">
              <CopyButton className="ghost" id="copy" label="Copy link" onCopy={onCopy} />
              <button className="ghost" type="button" id="full" onClick={onFullScreen}><svg className="full-ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><g><path d="M15 3h6v6" /><path d="M21 3l-7 7" /></g><g><path d="M9 21H3v-6" /><path d="M3 21l7-7" /></g></svg>Full screen</button>
            </div>
          </div>
          <div className={["stage", L?.overlap && "showcase", `view-${size}`, morphing && "morphing"].filter(Boolean).join(" ")} id="stage" ref={stage}
            style={L ? { height: L.stageH } : undefined}>
            {L && html && (
              <>
                {seen.current.desktop && (
                  <div className={L.browser.shown ? "frame f-browser" : "frame f-browser off"} inert={!L.browser.shown}
                    style={{ width: L.browser.w, transform: place(L.browser, L.browser.h, L.stageH) }}>
                    <div className="browser">
                      <div className="chrome" aria-hidden="true"><i></i><i></i><i></i><span id="r-host">{data?.address}</span></div>
                      <Screen html={html} scripts={scripts} layoutWidth={DESKTOP_WIDTH} width={L.deskW} height={L.deskH} title={`${name} homepage, desktop`} />
                    </div>
                  </div>
                )}
                {seen.current.phone && (
                  <div className={["frame f-phone", L.overlap && "overlap", !L.phone.shown && "off"].filter(Boolean).join(" ")} inert={!L.phone.shown}
                    style={{ width: L.phone.w + L.pad * 2, transform: place(L.phone, L.phone.h + L.pad * 2, L.stageH) }}>
                    <div className="phone">
                      <Screen html={html} scripts={scripts} layoutWidth={PHONE_WIDTH} width={L.phone.w} height={L.phone.h} title={`${name} homepage, phone`} />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="wrap"><Better items={data?.improvements} where="narrow" /></div>

      <BrandCard name={data?.name || "your business"} brand={data?.brand} />

      <div className="wrap r-next" id="r-next">
        <h2 className="t2">Love it? I'll build the whole site.</h2>
        <ol className="r-steps">
          <li><b>One 10-minute form</b><span>Your hours, a few photos and your logo if you have one. Skip anything you don't have. No calls.</span></li>
          <li><b>Your finished site in about two weeks</b><span>Every page, at a private link for you to look over. Two rounds of changes are included. A round is one list of changes you send at once.</span></li>
          <li><b>Pay only when you approve it</b><span>A flat $1,000, then it goes live on your own web address. Keeping it online is included, with no monthly fee.</span></li>
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

export function QueuedView({ hidden, data, onCopy }: { hidden: boolean; data: QueuedData | null; onCopy: () => Promise<boolean> }) {
  const draft = data?.draft;
  return (
    <section className="wrap queued" id="queued" hidden={hidden} aria-live="polite">
      <div className={draft ? "q-stage has-draft" : "q-stage"} id="q-stage">
        {draft && <span className="q-tag" aria-hidden="true"><i></i>Draft in progress</span>}
        <div className="q-draft" aria-hidden="true"><iframe id="q-frame" tabIndex={-1} title="" sandbox="" srcDoc={draft || undefined}></iframe></div>
        <div className="q-card">
          <h1 className="t2">I'm redesigning <span id="q-host">{data?.host || "your website"}</span>.</h1>
          <p className="lead">A careful homepage takes a little longer than a minute. I'll email it to <span id="q-email">{data?.email ? <b>{data.email}</b> : "you"}</span> the same day, usually within the hour. This page updates on its own if you keep it open, or you can close it and watch your inbox.</p>
          <div className="acts">
            <CopyButton className="btn btn-line" id="q-copy" label="Copy this page's link" onCopy={onCopy} />
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

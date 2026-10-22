import { useCallback, useEffect, useRef, useState, type FormEvent, type Ref, type RefObject } from "react";
import { EMAIL } from "../../../components/Chrome.tsx";
import { Arrow, Check } from "../../../components/icons.tsx";
import { TallyEmbed } from "../../../components/TallyEmbed.tsx";
import { TALLY } from "../../../lib/config.ts";
import { DONE_STEPS } from "../data.ts";
import { prefersReducedMotion } from "../hooks.ts";
import { CopyIcon } from "../icons.tsx";
import { copyText, useCopied } from "../Toast.tsx";

const REQUEST_FOOT = "I only use this to send your homepage. Never shared, never sold.";

const URL_OK = (v: string) => /[^\s.]+\.[a-z]{2,}/i.test(v);
const EMAIL_OK = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

/**
 * The redesign tool's form. The backend runs in queue mode: the visitor's site and email go to /try/
 * through sessionStorage, and the new homepage is emailed within the hour.
 */
function InstantForm() {
  const urlInput = useRef<HTMLInputElement>(null);
  const emailInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<{ field: "url" | "email"; message: string } | null>(null);
  /** Fields that were flagged once and have since been fixed: they get a small green check. */
  const [fixed, setFixed] = useState<{ url?: boolean; email?: boolean }>({});
  const flagged = useRef<{ url?: boolean; email?: boolean }>({});

  // Once a field has been flagged, check it as the visitor types, so the error clears the moment it's right.
  const onInput = (f: "url" | "email", value: string) => {
    if (!flagged.current[f]) return;
    const ok = (f === "url" ? URL_OK : EMAIL_OK)(value.trim());
    setFixed((x) => (x[f] === ok ? x : { ...x, [f]: ok }));
    if (ok && error?.field === f) setError(null);
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const url = urlInput.current!.value.trim();
    const email = emailInput.current!.value.trim();
    setError(null);
    if (!URL_OK(url)) {
      flagged.current.url = true;
      setFixed((x) => ({ ...x, url: false }));
      setError({ field: "url", message: "Add your website address, like rosasbakery.com." });
      urlInput.current!.focus();
      return;
    }
    if (!EMAIL_OK(email)) {
      flagged.current.email = true;
      setFixed((x) => ({ ...x, email: false }));
      setError({ field: "email", message: "Add your email so I can send you your homepage." });
      emailInput.current!.focus();
      return;
    }
    let stored = false;
    try {
      sessionStorage.setItem("bu-try", JSON.stringify({ url, email }));
      stored = !!sessionStorage.getItem("bu-try");
    } catch {
      // Storage blocked: /try/ can still pick the site up from the query string.
    }
    window.location.href = "/try/" + (stored ? "" : "?url=" + encodeURIComponent(url));
  };
  const invalid = (f: "url" | "email") => (error?.field === f ? { "aria-invalid": true, "aria-describedby": "instant-err" } : fixed[f] ? { "data-ok": "" } : {});

  return (
    <form id="instant" className="instant" noValidate onSubmit={onSubmit}>
      <label className="field">Your website<input ref={urlInput} name="url" type="text" inputMode="url" autoComplete="url" autoCapitalize="off" spellCheck={false} placeholder="rosasbakery.com" required onInput={(e) => onInput("url", e.currentTarget.value)} {...invalid("url")} /></label>
      <label className="field">Your email<input ref={emailInput} name="email" type="email" autoComplete="email" autoCapitalize="off" spellCheck={false} placeholder="you@rosasbakery.com" required onInput={(e) => onInput("email", e.currentTarget.value)} {...invalid("email")} /></label>
      <p className="form-err" id="instant-err" role="alert" hidden={!error}>{error?.message}</p>
      <button className="btn btn-primary" type="submit">Send me my new homepage <Arrow /></button>
      <p className="small">Same day, usually within the hour. Never shared, never sold.</p>
    </form>
  );
}

/** The hand-made concept request (Tally), with a thank-you panel once it's sent. */
function ConceptRequest({ card, sent, setSent }: { card: RefObject<HTMLDivElement | null>; sent: boolean; setSent: (sent: boolean) => void }) {
  const [round, setRound] = useState(0);
  const done = useRef<HTMLDivElement>(null);

  const onSubmit = useCallback(() => setSent(true), [setSent]);

  useEffect(() => {
    if (!sent) return;
    done.current?.focus({ preventScroll: true });
    card.current?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" });
  }, [sent, card]);

  return (
    <>
      <TallyEmbed
        key={round}
        formId={TALLY.concept}
        title="Get your free homepage concept"
        extra="&source=website"
        lazy
        onSubmit={onSubmit}
        fallback={<p className="small"><a href={`https://tally.so/r/${TALLY.concept}`}>Open the request form</a> or email <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.</p>}
      />
      <p className="small form-foot">{REQUEST_FOOT}</p>
      <div className="done" role="status" aria-live="polite" tabIndex={-1} ref={done}>
        <h3>Got it. It's on its way.</h3>
        <p>Thanks. I have your details and I'm already looking you up.</p>
        <ol>{DONE_STEPS.map((s) => <li key={s}>{s}</li>)}</ol>
        <button className="tlink" type="button" id="again" onClick={() => { setSent(false); setRound((r) => r + 1); }}>Send another business</button>
      </div>
    </>
  );
}

function AskJake({ say }: { say: (msg: string, quiet?: boolean) => void }) {
  const [copied, flash] = useCopied();
  return (
    <p className="ask-jake">
      Questions first? Write to <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
      <button className="copy" type="button" data-copy={EMAIL} data-copied={copied ? "" : undefined} aria-label={`Copy ${EMAIL}`} onClick={() => copyText(EMAIL, "Email address copied", say, flash)}>
        <span className="copied-swap" aria-hidden="true"><CopyIcon /><Check size={14} strokeWidth={3} /></span>
        <span className="copy-lbl" aria-hidden="true"><span>Copy</span><span>Copied</span></span>
      </button>
    </p>
  );
}

export function Concept({ live, search, say, ref }: { live: boolean; search: string; say: (msg: string, quiet?: boolean) => void; ref?: Ref<HTMLElement> }) {
  const card = useRef<HTMLDivElement>(null);
  const [sent, setSent] = useState(false);
  const fromEmail = new URLSearchParams(search).has("ref");
  if (fromEmail) {
    // They already have their homepage (it came in Jake's reply), so don't offer a second one.
    return (
      <section ref={ref} id="concept" className="sec closing" aria-labelledby="cta-h">
        <div className="wrap split">
          <div>
            <h2 className="t2" id="cta-h">Ready for the whole site?</h2>
            <p className="lead">The homepage I sent you is the start. Fill in one 10-minute form and I build every page. You see it finished before you pay anything.</p>
          </div>
          <div className="closing-act">
            <a className="btn btn-primary" href={`/start/${search}`} data-keep-ref="">Start my website <Arrow /></a>
            <AskJake say={say} />
          </div>
        </div>
      </section>
    );
  }
  return (
    <section ref={ref} id="concept" className="sec closing" aria-labelledby="cta-h">
      <div className="wrap split">
        <div>
          <h2 className="t2" id="cta-h">See your own homepage first.</h2>
          <p className="lead">{live
            ? "Tell me your website and where to send it. I'll email you your new homepage, built from your own photos, services and story."
            : "Tell me where to find you online. Your free homepage lands in your inbox within 48 hours."}</p>
          <p className="closing-note">Not for you? You'll never hear from me again.</p>
          <AskJake say={say} />
          <p className="closing-note">Already have one from me? <a href={`/start/${search}`} data-keep-ref="">Start your website</a>.</p>
        </div>
        <div className={["formcard", live && "live", sent && "sent"].filter(Boolean).join(" ")} id="formcard" ref={card}>
          {live ? <InstantForm /> : <ConceptRequest card={card} sent={sent} setSent={setSent} />}
        </div>
      </div>
    </section>
  );
}

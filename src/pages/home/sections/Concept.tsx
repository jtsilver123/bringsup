import { useCallback, useEffect, useRef, useState, type FormEvent, type Ref, type RefObject } from "react";
import { Arrow, Check } from "../../../components/icons.tsx";
import { TallyEmbed } from "../../../components/TallyEmbed.tsx";
import { TALLY } from "../../../lib/config.ts";
import { CTA_LIST, DONE_STEPS } from "../data.ts";
import { prefersReducedMotion } from "../hooks.ts";
import { CopyIcon } from "../icons.tsx";
import { Reveal } from "../Reveal.tsx";
import { copyText } from "../Toast.tsx";

const EMAIL = "jake@bringsup.com";
const REQUEST_FOOT = "We only use this to send your concept. Never shared, never sold.";

/**
 * The redesign tool's form. The backend runs in queue mode: the visitor's site and email go to /try/
 * through sessionStorage, and the new homepage is emailed within the hour.
 */
function InstantForm() {
  const urlInput = useRef<HTMLInputElement>(null);
  const emailInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const url = urlInput.current!.value.trim();
    const email = emailInput.current!.value.trim();
    setError("");
    if (!/[^\s.]+\.[a-z]{2,}/i.test(url)) {
      setError("Add your website address, like rosasbakery.com.");
      urlInput.current!.focus();
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setError("Add your email so we can follow up about your redesign.");
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

  return (
    <form id="instant" className="instant" noValidate onSubmit={onSubmit}>
      <label>Your website<input ref={urlInput} name="url" type="text" inputMode="url" autoComplete="url" autoCapitalize="off" spellCheck={false} placeholder="rosasbakery.com" required /></label>
      <label>Your email<input ref={emailInput} name="email" type="email" autoComplete="email" autoCapitalize="off" spellCheck={false} placeholder="you@rosasbakery.com" required /></label>
      <p className="instant-err" role="alert" hidden={!error}>{error}</p>
      <button className="btn btn-ink" type="submit">Redesign my website now <Arrow /></button>
      <p className="form-foot">We'll email your new homepage within the hour. Never shared, never sold.</p>
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
        fallback={<p className="form-foot"><a href={`https://tally.so/r/${TALLY.concept}`}>Open the request form</a> or email <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.</p>}
      />
      <p className="form-foot">{REQUEST_FOOT}</p>
      <div className="done" role="status" aria-live="polite" tabIndex={-1} ref={done}>
        <div className="tick"><Check size={32} /></div>
        <h3>Got it. It's on its way.</h3>
        <p>Thanks! We've got your details and we're already looking you up.</p>
        <ol>{DONE_STEPS.map((s) => <li key={s}>{s}</li>)}</ol>
        <div className="row">
          <button className="ghost" type="button" id="again" onClick={() => { setSent(false); setRound((r) => r + 1); }}>Send another business</button>
        </div>
      </div>
    </>
  );
}

export function Concept({ live, search, say, ref }: { live: boolean; search: string; say: (msg: string) => void; ref?: Ref<HTMLElement> }) {
  const card = useRef<HTMLDivElement>(null);
  const [sent, setSent] = useState(false);
  return (
    <section ref={ref} id="concept" className="cta" aria-labelledby="cta-h">
      <div className="cta-box">
        <Reveal>
          <p className="eyebrow">Free homepage concept</p>
          <h2 className="display" id="cta-h">{live ? "See your business, redone. Today." : "See your business, redone."}</h2>
          <p className="lead">{live
            ? "Paste your website and see your new homepage right here, built from your own photos, services and story."
            : "Tell us where to find you online. Your free homepage concept lands in your inbox within 48 hours."}</p>
          <ul className="cta-list">
            {CTA_LIST.map((c) => <li key={c}><Check size={20} />{c}</li>)}
          </ul>
          <p className="alt">
            Already have one from us? <a href={`/start/${search}`} data-keep-ref="">Start your website</a>, no call needed. Or write to <a href={`mailto:${EMAIL}`}>{EMAIL}</a>{" "}
            <button className="copy" type="button" data-copy={EMAIL} aria-label={`Copy ${EMAIL}`} onClick={() => copyText(EMAIL, "Email address copied", say)}><CopyIcon />Copy</button>
          </p>
        </Reveal>
        <div className={["formcard", live && "live", sent && "sent"].filter(Boolean).join(" ")} id="formcard" ref={card}>
          {live ? <InstantForm /> : <ConceptRequest card={card} sent={sent} setSent={setSent} />}
        </div>
      </div>
    </section>
  );
}

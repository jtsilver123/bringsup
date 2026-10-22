import { useEffect, useRef } from "react";

declare global {
  interface Window {
    Tally?: { loadEmbeds: () => void };
  }
}

const SCRIPT = "https://tally.so/widgets/embed.js";

/**
 * A Tally form embed. Tally's script sizes the iframe to its content and forwards page query
 * parameters (like ?ref=) to the form's hidden fields. onSubmit fires on Tally.FormSubmitted.
 */
export function TallyEmbed({ formId, title, height = 520, extra = "", lazy = false, onSubmit }: {
  formId: string;
  title: string;
  height?: number;
  /** Extra query string appended to the embed URL, e.g. "&source=website". */
  extra?: string;
  lazy?: boolean;
  onSubmit?: () => void;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const src = `https://tally.so/embed/${formId}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1${extra}`;

  useEffect(() => {
    const load = () => {
      if (window.Tally) window.Tally.loadEmbeds();
      else if (frame.current && !frame.current.src) frame.current.src = src;
    };
    if (window.Tally) return load();
    let script = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT}"]`);
    if (!script) {
      script = document.createElement("script");
      script.src = SCRIPT;
      script.async = true;
      document.body.appendChild(script);
    }
    script.addEventListener("load", load);
    script.addEventListener("error", load);
    return () => {
      script.removeEventListener("load", load);
      script.removeEventListener("error", load);
    };
  }, [src]);

  useEffect(() => {
    if (!onSubmit) return;
    const onMessage = (e: MessageEvent) => {
      if (typeof e.data === "string" && e.data.includes("Tally.FormSubmitted")) onSubmit();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [onSubmit]);

  return (
    <>
      <iframe
        ref={frame}
        id="tally"
        data-tally-src={src}
        loading={lazy ? "lazy" : "eager"}
        width="100%"
        height={height}
        frameBorder={0}
        marginHeight={0}
        marginWidth={0}
        title={title}
      />
      <noscript>
        <p className="foot"><a href={`https://tally.so/r/${formId}`}>Open the form</a></p>
      </noscript>
    </>
  );
}

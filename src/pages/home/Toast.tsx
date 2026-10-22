import { useCallback, useEffect, useRef, useState } from "react";
import { Check } from "../../components/icons.tsx";

/**
 * A small status toast. `say` shows a message for 2.6 seconds. With `quiet`, the message is only announced to
 * screen readers (for actions that already confirm themselves on screen, like a copy button's checkmark).
 */
export function useToast() {
  const [state, setState] = useState({ msg: "Copied", show: false });
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const say = useCallback((msg: string, quiet = false) => {
    clearTimeout(timer.current);
    if (quiet) return setState({ msg, show: false });
    setState({ msg, show: true });
    timer.current = setTimeout(() => setState((s) => ({ ...s, show: false })), 2600);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  return { ...state, say };
}

export function Toast({ msg, show }: { msg: string; show: boolean }) {
  return (
    <div className={show ? "toast show" : "toast"} id="toast" role="status" aria-live="polite">
      <Check size={18} /><span>{msg}</span>
    </div>
  );
}

/** A copy button's "Copied" moment: true for two seconds after `flash()`. */
export function useCopied(): [boolean, () => void] {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const flash = useCallback(() => {
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  return [copied, flash];
}

/**
 * Copy text to the clipboard, falling back to execCommand outside secure contexts. On success the button shows
 * its own checkmark (`onCopied`) and the message is announced quietly; a failure says how else to get it.
 */
export function copyText(text: string, msg: string, say: (msg: string, quiet?: boolean) => void, onCopied?: () => void): void {
  const ok = () => {
    onCopied?.();
    say(msg, Boolean(onCopied));
  };
  const fallback = () => {
    const t = document.createElement("textarea");
    t.value = text;
    t.setAttribute("readonly", "");
    t.style.position = "fixed";
    t.style.opacity = "0";
    document.body.appendChild(t);
    t.select();
    try {
      if (!document.execCommand("copy")) throw new Error("copy refused");
      ok();
    } catch {
      say("Couldn’t copy. Email jake@bringsup.com");
    }
    t.remove();
  };
  if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(ok, fallback);
  else fallback();
}

import { useCallback, useEffect, useRef, useState } from "react";
import { Check } from "../../components/icons.tsx";

/** A small status toast. `say` shows a message for 2.6 seconds. */
export function useToast() {
  const [state, setState] = useState({ msg: "Copied", show: false });
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const say = useCallback((msg: string) => {
    setState({ msg, show: true });
    clearTimeout(timer.current);
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

/** Copy text to the clipboard, falling back to execCommand outside secure contexts. */
export function copyText(text: string, msg: string, say: (msg: string) => void): void {
  const fallback = () => {
    const t = document.createElement("textarea");
    t.value = text;
    t.setAttribute("readonly", "");
    t.style.position = "fixed";
    t.style.opacity = "0";
    document.body.appendChild(t);
    t.select();
    try {
      document.execCommand("copy");
      say(msg);
    } catch {
      say("Couldn’t copy. Email jake@bringsup.com");
    }
    t.remove();
  };
  if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(() => say(msg), fallback);
  else fallback();
}

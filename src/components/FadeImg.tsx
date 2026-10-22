import { useEffect, useRef, useState, type ImgHTMLAttributes } from "react";

/**
 * An <img> that fades in once it has loaded instead of popping in. Give it width and height (or a sized box) so its
 * space is reserved. The server render and the no-JavaScript page show it normally: it's only hidden after hydration,
 * and only if it hasn't arrived yet. Styles: img.pending (hidden) and img.fade (the transition), in the page CSS.
 */
export function FadeImg(props: ImgHTMLAttributes<HTMLImageElement>) {
  const img = useRef<HTMLImageElement>(null);
  const [state, setState] = useState<"" | "pending" | "in">("");
  useEffect(() => {
    const el = img.current;
    if (!el || !props.src) return;
    if (el.complete && el.naturalWidth > 0) return setState("");
    setState("pending");
    const done = () => setState("in");
    el.addEventListener("load", done);
    el.addEventListener("error", done);
    return () => {
      el.removeEventListener("load", done);
      el.removeEventListener("error", done);
    };
  }, [props.src]);
  const cls = [props.className, state === "pending" && "fade pending", state === "in" && "fade"].filter(Boolean).join(" ");
  return <img ref={img} {...props} className={cls || undefined} />;
}

import { createElement, useEffect, useRef, useState, type HTMLAttributes } from "react";
import { hasIO, prefersReducedMotion } from "./hooks.ts";

type RevealProps = HTMLAttributes<HTMLElement> & { as?: "div" | "li" | "article" };

/**
 * Reveal on scroll: renders `.rv` and adds `.in` once the element scrolls into view. Siblings that
 * are also `.rv` stagger by 90ms each (up to four), the same as the original page.
 */
export function Reveal({ as = "div", className, style, ...rest }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);
  const [delay, setDelay] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!hasIO() || prefersReducedMotion()) {
      setShown(true);
      return;
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      const sibs = el.parentElement ? Array.from(el.parentElement.children).filter((c) => c.classList.contains("rv")) : [el];
      const d = Math.min(Math.max(sibs.indexOf(el), 0), 4) * 90;
      setDelay(d);
      setShown(true);
      timer = setTimeout(() => setDelay(null), d + 700);
    }, { rootMargin: "0px 0px -8% 0px" });
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(timer);
    };
  }, []);

  return createElement(as, {
    ...rest,
    ref,
    className: [className, "rv", shown && "in"].filter(Boolean).join(" "),
    style: delay === null ? style : { ...style, transitionDelay: `${delay}ms` },
  });
}

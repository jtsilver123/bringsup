import { useRef, type ReactNode } from "react";
import { useSeenOnce } from "./hooks.ts";

/** Five stars that light up one by one the first time they're seen. */
export function Stars() {
  const ref = useRef<HTMLSpanElement>(null);
  const lit = useSeenOnce(ref);
  return (
    <span ref={ref} className={lit ? "rate anim lit" : "rate anim"} aria-hidden="true">
      <i>★</i><i>★</i><i>★</i><i>★</i><i>★</i>
    </span>
  );
}

/** The lift: the Ember underline, drawn in the first time it's seen. */
export function Lift({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const drawn = useSeenOnce(ref);
  return (
    <span ref={ref} className={drawn ? "lift drawn" : "lift"}>
      {children}
      <svg viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true">
        <path pathLength={1} d="M4 16 C 70 11, 170 10, 250 12 C 268 12, 282 9, 296 3" />
      </svg>
    </span>
  );
}

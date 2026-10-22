import type { CSSProperties, ReactNode } from "react";

/** The lift: the hand-drawn Ember underline under the one phrase that carries the promise. */
export function Lift({ children, className = "lift", style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <span className={className} style={style}>
      {children}
      <svg viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true">
        <path d="M4 16 C 70 11, 170 10, 250 12 C 268 12, 282 9, 296 3" />
      </svg>
    </span>
  );
}

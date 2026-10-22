// Icons used only on the homepage. All are functional (they label a control), decorative to screen readers, and inherit currentColor.
import type { ReactNode } from "react";

function Stroke({ size, width = 2, children }: { size: number; width?: number; children: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

export const CloseIcon = () => <Stroke size={20} width={2.4}><path d="M6 6l12 12M18 6L6 18" /></Stroke>;
export const ExpandIcon = () => (
  <Stroke size={16} width={2.4}><path d="M15 3h6v6" /><path d="M9 21H3v-6" /><path d="M21 3l-7 7" /><path d="M3 21l7-7" /></Stroke>
);
export const CopyIcon = () => (
  <Stroke size={14} width={2.4}><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></Stroke>
);
export const KnobIcon = () => <Stroke size={20} width={2.6}><path d="M9 6l-6 6 6 6" /><path d="M15 6l6 6-6 6" /></Stroke>;

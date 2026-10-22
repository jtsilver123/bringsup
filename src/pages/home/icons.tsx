// Icons used only on the homepage. All are decorative and inherit currentColor.
import type { ReactNode } from "react";

function Stroke({ size, width = 2, join = true, children }: { size: number; width?: number; join?: boolean; children: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={width} strokeLinecap="round" strokeLinejoin={join ? "round" : undefined} aria-hidden="true">
      {children}
    </svg>
  );
}

export const MenuIcon = () => <Stroke size={20} width={2.4} join={false}><path d="M4 8h16M4 16h16" /></Stroke>;
export const CloseIcon = () => <Stroke size={20} width={2.4} join={false}><path d="M6 6l12 12M18 6L6 18" /></Stroke>;
export const PlusIcon = () => <Stroke size={16} width={2.6} join={false}><path d="M12 5v14M5 12h14" /></Stroke>;
export const ExpandIcon = () => (
  <Stroke size={16} width={2.4}><path d="M15 3h6v6" /><path d="M9 21H3v-6" /><path d="M21 3l-7 7" /><path d="M3 21l7-7" /></Stroke>
);
export const CopyIcon = () => (
  <Stroke size={14} width={2.4}><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></Stroke>
);
export const KnobIcon = () => <Stroke size={22} width={2.6}><path d="M9 6l-6 6 6 6" /><path d="M15 6l6 6-6 6" /></Stroke>;
export const BigArrow = () => <Stroke size={40}><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></Stroke>;

const STAR = "M12 3l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6L3.3 9.2l6.1-.6z";

/** Line icons for the pains and promises lists, keyed by name so the copy can stay as data. */
export const listIcons = {
  phone: (s: number) => <Stroke size={s}><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></Stroke>,
  clock: (s: number) => <Stroke size={s}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Stroke>,
  star: (s: number) => <Stroke size={s}><path d={STAR} /></Stroke>,
  mail: (s: number) => <Stroke size={s}><path d="M4 6h16v12H4z" /><path d="M4 7l8 6 8-6" /></Stroke>,
  dollar: (s: number) => <Stroke size={s}><path d="M12 2v20" /><path d="M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></Stroke>,
  lock: (s: number) => <Stroke size={s}><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></Stroke>,
} as const;

export type ListIcon = keyof typeof listIcons;

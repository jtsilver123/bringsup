// Shared inline icons. Stroke icons inherit currentColor.
const BUBBLE = "M14 4H34A10 10 0 0 1 44 14V30A10 10 0 0 1 34 40H21L10.6 46.6A1 1 0 0 1 9 45.8V39.3A10 10 0 0 1 4 30V14A10 10 0 0 1 14 4Z";

/** The BringsUp mark: a review bubble with an up arrow. Colors come from .bm-tile / .bm-arrow in page CSS. */
export function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 48 48" width={38} height={38} aria-hidden="true">
      <path className="bm-tile" d={BUBBLE} />
      <g className="bm-arrow" fill="none" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 31V13" />
        <path d="M16 21l8-8 8 8" />
      </g>
    </svg>
  );
}

export function Check({ size = 20, strokeWidth = 2.8 }: { size?: number; strokeWidth?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export function Arrow({ size = 18 }: { size?: number }) {
  return (
    <svg className="go" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

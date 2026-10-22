import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { FadeImg } from "../../components/FadeImg.tsx";
import { hasIO, prefersReducedMotion } from "./hooks.ts";
import { KnobIcon } from "./icons.tsx";
import "./beforeafter.css";

const clamp = (v: number) => Math.round(Math.max(0, Math.min(100, v)) * 10) / 10;

interface Shot { src: string; width: number; height: number; alt: string }
interface Props {
  /** The new site, on the left. */
  after?: Shot;
  /** The old site, on the right. */
  before?: Shot;
  labels?: [string, string];
  caption?: ReactNode;
  /** Whole-page pictures: the slider becomes a window you scroll up and down, both pages moving together. */
  scroll?: boolean;
}

const BAKERY: Required<Omit<Props, "scroll">> = {
  after: { src: "/assets/work/bakery-hero.jpg", width: 1664, height: 1040, alt: "The same bakery redesigned: a printed-menu look with a serif nameplate, a big photo of the bread, the hours, and an Order for pickup button." },
  before: { src: "/assets/work/bakery-before.jpg", width: 1664, height: 1040, alt: "An outdated bakery homepage: an old layout, a broken image, 'please call for hours' and no way to order online." },
  labels: ["After", "Before"],
  caption: "Drag the handle to compare. Marigold Bakery is made up and the photos are stock, so I can show the work without using anyone's real site.",
};

/**
 * Before/after slider: the new homepage on the left, the old one on the right. Drag anywhere on the
 * image, or use the arrow keys on the visually hidden range input (Shift moves further). A click or a
 * key press glides the handle to its new spot; a drag follows the pointer exactly, and the handle grows
 * while held. The first time it's seen it sways once to show it can be dragged (not with reduced motion).
 * With `scroll`, both pictures sit in one tall canvas inside a fixed-height window that scrolls, and the handle
 * stays put in the middle of the window. On touch, a swipe scrolls; only a touch near the line moves it.
 */
export function BeforeAfter(props: Props = {}) {
  const { after, before, labels, caption } = { ...BAKERY, ...props };
  const scroll = Boolean(props.scroll);
  // Heights as a multiple of the width; the canvas is as tall as the longer page.
  const afterTall = after.height / after.width, beforeTall = before.height / before.width;
  const canvas = Math.max(afterTall, beforeTall);
  const stage = useRef<HTMLDivElement>(null);
  const range = useRef<HTMLInputElement>(null);
  const touched = useRef(false);
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  /** Animate the next position change (a click or a key), not every pointer move. */
  const [glide, setGlide] = useState(false);

  const fromX = (x: number) => {
    const r = stage.current!.getBoundingClientRect();
    setPos(clamp(((x - r.left) / r.width) * 100));
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (scroll) {
      const r = stage.current!.getBoundingClientRect();
      const bar = e.currentTarget.querySelector(".ba-scroll");
      // Leave the scrollbar to the scroller, and swipes too: only a touch within reach of the line grabs it.
      if (bar && e.clientX > r.left + bar.clientWidth) return;
      if (e.pointerType !== "mouse" && Math.abs(e.clientX - (r.left + (r.width * pos) / 100)) > 32) return;
    }
    e.preventDefault();
    touched.current = true;
    setDragging(true);
    setGlide(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    fromX(e.clientX);
    range.current?.focus({ preventScroll: true });
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setGlide(false);
    fromX(e.clientX);
  };
  const stop = () => setDragging(false);
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    touched.current = true;
    setGlide(true);
    // Shift + arrow moves a tenth of the way, for people who'd rather not press twenty times.
    if (e.shiftKey && (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "ArrowUp" || e.key === "ArrowDown")) {
      e.preventDefault();
      setPos((p) => clamp(p + (e.key === "ArrowLeft" || e.key === "ArrowDown" ? -10 : 10)));
    }
  };

  // A one-time sway when the slider first comes into view, unless the visitor already used it.
  useEffect(() => {
    const el = stage.current;
    if (!el || !hasIO() || prefersReducedMotion()) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let frame = 0;
    const io = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting) return;
      io.disconnect();
      let t0: number | null = null;
      const step = (t: number) => {
        if (touched.current) return;
        if (t0 === null) t0 = t;
        const k = (t - t0) / 1600;
        if (k >= 1) {
          setPos(50);
          return;
        }
        setPos(clamp(50 + 16 * Math.sin(k * Math.PI * 2) * (1 - k * 0.3)));
        frame = requestAnimationFrame(step);
      };
      timer = setTimeout(() => {
        frame = requestAnimationFrame(step);
      }, 700);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <figure className="ba">
      <div className="ba-labels" aria-hidden="true"><span>{labels[0]}</span><span>{labels[1]}</span></div>
      <div
        ref={stage}
        className={["ba-stage", scroll && "tall", dragging && "dragging", glide && "glide"].filter(Boolean).join(" ")}
        // Custom shots set their own shape through --ba-ratio; the homepage keeps its CSS ratios (16:9, 4:3 on phones).
        style={{ "--pos": `${pos}%`, ...(props.after && !scroll ? { "--ba-ratio": `${after.width} / ${after.height}` } : {}) } as CSSProperties}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stop}
        onPointerCancel={stop}
      >
        {scroll ? (
          <div className="ba-scroll" tabIndex={0} aria-label="Scroll to see the whole page">
            {/* One canvas as tall as the longer page, so both pictures scroll together. */}
            <div className="ba-canvas" style={{ aspectRatio: `1 / ${canvas}` }}>
              <FadeImg className="ba-old" src={before.src} width={before.width} height={before.height} alt={before.alt} />
              <FadeImg className="ba-after" src={after.src} width={after.width} height={after.height} fetchPriority="high" alt={after.alt} />
              {/* Their page today often stops partway down; say so instead of leaving a blank strip. */}
              {beforeTall < canvas - 0.01 && <span className="ba-end" style={{ top: `${(beforeTall / canvas) * 100}%` }}>End of page</span>}
            </div>
          </div>
        ) : (
          <>
            <FadeImg className="ba-old" src={before.src} width={before.width} height={before.height} alt={before.alt} />
            <FadeImg className="ba-after" src={after.src} width={after.width} height={after.height} fetchPriority="high" alt={after.alt} />
          </>
        )}
        <input
          ref={range}
          className="ba-range"
          type="range"
          min={0}
          max={100}
          step={1}
          value={pos}
          aria-label={`Compare the homepages: "${labels[0]}" on the left, "${labels[1]}" on the right. Higher shows more of "${labels[0]}".`}
          onKeyDown={onKeyDown}
          onChange={(e) => {
            touched.current = true;
            setPos(clamp(Number(e.currentTarget.value)));
          }}
        />
        <span className="ba-line" aria-hidden="true"></span>
        <span className="ba-knob" aria-hidden="true"><KnobIcon /></span>
      </div>
      {caption && <figcaption className="small">{caption}</figcaption>}
    </figure>
  );
}

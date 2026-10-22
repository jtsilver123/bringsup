import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { hasIO, prefersReducedMotion } from "./hooks.ts";
import { KnobIcon } from "./icons.tsx";

const clamp = (v: number) => Math.round(Math.max(0, Math.min(100, v)) * 10) / 10;

/**
 * Before/after slider. Drag anywhere on the image, or use the arrow keys on the visually hidden
 * range input. The first time it's seen it sways once to show it can be dragged.
 */
export function BeforeAfter() {
  const stage = useRef<HTMLDivElement>(null);
  const range = useRef<HTMLInputElement>(null);
  const touched = useRef(false);
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [used, setUsed] = useState(false);

  const markUsed = () => {
    touched.current = true;
    setUsed(true);
  };
  const fromX = (x: number) => {
    const r = stage.current!.getBoundingClientRect();
    setPos(clamp(((x - r.left) / r.width) * 100));
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    markUsed();
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    fromX(e.clientX);
    range.current?.focus({ preventScroll: true });
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging) fromX(e.clientX);
  };
  const stop = () => setDragging(false);

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
        const k = (t - t0) / 1800;
        if (k >= 1) {
          setPos(50);
          return;
        }
        setPos(clamp(50 + 22 * Math.sin(k * Math.PI * 2) * (1 - k * 0.3)));
        frame = requestAnimationFrame(step);
      };
      timer = setTimeout(() => {
        frame = requestAnimationFrame(step);
      }, 900);
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
      <div className="ba-frame">
        <div className="ba-bar">
          <i></i><i></i><i></i>
          <span className="ba-url">marigoldbakery.example</span>
          <span className="ba-legend"><b className="a">After</b><b className="b">Before</b></span>
        </div>
        <div
          ref={stage}
          className={["ba-stage", used && "used", dragging && "dragging"].filter(Boolean).join(" ")}
          id="ba"
          style={{ "--pos": `${pos}%` } as CSSProperties}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={stop}
          onPointerCancel={stop}
        >
          <img src="/assets/work/bakery-before.jpg" width={1664} height={1040} alt="An outdated bakery homepage: a 2009 layout, a broken image, 'please call for hours' and no way to order online." />
          <img className="ba-after" src="/assets/work/bakery-hero.jpg" width={1664} height={1040} fetchPriority="high" alt="The same bakery redesigned: a full-width photo, 4.9 stars from 412 Google reviews up top, and an Order for pickup button." />
          <input
            ref={range}
            className="ba-range"
            type="range"
            min={0}
            max={100}
            step={1}
            value={pos}
            aria-label="Compare the new and old homepage. Higher shows more of the new site."
            onChange={(e) => {
              markUsed();
              setPos(clamp(Number(e.currentTarget.value)));
            }}
          />
          <span className="ba-line" aria-hidden="true"></span>
          <span className="ba-knob" aria-hidden="true"><KnobIcon /></span>
          <span className="ba-hint" aria-hidden="true">Drag to compare</span>
        </div>
      </div>
      <figcaption className="ba-note">A sample concept for a fictional bakery, made exactly the way we'd make yours.</figcaption>
    </figure>
  );
}

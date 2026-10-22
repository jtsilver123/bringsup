import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { FadeImg } from "../../components/FadeImg.tsx";
import { hasIO, prefersReducedMotion } from "./hooks.ts";
import { KnobIcon } from "./icons.tsx";

const clamp = (v: number) => Math.round(Math.max(0, Math.min(100, v)) * 10) / 10;

/**
 * Before/after slider: the new homepage on the left, the old one on the right. Drag anywhere on the
 * image, or use the arrow keys on the visually hidden range input (Shift moves further). A click or a
 * key press glides the handle to its new spot; a drag follows the pointer exactly, and the handle grows
 * while held. The first time it's seen it sways once to show it can be dragged (not with reduced motion).
 */
export function BeforeAfter() {
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
      <div className="ba-labels" aria-hidden="true"><span>After</span><span>Before</span></div>
      <div
        ref={stage}
        className={["ba-stage", dragging && "dragging", glide && "glide"].filter(Boolean).join(" ")}
        style={{ "--pos": `${pos}%` } as CSSProperties}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stop}
        onPointerCancel={stop}
      >
        <FadeImg className="ba-old" src="/assets/work/bakery-before.jpg" width={1664} height={1040} alt="An outdated bakery homepage: an old layout, a broken image, 'please call for hours' and no way to order online." />
        <FadeImg className="ba-after" src="/assets/work/bakery-hero.jpg" width={1664} height={1040} fetchPriority="high" alt="The same bakery redesigned: a printed-menu look with a serif nameplate, a big photo of the bread, the hours, and an Order for pickup button." />
        <input
          ref={range}
          className="ba-range"
          type="range"
          min={0}
          max={100}
          step={1}
          value={pos}
          aria-label="Compare the new homepage, on the left, with the old one, on the right. Higher shows more of the new site."
          onKeyDown={onKeyDown}
          onChange={(e) => {
            touched.current = true;
            setPos(clamp(Number(e.currentTarget.value)));
          }}
        />
        <span className="ba-line" aria-hidden="true"></span>
        <span className="ba-knob" aria-hidden="true"><KnobIcon /></span>
      </div>
      <figcaption className="small">Drag the handle to compare. Marigold Bakery is made up and the photos are stock, so I can show the work without using anyone's real site.</figcaption>
    </figure>
  );
}

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { FadeImg } from "../../../components/FadeImg.tsx";
import { WORK, type WorkSample } from "../data.ts";
import { ExpandIcon } from "../icons.tsx";

type Open = (src: string, name: string) => void;

/** One sample: the full-page shot scrolls by exactly its overflow on hover, and opens in the viewer. */
function Shot({ work, onOpen }: { work: WorkSample; onOpen: Open }) {
  const view = useRef<HTMLDivElement>(null);
  const [h, setH] = useState<number | null>(null);
  const full = `/assets/work/${work.slug}-full.jpg`;
  // The viewer opens it big, so it gets the double-resolution file (sharp on phones and Retina screens).
  const sharp = `/assets/work/${work.slug}-full@2x.webp`;
  const open = () => onOpen(sharp, work.name);

  useEffect(() => {
    const el = view.current;
    if (!el) return;
    const size = () => setH(el.clientHeight);
    size();
    window.addEventListener("resize", size);
    window.addEventListener("load", size);
    return () => {
      window.removeEventListener("resize", size);
      window.removeEventListener("load", size);
    };
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open();
    }
  };

  return (
    <article className="shot">
      <div
        ref={view}
        className="shot-view"
        tabIndex={0}
        role="button"
        aria-label={`Open the full homepage for ${work.name}`}
        style={h === null ? undefined : ({ "--h": `${h}px` } as CSSProperties)}
        onClick={open}
        onKeyDown={onKeyDown}
      >
        <FadeImg className="full" src={full} width={1200} height={work.height} loading="lazy" alt="" />
        <FadeImg className="phone" src={`/assets/work/${work.slug}-phone.jpg`} width={390} height={844} loading="lazy" alt="" />
      </div>
      <h3>{work.name}</h3>
      <p className="k">{work.kind}</p>
      <p>{work.text}</p>
      <button className="tlink view" type="button" onClick={open}>View the full homepage <ExpandIcon /></button>
    </article>
  );
}

export function Work({ onOpen }: { onOpen: Open }) {
  return (
    <section id="work" className="sec" aria-labelledby="work-h">
      <div className="wrap">
        <div className="sec-head">
          <h2 className="t2" id="work-h">Each one is made for <span className="key">one business</span>.</h2>
          <p>Their colors, their photos, their reviews, and the one button their customers need most. These businesses are made up and the photos are stock. Yours would use your real name, details and reviews.</p>
        </div>
        <div className="work">
          {WORK.map((w) => <Shot key={w.slug} work={w} onOpen={onOpen} />)}
        </div>
      </div>
    </section>
  );
}

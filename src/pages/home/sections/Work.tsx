import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { WORK, type WorkSample } from "../data.ts";
import { ExpandIcon } from "../icons.tsx";
import { Reveal } from "../Reveal.tsx";

type Open = (src: string, name: string) => void;

/** One sample: the full-page shot scrolls by exactly its overflow on hover, and opens in the viewer. */
function Shot({ work, onOpen }: { work: WorkSample; onOpen: Open }) {
  const view = useRef<HTMLDivElement>(null);
  const [h, setH] = useState<number | null>(null);
  const full = `/assets/work/${work.slug}-full.jpg`;
  const open = () => onOpen(full, work.name);

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
    <Reveal as="article" className="shot">
      <div
        ref={view}
        className="shot-view"
        tabIndex={0}
        role="button"
        data-src={full}
        data-name={work.name}
        aria-label={`Open the full homepage concept for ${work.ariaName}`}
        style={h === null ? undefined : ({ "--h": `${h}px` } as CSSProperties)}
        onClick={open}
        onKeyDown={onKeyDown}
      >
        <img className="full" src={full} width={1200} height={work.height} loading="lazy" alt="" />
        <img className="phone" src={`/assets/work/${work.slug}-phone.jpg`} width={390} height={844} loading="lazy" alt="" />
      </div>
      <div className="shot-meta">
        <p className="k">{work.kind}</p>
        <h3>{work.name}</h3>
        <p>{work.text}</p>
        <button className="view" type="button" data-src={full} data-name={work.name} onClick={open}>View the full homepage <ExpandIcon /></button>
      </div>
    </Reveal>
  );
}

export function Work({ onOpen }: { onOpen: Open }) {
  return (
    <section id="work" className="sand" aria-labelledby="work-h">
      <div className="wrap pad">
        <Reveal className="sec-head">
          <div>
            <p className="eyebrow">Sample work</p>
            <h2 className="display h2" id="work-h">Every business gets its own look. Not a template with your name on it.</h2>
          </div>
          <p className="lead">Your colors, your photos, your real reviews, and the one button your customers need most.</p>
        </Reveal>
        <div className="work">
          {WORK.map((w) => <Shot key={w.slug} work={w} onOpen={onOpen} />)}
        </div>
        <p className="work-note">These businesses are fictional, made to show our process, with stock photos. Your concept uses your real name, details and reviews.</p>
      </div>
    </section>
  );
}

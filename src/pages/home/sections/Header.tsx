import { useEffect, useRef, useState } from "react";
import { BrandMark } from "../../../components/icons.tsx";
import { NAV } from "../data.ts";

/** Sticky header (its button starts the site for ?ref= visitors): marks the section you're reading, and on phones opens a short menu under the bar. */
export function Header({ active, start }: { active: string; start?: string }) {
  const [open, setOpen] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);

  const head = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    firstLink.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      menuBtn.current?.focus();
    };
    // A tap anywhere outside the header closes the menu, like a sheet of paper you set down.
    const onDown = (e: PointerEvent) => {
      if (head.current && !head.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <header ref={head} className={open ? "site-head open" : "site-head"} id="top">
      <div className="wrap">
        <a className="brand" href="#top" aria-label="BringsUp home"><BrandMark /><span>BringsUp</span></a>
        <nav className="site-nav" aria-label="Main">
          {NAV.map((l) => (
            <a key={l.href} className="plain" aria-current={active === l.href.slice(1) ? "true" : undefined} href={l.href}>{l.label}</a>
          ))}
          {start
            ? <a className="btn btn-ink btn-sm" href={start}>Start my website</a>
            : <a className="btn btn-ink btn-sm" href="#concept">Free homepage</a>}
          <button ref={menuBtn} className="menu-btn" type="button" aria-expanded={open} aria-controls="sheet" onClick={() => setOpen((o) => !o)}>
            <span className="mb-icon" aria-hidden="true"><i></i><i></i></span><span className="mb-lbl">{open ? "Close" : "Menu"}</span>
          </button>
        </nav>
      </div>
      <nav className="sheet" id="sheet" aria-label="Menu" inert={!open}>
        <div className="wrap">
          {NAV.map((l, i) => (
            <a key={l.href} ref={i === 0 ? firstLink : undefined} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
          ))}
        </div>
      </nav>
    </header>
  );
}

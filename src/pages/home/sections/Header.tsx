import { useEffect, useRef, useState } from "react";
import { BrandMark } from "../../../components/icons.tsx";
import { NAV } from "../data.ts";

/** Sticky header (its button starts the site for ?ref= visitors): marks the section you're reading, and on phones opens a short menu under the bar. */
export function Header({ active, start }: { active: string; start?: string }) {
  const [open, setOpen] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;
    firstLink.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      menuBtn.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={open ? "site-head open" : "site-head"} id="top">
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
            {open ? "Close" : "Menu"}
          </button>
        </nav>
      </div>
      <nav className="sheet" id="sheet" aria-label="Menu" hidden={!open}>
        <div className="wrap">
          {NAV.map((l, i) => (
            <a key={l.href} ref={i === 0 ? firstLink : undefined} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
          ))}
        </div>
      </nav>
    </header>
  );
}

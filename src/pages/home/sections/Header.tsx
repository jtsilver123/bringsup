import { useEffect, useRef, useState } from "react";
import { BrandMark } from "../../../components/icons.tsx";
import { NAV } from "../data.ts";
import { CloseIcon, MenuIcon } from "../icons.tsx";
import { prefersReducedMotion } from "../hooks.ts";

/** Sticky header: condenses once you scroll, marks the section you're reading, and opens the mobile menu sheet. */
export function Header({ active }: { active: string }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The sheet is mounted (open) before it animates in (show), and animates out before it unmounts.
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const openSheet = () => {
    clearTimeout(closeTimer.current);
    setOpen(true);
    setExpanded(true);
  };
  const closeSheet = () => {
    setShow(false);
    setExpanded(false);
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), prefersReducedMotion() ? 0 : 260);
  };

  useEffect(() => {
    if (!open || !expanded) return;
    firstLink.current?.focus();
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setShow(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [open, expanded]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      closeSheet();
      menuBtn.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  return (
    <>
      <header className={scrolled ? "site-head scrolled" : "site-head"} id="top">
        <div className="wrap">
          <a className="brand" href="#top" aria-label="BringsUp home">
            <BrandMark />
            <span className="brand-name">BringsUp</span>
          </a>
          <nav className="site-nav" aria-label="Main">
            {NAV.map((l) => (
              <a key={l.href} className={active === l.href.slice(1) ? "plain active" : "plain"} href={l.href}>{l.label}</a>
            ))}
            <a className="btn btn-ink btn-sm" href="#concept"><span className="hide-sm">Get a free concept</span><span className="show-sm">Free concept</span></a>
            <button ref={menuBtn} className="menu-btn" type="button" aria-label="Open menu" aria-expanded={expanded} aria-controls="sheet" onClick={openSheet}>
              <MenuIcon />
            </button>
          </nav>
        </div>
      </header>

      <div className={["sheet", open && "open", show && "show"].filter(Boolean).join(" ")} id="sheet" role="dialog" aria-modal="true" aria-label="Menu">
        <div className="sheet-bg" onClick={closeSheet}></div>
        <div className="sheet-panel">
          <div className="sheet-top">
            <span className="brand"><BrandMark /><span className="brand-name">BringsUp</span></span>
            <button className="menu-btn" type="button" aria-label="Close menu" onClick={closeSheet}><CloseIcon /></button>
          </div>
          {NAV.map((l, i) => (
            <a key={l.href} ref={i === 0 ? firstLink : undefined} className="plain" href={l.href} onClick={closeSheet}>
              {l.sheetLabel} <span aria-hidden="true">→</span>
            </a>
          ))}
          <a className="btn btn-ember" href="#concept" onClick={closeSheet}>Get my free concept</a>
        </div>
      </div>
    </>
  );
}

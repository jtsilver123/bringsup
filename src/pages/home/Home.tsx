import { useEffect, useRef, useState, type RefObject } from "react";
import { Arrow } from "../../components/icons.tsx";
import { REDESIGN_API } from "../../lib/config.ts";
import { hasIO, useSearch } from "./hooks.ts";
import { Concept } from "./sections/Concept.tsx";
import { Faq } from "./sections/Faq.tsx";
import { Fixes } from "./sections/Fixes.tsx";
import { Footer } from "./sections/Footer.tsx";
import { Header } from "./sections/Header.tsx";
import { Hero } from "./sections/Hero.tsx";
import { Letter } from "./sections/Letter.tsx";
import { Offer } from "./sections/Offer.tsx";
import { Work } from "./sections/Work.tsx";
import { Toast, useToast } from "./Toast.tsx";
import { WorkViewer, type WorkViewerHandle } from "./WorkViewer.tsx";
import "../../components/site.css";
import "./home.css";

/** With the redesign backend configured, the page points at the redesign tool instead of the hand-made concept form. */
const LIVE = REDESIGN_API.length > 0;

/** The id of the section in the middle of the screen, for the nav. */
function useScrollspy(main: RefObject<HTMLElement | null>): string {
  const [active, setActive] = useState("");
  useEffect(() => {
    const el = main.current;
    if (!el || !hasIO()) return;
    const spy = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
    }, { rootMargin: "-45% 0px -50% 0px" });
    el.querySelectorAll(":scope > section").forEach((s) => spy.observe(s));
    return () => spy.disconnect();
  }, [main]);
  return active;
}

export function Home() {
  const main = useRef<HTMLElement>(null);
  const viewer = useRef<WorkViewerHandle>(null);
  const active = useScrollspy(main);
  const search = useSearch();
  const toast = useToast();
  const fromEmail = new URLSearchParams(search).has("ref");
  const startHref = `/start/${search}`;

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      {fromEmail && (
        <div className="welcome on-dark" role="region" aria-label="Welcome">
          <div className="wrap"><span>The homepage in Jake's email was made just for you, free. Like it?</span><a href={startHref}>Start my website <Arrow size={16} /></a></div>
        </div>
      )}
      <Header active={active} start={fromEmail ? startHref : undefined} />
      <main id="main" ref={main}>
        <Hero live={LIVE} start={fromEmail ? startHref : undefined} />
        <Letter />
        <Work onOpen={(src, name, height) => viewer.current?.open(src, name, height)} />
        <Fixes />
        <Offer />
        <Faq />
        <Concept live={LIVE} search={search} say={toast.say} />
      </main>
      <WorkViewer ref={viewer} />
      <Toast msg={toast.msg} show={toast.show} />
      <Footer />
    </>
  );
}

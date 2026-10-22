import { useEffect, useRef, useState, type RefObject } from "react";
import { Arrow } from "../../components/icons.tsx";
import { REDESIGN_API } from "../../lib/config.ts";
import { hasIO, useSearch } from "./hooks.ts";
import { About } from "./sections/About.tsx";
import { Concept } from "./sections/Concept.tsx";
import { Facts } from "./sections/Facts.tsx";
import { Faq } from "./sections/Faq.tsx";
import { Footer } from "./sections/Footer.tsx";
import { Header } from "./sections/Header.tsx";
import { Hero } from "./sections/Hero.tsx";
import { HowItWorks } from "./sections/HowItWorks.tsx";
import { Inbox } from "./sections/Inbox.tsx";
import { Pricing } from "./sections/Pricing.tsx";
import { Problem } from "./sections/Problem.tsx";
import { Work } from "./sections/Work.tsx";
import { Toast, useToast } from "./Toast.tsx";
import { WorkViewer, type WorkViewerHandle } from "./WorkViewer.tsx";
import "./home.css";

/** With the redesign backend configured, the page points at the redesign tool instead of the hand-made concept form. */
const LIVE = REDESIGN_API.length > 0;

type ElRef = RefObject<HTMLElement | null>;

/** The id of the section in the middle of the screen, for the nav's active dot. */
function useScrollspy(main: ElRef): string {
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

/** Mobile CTA bar: shows once the hero has scrolled away, hides while the form is on screen. */
function MobileCta({ hero, concept }: { hero: ElRef; concept: ElRef }) {
  const [pastHero, setPastHero] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  useEffect(() => {
    if (!hasIO() || !hero.current || !concept.current) return;
    const a = new IntersectionObserver((en) => setPastHero(!en[0]!.isIntersecting));
    const b = new IntersectionObserver((en) => setFormVisible(en[0]!.isIntersecting));
    a.observe(hero.current);
    b.observe(concept.current);
    return () => {
      a.disconnect();
      b.disconnect();
    };
  }, [hero, concept]);
  return (
    <div className={pastHero && !formVisible ? "mcta show" : "mcta"} id="mcta">
      <span>Free homepage concept</span><a className="btn btn-glow" href="#concept">Get mine</a>
    </div>
  );
}

export function Home() {
  const main = useRef<HTMLElement>(null);
  const hero = useRef<HTMLElement>(null);
  const concept = useRef<HTMLElement>(null);
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
        <div className="welcome" role="region" aria-label="Welcome">
          <div className="wrap"><span>Welcome. The homepage concept Jake sent you was made for you, free.</span><a href={startHref}>Start my website <Arrow size={16} /></a></div>
        </div>
      )}
      <Header active={active} />
      <main id="main" ref={main}>
        <Hero live={LIVE} start={fromEmail ? startHref : undefined} ref={hero} />
        <Facts />
        <Inbox search={search} />
        <Problem />
        <Work onOpen={(src, name) => viewer.current?.open(src, name)} />
        <HowItWorks />
        <Pricing />
        <About />
        <Faq />
        <Concept live={LIVE} search={search} say={toast.say} ref={concept} />
      </main>
      <WorkViewer ref={viewer} />
      <MobileCta hero={hero} concept={concept} />
      <Toast msg={toast.msg} show={toast.show} />
      <Footer />
    </>
  );
}

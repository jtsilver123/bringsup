import type { Ref } from "react";
import { Arrow, Check } from "../../../components/icons.tsx";
import { BeforeAfter } from "../BeforeAfter.tsx";
import { Lift, Stars } from "../bits.tsx";
import { HERO_CHECKS } from "../data.ts";

/** Hero. With the redesign tool on (live), the main button goes straight to /try/. */
/** `start` is set for owners arriving from an outreach email (?ref=): they already have a concept, so the main button starts their site. */
export function Hero({ live, start, ref }: { live: boolean; start?: string; ref?: Ref<HTMLElement> }) {
  return (
    <section ref={ref} className="wrap hero">
      <div>
        <p className="pill"><Stars />For family businesses<span className="hide-sm">{" "}with great reviews</span></p>
        <h1 className="display">Your reviews say you're the best in town. <em>Your website <Lift>should too.</Lift></em></h1>
        <p className="lead">{start ? "We've already made your new homepage. Like it?" : "See your new homepage free. Like it?"} We build the whole site and refresh your brand for a flat <strong>$1,000</strong>, paid only when you approve it.</p>
        <div className="ctas">
          {start
            ? <a className="btn btn-ember" href={start}>Start my website <Arrow /></a>
            : live
            ? <a className="btn btn-ember" href="/try/">See my new homepage, free <Arrow /></a>
            : <a className="btn btn-ember" href="#concept">Get my free concept <Arrow /></a>}
          <a className="btn btn-outline" href="#work">See sample work</a>
        </div>
        <ul className="checks">
          {HERO_CHECKS.map((c) => <li key={c}><Check size={18} />{c}</li>)}
        </ul>
      </div>
      <BeforeAfter />
    </section>
  );
}

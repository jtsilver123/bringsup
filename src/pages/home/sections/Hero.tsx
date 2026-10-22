import { Arrow } from "../../../components/icons.tsx";
import { BeforeAfter } from "../BeforeAfter.tsx";

/**
 * Hero: the promise, who's making it, one action, then the proof (the before/after).
 * With the redesign tool on (live), the main button goes straight to /try/. `start` is set for owners
 * arriving from an outreach reply (?ref=): they already have a homepage, so the button starts their site.
 */
export function Hero({ live, start }: { live: boolean; start?: string }) {
  return (
    <section className="hero" aria-labelledby="hero-h">
      <div className="wrap">
        <h1 className="t1" id="hero-h">Your reviews say you're <span className="key">the best in town</span>. Your website <span className="key">should&nbsp;too</span>.</h1>
        <div className="hero-sub">
          <p className="lead">
            {start
              ? <>I'm Jake Silver, and I've already made your new homepage. If you like it, I'll build the whole site for a flat $1,000, and you pay only once it's finished and you've approved it.</>
              : <>I'm Jake Silver. I make websites for family-owned businesses whose customers already love them. I'll make your new homepage first, for free. If you want the whole site, it's a flat $1,000, paid only once it's finished and you've approved it.</>}
          </p>
          <div className="hero-act">
            {start
              ? <a className="btn btn-primary" href={start}>Start my website <Arrow /></a>
              : live
              ? <a className="btn btn-primary" href="/try/">See my new homepage, free <Arrow /></a>
              : <a className="btn btn-primary" href="#concept">Get my free homepage <Arrow /></a>}
            <p className="small">No calls. Everything happens by email.</p>
          </div>
        </div>
        <BeforeAfter />
      </div>
    </section>
  );
}

import { EMAIL, useYear } from "../../../components/Chrome.tsx";
import { BrandMark } from "../../../components/icons.tsx";
import { NAV } from "../data.ts";

export function Footer() {
  const year = useYear();
  return (
    <footer className="site-foot">
      <div className="wrap">
        <div className="foot-top">
          <div>
            <a className="brand" href="#top" aria-label="BringsUp, back to top"><BrandMark /><span>BringsUp</span></a>
            <p className="foot-tag">Websites as good as your reviews. Made in New York City.</p>
          </div>
          <nav className="foot-links" aria-label="Footer">
            {NAV.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            <a href="/terms/">Terms</a>
            <a href="/privacy/">Privacy</a>
          </nav>
        </div>
        <p className="foot-bot">© <span id="yr">{year}</span> BringsUp, 109 Saint Marks Place, New York, NY 10009. Homepages I send are ideas, not live sites, and aren't affiliated with the businesses shown.</p>
      </div>
    </footer>
  );
}

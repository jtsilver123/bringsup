import { useEffect, useState } from "react";
import { BrandMark } from "../../../components/icons.tsx";

export function Footer() {
  // The build year is rendered on the server; the visitor's clock takes over after hydration.
  const [year, setYear] = useState(2026);
  useEffect(() => setYear(new Date().getFullYear()), []);
  return (
    <footer>
      <div className="wrap">
        <div className="foot-top">
          <div>
            <a className="brand" href="#top" aria-label="BringsUp, back to top">
              <BrandMark />
              <span className="brand-name">BringsUp</span>
            </a>
            <p className="foot-tag">Websites as good as <span>your reviews.</span></p>
          </div>
          <div className="foot-links">
            <div><b>Site</b><a href="#work">Sample work</a><a href="#how">How it works</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a></div>
            <div><b>Contact</b><a href="mailto:hello@bringsup.com">hello@bringsup.com</a><a href="mailto:jake@bringsup.com">jake@bringsup.com</a><a href="#concept">Get a free concept</a></div>
            <div><b>Legal</b><a href="/terms/">Terms of Service</a><a href="/privacy/">Privacy Policy</a></div>
          </div>
        </div>
        <div className="foot-bot">
          <span>© <span id="yr">{year}</span> BringsUp · For the businesses your town already loves.</span>
          <span>Concepts we send are ideas, not live sites, and aren't affiliated with the businesses shown.</span>
        </div>
      </div>
    </footer>
  );
}

import { useEffect, useState, type ReactNode } from "react";
import { BrandMark } from "./icons.tsx";

export const EMAIL = "jake@bringsup.com";

/** The build year on the server, the visitor's year after hydration. */
export function useYear(): number {
  const [year, setYear] = useState(2026);
  useEffect(() => setYear(new Date().getFullYear()), []);
  return year;
}

/** The slim header on every page but the homepage: the lockup, and either a nav or the help address. */
export function SubHeader({ children }: { children?: ReactNode }) {
  return (
    <header className="sub-head">
      <div className="wrap">
        <a className="brand" href="/" aria-label="BringsUp home"><BrandMark /><span>BringsUp</span></a>
        {children ?? <span className="help"><span className="lbl">Questions? </span><a href={`mailto:${EMAIL}`}>{EMAIL}</a></span>}
      </div>
    </header>
  );
}

/** The footer on every page but the homepage. `note` replaces the default line on the right. */
export function SubFooter({ note }: { note?: ReactNode }) {
  const year = useYear();
  return (
    <footer className="sub-foot">
      <div className="wrap">
        <span>© {year} BringsUp · 2195 Kipling Lane, Highland Park, IL 60035</span>
        <span>{note}{note ? " " : ""}<a href="/terms/">Terms</a> · <a href="/privacy/">Privacy</a> · <a href={`mailto:${EMAIL}`}>{EMAIL}</a></span>
      </div>
    </footer>
  );
}

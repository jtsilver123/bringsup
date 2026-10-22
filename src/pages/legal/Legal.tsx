import { BrandMark, Check } from "../../components/icons.tsx";
import { PRIVACY, TERMS, UPDATED } from "./content.tsx";
import "./legal.css";

export type LegalKind = "terms" | "privacy";

const anchor = (title: string) => title.toLowerCase().replace(/'/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** /terms and /privacy: a sticky table of contents, the short version, then each section. */
export function Legal({ kind }: { kind: LegalKind }) {
  const doc = kind === "terms" ? TERMS : PRIVACY;
  return (
    <>
      <header>
        <div className="wrap">
          <a className="brand" href="/" aria-label="BringsUp home"><BrandMark /><span>BringsUp</span></a>
          <nav aria-label="Legal">
            <a href="/terms/" aria-current={kind === "terms" ? "page" : undefined}>Terms</a>
            <a href="/privacy/" aria-current={kind === "privacy" ? "page" : undefined}>Privacy</a>
          </nav>
        </div>
      </header>
      <main>
        <div className="wrap">
          <nav className="toc" aria-label="On this page">
            {doc.sections.map((s) => <a key={s.title} href={`#${anchor(s.title)}`}>{s.title}</a>)}
          </nav>
          <article>
            <p className="eyebrow">The fine print, in plain English</p>
            <h1>{doc.title}</h1>
            <p className="updated">Last updated {UPDATED}</p>
            <div className="short">
              <b>The short version</b>
              <ul>{doc.summary.map((s) => <li key={s}><Check size={18} /><span>{s}</span></li>)}</ul>
            </div>
            {doc.sections.map((s) => (
              <section key={s.title} id={anchor(s.title)}><h2>{s.title}</h2>{s.body}</section>
            ))}
          </article>
        </div>
      </main>
      <footer>
        <div className="wrap">
          <span>© {new Date().getFullYear()} BringsUp · 2195 Kipling Lane, Highland Park, IL 60035</span>
          <span><a href="/terms/">Terms</a> · <a href="/privacy/">Privacy</a> · <a href="mailto:jake@bringsup.com">jake@bringsup.com</a></span>
        </div>
      </footer>
    </>
  );
}

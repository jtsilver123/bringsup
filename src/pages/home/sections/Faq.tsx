import { EMAIL } from "../../../components/Chrome.tsx";
import { FAQ, type FaqItem } from "../data.ts";

/** Native <details>, so it opens and closes without JavaScript. */
export function Faq({ items = FAQ }: { items?: FaqItem[] }) {
  return (
    <section id="faq" className="sec" aria-labelledby="faq-h">
      <div className="wrap split faq-split">
        <div className="faq-intro">
          <h2 className="t2" id="faq-h">Questions owners ask.</h2>
          <p>Something else? Write to <a href={`mailto:${EMAIL}`}>{EMAIL}</a> and I'll answer the same day.</p>
        </div>
        <div className="faq">
          {items.map((f) => (
            <details key={f.q}>
              <summary>{f.q}<span className="pm" aria-hidden="true"></span></summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

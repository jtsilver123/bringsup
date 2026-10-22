import { FAQ, type FaqItem } from "../data.ts";
import { PlusIcon } from "../icons.tsx";
import { Reveal } from "../Reveal.tsx";

/** Native <details>, so it opens and closes without JavaScript. The first answer starts open. */
export function Faq({ items = FAQ }: { items?: FaqItem[] }) {
  return (
    <section id="faq" className="sand" aria-labelledby="faq-h">
      <div className="wrap pad faq-grid">
        <Reveal>
          <p className="eyebrow">FAQ</p>
          <h2 className="display h2" id="faq-h">Questions owners ask us</h2>
          <p className="lead" style={{ marginTop: 18 }}>Something else? Email <a href="mailto:jake@bringsup.com">jake@bringsup.com</a> and a person will write back.</p>
        </Reveal>
        <div className="faq">
          {items.map((f, i) => (
            <details key={f.q} open={i === 0}>
              <summary>{f.q}<span className="pm" aria-hidden="true"><PlusIcon /></span></summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

import { STEPS } from "../data.ts";
import { Reveal } from "../Reveal.tsx";

export function HowItWorks() {
  return (
    <section id="how" className="wrap pad" aria-labelledby="how-h">
      <Reveal className="sec-head">
        <div>
          <p className="eyebrow">How it works</p>
          <h2 className="display h2" id="how-h">See it first. Pay only if you love it.</h2>
        </div>
        <p className="lead">No calls, no sales pitch, nothing to pay up front. We start with what your customers already say about you.</p>
      </Reveal>
      <ol className="steps">
        {STEPS.map((s, i) => (
          <Reveal as="li" className="step" key={s.title}>
            <div className="num">{String(i + 1).padStart(2, "0")}</div><h3>{s.title}</h3><p>{s.text}</p><span className="when">{s.when}</span>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

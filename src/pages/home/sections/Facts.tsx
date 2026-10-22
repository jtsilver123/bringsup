import { FACTS, TRADES } from "../data.ts";

export function Facts() {
  return (
    <section className="facts" aria-label="The offer at a glance">
      <div className="wrap">
        <div className="facts-row">
          {FACTS.map((f) => <div className="fact" key={f.value}><b>{f.value}</b><span>{f.label}</span></div>)}
        </div>
        <p className="trades"><b>Made for</b>{TRADES.map((t) => <span key={t}>{t}</span>)}</p>
      </div>
    </section>
  );
}

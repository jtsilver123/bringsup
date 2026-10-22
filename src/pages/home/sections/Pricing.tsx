import { Arrow, Check } from "../../../components/icons.tsx";
import { COMPARE, COMPARE_COLUMNS, INCLUDED } from "../data.ts";
import { Reveal } from "../Reveal.tsx";

function Compare() {
  const { diy, agency, us } = COMPARE_COLUMNS;
  return (
    <Reveal className="compare">
      <h3>How it compares</h3>
      <div className="tbl" role="region" aria-label="Comparison table" tabIndex={0}>
        <table>
          <thead><tr><th scope="col"><span className="sr">Question</span></th><th scope="col">{diy}</th><th scope="col">{agency}</th><th scope="col" className="us">{us}</th></tr></thead>
          <tbody>
            {COMPARE.map((r) => (
              <tr key={r.label}><th scope="row">{r.label}</th><td data-label={diy}>{r.diy}</td><td data-label={agency}>{r.agency}</td><td className="us" data-label={us}>{r.us}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </Reveal>
  );
}

export function Pricing() {
  return (
    <section id="pricing" className="sand" aria-labelledby="price-h">
      <div className="wrap pad">
        <div className="inc">
          <Reveal>
            <p className="eyebrow">What's included</p>
            <h2 className="display h2" id="price-h">Everything you need online. One flat price.</h2>
            <ul>
              {INCLUDED.map((item) => <li key={item}><Check size={22} strokeWidth={2.6} />{item}</li>)}
            </ul>
          </Reveal>
          <Reveal className="price">
            <div className="price-main">
              <p className="eyebrow">Website + brand refresh</p>
              <div style={{ marginTop: 12, display: "flex", alignItems: "baseline", gap: 10 }}><span className="amt">$1,000</span><span className="per">flat</span></div>
              <p>That's the whole price, and you pay it only after you've seen your finished site and approved it. No hidden fees, no contract.</p>
              <div className="split-pay"><div><b>$0</b>to start</div><div><b>$1,000</b>when you approve</div></div>
              <a className="btn btn-glow" href="#concept">Start with a free concept <Arrow /></a>
            </div>
            <div className="care">
              <div className="care-top"><h3>Optional Care Plan</h3><span className="amt">$79<small>/mo</small></span></div>
              <p>Hosting, security updates, and unlimited small edits: new hours, specials, photos. Cancel anytime.</p>
            </div>
          </Reveal>
        </div>
        <Compare />
      </div>
    </section>
  );
}

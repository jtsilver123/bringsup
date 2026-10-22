import { Capacity } from "../../../components/Capacity.tsx";
import { INCLUDED, STEPS } from "../data.ts";

/** How it works and what it costs, as one timeline, then the price and what it covers. */
export function Offer() {
  return (
    <section id="how" className="sec" aria-labelledby="how-h">
      <div className="wrap">
        <div className="sec-head">
          <h2 className="t2" id="how-h">What happens, and <span className="key">what it costs</span>.</h2>
          <p>You see your homepage, then your finished site, before you pay anything.</p>
        </div>
        <ol className="timeline">
          {STEPS.map((s) => (
            <li key={s.title}>
              <span className="tl-when">{s.when}</span>
              <div className="tl-what"><h3>{s.title}</h3><p>{s.text}</p></div>
              <span className={s.cost === "Free" ? "tl-cost" : "tl-cost due"}><span className="sr">Cost: </span>{s.cost}</span>
            </li>
          ))}
        </ol>

        <div className="price" id="pricing">
          <div className="price-main">
            <p className="price-amt"><span className="sr">The price: </span><span className="cur">$</span>1,000</p>
            <p className="price-what">Flat, for the whole site and a brand refresh.</p>
            <p>That's the whole price, and you pay it only after you've seen your finished site and approved it. No deposit, no contract, no monthly bill.</p>
            <Capacity />
          </div>
          <div className="price-inc">
            <h3>What's included</h3>
            <ul className="ruled inc">
              {INCLUDED.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
          <div className="price-after">
            <h3>After it's live</h3>
            <p>Hosting stays included, with no monthly fee. Anything I got wrong is fixed free. Other updates, like new hours or photos, are $150 a round, the same as an extra round of changes before launch. Just reply by email. Or, if you'd rather never think about it, the <a href="/managed/">managed plan</a> is $49 a month with updates included. The files are yours, so your own web person can edit them too.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

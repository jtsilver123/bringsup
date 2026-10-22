import { Stars } from "../bits.tsx";
import { PAINS, type IconItem } from "../data.ts";
import { BigArrow, listIcons } from "../icons.tsx";
import { Reveal } from "../Reveal.tsx";

/** An icon list (used for the pains here and the promises in About). */
export function IconList({ className, items, iconSize }: { className: string; items: IconItem[]; iconSize: number }) {
  return (
    <ul className={className}>
      {items.map((p) => (
        <li key={p.title}><span className="icon">{listIcons[p.icon](iconSize)}</span><div><b>{p.title}</b><span>{p.text}</span></div></li>
      ))}
    </ul>
  );
}

export function Problem() {
  return (
    <section className="wrap pad" aria-labelledby="problem-h">
      <div className="moment">
        <Reveal>
          <p className="eyebrow">Why it matters</p>
          <h2 className="display h2" id="problem-h">Word of mouth got you here. Then people look you up.</h2>
          <p className="lead" style={{ marginTop: 20 }}>New customers find you on Google, see the stars, and tap your website. In a few seconds they decide if you're for them. An outdated site can make a busy shop look closed.</p>
          <IconList className="pains" items={PAINS} iconSize={20} />
        </Reveal>
        <Reveal className="journey" role="img" aria-label="A search listing showing 4.9 stars from 412 reviews. Tapping Website opens an outdated site that is hard to read on a phone.">
          <div className="j-step">
            <p className="j-label"><i>1</i>They look you up</p>
            <div className="listing" aria-hidden="true">
              <div className="l-photo"></div>
              <div className="l-body">
                <b>Marigold Bakery</b>
                <div className="l-rate"><span>4.9</span><Stars /><span>(412)</span></div>
                <div className="l-meta">Bakery · Westbrook, CT</div>
                <div className="l-meta"><em>Open</em> · Closes 3 PM</div>
                <div className="l-btns"><span>Directions</span><span>Call</span><span className="hot">Website<i></i></span></div>
              </div>
            </div>
          </div>
          <div className="j-arrow" aria-hidden="true"><BigArrow /></div>
          <div className="j-step">
            <p className="j-label"><i>2</i>Then they see this</p>
            <div className="j-phone" aria-hidden="true"><img src="/assets/work/bakery-before.jpg" width={1664} height={1040} alt="" loading="lazy" /></div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

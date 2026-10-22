import { PROMISES } from "../data.ts";
import { Reveal } from "../Reveal.tsx";
import { IconList } from "./Problem.tsx";

export function About() {
  return (
    <section className="wrap pad" aria-labelledby="about-h">
      <div className="about">
        <Reveal>
          <p className="eyebrow">Who we are</p>
          <h2 className="display h2" id="about-h">Run by a person, not a call center.</h2>
          <IconList className="promises" items={PROMISES} iconSize={22} />
        </Reveal>
        <Reveal className="note">
          <p>Some of the best places in any town have websites that haven't changed in years. The owners are busy doing the work that earned those reviews, and the website is the last thing on the list.</p>
          <p>That's who BringsUp is for. We look for family businesses whose customers rave about them, and we show them, for free, what their website could look like. If they like it, we build it for a price a small business can say yes to.</p>
          <p>No jargon, no pressure, and no monthly bill unless you want one.</p>
          <div className="sig"><span className="av" aria-hidden="true">JS</span><div><b>Jake Silver</b><span>Founder, BringsUp · <a href="mailto:jake@bringsup.com">jake@bringsup.com</a></span></div></div>
        </Reveal>
      </div>
    </section>
  );
}

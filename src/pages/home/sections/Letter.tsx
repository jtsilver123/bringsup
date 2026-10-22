import { EMAIL } from "../../../components/Chrome.tsx";

/**
 * Who's behind this, for owners who typed bringsup.com after a cold email: a short note from Jake,
 * next to the actual first email (the example from tools/email_template.md, to a made-up bakery).
 */
export function Letter() {
  return (
    <section id="hello" className="sec" aria-labelledby="hello-h">
      <div className="wrap split">
        <div className="letter">
          <h2 className="t2" id="hello-h">Got an email from me?</h2>
          <p>Then it really was me. BringsUp is one person, Jake Silver. I look for family businesses whose customers rave about them and whose website hasn't caught up yet, and I write to the address the business lists itself. I never buy lists.</p>
          <p>The email has no links and no attachments. If you write back yes, I make your homepage and send you a private link, usually the same day. If it's not for you, say so and I won't write again. Either way, I send three short emails at most, then I stop.</p>
          <p>I keep everything on email, which is part of how I keep the price flat. Ask me anything at <a href={`mailto:${EMAIL}`}>{EMAIL}</a> and you'll get an answer the same day.</p>
        </div>
        <figure className="mail">
          <div className="mail-card">
            <dl className="mail-head">
              <div><dt>From</dt><dd>Jake Silver &lt;{EMAIL}&gt;</dd></div>
              <div><dt>Subject</dt><dd>idea for marigold bakery</dd></div>
            </dl>
            <div className="mail-body">
              <p>Hi Rosa,</p>
              <p>I was reading through your reviews and kept seeing the sourdough, and that your family remembers people's names. Forty years of that is something.</p>
              <p>Your website doesn't really show it yet. I'd like to make you a new homepage, built from your actual menu and hours, with the bakery front and center and ordering one tap away on a phone.</p>
              <p>It's free to look at, and if you like it I can build the whole site, and you'd only pay once it's finished and you're happy with it. Want me to put one together?</p>
              <p>Jake<br />bringsup.com</p>
              <p className="mail-foot">If this isn't for you, just say so and I won't email again.</p>
            </div>
          </div>
          <figcaption className="small">The first email, as it would go to a made-up bakery. Yours would be about your own business.</figcaption>
        </figure>
      </div>
    </section>
  );
}

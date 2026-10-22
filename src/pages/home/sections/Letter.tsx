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
          <h2 className="t2" id="hello-h">Got an email from <span className="key">me</span>?</h2>
          <p>Then it really was me. BringsUp is one person, Jake Silver. I look for family businesses whose customers rave about them and whose website hasn't caught up yet, and I write to the address the business lists itself. I never buy lists.</p>
          <p>The email has no links and no attachments. If you write back yes, I make your homepage and send you a private link, usually the same day. If it's not for you, say so and I won't write again. Either way, I send three short emails at most, then I stop.</p>
          <p>I keep everything on email, which is part of how I keep the price flat. Ask me anything at <a href={`mailto:${EMAIL}`}>{EMAIL}</a> and you'll get an answer the same day.</p>
          <p className="ps">P.S. There's no sales team or call center behind this. When you reply, you're writing to me.</p>
        </div>
        <figure className="mail">
          <div className="mail-card">
            <dl className="mail-head">
              <div><dt>From</dt><dd><span className="who">Jake Silver</span> <span className="addr">&lt;{EMAIL}&gt;</span></dd></div>
              <div><dt>Subject</dt><dd className="subj">marigold bakery</dd></div>
            </dl>
            <div className="mail-body">
              <p>Hi Rosa,</p>
              <p>Forty years in Westbrook and people still rave about your sourdough. Your website doesn't really show that.</p>
              <p>I'm Jake, I make websites for family businesses. Want me to make you a new one? Happy to send you a demo link for free. Just let me know.</p>
              <p>Jake<br />bringsup.com</p>
              <p className="mail-foot">Not for you? Just say so and I won't write again.</p>
            </div>
          </div>
          <figcaption className="small">The first email, as it would go to a made-up bakery. Yours would be about your own business.</figcaption>
        </figure>
      </div>
    </section>
  );
}

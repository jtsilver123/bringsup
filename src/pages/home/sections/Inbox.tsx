import { Arrow } from "../../../components/icons.tsx";
import { NEXT } from "../data.ts";
import { Reveal } from "../Reveal.tsx";

/** For owners who got an outreach email. `search` carries ?ref= into /start/. */
export function Inbox({ search }: { search: string }) {
  return (
    <section className="inbox" id="hello" aria-labelledby="hello-h">
      <div className="wrap">
        <Reveal>
          <p className="eyebrow">Got an email from Jake?</p>
          <h2 className="display" id="hello-h">Yes, we really made that concept for you.</h2>
          <p className="lead">We found you through your reviews, not a mailing list. If you like what you saw, here's how it works. No calls, and nothing to pay until you approve your finished site.</p>
          <a className="btn btn-glow" href={`/start/${search}`} data-keep-ref="" style={{ marginTop: 26 }}>Start my website <Arrow /></a>
        </Reveal>
        <ol className="next">
          {NEXT.map((n) => <Reveal as="li" key={n.title}><b>{n.title}</b><span>{n.text}</span></Reveal>)}
        </ol>
      </div>
    </section>
  );
}

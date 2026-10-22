import { EMAIL, SubFooter, SubHeader } from "../../components/Chrome.tsx";
import "../../components/site.css";
import "./notfound.css";

export function NotFound() {
  return (
    <>
      <SubHeader />
      <main className="wrap nf">
        <h1 className="t1">This page isn't here.</h1>
        <p className="lead">Looking for your new homepage? The link is in the email I sent you. If it doesn't work, reply to that email, or write to <a href={`mailto:${EMAIL}`}>{EMAIL}</a>, and I'll send it again.</p>
        <a className="btn btn-ink" href="/">Back to BringsUp</a>
      </main>
      <SubFooter />
    </>
  );
}

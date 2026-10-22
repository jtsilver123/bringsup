import "./notfound.css";

export function NotFound() {
  return (
    <main>
      <svg className="mark" viewBox="0 0 48 48" width="72" height="72" aria-hidden="true">
        <path className="bm-tile" fill="#16181D" d="M14 4H34A10 10 0 0 1 44 14V30A10 10 0 0 1 34 40H21L10.6 46.6A1 1 0 0 1 9 45.8V39.3A10 10 0 0 1 4 30V14A10 10 0 0 1 14 4Z" />
        <g className="bm-arrow" stroke="#FFB37A" fill="none" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round"><path d="M24 31V13" /><path d="M16 21l8-8 8 8" /></g>
      </svg>
      <h1>This page isn't here.</h1>
      <p>Looking for your homepage concept? It's in the email Jake sent you. You can also reply to that email and we'll send it again.</p>
      <a className="btn" href="/">Back to BringsUp</a>
    </main>
  );
}

/** The same few things hold most good local sites back, and what I do instead. Kind, specific, never about a real business. */
const FIXES: [string, string][] = [
  ["Hours posted as a photo of the sign on the door.", "Your hours as real text, with today's highlighted, so phones and Google can read them."],
  ["A menu that's a PDF to download.", "A menu that opens instantly on a phone, with prices you can read without pinching."],
  ["A phone number you can't tap.", "Call and directions one tap away, on every page."],
  ["“Welcome to our website” as the first words.", "A first line that says what you're loved for, in your customers' own words."],
  ["Your best reviews buried on Google.", "The things people rave about, front and center."],
  ["A design that could be anyone's.", "A look that fits you. A bakery shouldn't look like a law firm."],
];

export function Fixes() {
  return (
    <section id="fixes" className="sec" aria-labelledby="fixes-h">
      <div className="wrap">
        <div className="sec-head">
          <h2 className="t2" id="fixes-h">The same six things hold <span className="key">good businesses</span> back.</h2>
          <p>It's nobody's fault. Websites age faster than shops do. Here's what I fix every time.</p>
        </div>
        <ol className="fixes">
          {FIXES.map(([was, now]) => (
            <li key={was}>
              <p className="fx-was"><span className="sr">Often: </span>{was}</p>
              <p className="fx-now"><span className="sr">Instead: </span>{now}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

import type { CSSProperties } from "react";
import { EMAIL, SubFooter, SubHeader } from "../../components/Chrome.tsx";
import { Arrow } from "../../components/icons.tsx";
import "../../components/site.css";
import "./brand.css";

// The visual version of brand.md. When the two disagree, brand.md wins: update this page to match it.

const INK: CSSProperties = { background: "var(--ink)" };

const ASSETS: { label: string; file: string; alt: string; w: number; h: number; bg?: CSSProperties; img?: CSSProperties }[] = [
  { label: "Primary lockup", file: "/assets/brand/logo.svg", alt: "BringsUp logo", w: 205, h: 48 },
  { label: "Reverse lockup", file: "/assets/brand/logo-reverse.svg", alt: "BringsUp logo, reverse", w: 205, h: 48, bg: INK },
  { label: "Mark", file: "/assets/brand/mark.svg", alt: "BringsUp mark", w: 64, h: 64 },
  { label: "Mark, reverse", file: "/assets/brand/mark-reverse.svg", alt: "BringsUp mark, reverse", w: 64, h: 64, bg: INK },
  { label: "App icon and avatar", file: "/assets/brand/avatar.png", alt: "BringsUp app icon", w: 96, h: 96, bg: INK, img: { maxHeight: 96, borderRadius: 22 } },
  { label: "Wordmark", file: "/assets/brand/wordmark.svg", alt: "BringsUp wordmark", w: 200, h: 50, img: { maxHeight: 44 } },
  { label: "Link preview", file: "/assets/og.png", alt: "Link preview image", w: 1200, h: 630, bg: { background: "var(--sand)" }, img: { maxHeight: 150, borderRadius: 6 } },
];

const COLORS: { name: string; hex: string; use: string; border?: boolean }[] = [
  { name: "Ink", hex: "#16181D", use: "Text, dark sections, dark buttons, the mark" },
  { name: "Paper", hex: "#FBFAF7", use: "Page background", border: true },
  { name: "Sand", hex: "#F1EEE6", use: "Alternate sections" },
  { name: "Line", hex: "#E4E1D9", use: "Borders, section hairlines" },
  { name: "Rule", hex: "#D6D2C8", use: "Rules between list items" },
  { name: "Ember", hex: "#C2410C", use: "The one accent: the primary button, the price that's due" },
  { name: "Ember Deep", hex: "#9A3412", use: "Accent text and links, Ember hover" },
  { name: "Glow", hex: "#FFB37A", use: "Accent on Ink only, and the focus ring on inputs" },
  { name: "Tint", hex: "#FFE8DC", use: "Text selection only" },
  { name: "Muted", hex: "#3D414B", use: "Body copy" },
  { name: "Subtle", hex: "#5A5F6B", use: "Captions, fine print" },
];

/** Mirrors brand.md "Motion". */
const MOTION: [string, string][] = [
  ["Hovers", "Colors change in 150 to 200ms. Link underlines thicken and settle closer; they never draw in."],
  ["Presses", "A button settles 1px and to 98.5% for as long as it's held. No bounce, no ripple."],
  ["Arrows", "The arrow in a button leans 4px toward where it goes, a little further when pressed."],
  ["Confirmations", "A copy button turns its icon into a check and says Copied, in place, for two seconds."],
  ["Opening", "FAQ answers, menus and dialogs open in 200 to 250ms with an ease-out curve, and close a bit faster."],
  ["Images", "They fade in once loaded, in space that was already reserved, so nothing jumps."],
  ["Never", "Reveals on scroll, parallax, bounce, glow, confetti, or anything that makes someone wait to read."],
];

const DO = [
  "Lead with what's great: their reviews, their history.",
  "Write buttons in the visitor's words: \"Get my free homepage\".",
  "Make errors helpful: \"Add your website address, like rosasbakery.com.\"",
  "Say \"flat $1,000\" and \"your new homepage\".",
  "Keep it plain, warm and specific.",
  "Label sample work as fictional.",
];
const DONT = [
  "Mention or quote bad reviews.",
  "Call a site bad or ugly. \"Outdated\" is the strongest word.",
  "Use jargon (SEO, conversion, UX), hype words or emojis.",
  "Invent stats, clients or results.",
];

export function Brand() {
  return (
    <>
      <SubHeader />
      <main className="bg">
        <section className="wrap bg-top">
          <h1 className="t1">Websites as good as your reviews.</h1>
          <p className="lead">The BringsUp brand guide: the site, cold emails, concept boards, anything with the name on it. The source of truth is <code>brand.md</code> in the repo; this page is the visual version.</p>
        </section>

        <section className="sec" aria-labelledby="logo-h">
          <div className="wrap">
            <div className="sec-head"><h2 className="t2" id="logo-h">The review bubble.</h2><p>A speech bubble for what customers say, with an arrow for what we do with it: bring it up. Ink and Glow on light backgrounds, the reverse on dark, Glow on Ink for app icons. The tail always sits bottom left.</p></div>
            <div className="tiles">
              {ASSETS.map((a) => (
                <figure className="tile" key={a.file}>
                  <div className="show" style={a.bg}><img src={a.file} alt={a.alt} width={a.w} height={a.h} style={a.img} loading="lazy" /></div>
                  <figcaption><span>{a.label}</span><a href={a.file} download>{a.file.split("/").pop()}</a></figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="sec" aria-labelledby="color-h">
          <div className="wrap">
            <div className="sec-head"><h2 className="t2" id="color-h">Warm neutrals and one accent.</h2><p>Ember is the only accent, once per screen. Glow appears only on Ink. No gradients, no other hues. Prospect concepts use the prospect's colors, never ours.</p></div>
            <ul className="swatches">
              {COLORS.map((c) => (
                <li key={c.name}>
                  <span className="chip" style={{ background: c.hex, ...(c.border ? { boxShadow: "inset 0 0 0 1px var(--line)" } : {}) }} />
                  <b>{c.name}</b> <code>{c.hex}</code>
                  <span className="use">{c.use}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="sec" aria-labelledby="type-h">
          <div className="wrap">
            <div className="sec-head"><h2 className="t2" id="type-h">Typography carries the page.</h2><p>Two display sizes, one body size, one small size. No eyebrows: a heading says what the section is.</p></div>
            <ol className="ruled specimens">
              <li><small>Page title · Bricolage Grotesque 800, −0.035em</small><span className="t1">Your website should too.</span></li>
              <li><small>Section title · Bricolage Grotesque 800, −0.025em</small><span className="t2">What happens, and what it costs.</span></li>
              <li><small>Lead · DM Sans 400, 20px</small><span className="lead">I make websites for family-owned businesses whose customers already love them.</span></li>
              <li><small>Body · DM Sans 400, 18px</small><span>Hours, services, a few photos, and your logo if you have one.</span></li>
              <li><small>Small · DM Sans 400, 16px</small><span className="small">No calls. Everything happens by email.</span></li>
            </ol>
          </div>
        </section>

        <section className="sec" aria-labelledby="ui-h">
          <div className="wrap">
            <div className="sec-head"><h2 className="t2" id="ui-h">Buttons, links and fields.</h2><p>6px corners on everything; the slider handle is the only circle. These are the real components: hover them, press them, tab to them.</p></div>
            <div className="ui">
              <div className="ui-row">
                <a className="btn btn-primary" href="/#concept">Get my free homepage <Arrow /></a>
                <a className="btn btn-line" href="/#how">How it works</a>
                <a className="btn btn-ink btn-sm" href="/#concept">Free homepage</a>
                <a className="tlink" href="/#faq">Questions owners ask</a>
              </div>
              <p className="small">Primary is Ember, once per screen. Secondary is a 1.5px Ink outline or an underlined text link. Ink fill for the header button and "back" actions.</p>
              <div className="ui-row dark on-dark">
                <a className="btn btn-light" href="/#concept">On Ink</a>
                <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
              </div>
              <form className="ui-form" onSubmit={(e) => e.preventDefault()}>
                <label className="field">Your website<input type="text" placeholder="rosasbakery.com" /></label>
                <label className="field">With an error<input type="text" defaultValue="rosasbakery" aria-invalid="true" aria-describedby="bg-err" /></label>
                <p className="form-err" id="bg-err">Add your website address, like rosasbakery.com.</p>
              </form>
            </div>
          </div>
        </section>

        <section className="sec" aria-labelledby="motion-h">
          <div className="wrap">
            <div className="sec-head"><h2 className="t2" id="motion-h">Motion confirms, it never decorates.</h2><p>Quick and ease-out: 120 to 250ms. If a movement doesn't explain something or confirm an action, cut it. Everything respects reduced-motion settings.</p></div>
            <dl className="ruled motion">
              {MOTION.map(([t, d]) => <div key={t}><dt>{t}</dt><dd>{d}</dd></div>)}
            </dl>
          </div>
        </section>

        <section className="sec" aria-labelledby="voice-h">
          <div className="wrap">
            <div className="sec-head"><h2 className="t2" id="voice-h">Like a neighbor who happens to build websites.</h2><p>Plain, warm and specific. Jake speaks in the first person on the website; legal pages say "we".</p></div>
            <div className="dos">
              <div><h3>Do</h3><ul className="ruled">{DO.map((x) => <li key={x}>{x}</li>)}</ul></div>
              <div><h3>Don't</h3><ul className="ruled">{DONT.map((x) => <li key={x}>{x}</li>)}</ul></div>
            </div>
          </div>
        </section>
      </main>
      <SubFooter />
    </>
  );
}

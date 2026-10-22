import type { CSSProperties } from "react";
import { Lift } from "../../components/Lift.tsx";
import "./brand.css";

const INK: CSSProperties = { background: "var(--ink)" };

const ASSETS: { label: string; file: string; alt: string; w: number; h: number; bg?: CSSProperties; img?: CSSProperties }[] = [
  { label: "Primary lockup", file: "/assets/brand/logo.svg", alt: "BringsUp logo", w: 205, h: 48 },
  { label: "Reverse lockup", file: "/assets/brand/logo-reverse.svg", alt: "BringsUp logo, reverse", w: 205, h: 48, bg: INK },
  { label: "Mark", file: "/assets/brand/mark.svg", alt: "BringsUp mark", w: 64, h: 64 },
  { label: "Mark, reverse", file: "/assets/brand/mark-reverse.svg", alt: "BringsUp mark, reverse", w: 64, h: 64, bg: INK },
  { label: "App icon and avatar", file: "/assets/brand/avatar.png", alt: "BringsUp app icon", w: 96, h: 96, bg: INK, img: { maxHeight: 96, borderRadius: 22 } },
  { label: "Wordmark", file: "/assets/brand/wordmark.svg", alt: "BringsUp wordmark", w: 200, h: 50, img: { maxHeight: 44 } },
  { label: "Link preview", file: "/assets/og.png", alt: "Link preview image", w: 1200, h: 630, bg: { background: "var(--sand)" }, img: { maxHeight: 150, borderRadius: 8 } },
];

const MOTION = [
  ["150–250ms", "Hovers and presses. Buttons press to 97%, arrows nudge 4px."],
  ["300–450ms", "Menus, dialogs, FAQ answers opening."],
  ["600ms", "Sections easing in on scroll, staggered 90ms."],
  ["900ms", "The lift drawing itself under the promise."],
];

const COLORS: { name: string; hex: string; use: string; border?: boolean }[] = [
  { name: "Ink", hex: "#16181D", use: "Text, dark sections" },
  { name: "Paper", hex: "#FBFAF7", use: "Page background", border: true },
  { name: "Sand", hex: "#F1EEE6", use: "Alternate sections" },
  { name: "Line", hex: "#E4E1D9", use: "Borders" },
  { name: "Ember", hex: "#C2410C", use: "Primary buttons, accents" },
  { name: "Ember Deep", hex: "#9A3412", use: "Accent text, hover" },
  { name: "Glow", hex: "#FFB37A", use: "Accent on Ink only" },
  { name: "Tint", hex: "#FFE8DC", use: "Icon tiles, pills" },
  { name: "Muted", hex: "#3D414B", use: "Body copy" },
  { name: "Subtle", hex: "#5A5F6B", use: "Captions" },
];

const DO = [
  "Lead with what's great: their reviews, their history.",
  "Write buttons in the visitor's words: \"Get my free concept\".",
  "Make errors helpful: \"No website yet? Your Facebook page works too.\"",
  "Say \"flat $1,000\" and \"free concept\".",
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
      <header><div className="wrap"><a href="/"><img src="/assets/brand/logo.svg" alt="BringsUp" width="170" height="40" /></a><a href="/">bringsup.com</a></div></header>
      <main className="wrap">
        <section>
          <p className="eyebrow">Brand guide</p>
          <h1 className="display">Websites as good as <Lift>your reviews.</Lift></h1>
          <p className="lead">Everything with the BringsUp name on it: the site, cold emails, concept boards. The source of truth is <code>brand.md</code> in the repo; this page is the visual version.</p>
        </section>

        <section>
          <p className="eyebrow">Logo</p>
          <h2 className="display">The review bubble.</h2>
          <p className="lead">A speech bubble for what your customers say, with an arrow for what we do with it: bring it up. Ink and Glow on light backgrounds, the reverse on dark, and Glow on Ink for app icons and avatars. The tail always sits bottom left.</p>
          <div className="grid g2">
            {ASSETS.map((a) => (
              <div className="tile" key={a.file}>
                <div className="show" style={a.bg}><img src={a.file} alt={a.alt} width={a.w} height={a.h} style={a.img} /></div>
                <div className="cap"><span>{a.label}</span><a href={a.file} download>{a.file.split("/").pop()}</a></div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <p className="eyebrow">Signatures</p>
          <h2 className="display">Two things that make it ours.</h2>
          <p className="lead">Use each at most once per screen. They work because they're rare.</p>
          <div className="sig-grid">
            <div className="sig-card"><div className="demo"><Lift className="display lift" style={{ fontSize: 44 }}>should too.</Lift></div><h3>The lift</h3><p>A hand-drawn Ember underline that rises at the end, like the arrow in the mark. It goes under the one phrase that carries the promise, and draws itself in once.</p></div>
            <div className="sig-card"><div className="demo"><span className="stars" aria-label="Five stars">★★★★★</span></div><h3>Five stars</h3><p>Our shorthand for "your reputation". Always about the customer's reviews, never a claim about us. They light up one by one when first seen.</p></div>
          </div>
        </section>

        <section>
          <p className="eyebrow">Motion</p>
          <h2 className="display">Quick, warm, purposeful.</h2>
          <p className="lead">Motion explains something or confirms an action. If it does neither, cut it. Everything respects reduced-motion settings.</p>
          <div className="motion">
            {MOTION.map(([t, d]) => <div key={t}><b>{t}</b><span>{d}</span></div>)}
          </div>
        </section>

        <section>
          <p className="eyebrow">Color</p>
          <h2 className="display">Warm neutrals and one accent.</h2>
          <p className="lead">Ember is the only accent, once per screen. Glow appears only on Ink. No gradients, no other hues. Prospect concepts use the prospect's colors, never ours.</p>
          <div className="grid g5">
            {COLORS.map((c) => (
              <div className="sw" key={c.name}>
                <div className="c" style={{ background: c.hex, ...(c.border ? { borderBottom: "1px solid var(--line)" } : {}) }} />
                <div className="t"><b>{c.name}</b><code>{c.hex}</code><br />{c.use}</div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <p className="eyebrow">Type and buttons</p>
          <h2 className="display">Bold headlines, friendly body.</h2>
          <div className="type">
            <div className="row"><small>Display · Bricolage Grotesque 800, −0.03em</small><span className="display" style={{ fontSize: 52, lineHeight: 1 }}>Your website should too.</span></div>
            <div className="row"><small>Eyebrow · DM Sans 700, uppercase, +0.06em</small><span className="eyebrow">How it works</span></div>
            <div className="row"><small>Body · DM Sans 400, 17–20px</small><span style={{ fontSize: 19, color: "var(--muted)" }}>We redesign websites for local shops that customers already love.</span></div>
          </div>
          <div className="btns">
            <a className="btn" style={{ background: "var(--ember)", color: "#fff" }} href="/#concept">Primary</a>
            <a className="btn" style={{ boxShadow: "inset 0 0 0 2px var(--ink)", color: "var(--ink)" }} href="/#how">Secondary</a>
            <span className="dark"><a className="btn" style={{ background: "var(--glow)", color: "var(--ink)" }} href="/#concept">On dark</a></span>
          </div>
        </section>

        <section style={{ borderBottom: 0 }}>
          <p className="eyebrow">Voice</p>
          <h2 className="display">Like a neighbor who happens to build websites.</h2>
          <div className="dos">
            <div><h3>Do</h3><ul>{DO.map((x) => <li key={x}>{x}</li>)}</ul></div>
            <div><h3>Don't</h3><ul>{DONT.map((x) => <li key={x}>{x}</li>)}</ul></div>
          </div>
        </section>
      </main>
      <footer><div className="wrap">© BringsUp · Questions about the brand: <a href="mailto:jake@bringsup.com">jake@bringsup.com</a></div></footer>
    </>
  );
}

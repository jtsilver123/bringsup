// Renders a customer's full website from one SiteContent object: home, menu or services, about, contact, 404,
// plus sitemap, robots, favicon and social preview tags. Pure function: content in, { path: html } out.
// The operator (tools/OPERATOR.md) writes the content; tools/site-kit/build.ts downloads images and writes files.
// No imports, so the /try/ page (src/lib/concept-render.ts) renders a prospect's concept with this same code.

/** The kind of business: "home" for remodelers, carpenters, upholsterers, framers and furniture restorers;
 * "boutique" for jewelers, watch repair, tailors and bridal. */
export type Theme = "bakery" | "restaurant" | "auto" | "garden" | "trades" | "beauty" | "retail" | "health" | "professional" | "home" | "boutique";

/**
 * The look. Each is its own layout system, type pairing and rhythm, not a color swap:
 * - editorial: bakeries, delis, restaurants, cafes. A printed menu: serif masthead, dotted-leader price list, pull quote.
 * - workshop: auto specialists, plumbers, electricians and other trades. Expanded grotesk, big phone number, numbered spec rows.
 * - craft: carpenters, cabinetmakers, remodelers, upholsterers, restorers. Project-led like an architecture monograph.
 * - atelier: jewelers, watchmakers, tailors, bridal, framers. Centered, quiet, refined serif, few large images.
 * - landscape: landscape designers, tree care, gardens and nurseries. Photo-first, minimal chrome.
 */
export type Style = "editorial" | "workshop" | "craft" | "atelier" | "landscape";

export interface SiteContent {
  business_name: string;
  theme: Theme;
  /** Overrides the look picked from `theme` (see Style). Leave it out unless the theme's default is wrong for them. */
  style?: Style;
  /** Button corners, matched to the business: "round" for playful shops (ice cream, bakery, kids), "soft" for most family
   *  businesses, "crisp" for formal or upscale ones. Leave it out to use the look's default. */
  buttons?: "round" | "soft" | "crisp";
  tagline: string;
  /** e.g. "Westbrook, CT" */
  city_state: string;
  phone: string;
  email: string;
  address: string;
  hours: { days: string; time: string }[];
  year_founded: string;
  /** Only real, verifiable numbers from Google or Yelp; "" if unknown. */
  rating: string;
  review_count: string;
  reviews_url: string;
  brand_primary: string;
  brand_accent: string;
  /** Image paths relative to the site root (assets/...) or absolute URLs. */
  logo: string;
  hero_image: string;
  primary_cta: { label: string; href: string };
  home: { headline: string; subheadline: string; final_heading: string };
  /** The menu or services page. */
  offer: {
    title: string;
    intro: string;
    groups: { name: string; items: { name: string; description: string; price: string; image: string }[] }[];
  };
  about: { heading: string; paragraphs: string[]; images: string[] };
  testimonials: { quote: string; author: string }[];
  /** Domain the site will live on (no protocol), for canonical links. */
  domain: string;
  social: { label: string; url: string }[];
  /** Short names of what they specialize in, e.g. ["Porsche", "BMW", "Audi"] or ["Kitchens", "Built-ins", "Staircases"]. */
  specialties?: string[];
  /** How a job goes, in their words: 2 or 3 short paragraphs. */
  approach?: { heading: string; paragraphs: string[] };
  /** Photos of their work or place, each with a short factual caption ("" if none), e.g. "Walnut kitchen, Claverack". */
  gallery?: { image: string; caption: string }[];
}

export interface RenderOptions {
  /** Adds the BringsUp preview bar with approve and change links. */
  preview?: { ref: string; roundsLeft: number };
  /** One self-contained home page (inline CSS, in-page links) for the /try/ concept iframe, with `note` printed at the bottom. */
  standalone?: { note: string };
}

const STYLE_FOR_THEME: Record<Theme, Style> = {
  bakery: "editorial", restaurant: "editorial", auto: "workshop", trades: "workshop", home: "craft", professional: "craft",
  boutique: "atelier", beauty: "atelier", retail: "atelier", health: "atelier", garden: "landscape",
};
const HINTS: [RegExp, Style][] = [
  [/jewel|watch|clock|horolog|tailor|bespoke|bridal|couture|alteration|\bframe|framing|engrav/i, "atelier"],
  [/carpent|cabinet|joiner|woodwork|millwork|remodel|renovat|builder|upholster|furniture|restor|stair/i, "craft"],
  [/landscap|garden|\btree|arbor|\blawn|nursery|hardscap|greenhouse/i, "landscape"],
  [/\bbaker(y|ies)\b|bakehouse|pastr|patisser|\bdeli\b|delicatessen|caf[eé]\b|coffee|restaurant|pizz|\bdiner\b|bistro|trattoria|butcher|cheese/i, "editorial"],
  [/\bauto|motor|garage|porsche|bmw|mercedes|audi|volvo|mechanic|\btires?\b|transmission|collision|plumb|hvac|heating|electric|roofing/i, "workshop"],
];
/** The look for a theme. Broad themes (trades, retail...) are refined by keywords in `hint` (name, tagline, services). */
function styleFor(theme: Theme, hint = ""): Style {
  const base = STYLE_FOR_THEME[theme] || "craft";
  if (!["trades", "retail", "professional", "health", "beauty"].includes(theme)) return base;
  for (const [re, s] of HINTS) if (re.test(hint)) return s;
  return base;
}

interface Look { fonts: string; fd: string; fb: string; fl: string; bg: string; alt: string; ink: string; accent: string; r: string; buttons: "round" | "soft" | "crisp"; vars: string }
/** Button corner radius for each SiteContent.buttons choice. */
const BUTTON_RADIUS = { round: "999px", soft: "10px", crisp: "2px" } as const;

const LOOKS: Record<Style, Look> = {
  editorial: {
    fonts: "family=Newsreader:ital,opsz,wght@0,6..72,400..700;1,6..72,400..600&family=Familjen+Grotesk:wght@400..700",
    fd: '"Newsreader",Georgia,serif', fb: '"Newsreader",Georgia,serif', fl: '"Familjen Grotesk",system-ui,sans-serif',
    bg: "#F6F0E6", alt: "#ECE2D2", ink: "#231A13", accent: "#B4541A", r: "2px", buttons: "soft", vars: "--dw:500;--dls:-.025em;--dlh:1.02",
  },
  workshop: {
    fonts: "family=Archivo:wdth,wght@62..125,400..900&family=IBM+Plex+Mono:wght@400;500",
    fd: '"Archivo",system-ui,sans-serif', fb: '"Archivo",system-ui,sans-serif', fl: '"IBM Plex Mono",ui-monospace,monospace',
    bg: "#F2F2EF", alt: "#E6E6E1", ink: "#131518", accent: "#D23C26", r: "3px", buttons: "soft", vars: "--dw:800;--dls:-.03em;--dlh:.98;--dst:112%",
  },
  craft: {
    fonts: "family=Schibsted+Grotesk:wght@400..800&family=Source+Serif+4:ital,opsz,wght@0,8..60,400..600;1,8..60,400..500",
    fd: '"Schibsted Grotesk",system-ui,sans-serif', fb: '"Source Serif 4",Georgia,serif', fl: '"Schibsted Grotesk",system-ui,sans-serif',
    bg: "#F3EFE8", alt: "#E8E1D5", ink: "#1E1C19", accent: "#7A4A2A", r: "2px", buttons: "soft", vars: "--dw:700;--dls:-.04em;--dlh:.98",
  },
  atelier: {
    fonts: "family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@400;500",
    fd: '"Cormorant Garamond",Georgia,serif', fb: '"Jost",system-ui,sans-serif', fl: '"Jost",system-ui,sans-serif',
    bg: "#FAF8F4", alt: "#F1ECE3", ink: "#1A1918", accent: "#8C6A3F", r: "0", buttons: "crisp", vars: "--dw:400;--dls:-.005em;--dlh:1.06",
  },
  landscape: {
    fonts: "family=Instrument+Serif:ital@0;1&family=Instrument+Sans:wght@400..700",
    fd: '"Instrument Serif",Georgia,serif', fb: '"Instrument Sans",system-ui,sans-serif', fl: '"Instrument Sans",system-ui,sans-serif',
    bg: "#F4F3EE", alt: "#E7E7DE", ink: "#1B241C", accent: "#3E6B48", r: "4px", buttons: "round", vars: "--dw:400;--dls:-.02em;--dlh:1",
  },
};

const ENT: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
/** Typographer's quotes and apostrophes for prose; URLs, paths and colors pass through untouched. */
const smart = (s: string) => (/^(https?:|tel:|mailto:|data:|#|\.{0,2}\/|assets\/)/.test(s) ? s
  : s.replace(/(\w)'(?=\w)/g, "$1\u2019").replace(/(^|[\s(\[])'/g, "$1\u2018").replace(/'/g, "\u2019")
    .replace(/(^|[\s(\[])"/g, "$1\u201C").replace(/"/g, "\u201D"));
const esc = (s: unknown) => smart(String(s ?? "")).replace(/[&<>"']/g, (c) => ENT[c]);
const hex = (c: string, fb: string) => (/^#[0-9a-f]{6}$/i.test(c || "") ? c : fb);
const rgb = (h: string) => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const lum = (h: string) => rgb(h).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; })
  .reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
const mix = (h: string, to: string, t: number) => { const a = rgb(h), b = rgb(to); return "#" + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, "0")).join(""); };
const contrast = (a: string, b: string) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
/** Nudge `fg` toward black or white until it reaches `ratio` against `bg`. */
const ensure = (fg: string, bg: string, ratio: number) => {
  const to = lum(bg) > 0.3 ? "#000000" : "#FFFFFF";
  for (let i = 0; i < 24 && contrast(fg, bg) < ratio; i++) fg = mix(fg, to, 0.1);
  return fg;
};
const tel = (p: string) => "tel:" + p.replace(/[^\d+]/g, "");
const initials = (name: string) => (name.replace(/'s\b/g, "").split(/[^A-Za-z]+/).filter((x) => x && !/^(the|and|of|inc|llc|co)$/i.test(x)).slice(0, 2).map((x) => x[0]).join("") || "?").toUpperCase();
const src = (path: string, depth: number) => (!path || /^(https?:|data:)/.test(path) ? path : "../".repeat(depth) + path);
const list = (xs: string[]) => (xs.length < 2 ? xs.join("") : xs.slice(0, -1).join(", ") + " and " + xs[xs.length - 1]);
const pad2 = (n: number) => String(n).padStart(2, "0");
const maps = (q: string) => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
const reviewSite = (url: string) => (/google|goo\.gl|g\.page/i.test(url) ? "Google" : /yelp/i.test(url) ? "Yelp" : /facebook/i.test(url) ? "Facebook" : "");

type Group = SiteContent["offer"]["groups"][number];
type Item = Group["items"][number];
interface Photo { src: string; caption: string; kind: "gallery" | "item" | "about" }

/** The first `n` items, keeping their groups. */
const firstItems = (groups: Group[], n: number): Group[] => {
  const out: Group[] = [];
  for (const g of groups) {
    if (n <= 0) break;
    const items = g.items.slice(0, n);
    n -= items.length;
    if (items.length) out.push({ ...g, items });
  }
  return out;
};

const PHONE_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>';
/** Progressive touches, a few lines with no dependencies. Without them everything still works:
 * images fade in once loaded instead of popping (only ones not yet loaded are hidden, and only by this script), and the
 * no-JavaScript menu also closes on Escape, on a tap outside it, or when one of its links is used. Left out of the standalone
 * /try/ concept, whose sandboxed iframe can't run scripts. */
const ENHANCE = `<script>(function(){var d=document;d.querySelectorAll("main img").forEach(function(i){if(i.complete)return;i.setAttribute("data-fade","");var f=function(){i.removeAttribute("data-fade")};i.addEventListener("load",f,{once:true});i.addEventListener("error",f,{once:true})});var m=d.querySelector(".mnav");if(!m)return;var c=function(){m.open=false};d.addEventListener("click",function(e){if(m.open&&!m.contains(e.target))c()});d.addEventListener("keydown",function(e){if(e.key==="Escape"&&m.open){c();m.querySelector("summary").focus()}});m.querySelectorAll("nav a").forEach(function(a){a.addEventListener("click",c)})})();</script>`;
const MARK = '<svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true"><path d="M14 4H34A10 10 0 0 1 44 14V30A10 10 0 0 1 34 40H21L10.6 46.6A1 1 0 0 1 9 45.8V39.3A10 10 0 0 1 4 30V14A10 10 0 0 1 14 4Z" fill="#FBFAF7"/><g fill="none" stroke="#16181D" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><path d="M24 31V13"/><path d="M16 21l8-8 8 8"/></g></svg>';

export function render(c: SiteContent, opts: RenderOptions = {}): Record<string, string> {
  const style: Style = c.style && LOOKS[c.style] ? c.style : styleFor(c.theme, [c.business_name, c.tagline, ...(c.specialties || [])].join(" "));
  const L = LOOKS[style];
  const solo = !!opts.standalone;

  // Color: the style's neutral base, the business's own dark as ink, and one accent from their brand.
  const bg = L.bg;
  let ink = hex(c.brand_primary, L.ink);
  for (let i = 0; i < 12 && lum(ink) > 0.022; i++) ink = mix(ink, "#000000", 0.18);
  const accent = hex(c.brand_accent, L.accent);
  const accT = ensure(accent, bg, 4.6);
  const fill = contrast(accent, bg) < 1.6 ? accT : accent;
  const fillInk = contrast(fill, "#FFFFFF") >= 4.5 ? "#FFFFFF" : contrast(fill, ink) >= 4.5 ? ink : "#111111";
  const dark = style === "workshop" ? mix(ink, "#000000", 0.1) : ink;
  const onDark = mix(bg, "#FFFFFF", 0.4);
  const accD = ensure(accent, dark, 4.6);
  const muted = ensure(mix(ink, bg, 0.36), bg, 5);
  const mutedD = ensure(mix(onDark, dark, 0.32), dark, 5);
  const line = mix(ink, bg, 0.84);

  const offerSlug = c.theme === "bakery" || c.theme === "restaurant" || style === "editorial" ? "menu" : "services";
  const offerTitle = c.offer.title || (offerSlug === "menu" ? "Menu" : "Services");
  const base = c.domain ? `https://${c.domain}` : "";
  const hours = c.hours.filter((h) => h.days || h.time);
  const allItems = c.offer.groups.flatMap((g) => g.items);
  const quotes = c.testimonials.filter((q) => q.quote);
  const site = reviewSite(c.reviews_url);
  const city = c.city_state.split(",")[0].trim();
  const specialties = (c.specialties || []).filter(Boolean);
  const approach = c.approach && c.approach.paragraphs.filter(Boolean).length ? c.approach : null;
  // How they work, or else the start of their story (craft and landscape homes).
  const words = approach || (c.about.paragraphs.length ? { heading: c.about.heading, paragraphs: c.about.paragraphs.slice(0, 2) } : null);

  const css = baseCss() + STYLE_CSS[style] + lastCss();
  const tokens = `:root{--bg:${bg};--alt:${L.alt};--ink:${ink};--muted:${muted};--line:${line};--acc:${fill};--acc-ink:${fillInk};--acc-t:${accT};--dark:${dark};--on-dark:${onDark};--muted-d:${mutedD};--acc-d:${accD};--fd:${L.fd};--fb:${L.fb};--fl:${L.fl};--r:${L.r};--rb:${BUTTON_RADIUS[c.buttons && c.buttons in BUTTON_RADIUS ? c.buttons : L.buttons]};${L.vars}}\n`;

  const ldjson = JSON.stringify({
    "@context": "https://schema.org", "@type": c.theme === "bakery" ? "Bakery" : c.theme === "restaurant" ? "Restaurant" : c.theme === "auto" ? "AutoRepair" : "LocalBusiness",
    name: c.business_name, url: base || undefined, telephone: c.phone || undefined, email: c.email || undefined, address: c.address || undefined,
    image: c.hero_image && base ? new URL(c.hero_image, base + "/").href : undefined, foundingDate: c.year_founded || undefined,
    openingHours: hours.length ? hours.map((h) => `${h.days} ${h.time}`) : undefined,
    aggregateRating: c.rating && c.review_count ? { "@type": "AggregateRating", ratingValue: c.rating, reviewCount: c.review_count } : undefined,
  }).replace(/</g, "\\u003c");

  interface Page { path: string; depth: number; nav: string; title: string; description: string; body: (d: number) => string }
  const pages: Page[] = [];

  // Links. In standalone mode everything points inside the one page.
  const ANCHORS: Record<string, string> = { "": "#top", [offerSlug + "/"]: "#offer", "about/": "#story", "contact/": "#visit" };
  const href = (path: string, depth: number) => (solo ? ANCHORS[path] || "#top" : "../".repeat(depth) + path || "./");
  const ctaHref = (depth: number) => {
    const h = c.primary_cta.href;
    if (/^(https?:|tel:|mailto:|#)/.test(h)) return h;
    return solo ? "#visit" : href(h.replace(/^\//, ""), depth);
  };
  const ctaIsCall = c.primary_cta.href.startsWith("tel:");

  // Small shared pieces.
  const img = (p: string, alt: string, depth: number, eager = false) =>
    `<img src="${esc(src(p, depth))}" alt="${esc(alt)}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">`;
  const fig = (ph: Photo, depth: number, cls = "") =>
    `<figure${cls ? ` class="${cls}"` : ""}>${img(ph.src, ph.caption || "", depth)}${ph.caption ? `<figcaption>${esc(ph.caption)}</figcaption>` : ""}</figure>`;
  const btn = (depth: number) => `<a class="btn" href="${esc(ctaHref(depth))}">${esc(c.primary_cta.label)}</a>`;
  const callLink = (cls = "tel", label = "") => (c.phone ? `<a class="${cls}" href="${tel(c.phone)}">${label}${esc(c.phone)}</a>` : "");
  const hoursDl = () => (hours.length ? `<dl class="hrs">${hours.map((h) => `<div><dt>${esc(h.days)}</dt><dd>${esc(h.time)}</dd></div>`).join("")}</dl>` : "");
  const by = (q: { author: string }) => {
    const parts = [q.author ? esc(q.author) : "", site ? (c.reviews_url ? `<a href="${esc(c.reviews_url)}">${site} review</a>` : `${site} review`) : ""].filter(Boolean);
    return parts.length ? `<p class="by">${parts.join('<span aria-hidden="true"> · </span>')}</p>` : "";
  };
  const reviewsLine = () => {
    if (!c.rating && !c.reviews_url) return "";
    const text = c.rating && c.review_count ? `Rated ${esc(c.rating)} out of 5 across ${esc(c.review_count)} reviews${site ? " on " + site : ""}` : c.rating ? `Rated ${esc(c.rating)} out of 5${site ? " on " + site : ""}` : `Read our reviews${site ? " on " + site : ""}`;
    return `<p class="rv">${c.reviews_url ? `<a href="${esc(c.reviews_url)}">${text}</a>` : text}</p>`;
  };
  const addressBlock = () => (c.address ? `<p class="adr">${esc(c.address)}</p>${solo ? "" : `<p><a class="dir" href="${esc(maps(c.business_name + ", " + c.address))}">Get directions</a></p>`}` : "");
  const moreLink = (path: string, label: string, depth: number) => (solo ? "" : `<p class="more"><a href="${href(path, depth)}">${esc(label)}</a></p>`);
  const allOffer = (shown: number, depth: number) => (allItems.length > shown ? moreLink(offerSlug + "/", "All " + offerTitle.toLowerCase(), depth) : "");
  const offerIntro = () => (c.offer.intro ? `<p class="dek">${esc(c.offer.intro)}</p>` : "");
  const paras = (xs: string[]) => xs.map((p) => `<p>${esc(p)}</p>`).join("");

  // Every photo we have, once each. Sections take what they need, so nothing repeats on a page.
  const pool = () => {
    const seen = new Set<string>([c.hero_image].filter(Boolean));
    const all: Photo[] = [
      ...(c.gallery || []).map((g) => ({ src: g.image, caption: g.caption || "", kind: "gallery" as const })),
      ...allItems.map((it) => ({ src: it.image, caption: it.name, kind: "item" as const })),
      ...c.about.images.map((s) => ({ src: s, caption: "", kind: "about" as const })),
    ].filter((p) => p.src);
    return {
      take(n: number, kinds: Photo["kind"][]): Photo[] {
        const out: Photo[] = [];
        for (const k of kinds) for (const p of all) if (out.length < n && p.kind === k && !seen.has(p.src)) { seen.add(p.src); out.push(p); }
        return out;
      },
    };
  };

  // Offer lists, one typographic system per style.
  const offerList = (groups: Group[]) => {
    const named = groups.length > 1 || groups.some((g) => g.name);
    const lvl = named ? "h4" : "h3";
    const nm = (it: Item) => `<${lvl} class="n">${esc(it.name)}</${lvl}>`;
    const gh = (g: Group) => (named && g.name ? `<h3 class="gh">${esc(g.name)}</h3>` : "");
    const price = (it: Item) => (it.price ? `<span class="pr">${esc(it.price)}</span>` : "");
    const desc = (it: Item) => (it.description ? `<p>${esc(it.description)}</p>` : "");
    if (style === "editorial") {
      return `<div class="menu g${Math.min(groups.length, 3)}">${groups.map((g) => `<section class="grp">${gh(g)}<ul>${g.items.map((it) =>
        `<li class="mi"><div class="mi-h">${nm(it)}${it.price ? `<span class="ld" aria-hidden="true"></span>${price(it)}` : ""}</div>${desc(it)}</li>`).join("")}</ul></section>`).join("")}</div>`;
    }
    if (style === "workshop") {
      let no = 0;
      return groups.map((g) => `${gh(g)}<ol class="rows">${g.items.map((it) => `<li><span class="no" aria-hidden="true">${pad2(++no)}</span>${nm(it)}${desc(it)}${price(it)}</li>`).join("")}</ol>`).join("");
    }
    const cls = style === "atelier" ? "clist" : "pairs";
    return groups.map((g) => `${gh(g)}<ul class="${cls}">${g.items.map((it) => `<li>${nm(it)}${desc(it)}${price(it)}</li>`).join("")}</ul>`).join("");
  };

  const quoteBlock = (cls: string) => {
    if (!quotes.length) return reviewsLine() ? `<section class="${cls} only-rv"><div class="wrap">${reviewsLine()}</div></section>` : "";
    const [q, ...rest] = quotes;
    return `<section class="${cls}" aria-label="What customers say"><div class="wrap">
<figure class="pq"><blockquote><p>${esc(q.quote)}</p></blockquote><figcaption>${by(q)}</figcaption></figure>
${rest.length ? `<div class="more-q">${rest.slice(0, 2).map((r) => `<figure><blockquote><p>${esc(r.quote)}</p></blockquote><figcaption>${by(r)}</figcaption></figure>`).join("")}</div>` : ""}
${reviewsLine()}</div></section>`;
  };

  const visitCols = (depth: number) => {
    const cols: string[] = [];
    if (hours.length) cols.push(`<div class="vc"><h3 class="vh">Hours</h3>${hoursDl()}</div>`);
    if (c.address) cols.push(`<div class="vc"><h3 class="vh">Find us</h3>${addressBlock()}</div>`);
    if (c.phone || c.email) cols.push(`<div class="vc"><h3 class="vh">${ctaIsCall ? "Call us" : "Get in touch"}</h3>${c.phone ? `<p>${callLink("tel big")}</p>` : ""}${c.email ? `<p><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></p>` : ""}${ctaIsCall ? "" : `<p class="vbtn">${btn(depth)}</p>`}</div>`);
    return cols.join("");
  };
  const visit = (d: number, heading: string, cls = "") =>
    `<section class="sec visit${cls}" id="visit"><div class="wrap">${heading ? `<h2 class="d">${esc(heading)}</h2>` : ""}<div class="vgrid">${visitCols(d)}</div></div></section>`;

  // ---------- Home, one composition per style ----------
  const homes: Record<Style, (d: number) => string> = {
    editorial: (d) => {
      const P = pool();
      const plates = P.take(3, ["item", "gallery", "about"]);
      const storyImg = P.take(1, ["about", "gallery", "item"])[0];
      const shown = firstItems(c.offer.groups, 9);
      return `<section class="lead${c.hero_image ? "" : " noimg"}"><div class="wrap lead-g">
<div class="lead-copy"><h1 class="d">${esc(c.home.headline)}</h1><p class="dek">${esc(c.home.subheadline)}</p>
<div class="ctas">${btn(d)}${c.phone && !ctaIsCall ? `<span class="or">or call ${callLink()}</span>` : ""}</div>
${hours.length ? `<div class="today"><h2 class="vh">Hours</h2>${hoursDl()}</div>` : ""}</div>
${c.hero_image ? `<figure class="lead-fig">${img(c.hero_image, "", d, true)}</figure>` : ""}
</div></section>
${allItems.length ? `<section class="sec carte" id="offer"><div class="wrap">
<header class="sec-h"><h2 class="d">${esc(offerTitle)}</h2>${offerIntro()}</header>
${offerList(shown)}
${plates.length ? `<div class="plates n${plates.length}">${plates.map((p) => fig(p, d)).join("")}</div>` : ""}
${allItems.length > 9 ? moreLink(offerSlug + "/", "The full " + offerTitle.toLowerCase(), d) : ""}
</div></section>` : ""}
${quoteBlock("sec pull")}
${c.about.paragraphs.length ? `<section class="sec story${storyImg ? "" : " noimg"}" id="story"><div class="wrap story-g">
${storyImg ? fig(storyImg, d, "story-fig") : ""}<div class="prose"><h2 class="d">${esc(c.about.heading)}</h2>${paras(c.about.paragraphs.slice(0, 2))}${moreLink("about/", "More about us", d)}</div>
</div></section>` : ""}
${visit(d, c.home.final_heading)}`;
    },

    workshop: (d) => {
      const P = pool();
      const strip = P.take(4, ["gallery", "item", "about"]);
      const shown = firstItems(c.offer.groups, 6);
      const story = c.about.paragraphs.length ? `<section class="sec how" id="story"><div class="wrap how-g"><h2 class="d">${esc(c.about.heading)}</h2><div class="prose">${paras(c.about.paragraphs.slice(0, approach ? 1 : 2))}${moreLink("about/", "About the shop", d)}</div></div></section>` : "";
      return `<section class="hero${c.hero_image ? "" : " noimg"}"><div class="wrap">
${c.tagline || city ? `<p class="kick">${esc([c.tagline, c.city_state].filter(Boolean).join(" · "))}</p>` : ""}
<h1 class="d">${esc(c.home.headline)}</h1>
<div class="hero-row"><p class="dek">${esc(c.home.subheadline)}</p><div class="ctas">${btn(d)}${c.phone && !ctaIsCall ? callLink("tel alt", "Call ") : ""}</div></div>
${c.hero_image ? `<figure class="hero-fig">${img(c.hero_image, "", d, true)}</figure>` : ""}
</div></section>
${specialties.length ? `<section class="makes-s" aria-label="Specialties"><div class="wrap"><p class="lbl">Specialists in</p><ul class="makes">${specialties.map((s) => `<li>${esc(s)}</li>`).join("")}</ul></div></section>` : ""}
${allItems.length ? `<section class="sec svc" id="offer"><div class="wrap">
<header class="sec-h"><h2 class="d">${esc(offerTitle)}</h2>${offerIntro()}</header>
${offerList(shown)}
${allOffer(6, d)}
</div></section>` : ""}
${approach ? `<section class="sec how"><div class="wrap how-g"><h2 class="d">${esc(approach.heading)}</h2><div class="prose">${paras(approach.paragraphs)}</div></div></section>` : ""}
${strip.length ? `<section class="sec shop" aria-label="Photos"><div class="wrap"><div class="film n${strip.length}">${strip.map((p, i) => `<figure>${img(p.src, p.caption, d)}${p.caption ? `<figcaption><span>${pad2(i + 1)}</span>${esc(p.caption)}</figcaption>` : ""}</figure>`).join("")}</div></div></section>` : ""}
${quoteBlock("sec say")}
${story}
<section class="sec visit" id="visit"><div class="wrap visit-g">
<div><h2 class="d">${esc(c.home.final_heading)}</h2>${c.phone ? `<p class="bigtel">${callLink("tel")}</p>` : ""}${addressBlock()}${c.email ? `<p><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></p>` : ""}${ctaIsCall ? "" : `<p class="vbtn">${btn(d)}</p>`}</div>
${hours.length ? `<div class="vh-col"><h3 class="lbl">Hours</h3>${hoursDl()}</div>` : ""}
</div></section>`;
    },

    craft: (d) => {
      const P = pool();
      let work = P.take(5, ["gallery", "item"]);
      if (!work.length) work = P.take(4, ["about"]);
      const appImg = P.take(1, ["about", "gallery", "item"])[0];
      const shown = firstItems(c.offer.groups, 6);
      return `<section class="hero${c.hero_image ? "" : " noimg"}">
<div class="wrap"><h1 class="d">${esc(c.home.headline)}</h1></div>
<div class="hero-b"><div class="hero-copy"><p class="dek">${esc(c.home.subheadline)}</p><div class="ctas">${btn(d)}${c.phone && !ctaIsCall ? callLink("tel", "or call ") : ""}</div></div>
${c.hero_image ? `<figure class="hero-fig">${img(c.hero_image, "", d, true)}</figure>` : ""}</div>
</section>
${specialties.length ? `<section class="sec make"><div class="wrap"><p class="lbl">What we make</p><p class="makes">${esc(list(specialties))}.</p></div></section>` : ""}
${work.length ? `<section class="sec work-s" aria-labelledby="work-h"><div class="wrap"><h2 class="lbl" id="work-h">Recent work</h2><div class="work n${work.length}">${work.map((p) => fig(p, d)).join("")}</div></div></section>` : ""}
${allItems.length ? `<section class="sec svc" id="offer"><div class="wrap svc-g"><header><h2 class="d">${esc(offerTitle)}</h2>${offerIntro()}${allOffer(6, d)}</header><div>${offerList(shown)}</div></div></section>` : ""}
${words ? `<section class="sec appr${appImg ? "" : " noimg"}" id="story"><div class="wrap appr-g">${appImg ? fig(appImg, d, "appr-fig") : ""}<div class="prose"><h2 class="d">${esc(words.heading)}</h2>${paras(words.paragraphs)}${moreLink("about/", "About us", d)}</div></div></section>` : ""}
${quoteBlock("sec say")}
${visit(d, c.home.final_heading)}`;
    },

    atelier: (d) => {
      const P = pool();
      const duo = P.take(2, ["gallery", "item", "about"]);
      const shown = firstItems(c.offer.groups, 4);
      return `<section class="hero${c.hero_image ? "" : " noimg"}"><div class="wrap">
<h1 class="d">${esc(c.home.headline)}</h1><p class="dek">${esc(c.home.subheadline)}</p>
<div class="ctas">${btn(d)}</div>
</div>${c.hero_image ? `<figure class="hero-fig">${img(c.hero_image, "", d, true)}</figure>` : ""}</section>
${allItems.length ? `<section class="sec svc" id="offer"><div class="wrap"><h2 class="lbl">${esc(offerTitle)}</h2>${offerIntro()}${offerList(shown)}${allOffer(4, d)}</div></section>` : ""}
${duo.length ? `<section class="sec duo-s" aria-label="Photos"><div class="wrap duo n${duo.length}">${duo.map((p) => fig(p, d)).join("")}</div></section>` : ""}
${quoteBlock("sec say")}
${c.about.paragraphs.length ? `<section class="sec story" id="story"><div class="wrap"><h2 class="d">${esc(c.about.heading)}</h2>${paras(c.about.paragraphs.slice(0, 2))}${moreLink("about/", "Our story", d)}</div></section>` : ""}
${visit(d, c.home.final_heading)}`;
    },

    landscape: (d) => {
      const P = pool();
      const mosaic = P.take(3, ["gallery", "about", "item"]);
      const appImg = P.take(1, ["about", "gallery", "item"])[0];
      const shown = firstItems(c.offer.groups, 6);
      return `<section class="hero${c.hero_image ? "" : " noimg"}">${c.hero_image ? `<figure class="hero-fig">${img(c.hero_image, "", d, true)}</figure>` : ""}
<div class="wrap hero-t"><h1 class="d">${esc(c.home.headline)}</h1><div><p class="dek">${esc(c.home.subheadline)}</p><div class="ctas">${btn(d)}${c.phone && !ctaIsCall ? callLink("tel", "or call ") : ""}</div></div></div></section>
${mosaic.length ? `<section class="sec mos-s" aria-label="Recent work"><div class="wrap"><div class="mosaic n${mosaic.length}">${mosaic.map((p) => fig(p, d)).join("")}</div></div></section>` : ""}
${specialties.length ? `<section class="sec make" aria-label="Specialties"><div class="wrap"><p class="makes">${specialties.map((s) => `<span>${esc(s)}</span>`).join("")}</p></div></section>` : ""}
${allItems.length ? `<section class="sec svc" id="offer"><div class="wrap svc-g"><header><h2 class="d">${esc(offerTitle)}</h2>${offerIntro()}${allOffer(6, d)}</header><div>${offerList(shown)}</div></div></section>` : ""}
${words ? `<section class="sec appr${appImg ? "" : " noimg"}" id="story"><div class="wrap appr-g"><div class="prose"><h2 class="d">${esc(words.heading)}</h2>${paras(words.paragraphs)}${moreLink("about/", "About us", d)}</div>${appImg ? fig(appImg, d, "appr-fig") : ""}</div></section>` : ""}
${quoteBlock("sec say")}
${visit(d, c.home.final_heading)}`;
    },
  };

  const pageHead = (label: string, title: string, lede: string) =>
    `<header class="ph"><div class="wrap">${label ? `<p class="lbl">${esc(label)}</p>` : ""}<h1 class="d">${esc(title)}</h1>${lede ? `<p class="dek">${esc(lede)}</p>` : ""}</div></header>`;

  pages.push({ path: "", depth: 0, nav: "", title: "Home", description: c.home.subheadline, body: homes[style] });

  pages.push({
    path: offerSlug + "/", depth: 1, nav: offerSlug + "/", title: offerTitle,
    description: c.offer.intro || `${offerTitle} at ${c.business_name}.`,
    body: (d) => {
      const photos: Photo[] = allItems.filter((it) => it.image).map((it) => ({ src: it.image, caption: it.name, kind: "item" }));
      return `${pageHead(c.business_name, offerTitle, c.offer.intro)}
<section class="sec carte svc inner"><div class="wrap">${offerList(c.offer.groups)}</div></section>
${photos.length ? `<section class="sec figs-s" aria-label="Photos"><div class="wrap figs">${photos.slice(0, 9).map((p) => fig(p, d)).join("")}</div></section>` : ""}
${visit(d, c.home.final_heading)}`;
    },
  });

  pages.push({
    path: "about/", depth: 1, nav: "about/", title: "About",
    description: c.about.paragraphs[0] || `About ${c.business_name}.`,
    body: (d) => {
      const photos = pool().take(6, ["about", "gallery", "item"]);
      const [first, ...rest] = photos;
      return `${pageHead(c.year_founded ? `Est. ${c.year_founded}` : c.business_name, c.about.heading, "")}
<section class="sec about${first ? "" : " noimg"}"><div class="wrap about-g">${first ? fig(first, d, "about-fig") : ""}<div class="prose">${paras(c.about.paragraphs)}</div></div></section>
${approach ? `<section class="sec about2"><div class="wrap about-g noimg"><div class="prose"><h2 class="d">${esc(approach.heading)}</h2>${paras(approach.paragraphs)}</div></div></section>` : ""}
${rest.length ? `<section class="sec figs-s" aria-label="Photos"><div class="wrap figs">${rest.map((p) => fig(p, d)).join("")}</div></section>` : ""}
${quotes.length ? `<section class="sec quotes-s" aria-labelledby="q-h"><div class="wrap"><h2 class="lbl" id="q-h">In our customers' words</h2><div class="quotes">${quotes.map((q) => `<figure><blockquote><p>${esc(q.quote)}</p></blockquote><figcaption>${by(q)}</figcaption></figure>`).join("")}</div>${reviewsLine()}</div></section>` : ""}
${visit(d, c.home.final_heading)}`;
    },
  });

  pages.push({
    path: "contact/", depth: 1, nav: "contact/", title: "Contact",
    description: `Hours, directions and how to reach ${c.business_name}${c.city_state ? " in " + c.city_state : ""}.`,
    body: (d) => `${pageHead(c.business_name, "Visit and contact", [c.address, c.phone].filter(Boolean).join(" · "))}
<section class="sec visit flat" id="visit"><div class="wrap"><div class="vgrid">${visitCols(d)}</div>
${c.address ? `<iframe class="map" title="Map to ${esc(c.business_name)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=${encodeURIComponent(c.business_name + ", " + c.address)}&amp;output=embed"></iframe>` : ""}
</div></section>`,
  });

  pages.push({
    path: "404.html", depth: 0, nav: "", title: "Page not found",
    description: "This page isn't here.",
    body: () => `${pageHead("", "This page isn't here.", "")}<section class="sec"><div class="wrap prose"><p>Try the <a href="/">home page</a>${c.phone ? `, or call us at <a href="${tel(c.phone)}">${esc(c.phone)}</a>` : ""}.</p></div></section>`,
  });

  // ---------- Page shell ----------
  const shell = (p: Page) => {
    const d = p.depth;
    const nf = p.path === "404.html" && !solo; // served at any depth, so it links from the root
    const h = (path: string) => (nf ? "/" + path : href(path, d));
    const asset = (path: string) => (nf ? "/" + path : src(path, d));
    const title = p.path ? `${p.title} | ${c.business_name}` : `${c.business_name}${c.city_state ? " | " + c.city_state : ""}`;
    const url = base ? `${base}/${p.path}` : "";
    const og = c.hero_image && base ? new URL(c.hero_image, base + "/").href : "";
    const navItems: [string, string, boolean][] = [[offerSlug + "/", offerTitle, allItems.length > 0], ["about/", "About", c.about.paragraphs.length > 0], ["contact/", solo ? "Visit" : "Contact", true]];
    const links = navItems.filter(([, , show]) => show || !solo)
      .map(([path, label]) => `<a href="${h(path)}"${path === p.nav ? ' aria-current="page"' : ""}>${esc(label)}</a>`).join("");
    const ctaH = nf && !/^(https?:|tel:|mailto:|#)/.test(c.primary_cta.href) ? "/" + c.primary_cta.href.replace(/^\//, "") : ctaHref(d);
    const sub = style === "editorial" ? [c.year_founded ? `Est. ${c.year_founded}` : "", c.tagline, c.city_state].filter(Boolean).join(" · ")
      : style === "atelier" ? [c.tagline, c.year_founded ? `Est. ${c.year_founded}` : ""].filter(Boolean).join(" · ") : style === "workshop" ? "" : c.tagline;
    const brand = c.logo ? `<img class="logo" src="${esc(asset(c.logo))}" alt="${esc(c.business_name)}">` : `<span class="nm">${esc(c.business_name)}</span>`;
    const act = c.phone || !ctaIsCall
      ? `<div class="act${c.phone && !ctaIsCall ? "" : " one"}">${c.phone ? `<a class="a-tel" href="${tel(c.phone)}">${PHONE_ICON}Call ${esc(c.phone)}</a>` : ""}${ctaIsCall ? "" : `<a class="a-cta" href="${esc(ctaH)}">${esc(c.primary_cta.label)}</a>`}</div>` : "";
    const left = opts.preview ? opts.preview.roundsLeft : 0;
    const pv = opts.preview ? `<div class="pv" role="region" aria-label="BringsUp preview"><div class="pv-in">
<p class="pv-t">${MARK}<span><b>Private preview</b> <span class="pv-s"><span class="pv-lg">Not live yet · </span>${left > 0 ? `${left} round${left === 1 ? "" : "s"} of changes left` : "included rounds used, one more is $150"}</span></span></p>
<p class="pv-b"><a class="pv-ch" href="https://bringsup.com/${left > 0 ? "changes" : "extra"}/?ref=${encodeURIComponent(opts.preview.ref)}">${left > 0 ? "Request changes" : "One more round ($150)"}</a><a class="pv-ok" href="https://bringsup.com/approve/?ref=${encodeURIComponent(opts.preview.ref)}">Approve<span class="pv-lg"> and pay</span> $1,000</a></p>
</div></div>` : "";
    const fonts = `https://fonts.googleapis.com/css2?${L.fonts}&display=swap`;
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(solo ? `${c.business_name}: a homepage concept by BringsUp` : title)}</title>
<meta name="description" content="${esc(p.description)}">
${solo || opts.preview ? '<meta name="robots" content="noindex">' : url ? `<link rel="canonical" href="${esc(url)}">` : ""}
<meta name="theme-color" content="${style === "workshop" ? dark : bg}">
${solo ? "" : `<meta property="og:type" content="website"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(p.description)}">
${url ? `<meta property="og:url" content="${esc(url)}">` : ""}${og ? `<meta property="og:image" content="${esc(og)}"><meta name="twitter:card" content="summary_large_image">` : ""}
<link rel="icon" href="${asset("favicon.svg")}" type="image/svg+xml">`}
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${esc(fonts)}" rel="stylesheet">
${solo ? `<style>${tokens}${css}</style>` : `<link rel="stylesheet" href="${asset("site.css")}">`}
${p.path === "" && !solo ? `<script type="application/ld+json">${ldjson}</script>` : ""}
</head>
<body class="s-${style}" id="top">
<a class="skip" href="#main">Skip to content</a>
<header class="hd"><div class="wrap hd-in">
<a class="brand" href="${h("")}">${brand}</a>
${sub ? `<p class="sub">${esc(sub)}</p>` : ""}
<nav class="nav" aria-label="Main">${links}</nav>
<div class="hd-act">${c.phone ? `<a class="hd-tel" href="${tel(c.phone)}">${esc(c.phone)}</a>` : ""}${ctaIsCall ? "" : `<a class="btn sm" href="${esc(ctaH)}">${esc(c.primary_cta.label)}</a>`}</div>
<details class="mnav"><summary>Menu</summary><nav aria-label="Main">${links}${c.phone ? `<a href="${tel(c.phone)}">Call ${esc(c.phone)}</a>` : ""}</nav></details>
</div></header>
<main id="main">
${p.body(d)}
</main>
<footer class="ft"><div class="wrap ft-in">
<p class="ft-nm">${esc(c.business_name)}</p>
<p>${[c.address ? esc(c.address) : "", c.phone ? `<a href="${tel(c.phone)}">${esc(c.phone)}</a>` : "", c.email ? `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>` : ""].filter(Boolean).join("<br>")}</p>
<p>${c.social.map((s) => `<a href="${esc(s.url)}">${esc(s.label)}</a>`).join(" · ")}${c.social.length ? "<br>" : ""}© ${new Date().getFullYear()} ${esc(c.business_name)}</p>
</div></footer>
${solo ? `<p class="note">${esc(opts.standalone!.note)}</p>` : ""}
${act || pv ? `<div class="dock">${act}${pv}</div>` : ""}
${solo ? "" : ENHANCE}
</body>
</html>
`;
  };

  if (solo) return { "index.html": shell(pages[0]) };

  const files: Record<string, string> = { "site.css": tokens + css };
  for (const p of pages) files[p.path.endsWith(".html") ? p.path : p.path + "index.html"] = shell(p);
  files["favicon.svg"] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="${style === "atelier" ? 0 : 12}" fill="${dark}"/><text x="32" y="42" text-anchor="middle" font-family="${style === "workshop" || style === "craft" ? "Arial,sans-serif" : "Georgia,serif"}" font-weight="700" font-size="26" fill="${ensure(accent, dark, 3)}">${esc(initials(c.business_name))}</text></svg>`;
  files["robots.txt"] = opts.preview ? "User-agent: *\nDisallow: /\n" : `User-agent: *\nAllow: /\n${base ? `\nSitemap: ${base}/sitemap.xml\n` : ""}`;
  if (base && !opts.preview) {
    files["sitemap.xml"] = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.filter((p) => !p.path.endsWith(".html")).map((p) => `  <url><loc>${base}/${p.path}</loc></url>`).join("\n")}\n</urlset>\n`;
  }
  return files;
}

// ---------- CSS ----------
// Shared foundations, then one sheet per style. Colors and fonts come from the tokens on :root.
function baseCss(): string {
  return `
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--fb);font-size:18px;line-height:1.6;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;overflow-x:clip}
img{display:block;max-width:100%;height:auto}
h1,h2,h3,h4,p,ul,ol,dl,dd,figure,blockquote{margin:0}
ul,ol{padding:0;list-style:none}
a{color:inherit;text-decoration-thickness:1px;text-underline-offset:.22em;-webkit-tap-highlight-color:transparent;transition:color .15s,text-decoration-color .15s,text-decoration-thickness .15s,text-underline-offset .15s}
a:hover{text-decoration-thickness:2px;text-underline-offset:.18em}
:focus-visible{outline:2px solid var(--acc-t);outline-offset:3px}
.ft :focus-visible,.s-workshop .hd :focus-visible,.s-workshop .hero :focus-visible,.s-workshop .say :focus-visible,.s-workshop .ph :focus-visible,.s-craft .visit:not(.flat) :focus-visible,.s-landscape .visit:not(.flat) :focus-visible,.act :focus-visible{outline-color:var(--acc-d)}
main img{transition:opacity .35s cubic-bezier(.16,1,.3,1)}
main img[data-fade]{opacity:0}
.wrap{width:100%;max-width:1240px;margin:0 auto;padding:0 20px}
@media(min-width:760px){.wrap{padding:0 40px}}
.skip{position:absolute;left:-9999px;top:8px;background:var(--bg);color:var(--ink);padding:10px 16px;z-index:99}.skip:focus{left:8px}
.d{font-family:var(--fd);font-weight:var(--dw);letter-spacing:var(--dls);line-height:var(--dlh);font-stretch:var(--dst,100%);text-wrap:balance}
.lbl,.vh{font-family:var(--fl);font-size:13px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;line-height:1.4}
.btn{display:inline-flex;align-items:center;justify-content:center;min-height:52px;padding:0 26px;border-radius:var(--rb);background:var(--acc);color:var(--acc-ink);font-family:var(--fl);font-weight:600;font-size:16px;line-height:1.2;text-decoration:none;text-align:center;white-space:nowrap;transition:background-color .15s,color .15s,box-shadow .15s,transform .12s cubic-bezier(.16,1,.3,1)}
.btn:active{transform:translateY(1px) scale(.985);transition-duration:.06s}
.btn:focus-visible{outline-offset:4px}
.btn:hover{background:var(--ink);color:var(--bg)}
.btn.sm{min-height:44px;padding:0 18px;font-size:15px}
.ctas{display:flex;flex-wrap:wrap;align-items:center;gap:14px 22px;margin-top:32px}
.tel{white-space:nowrap}
figure img{width:100%;object-fit:cover;background:var(--alt)}
figcaption{margin-top:10px;font-size:15px;line-height:1.45;color:var(--muted)}
.sec{padding:88px 0}
@media(max-width:759px){.sec{padding:64px 0}}
.prose p+p{margin-top:1em}
.more{margin-top:32px;font-family:var(--fl);font-weight:600;font-size:16px}
.more a{text-decoration-thickness:1.5px}
.hrs div{display:flex;justify-content:space-between;gap:16px;padding:9px 0;border-bottom:1px solid var(--line)}.hrs dd{text-align:right;white-space:nowrap}
.rv{margin-top:36px;font-family:var(--fl);font-size:15px}
.by{font-family:var(--fl);font-size:14px;letter-spacing:.04em}
.vgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:40px;margin-top:48px}
.vgrid p+p{margin-top:8px}.vbtn{margin-top:20px!important}
.tel.big{font-size:22px;font-weight:600}
.map{display:block;width:100%;height:380px;border:0;margin-top:56px;background:var(--alt)}
.ph{padding:72px 0 8px}.ph h1{font-size:clamp(40px,6vw,76px);max-width:18ch;margin-top:14px}.ph .dek{margin-top:20px;font-size:20px;color:var(--muted);max-width:56ch}
.figs{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:28px}.figs img{aspect-ratio:4/3}
.about-g{display:grid;grid-template-columns:5fr 6fr;gap:64px;align-items:start}.about-g.noimg,.about.noimg .about-g{grid-template-columns:minmax(0,40em)}
.about-fig img{aspect-ratio:4/5}.about .prose,.about2 .prose{font-size:19px}.about2 h2{font-size:clamp(30px,3.4vw,44px);margin-bottom:24px}
@media(max-width:859px){.about-g{grid-template-columns:1fr;gap:32px}}
.quotes{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:48px;margin-top:32px}
.quotes blockquote p{font-family:var(--fd);font-size:24px;line-height:1.35}.quotes figcaption{margin-top:16px}
.ft{background:var(--dark);color:var(--on-dark);font-size:15px;line-height:1.6}
.ft-in{display:grid;grid-template-columns:2fr 2fr 1.4fr;gap:32px;padding-top:56px;padding-bottom:56px}
.ft-nm{font-family:var(--fd);font-weight:var(--dw);font-stretch:var(--dst,100%);font-size:26px;line-height:1.1;letter-spacing:var(--dls)}
.ft a{color:var(--on-dark)}.ft p:not(.ft-nm){color:var(--muted-d)}
@media(max-width:759px){.ft-in{grid-template-columns:1fr;gap:20px;padding-top:44px;padding-bottom:44px}}
.note{background:#16181D;color:#D9D6CE;font:14px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;text-align:center;padding:14px 20px;margin:0}
.hd{position:relative;z-index:30}
.brand{text-decoration:none;display:inline-block;min-width:0}.brand .logo{height:52px;width:auto;max-width:200px;object-fit:contain}
.nav{display:flex;gap:30px;align-items:center}.nav a{padding:6px 0;text-decoration:underline 1.5px transparent;text-underline-offset:.4em}.nav a:hover{text-decoration-color:currentColor;text-underline-offset:.3em}.nav a[aria-current]{text-decoration-color:var(--acc-t);text-underline-offset:.3em}
.hd-tel:hover{text-decoration:underline;text-decoration-thickness:1.5px}
.hd-act{display:flex;align-items:center;gap:22px}.hd-tel{text-decoration:none;font-weight:600;white-space:nowrap}
.mnav{display:none}
/* the phone menu works without JavaScript (details/summary): two bars turn into a cross, and the panel drops in */
.mnav summary{list-style:none;cursor:pointer;position:relative;display:inline-flex;align-items:center;min-height:44px;padding:0 42px 0 14px;border:1px solid currentColor;border-radius:var(--r);font-family:var(--fl);font-size:15px;font-weight:600;-webkit-tap-highlight-color:transparent;transition:background-color .15s,transform .12s}
.mnav summary::-webkit-details-marker{display:none}
.mnav summary::before,.mnav summary::after{content:"";position:absolute;right:14px;top:50%;width:15px;height:2px;margin-top:-1px;border-radius:1px;background:currentColor;transition:transform .22s cubic-bezier(.16,1,.3,1)}
.mnav summary::before{transform:translateY(-3.5px)}.mnav summary::after{transform:translateY(3.5px)}
.mnav[open] summary::before{transform:rotate(45deg)}.mnav[open] summary::after{transform:rotate(-45deg)}
.mnav summary:active{transform:translateY(1px)}
.mnav summary:hover{background:color-mix(in srgb,currentColor 8%,transparent)}
.mnav nav{position:absolute;left:0;right:0;top:100%;background:var(--bg);color:var(--ink);border-bottom:1px solid var(--line);padding:8px 20px 20px;display:flex;flex-direction:column;box-shadow:0 18px 30px -24px rgba(0,0,0,.4)}
.mnav[open] nav{animation:mnav-in .22s cubic-bezier(.16,1,.3,1)}
@keyframes mnav-in{from{opacity:0;transform:translateY(-6px)}}
.mnav nav a{padding:14px 0;border-top:1px solid var(--line);text-decoration:none;font-family:var(--fl);font-size:18px;transition:color .15s,padding-left .2s cubic-bezier(.16,1,.3,1)}
.mnav nav a:hover,.mnav nav a:active{color:var(--acc-t);padding-left:4px}
.mnav nav a[aria-current]{color:var(--acc-t)}
@media(max-width:899px){.nav,.hd-act{display:none}.mnav{display:block}}
.dock{position:sticky;bottom:0;z-index:40}
.act{display:none}
@media(max-width:899px){.act{display:grid;grid-template-columns:1fr 1fr;background:var(--dark);border-top:1px solid rgba(255,255,255,.12)}.act.one{grid-template-columns:1fr}
.act a{display:flex;align-items:center;justify-content:center;gap:8px;min-height:58px;padding:6px 12px;color:var(--on-dark);font-family:var(--fl);font-weight:600;font-size:16px;text-decoration:none;text-align:center;line-height:1.2;-webkit-tap-highlight-color:transparent;transition:background-color .12s,filter .12s}
.act a svg{flex:none;transition:transform .2s cubic-bezier(.16,1,.3,1)}
.act a:active{background:color-mix(in srgb,var(--dark) 80%,#fff)}.act a:active svg{transform:rotate(-12deg) scale(.92)}
.act a+a,.act.one a{background:var(--acc);color:var(--acc-ink)}
.act a+a:active,.act.one a:active{filter:brightness(.9)}}
.pv{background:#16181D;color:#FBFAF7;font:15px/1.4 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;border-top:1px solid #2B2E36}
.pv-in{max-width:1240px;margin:0 auto;padding:12px 20px;display:flex;align-items:center;justify-content:space-between;gap:12px 24px;flex-wrap:wrap}
.pv-t{display:flex;align-items:center;gap:12px;margin:0}.pv-t svg{flex:none}.pv-t b{font-weight:650}.pv-s{color:#B9B6AE}
.pv-b{display:flex;gap:10px;margin:0;flex-wrap:wrap}
.pv a{display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:0 16px;border-radius:6px;font-weight:600;font-size:14.5px;text-decoration:none;color:#FBFAF7;-webkit-tap-highlight-color:transparent;transition:background-color .15s,box-shadow .15s,transform .12s cubic-bezier(.16,1,.3,1)}
.pv a:active{transform:translateY(1px) scale(.985)}
.pv-ch{box-shadow:inset 0 0 0 1px #4A4E58}.pv-ch:hover{box-shadow:inset 0 0 0 1px #FBFAF7}
.pv .pv-ok{background:#FFB37A;color:#16181D}.pv .pv-ok:hover{background:#FFC597}.pv .pv-ok:active{background:#F5A266}
.pv a:focus-visible{outline:2px solid #FFB37A;outline-offset:2px}
@media(max-width:599px){.pv-in{padding:8px 12px 10px;gap:8px}.pv-t{font-size:13.5px;gap:8px}.pv-t svg{width:18px;height:18px}.pv-lg{display:none}.pv-b{width:100%;flex-wrap:nowrap}.pv-b a{flex:1;min-height:40px;padding:0 8px;font-size:14px;white-space:nowrap}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*::before,*::after{transition:none!important;animation:none!important}}
`;
}
/** Last, so it wins over every style: a reviews line on its own when there are no quotes to show. */
function lastCss(): string {
  return `.sec.only-rv{background:var(--bg);color:var(--ink);padding:40px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line);text-align:center}.only-rv .rv{margin:0;color:var(--ink)}
`;
}

const STYLE_CSS: Record<Style, string> = {
  // A printed bakery or deli menu: serif nameplate with ears, ruled sections, dotted price leaders, pull quote.
  editorial: `
body{font-size:19px;line-height:1.55}
.hd{border-bottom:1px solid var(--ink)}
.hd-in{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;column-gap:24px;padding-top:26px}
.brand{grid-column:2;grid-row:1;text-align:center}
.brand .nm{display:block;font-family:var(--fd);font-weight:500;font-size:clamp(38px,5.2vw,68px);letter-spacing:-.03em;line-height:1;font-variation-settings:"opsz" 72}
.sub{grid-column:1/-1;grid-row:2;text-align:center;margin-top:20px;padding:9px 0;border-top:1px solid var(--ink);font-family:var(--fl);font-size:12.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase}
.nav{grid-column:1;grid-row:1;justify-self:start;font-family:var(--fl);font-size:16px;font-weight:500}
.hd-act{grid-column:3;grid-row:1;justify-self:end;font-family:var(--fl);font-size:16px}
.btn{background:var(--ink);color:var(--bg)}.btn:hover{background:var(--acc-t);color:#fff}.btn:active{background:color-mix(in srgb,var(--acc-t) 85%,#000)}
.lead{padding:56px 0 96px}
.lead-g{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));column-gap:32px;align-items:end}
.lead-copy{grid-column:1/6}
.lead-fig{grid-column:6/13;align-self:start;margin-top:12px}.lead-fig img{aspect-ratio:6/5}
@media(min-width:900px) and (max-width:1120px){.s-editorial .hd-tel{display:none}}
.lead h1{font-size:clamp(44px,5.4vw,76px);font-variation-settings:"opsz" 72}
.lead .dek{font-size:21px;line-height:1.5;margin-top:24px;color:var(--muted);max-width:30em}
.or{font-family:var(--fl);font-size:16px;color:var(--muted)}.or a{color:var(--ink);font-weight:600}
.today{margin-top:44px;font-family:var(--fl);font-size:15.5px;max-width:420px}.today .vh{padding-bottom:10px;border-bottom:1px solid var(--ink);color:var(--acc-t)}
.lead.noimg .lead-copy{grid-column:2/12;text-align:center}.lead.noimg h1{font-size:clamp(46px,7vw,96px)}.lead.noimg .dek{margin-left:auto;margin-right:auto}.lead.noimg .ctas{justify-content:center}.lead.noimg .today{margin-left:auto;margin-right:auto;text-align:left}
.carte{border-top:1px solid var(--ink);padding-top:0}
.sec-h{display:grid;grid-template-columns:1fr 1fr;gap:32px;align-items:end;padding:36px 0 28px;border-bottom:1px solid var(--line)}
.sec-h h2{font-size:clamp(44px,5.4vw,72px)}.sec-h .dek{font-style:italic;font-size:21px;color:var(--muted);justify-self:end;max-width:24em;text-align:right}
.menu{columns:2 300px;column-gap:56px;padding-top:36px}.menu.g3{columns:3 260px}
.grp{break-inside:avoid;margin-bottom:28px}
.menu.g1 .grp{break-inside:auto}
.gh{font-family:var(--fl);font-size:13px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--acc-t);padding:6px 0 10px;border-bottom:1px solid var(--ink)}
.mi{padding:16px 0 15px;border-bottom:1px solid var(--line);break-inside:avoid}
.mi-h{display:flex;align-items:baseline;gap:10px}
.mi .n{font-family:var(--fd);font-weight:500;font-size:24px;line-height:1.2;letter-spacing:-.01em}
.mi .ld{flex:1;min-width:24px;border-bottom:2px dotted color-mix(in srgb,var(--ink) 40%,transparent);transform:translateY(-6px)}
.mi .pr{font-family:var(--fd);font-size:22px;font-variant-numeric:lining-nums;white-space:nowrap}
.mi p{font-style:italic;color:var(--muted);font-size:17.5px;line-height:1.45;margin-top:4px;max-width:34em}
.plates{display:grid;grid-template-columns:7fr 5fr;gap:24px 32px;margin-top:56px}
.plates figure:first-child{grid-row:span 2}.plates figure:first-child img{height:100%;min-height:420px}
.plates img{aspect-ratio:4/3}.plates figcaption{font-style:italic;font-size:16px}
.plates.n1{grid-template-columns:1fr}.plates.n1 img{aspect-ratio:21/9;min-height:0!important}
.plates.n2 figure:first-child{grid-row:auto}.plates.n2 img{min-height:0!important}
.pull{text-align:center;border-top:1px solid var(--ink);padding:104px 0}
.pq blockquote p{font-family:var(--fd);font-style:italic;font-weight:400;font-size:clamp(30px,3.8vw,50px);line-height:1.18;letter-spacing:-.015em;max-width:24ch;margin:0 auto;text-wrap:balance}
.pq blockquote p::before{content:"“";display:block;font-size:2.2em;line-height:.6;height:.42em;color:var(--acc-t);font-style:normal}
.pq figcaption,.more-q figcaption{margin-top:26px}
.by{text-transform:uppercase;letter-spacing:.12em;font-size:13px;font-weight:600;color:var(--ink)}
.more-q{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:48px;max-width:960px;margin:72px auto 0;padding-top:40px;border-top:1px solid var(--line);text-align:left}
.more-q blockquote p{font-size:21px;line-height:1.45}.more-q blockquote p::before{content:"“"}.more-q blockquote p::after{content:"”"}
.pull .rv{color:var(--muted)}
.story{background:var(--alt)}
.story-g{display:grid;grid-template-columns:5fr 6fr;gap:72px;align-items:center}
.story.noimg .story-g{grid-template-columns:minmax(0,38em);justify-content:center}
.story-fig img{aspect-ratio:4/5}
.story h2{font-size:clamp(36px,4.2vw,56px);margin-bottom:28px}
.story .prose>p:first-of-type::first-letter{float:left;font-family:var(--fd);font-size:4.1em;line-height:.82;padding:6px 10px 0 0;color:var(--acc-t)}
.visit{text-align:center}
.visit h2{font-size:clamp(36px,4.6vw,60px);max-width:18ch;margin:0 auto}
.visit .vgrid{grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:0;border-top:1px solid var(--ink);text-align:left;font-family:var(--fl);font-size:17px}
.vc{padding:28px 32px 8px}.vc+.vc{border-left:1px solid var(--line)}
.vh{color:var(--acc-t);margin-bottom:14px}
.visit.flat .vgrid{margin-top:0}
.ph{text-align:center;padding-bottom:40px;border-bottom:1px solid var(--ink)}.ph h1,.ph .dek{margin-left:auto;margin-right:auto}.ph .lbl{color:var(--acc-t)}
.carte.inner{border-top:0}
@media(max-width:899px){
.hd-in{grid-template-columns:1fr auto;padding-top:14px;row-gap:0}
.brand{grid-column:1;text-align:left}.brand .nm{font-size:clamp(28px,8.4vw,36px)}
.mnav{grid-column:2;grid-row:1}
.sub{text-align:left;font-size:11px;letter-spacing:.12em;margin-top:12px;padding:8px 0}
.lead{padding:28px 0 64px}
.lead-g{display:flex;flex-direction:column;align-items:stretch}
.lead-fig{order:-1;margin:0 -20px 28px}.lead-fig img{aspect-ratio:4/3}
.lead h1{font-size:44px}
.lead .dek{font-size:19px;margin-top:18px}
.ctas{margin-top:26px}.ctas .btn{flex:1 1 100%}
.today{margin-top:36px;max-width:none}
.sec-h{grid-template-columns:1fr;gap:10px}.sec-h .dek{justify-self:start;text-align:left;font-size:19px}
.menu{columns:1;padding-top:16px}
.mi .n{font-size:21px}.mi .pr{font-size:20px}.mi p{font-size:17px}
.plates,.plates.n2{grid-template-columns:1fr 1fr;gap:16px;margin-top:40px}.plates figure:first-child{grid-column:1/-1;grid-row:auto}.plates figure:first-child img{min-height:0;height:auto;aspect-ratio:4/3}.plates img{aspect-ratio:1}
.pull{padding:72px 0}.pq blockquote p{font-size:30px}
.more-q{gap:32px;margin-top:48px}
.story-g{grid-template-columns:1fr;gap:32px}
.visit .vgrid{grid-template-columns:1fr}.vc{padding:24px 0 8px}.vc+.vc{border-left:0;border-top:1px solid var(--line)}
}
`,

  // Workshop: dark header with the phone number, expanded grotesk headline, photo straddling into the page, numbered spec rows.
  workshop: `
body{font-size:18px}
.hd{background:var(--dark);color:var(--on-dark)}
.hd-in{display:flex;align-items:center;gap:36px;min-height:80px}
.brand .nm{font-family:var(--fd);font-weight:800;font-stretch:120%;font-size:19px;letter-spacing:.04em;text-transform:uppercase;line-height:1}
.brand,.nav a,.btn{white-space:nowrap}
.nav{margin-left:auto;font-family:var(--fl);font-size:14px;text-transform:uppercase;letter-spacing:.06em}
.hd-act{gap:26px}.hd-tel{font-family:var(--fd);font-stretch:112%;font-weight:700;font-size:21px;letter-spacing:-.01em}
.btn{font-family:var(--fd);font-weight:700;font-stretch:108%;letter-spacing:.01em}
.btn:hover{background:var(--on-dark);color:var(--dark)}.btn:active{background:color-mix(in srgb,var(--on-dark) 85%,#000)}
.lbl{font-family:var(--fl);font-weight:500;letter-spacing:.08em}
.hero{background:linear-gradient(var(--dark),var(--dark)) top/100% calc(100% - 160px) no-repeat;color:var(--on-dark);padding-top:72px}
.hero.noimg{background:var(--dark);padding-bottom:88px}
.kick{font-family:var(--fl);font-size:14px;letter-spacing:.06em;text-transform:uppercase;color:var(--acc-d)}
.hero h1{font-size:clamp(46px,7.6vw,116px);line-height:.93;max-width:13.5ch;margin-top:22px}
.hero-row{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:48px;align-items:end;margin-top:40px}
.hero .dek{font-size:20px;line-height:1.55;color:var(--muted-d);max-width:40em}
.hero .ctas{margin-top:0;justify-content:flex-end}
.tel.alt{display:inline-flex;align-items:center;min-height:52px;padding:0 22px;border-radius:var(--rb);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.45);color:var(--on-dark);text-decoration:none;font-weight:700;font-family:var(--fd)}
.tel.alt:hover{box-shadow:inset 0 0 0 1.5px var(--on-dark)}
.hero-fig{margin-top:64px}.hero-fig img{aspect-ratio:21/9}
.makes-s{padding:44px 0 40px;border-bottom:1px solid var(--line)}
.makes-s .lbl{color:var(--muted)}
.makes{display:flex;flex-wrap:wrap;gap:4px 0;margin-top:14px;font-family:var(--fd);font-weight:800;font-stretch:118%;font-size:clamp(24px,3.2vw,44px);text-transform:uppercase;letter-spacing:-.01em;line-height:1.1}
.makes li:not(:last-child)::after{content:"/";color:var(--acc-t);font-weight:400;margin:0 .45em}
.svc .sec-h{display:grid;grid-template-columns:minmax(0,6fr) minmax(0,5fr);gap:48px;align-items:end;margin-bottom:48px}
.svc .sec-h h2{font-size:clamp(40px,5.2vw,72px)}
.svc .sec-h .dek{font-size:19px;color:var(--muted);max-width:30em}
.gh{font-family:var(--fl);font-size:13px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:var(--acc-t);margin:48px 0 0}
.rows{border-bottom:1px solid var(--ink)}
.rows li{display:grid;grid-template-columns:64px minmax(0,4fr) minmax(0,5fr) minmax(0,1.3fr);gap:32px;padding:30px 0 28px;border-top:1px solid var(--ink);align-items:baseline}
.rows .no{font-family:var(--fl);font-size:14px;color:var(--acc-t)}
.rows .n{font-family:var(--fd);font-size:25px;font-weight:700;font-stretch:108%;letter-spacing:-.015em;line-height:1.15}
.rows p{color:var(--muted);font-size:17.5px;line-height:1.55}
.rows .pr{font-family:var(--fl);font-size:15px;text-align:right;white-space:nowrap}
.svc.inner .rows{margin-top:24px}
.how{background:var(--alt)}
.how-g{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,6fr);gap:64px;align-items:start}
.how h2{font-size:clamp(34px,4vw,56px)}
.how .prose p{font-size:18.5px;color:var(--muted);max-width:36em}
.how .prose p:first-child{font-size:24px;line-height:1.4;color:var(--ink);font-weight:500;letter-spacing:-.01em}
.how+.how{background:var(--bg)}
.film{display:grid;grid-template-columns:5fr 4fr 3fr;gap:16px}
.film.n4{grid-template-columns:4fr 3fr 3fr 4fr}.film.n2{grid-template-columns:3fr 2fr}.film.n1{grid-template-columns:1fr}
.film img{height:440px}.film.n1 img{height:auto;aspect-ratio:21/9}
.film figcaption{font-family:var(--fl);font-size:13px;color:var(--muted);display:flex;gap:12px;margin-top:12px}.film figcaption span{color:var(--acc-t)}
.say{background:var(--dark);color:var(--on-dark)}
.pq{max-width:1000px}
.pq blockquote p{font-family:var(--fd);font-weight:600;font-stretch:104%;font-size:clamp(28px,3.4vw,46px);line-height:1.16;letter-spacing:-.02em;text-wrap:pretty}
.pq blockquote p::before{content:"“";display:block;font-weight:800;font-size:2.4em;line-height:.8;height:.5em;color:var(--acc-d)}
.say figcaption{margin-top:28px;color:var(--muted-d)}.say .by{font-family:var(--fl);text-transform:uppercase}.say a{color:var(--on-dark)}
.more-q{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:40px;margin-top:64px;padding-top:36px;border-top:1px solid rgba(255,255,255,.18)}
.more-q blockquote p{font-size:19px;line-height:1.5;color:var(--on-dark)}.more-q blockquote p::before{content:"“"}.more-q blockquote p::after{content:"”"}
.say .rv{color:var(--muted-d);font-family:var(--fl)}
.visit-g{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:72px;align-items:start}
.visit h2{font-size:clamp(34px,4.4vw,60px);max-width:16ch}
.bigtel{margin:28px 0 20px}.bigtel a{font-family:var(--fd);font-weight:800;font-stretch:112%;font-size:clamp(38px,5.4vw,72px);letter-spacing:-.03em;line-height:1;text-decoration:underline;text-decoration-color:var(--acc-t);text-decoration-thickness:4px;text-underline-offset:.16em}
.bigtel a{transition:color .15s,text-decoration-thickness .15s,text-underline-offset .15s}.bigtel a:hover{color:var(--acc-t);text-decoration-thickness:6px;text-underline-offset:.12em}
.visit .adr{font-size:19px}.dir{font-family:var(--fl);font-size:15px}
.vh-col .lbl{padding-bottom:12px;border-bottom:1px solid var(--ink)}
.vh-col .hrs{font-family:var(--fl);font-size:15.5px}
.visit .vgrid{font-size:17px}.vh{font-family:var(--fl);font-weight:500;color:var(--acc-t);margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid var(--ink)}
.visit .vgrid .hrs{font-family:var(--fl);font-size:15px}
.ph{background:var(--dark);color:var(--on-dark);padding:64px 0 56px}.ph .lbl{color:var(--acc-d)}.ph .dek{color:var(--muted-d)}
.ft{border-top:1px solid rgba(255,255,255,.1)}.ft p:not(.ft-nm){font-family:var(--fl);font-size:13.5px}.ft-nm{text-transform:uppercase;font-size:22px;font-stretch:120%;letter-spacing:.02em}
.mnav summary{border-color:rgba(255,255,255,.4)}
.act a{font-family:var(--fd);font-stretch:104%;font-weight:700}
@media(max-width:899px){
.hd-in{min-height:64px;gap:12px;justify-content:space-between}
.brand .nm{font-size:16px}
.hero{padding-top:40px;background-size:100% calc(100% - 70px)}
.kick{font-size:12.5px}
.hero h1{font-size:44px;line-height:.95;margin-top:16px}
.hero-row{grid-template-columns:1fr;gap:26px;margin-top:22px}.hero .dek{font-size:18px}
.hero .ctas{justify-content:flex-start}.hero .ctas>*{flex:1 1 100%}
.hero-fig{margin:36px -20px 0}.hero-fig img{aspect-ratio:4/3}
.makes{font-size:24px}
.svc .sec-h{grid-template-columns:1fr;gap:10px;margin-bottom:28px}
.rows li{grid-template-columns:40px minmax(0,1fr);gap:6px 12px;padding:22px 0}
.rows .n{font-size:22px}.rows p,.rows .pr{grid-column:2}.rows .pr{text-align:left;color:var(--acc-t)}
.how-g{grid-template-columns:1fr;gap:24px}.how .prose p:first-child{font-size:21px}
.film,.film.n4,.film.n2{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:12px;margin-right:-20px;padding-right:20px;scrollbar-width:none}
.film figure{flex:0 0 80%;scroll-snap-align:start}.film img{height:auto;aspect-ratio:4/5}
.pq blockquote p{font-size:27px}
.visit-g{grid-template-columns:1fr;gap:40px}.bigtel a{font-size:38px}
}
`,

  // Craft: architecture-monograph calm. Tight grotesk display, serif reading text, a hero photo running off the right edge, project grid.
  craft: `
body{font-size:19px;line-height:1.6}
.hd{border-bottom:1px solid var(--line)}
.hd-in{display:flex;align-items:center;gap:20px;min-height:84px}
.brand .nm{font-family:var(--fd);font-weight:700;font-size:21px;letter-spacing:-.025em}
.sub{font-style:italic;color:var(--muted);font-size:16px;margin-right:auto;padding-left:16px;border-left:1px solid var(--line)}
.nav{font-family:var(--fl);font-size:15.5px;font-weight:500;gap:28px;margin-left:auto}.sub+.nav{margin-left:0}
.hd-act{font-family:var(--fl);font-size:15.5px;padding-left:28px;border-left:1px solid var(--line)}
.lbl{font-family:var(--fl);font-weight:600;letter-spacing:.08em;color:var(--muted)}
.hero{padding-top:72px}
.hero h1{font-size:clamp(46px,7.4vw,112px);line-height:.94;max-width:12.5ch}
.hero-b{display:grid;grid-template-columns:minmax(40px,1fr) minmax(0,380px) 56px minmax(0,724px) minmax(40px,1fr);margin-top:64px;align-items:end}
.hero-copy{grid-column:2}.hero-fig{grid-column:4/6}
.hero-fig img{aspect-ratio:3/2}
.hero.noimg .hero-copy{grid-column:2/5}.hero.noimg .dek{max-width:34em;font-size:23px}
.hero .dek{font-size:20px;line-height:1.55;color:var(--muted)}
.hero .ctas{gap:14px 20px}.hero .tel{font-family:var(--fl);font-size:16px;color:var(--muted)}
.make{padding:104px 0 96px;border-bottom:1px solid var(--line)}
.makes{font-family:var(--fb);font-weight:400;font-size:clamp(28px,3.4vw,46px);line-height:1.22;letter-spacing:-.015em;max-width:30ch;margin-top:20px;text-wrap:balance}
.work-s{padding-top:96px}
.work{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:64px 32px;margin-top:32px;align-items:end}
.work figure:nth-child(4n+1){grid-column:1/8}.work figure:nth-child(4n+1) img{aspect-ratio:4/3}
.work figure:nth-child(4n+2){grid-column:9/13}.work figure:nth-child(4n+2) img{aspect-ratio:4/5}
.work figure:nth-child(4n+3){grid-column:2/6;align-self:start}.work figure:nth-child(4n+3) img{aspect-ratio:4/5}
.work figure:nth-child(4n+4){grid-column:7/13;align-self:start}.work figure:nth-child(4n+4) img{aspect-ratio:3/2}
.work figure:nth-child(5){grid-column:3/11}.work figure:nth-child(5) img{aspect-ratio:16/9}
.work.n1 figure{grid-column:1/-1!important}.work.n1 img{aspect-ratio:21/9!important}
.work figcaption,.appr figcaption{font-family:var(--fl);font-size:14.5px;color:var(--muted);margin-top:14px;padding-top:12px;border-top:1px solid var(--line)}
.svc{border-top:1px solid var(--line);margin-top:24px}
.svc-g{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,8fr);gap:56px;align-items:start}
.svc h2{font-size:clamp(34px,4vw,54px)}.svc .dek{margin-top:18px;color:var(--muted);font-size:18px;max-width:22em}
.gh{font-family:var(--fl);font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--acc-t);margin:0 0 4px}
.pairs{display:grid;grid-template-columns:1fr 1fr;gap:0 40px}.pairs+.gh{margin-top:40px}
.pairs li{border-top:1px solid var(--ink);padding:22px 0 36px}
.pairs .n{font-family:var(--fd);font-weight:650;font-size:23px;letter-spacing:-.02em;line-height:1.2}
.pairs p{margin-top:10px;color:var(--muted);font-size:17.5px;line-height:1.55}
.pairs .pr{display:block;margin-top:12px;font-family:var(--fl);font-size:14.5px;font-weight:600;color:var(--acc-t)}
.svc.inner .pairs{grid-template-columns:repeat(auto-fill,minmax(300px,1fr))}
.appr{background:var(--alt)}
.appr-g{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,6fr);gap:80px;align-items:center}
.appr.noimg .appr-g{grid-template-columns:minmax(0,40em)}
.appr-fig img{aspect-ratio:4/5}
.appr h2{font-size:clamp(32px,3.6vw,48px);margin-bottom:28px}
.appr .prose p{font-size:19px}.appr .prose p:first-of-type{font-size:23px;line-height:1.45}
.say{padding:120px 0}
.pq{max-width:980px;position:relative}
.pq blockquote p{font-family:var(--fb);font-style:italic;font-size:clamp(28px,3.4vw,44px);line-height:1.25;letter-spacing:-.015em;text-wrap:pretty}
.pq blockquote p::before{content:"“";position:absolute;left:-.55em;color:var(--acc-t)}
.pq blockquote p::after{content:"”"}
.pq figcaption,.more-q figcaption{margin-top:26px}.by{font-weight:600}
.more-q{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:40px;margin-top:64px}
.more-q blockquote p{font-size:19px;font-style:italic}
.visit{background:var(--dark);color:var(--on-dark)}
.visit h2{font-size:clamp(40px,5.6vw,80px);max-width:14ch}
.visit .vgrid{border-top:1px solid rgba(255,255,255,.2);padding-top:32px;margin-top:56px}
.vh{color:var(--muted-d);margin-bottom:14px;font-weight:600}
.visit a{color:var(--on-dark)}.visit .hrs div{border-color:rgba(255,255,255,.14)}.visit .tel.big{font-family:var(--fd);font-size:26px}
.visit .btn{background:var(--on-dark);color:var(--dark)}.visit .btn:hover{background:var(--acc);color:var(--acc-ink)}
.visit.flat{background:var(--bg);color:var(--ink)}.visit.flat a{color:var(--ink)}.visit.flat .vgrid{border-color:var(--line);margin-top:0}.visit.flat .vh{color:var(--muted)}.visit.flat .hrs div{border-color:var(--line)}.visit.flat .btn{background:var(--acc);color:var(--acc-ink)}
.ph{padding-top:88px}
.ft{background:var(--bg);color:var(--ink);border-top:1px solid var(--line)}.ft a{color:var(--ink)}.ft p:not(.ft-nm){color:var(--muted)}
@media(max-width:899px){
.hd-in{min-height:66px;justify-content:space-between}.sub{display:none}
.brand .nm{font-size:19px}
.hero{padding-top:40px}
.hero h1{font-size:46px}
.hero-b{display:flex;flex-direction:column;margin-top:28px}
.hero-copy{padding:0 20px}.hero-fig{order:2;margin-top:36px}
.hero .dek{font-size:18.5px}.ctas .btn{flex:1 1 100%}
.make{padding:64px 0}.makes{font-size:29px}
.work{grid-template-columns:1fr;gap:40px}.work figure{grid-column:1/-1!important}.work img{aspect-ratio:4/3!important}
.svc-g{grid-template-columns:1fr;gap:28px}.pairs,.svc.inner .pairs{grid-template-columns:1fr}
.appr-g{grid-template-columns:1fr;gap:32px}.appr .prose p:first-of-type{font-size:21px}
.say{padding:72px 0}.pq blockquote p{font-size:27px}.pq blockquote p::before{position:static}
.visit h2{font-size:42px}
}
`,

  // Atelier: centered and quiet. Letterspaced name, refined serif, one big image, services as a centered list.
  atelier: `
body{font-size:17.5px;line-height:1.75;letter-spacing:.005em}
.hd-in{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding-top:30px}
.brand{grid-column:2;grid-row:1;text-align:center}
.brand .nm{display:block;font-family:var(--fd);font-weight:500;font-size:30px;letter-spacing:.2em;text-transform:uppercase;line-height:1.1;padding-left:.2em}
.sub{grid-column:2;grid-row:2;text-align:center;margin-top:8px;font-family:var(--fl);font-size:11.5px;letter-spacing:.32em;text-transform:uppercase;color:var(--muted)}
.nav{grid-column:1/-1;grid-row:3;justify-content:center;gap:48px;margin-top:26px;padding:14px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line);font-family:var(--fl);font-size:12.5px;letter-spacing:.22em;text-transform:uppercase}
.hd-act{grid-column:3;grid-row:1;justify-self:end;font-family:var(--fl);font-size:14px;letter-spacing:.1em}.hd-act .btn{display:none}
.hd-act .hd-tel{font-weight:400}
.btn{background:transparent;color:var(--ink);box-shadow:inset 0 0 0 1px var(--ink);font-weight:500;font-size:13px;letter-spacing:.22em;text-transform:uppercase;padding:0 36px;min-height:54px;transition:background-color .25s,color .25s,transform .12s cubic-bezier(.16,1,.3,1)}
.btn:hover{background:var(--ink);color:var(--bg)}.btn:active{transform:none;background:color-mix(in srgb,var(--ink) 88%,var(--bg))}
.lbl,.vh{font-weight:500;font-size:12px;letter-spacing:.28em;color:var(--muted)}
.hero{text-align:center;padding:112px 0 0}
.hero h1{font-size:clamp(44px,6.2vw,88px);max-width:15ch;margin:0 auto}
.hero .dek{max-width:34em;margin:30px auto 0;color:var(--muted);font-size:18.5px}
.hero .ctas{justify-content:center;margin-top:44px}
.hero-fig{max-width:1160px;margin:96px auto 0;padding:0 40px}.hero-fig img{aspect-ratio:16/9}
.hero.noimg{padding-bottom:40px}
.svc{text-align:center;padding-top:120px}
.svc>.wrap>.dek{max-width:32em;margin:18px auto 0;color:var(--muted)}
.gh{font-family:var(--fl);font-weight:500;font-size:12px;letter-spacing:.28em;text-transform:uppercase;color:var(--acc-t);margin-top:64px}
.clist{max-width:640px;margin:0 auto}
.clist li{padding:44px 0 0}
.clist li::before{content:"";display:block;width:36px;height:1px;background:var(--acc-t);margin:0 auto 44px}
.clist .n{font-family:var(--fd);font-weight:500;font-size:36px;line-height:1.15;letter-spacing:-.005em}
.clist p{margin:12px auto 0;color:var(--muted);max-width:34em}
.clist .pr{display:block;margin-top:12px;font-family:var(--fl);font-size:12.5px;letter-spacing:.22em;text-transform:uppercase;color:var(--acc-t)}
.more{text-align:center;font-weight:500;font-size:13px;letter-spacing:.22em;text-transform:uppercase;margin-top:56px}
.duo{display:grid;grid-template-columns:1fr 1fr;gap:40px;max-width:1080px;align-items:start}
.duo figure:nth-child(2){margin-top:140px}.duo img{aspect-ratio:4/5}.duo.n1{grid-template-columns:minmax(0,640px);justify-content:center}
.duo figcaption{text-align:center;font-family:var(--fd);font-style:italic;font-size:18px}
.say{text-align:center;padding:120px 0}
.pq blockquote p{font-family:var(--fd);font-style:italic;font-size:clamp(30px,3.6vw,48px);line-height:1.25;max-width:24ch;margin:0 auto;text-wrap:balance}
.pq blockquote p::before{content:"“"}.pq blockquote p::after{content:"”"}
.pq figcaption,.more-q figcaption{margin-top:28px}
.by{text-transform:uppercase;letter-spacing:.24em;font-size:11.5px;color:var(--muted)}
.more-q{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:56px;max-width:900px;margin:80px auto 0}
.more-q blockquote p{font-family:var(--fd);font-style:italic;font-size:23px;line-height:1.4}
.say .rv{font-size:12.5px;letter-spacing:.2em;text-transform:uppercase}
.story{text-align:center;background:var(--alt)}
.story .wrap{max-width:820px}
.story h2{font-size:clamp(34px,4vw,54px);margin-bottom:28px}
.story p{max-width:36em;margin-left:auto;margin-right:auto;color:var(--muted)}
.visit{text-align:center}
.visit h2{font-size:clamp(34px,4.4vw,58px);max-width:16ch;margin:0 auto}
.visit .vgrid{max-width:960px;margin:56px auto 0;gap:56px}
.visit .vh{margin-bottom:16px}
.visit .hrs div{justify-content:center;gap:12px;border:0;padding:3px 0}.visit .hrs dt::after{content:"·";margin-left:12px;color:var(--acc-t)}
.ph{text-align:center;padding:96px 0 32px}.ph h1,.ph .dek{margin-left:auto;margin-right:auto}
.ft{background:var(--alt);color:var(--ink);text-align:center}.ft-in{grid-template-columns:1fr;gap:12px}.ft a{color:var(--ink)}.ft p:not(.ft-nm){color:var(--muted)}
.ft-nm{font-weight:500;text-transform:uppercase;letter-spacing:.2em;font-size:22px}
@media(max-width:899px){
.hd{border-bottom:1px solid var(--line)}
.hd-in{grid-template-columns:1fr auto;padding-top:16px;padding-bottom:14px;row-gap:0}
.brand{grid-column:1;text-align:left}.brand .nm{font-size:20px;letter-spacing:.14em;padding-left:0}
.sub{grid-column:1;text-align:left;margin-top:4px;font-size:10.5px;letter-spacing:.24em}
.mnav{grid-column:2;grid-row:1/3}
.mnav summary{font-weight:500;letter-spacing:.12em;text-transform:uppercase;font-size:12px}
.hero{padding-top:64px}
.hero h1{font-size:44px}
.hero .dek{font-size:17.5px}
.hero-fig{padding:0;margin-top:64px}.hero-fig img{aspect-ratio:4/5}
.svc{padding-top:88px}.clist .n{font-size:30px}
.duo{grid-template-columns:1fr;gap:28px}.duo figure:nth-child(2){margin-top:0}
.say{padding:80px 0}.pq blockquote p{font-size:30px}
.visit .vgrid{grid-template-columns:1fr;gap:40px}
}
`,

  // Landscape: the photos lead. Full-bleed image, headline below it, a gallery mosaic, minimal chrome.
  landscape: `
body{font-size:18px;line-height:1.6}
.hd-in{display:flex;align-items:center;gap:20px;min-height:84px}
.brand .nm{font-family:var(--fd);font-size:32px;letter-spacing:-.015em;line-height:1}
.sub{font-size:14.5px;color:var(--muted);margin-right:auto;padding-left:18px}
.nav{margin-left:auto;font-size:16px;font-weight:500}.sub+.nav{margin-left:0}
.hd-act{font-size:16px}
.lbl{font-weight:600;letter-spacing:.08em;color:var(--muted)}
.hero-fig img{width:100%;height:clamp(420px,74vh,820px)}
.hero-t{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,4fr);gap:64px;align-items:end;padding-top:56px;padding-bottom:88px}
.hero h1{font-size:clamp(50px,7.4vw,116px);line-height:.95}
.hero .dek{font-size:19.5px;color:var(--muted)}
.hero .ctas{margin-top:26px}.hero .tel{color:var(--muted)}
.hero.noimg .hero-t{padding-top:96px;grid-template-columns:1fr;gap:32px}.hero.noimg .dek{max-width:34em}
.mos-s{padding-top:0}
.mosaic{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:16px}
.mosaic figure:first-child{grid-row:span 2}.mosaic figure:first-child img{height:100%;min-height:600px}
.mosaic img{aspect-ratio:4/3}
.mosaic.n1{grid-template-columns:1fr}.mosaic.n1 img{aspect-ratio:21/9;min-height:0!important}
.mosaic.n2{grid-template-columns:3fr 2fr}.mosaic.n2 figure:first-child{grid-row:auto}.mosaic.n2 img{aspect-ratio:4/5;min-height:0!important;height:auto!important}
.mosaic figcaption{font-size:14.5px}
.make{padding:24px 0 56px}
.makes{font-family:var(--fd);font-style:italic;font-size:clamp(26px,3vw,38px);line-height:1.25;color:var(--muted)}
.makes span:not(:last-child)::after{content:" / ";font-style:normal;color:var(--acc-t)}
.svc{background:var(--alt)}
.svc-g{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,8fr);gap:56px}
.svc h2{font-size:clamp(40px,5vw,68px)}.svc .dek{margin-top:16px;color:var(--muted);max-width:22em}
.gh{font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--acc-t);margin-bottom:6px}
.pairs{display:grid;grid-template-columns:1fr 1fr;gap:0 40px}.pairs+.gh{margin-top:36px}
.pairs li{border-top:1px solid color-mix(in srgb,var(--ink) 30%,transparent);padding:20px 0 32px}
.pairs .n{font-family:var(--fd);font-weight:400;font-size:30px;line-height:1.1}
.pairs p{margin-top:8px;color:var(--muted);font-size:17px}.pairs .pr{display:block;margin-top:10px;font-size:15px;font-weight:600;color:var(--acc-t)}
.appr-g{display:grid;grid-template-columns:minmax(0,6fr) minmax(0,5fr);gap:80px;align-items:center}
.appr.noimg .appr-g{grid-template-columns:minmax(0,40em)}
.appr h2{font-size:clamp(36px,4.2vw,58px);margin-bottom:26px}
.appr-fig img{aspect-ratio:4/5}
.say{text-align:center;padding:112px 0;border-top:1px solid var(--line)}
.pq blockquote p{font-family:var(--fd);font-size:clamp(32px,4vw,56px);line-height:1.12;letter-spacing:-.015em;max-width:22ch;margin:0 auto;text-wrap:balance}
.pq blockquote p::before{content:"“"}.pq blockquote p::after{content:"”"}
.pq figcaption,.more-q figcaption{margin-top:24px}.by{font-weight:600}
.more-q{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:48px;max-width:960px;margin:72px auto 0;text-align:left}
.more-q blockquote p{font-family:var(--fd);font-size:25px;line-height:1.3}
.visit{background:var(--dark);color:var(--on-dark)}
.visit h2{font-size:clamp(42px,5.6vw,80px);max-width:14ch}
.visit .vgrid{margin-top:56px;padding-top:32px;border-top:1px solid rgba(255,255,255,.2)}
.vh{color:var(--muted-d);margin-bottom:12px}.visit a{color:var(--on-dark)}.visit .hrs div{border-color:rgba(255,255,255,.14)}
.visit .btn{background:var(--on-dark);color:var(--dark)}
.visit.flat{background:var(--bg);color:var(--ink)}.visit.flat a{color:var(--ink)}.visit.flat .vgrid{border-color:var(--line);margin-top:0}.visit.flat .vh{color:var(--muted)}.visit.flat .hrs div{border-color:var(--line)}.visit.flat .btn{background:var(--acc);color:var(--acc-ink)}
.ft{background:var(--bg);color:var(--ink);border-top:1px solid var(--line)}.ft a{color:var(--ink)}.ft p:not(.ft-nm){color:var(--muted)}
@media(max-width:899px){
.hd-in{min-height:64px;justify-content:space-between}.sub{display:none}.brand .nm{font-size:27px}
.hero-fig img{height:62vh;min-height:360px}
.hero-t{grid-template-columns:1fr;gap:22px;padding-top:32px;padding-bottom:56px}
.hero h1{font-size:50px}.hero .dek{font-size:18px}.ctas .btn{flex:1 1 100%}
.mosaic,.mosaic.n2{grid-template-columns:1fr 1fr;gap:10px}.mosaic figure:first-child{grid-column:1/-1;grid-row:auto}.mosaic figure:first-child img{min-height:0;aspect-ratio:4/3}.mosaic img{aspect-ratio:1}
.svc-g{grid-template-columns:1fr;gap:24px}.pairs{grid-template-columns:1fr}
.appr-g{grid-template-columns:1fr;gap:32px}
.say{padding:72px 0}.pq blockquote p{font-size:32px}
.visit h2{font-size:44px}
}
`,
};

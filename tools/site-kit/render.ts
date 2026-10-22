// Renders a customer's full website from one SiteContent object: home, menu or services, about, contact, 404,
// plus sitemap, robots, favicon and social preview tags. Pure function: content in, { path: html } out.
// The site builder (tools/SITE_BUILDER.md) writes the content; tools/site-kit/build.ts downloads images and writes files.

/** Match the concept the owner was sent (tools/make_concept.py theme_for): "home" for remodelers, carpenters, upholsterers,
 * framers and furniture restorers; "boutique" for jewelers, watch repair, tailors and bridal. */
export type Theme = "bakery" | "restaurant" | "auto" | "garden" | "trades" | "beauty" | "retail" | "health" | "professional" | "home" | "boutique";

export interface SiteContent {
  business_name: string;
  theme: Theme;
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
}

export interface RenderOptions {
  /** Adds the BringsUp preview bar with approve and change links. */
  preview?: { ref: string; roundsLeft: number };
}

/** `radius` is for buttons; `radiusLg` for cards, photos, quotes, boxes and the map (default 18px). */
interface ThemeStyle { display: string; displayQ: string; body: string; bodyQ: string; primary: string; accent: string; radius: string; radiusLg?: string }
const SERIF = { display: "Fraunces", displayQ: "Fraunces:opsz,wght@9..144,600;9..144,700" };
const CORMORANT = { display: "Cormorant Garamond", displayQ: "Cormorant+Garamond:wght@600;700", body: "Jost", bodyQ: "Jost:wght@400;500;600;700" };
const THEMES: Record<Theme, ThemeStyle> = {
  bakery: { ...SERIF, body: "Work Sans", bodyQ: "Work+Sans:wght@400;500;600;700", primary: "#3B2416", accent: "#F2A65A", radius: "999px" },
  restaurant: { ...SERIF, body: "Work Sans", bodyQ: "Work+Sans:wght@400;500;600;700", primary: "#1F3A2B", accent: "#E8B64C", radius: "999px" },
  auto: { display: "Archivo", displayQ: "Archivo:wght@600;700;800", body: "Inter", bodyQ: "Inter:wght@400;500;600;700", primary: "#14181C", accent: "#F5B700", radius: "10px" },
  garden: { ...SERIF, body: "Karla", bodyQ: "Karla:wght@400;500;600;700", primary: "#23402F", accent: "#E9C46A", radius: "999px" },
  trades: { display: "Barlow", displayQ: "Barlow:wght@600;700;800", body: "Barlow", bodyQ: "Barlow:wght@400;500;600;700", primary: "#102A43", accent: "#F0B429", radius: "8px" },
  beauty: { ...SERIF, body: "DM Sans", bodyQ: "DM+Sans:wght@400;500;700", primary: "#3A2433", accent: "#E8A6A1", radius: "999px" },
  retail: { ...SERIF, body: "DM Sans", bodyQ: "DM+Sans:wght@400;500;700", primary: "#22313F", accent: "#F2B880", radius: "999px" },
  health: { display: "Manrope", displayQ: "Manrope:wght@600;700;800", body: "Manrope", bodyQ: "Manrope:wght@400;500;600;700", primary: "#123B4A", accent: "#7BD3C4", radius: "12px" },
  home: { ...CORMORANT, primary: "#2A2622", accent: "#C9A46A", radius: "6px", radiusLg: "10px" },
  boutique: { ...CORMORANT, primary: "#151515", accent: "#D8B67A", radius: "2px", radiusLg: "4px" },
  professional: { display: "Manrope", displayQ: "Manrope:wght@600;700;800", body: "Inter", bodyQ: "Inter:wght@400;500;600;700", primary: "#1C2A3A", accent: "#F2C14E", radius: "10px" },
};

const ENT: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => ENT[c]);
const hex = (c: string, fb: string) => (/^#[0-9a-f]{6}$/i.test(c || "") ? c : fb);
const rgb = (h: string) => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const lum = (h: string) => rgb(h).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; })
  .reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
const mix = (h: string, to: string, t: number) => { const a = rgb(h), b = rgb(to); return "#" + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, "0")).join(""); };
const contrast = (a: string, b: string) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const tel = (p: string) => "tel:" + p.replace(/[^\d+]/g, "");
const initials = (name: string) => (name.replace(/'s\b/g, "").split(/[^A-Za-z]+/).filter((x) => x && !/^(the|and|of|inc|llc|co)$/i.test(x)).slice(0, 2).map((x) => x[0]).join("") || "?").toUpperCase();
const src = (path: string, depth: number) => (!path || /^https?:/.test(path) ? path : "../".repeat(depth) + path);

export function render(c: SiteContent, opts: RenderOptions = {}): Record<string, string> {
  const t = THEMES[c.theme] || THEMES.professional;
  let dark = hex(c.brand_primary, t.primary);
  for (let i = 0; i < 6 && lum(dark) > 0.06; i++) dark = mix(dark, "#000000", 0.25);
  let accent = hex(c.brand_accent, t.accent);
  if (contrast(accent, dark) < 3) accent = t.accent;
  const accentInk = lum(accent) > 0.4 ? "#16181D" : "#FFFFFF";
  const light = mix(dark, "#FFFFFF", 0.94);
  const line = mix(dark, "#FFFFFF", 0.86);
  const offerSlug = c.theme === "bakery" || c.theme === "restaurant" ? "menu" : "services";
  const base = c.domain ? `https://${c.domain}` : "";
  const allItems = c.offer.groups.flatMap((g) => g.items);
  const hours = c.hours.filter((h) => h.days || h.time);

  const css = `
:root{--dark:${dark};--accent:${accent};--accent-ink:${accentInk};--light:${light};--line:${line};--r:${t.radius};--rl:${t.radiusLg || "18px"};--display:"${t.display}",Georgia,serif;--body:"${t.body}",system-ui,sans-serif}
*{box-sizing:border-box}body{margin:0;background:var(--light);color:#1d1d1f;font-family:var(--body);font-size:17px;line-height:1.6;-webkit-font-smoothing:antialiased}
h1,h2,h3,p,ul{margin:0}a{color:inherit}img{max-width:100%;display:block}.wrap{max-width:1180px;margin:0 auto;padding:0 24px}
:focus-visible{outline:3px solid var(--accent);outline-offset:3px}
.skip{position:absolute;left:-999px;top:8px;background:#fff;padding:10px 16px;border-radius:8px;z-index:99}.skip:focus{left:8px}
.btn{display:inline-flex;align-items:center;justify-content:center;min-height:52px;padding:14px 26px;border-radius:var(--r);font-weight:700;text-decoration:none;font-size:16px;transition:transform .15s,filter .15s}
.btn:hover{filter:brightness(1.06)}.btn:active{transform:scale(.97)}
.btn-a{background:var(--accent);color:var(--accent-ink)}.btn-g{border:1.5px solid rgba(255,255,255,.75);color:#fff}.btn-d{background:var(--dark);color:#fff}
.util{background:var(--dark);color:#fff;font-size:14px}.util .wrap{display:flex;justify-content:space-between;gap:12px;padding-top:9px;padding-bottom:9px;flex-wrap:wrap}.util b{color:var(--accent)}.util a{text-decoration:none}
.nav{background:#fff;border-bottom:1px solid var(--line);position:sticky;top:0;z-index:20}.nav .wrap{display:flex;align-items:center;justify-content:space-between;gap:16px;padding-top:12px;padding-bottom:12px}
.logo{display:flex;align-items:center;gap:12px;min-width:0;text-decoration:none}.logo img{height:48px;width:auto;max-width:170px;object-fit:contain}
.mono{width:46px;height:46px;border-radius:50%;background:var(--dark);color:var(--accent);display:flex;align-items:center;justify-content:center;font-family:var(--display);font-weight:700;font-size:18px;flex:none}
.logo b{display:block;font-family:var(--display);font-weight:700;font-size:21px;line-height:1.15}.logo small{display:block;font-size:12px;letter-spacing:.1em;text-transform:uppercase;opacity:.65;font-weight:600}
.links{display:flex;gap:26px;align-items:center;font-weight:600;font-size:15px}.links a{text-decoration:none}.links a[aria-current]{color:${mix(dark, accent, 0.4)}}.links .btn{min-height:44px;padding:10px 18px;font-size:15px}
.menu-btn{display:none}
@media(max-width:860px){.links{display:none;position:absolute;left:0;right:0;top:100%;background:#fff;flex-direction:column;align-items:stretch;padding:12px 24px 20px;gap:4px;border-bottom:1px solid var(--line)}.links a{padding:12px 0}.links .btn{margin-top:8px}
.menu-btn{display:inline-flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:10px;border:1px solid var(--line);background:#fff;cursor:pointer}.nav.open .links{display:flex}.logo b{font-size:18px}}
.hero{position:relative;color:#fff;min-height:580px;display:flex;align-items:flex-end;overflow:hidden;background:var(--dark)}
.hero img.ph{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.hero .shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.78),rgba(0,0,0,.5) 50%,rgba(0,0,0,.15)),linear-gradient(0deg,rgba(0,0,0,.45),transparent 45%)}
.hero .wrap{position:relative;width:100%;padding-top:110px;padding-bottom:80px}
.chip{display:inline-flex;gap:10px;align-items:center;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.28);padding:7px 15px;border-radius:999px;font-size:14px;font-weight:600;text-decoration:none}.chip i{font-style:normal;color:#FFC94D;letter-spacing:2px}
.hero h1{font-family:var(--display);font-weight:700;font-size:clamp(40px,6vw,80px);line-height:1.03;margin-top:20px;max-width:820px;text-wrap:balance}
.hero p{font-size:20px;margin-top:20px;max-width:580px;opacity:.95}.ctas{display:flex;flex-wrap:wrap;gap:12px;margin-top:32px}
.page-head{background:var(--dark);color:#fff;padding:72px 0 64px}.page-head h1{font-family:var(--display);font-weight:700;font-size:clamp(36px,5vw,60px);line-height:1.05;text-wrap:balance}.page-head p{margin-top:16px;font-size:19px;opacity:.9;max-width:640px}
.facts{background:var(--dark);color:#fff;border-top:1px solid rgba(255,255,255,.1)}.facts .wrap{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr))}
.fact{padding:26px 22px 26px 0}.fact b{display:block;font-family:var(--display);font-size:34px;line-height:1;color:var(--accent)}.fact span{font-size:14px;opacity:.85;font-weight:600}
section.s{padding:88px 0}.eyebrow{font-size:13px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:${mix(dark, accent, 0.35)}}
.h2{font-family:var(--display);font-weight:700;font-size:clamp(30px,4vw,48px);line-height:1.08;margin-top:10px;max-width:760px;text-wrap:balance}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:22px;margin-top:40px;align-items:start}
.card{background:#fff;border:1px solid var(--line);border-radius:var(--rl);overflow:hidden;box-shadow:0 12px 30px rgba(0,0,0,.06)}.card img{width:100%;height:210px;object-fit:cover}
.card .bd{padding:22px 24px 24px}.card h3{font-family:var(--display);font-weight:700;font-size:21px;display:flex;justify-content:space-between;gap:12px}.card h3 small{font-family:var(--body);font-size:16px;color:${mix(dark, accent, 0.35)}}.card p{margin-top:8px;color:#555;font-size:15.5px}
.more{margin-top:32px}
.group+.group{margin-top:56px}.group h2{font-family:var(--display);font-size:30px}
.split{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center}.split .photo{border-radius:var(--rl);width:100%;height:460px;object-fit:cover;background:var(--line)}
.prose p{font-size:18.5px;color:#3a3a3a;margin-top:18px}
.quote{margin-top:28px;padding:24px 26px;border-radius:var(--rl);background:#fff;border:1px solid var(--line)}.quote p{font-family:var(--display);font-size:21px;line-height:1.4}.quote small{display:block;margin-top:10px;color:#666;font-weight:600}
.quotes{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;margin-top:36px}
.band{background:#fff;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;margin-top:40px}.gallery img{border-radius:var(--rl);height:260px;width:100%;object-fit:cover}
@media(max-width:860px){.split{grid-template-columns:1fr;gap:32px}.split .photo{height:300px}section.s{padding:64px 0}}
.visit{background:var(--dark);color:#fff}.visit .eyebrow{color:var(--accent)}.vg{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;margin-top:40px}
.box{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:var(--rl);padding:28px}.box h3{font-size:13px;letter-spacing:.12em;text-transform:uppercase;opacity:.75}
.box ul{list-style:none;padding:0;margin:14px 0 0;font-size:18px;line-height:1.9}.box li{display:flex;justify-content:space-between;gap:16px;border-bottom:1px solid rgba(255,255,255,.08)}
.box p{margin-top:14px;font-size:18px;line-height:1.8}.box a{color:#fff}
.map{width:100%;height:380px;border:0;border-radius:var(--rl);margin-top:24px}
.final{text-align:center;padding:100px 0;background:${mix(dark, "#000000", 0.25)};color:#fff}.final h2{font-family:var(--display);font-weight:700;font-size:clamp(32px,4.6vw,56px);line-height:1.06;max-width:780px;margin:0 auto;text-wrap:balance}.final .ctas{justify-content:center}
footer{background:#fff;border-top:1px solid var(--line)}footer .wrap{display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px 24px;padding-top:32px;padding-bottom:32px;color:#555;font-size:15px}footer b{color:#1d1d1f;font-family:var(--display);font-size:19px}footer a{color:#555}
.pv{position:sticky;bottom:0;z-index:50;background:#16181D;color:#E9E7E1;font-family:system-ui,sans-serif;font-size:15px}.pv .wrap{display:flex;gap:12px 20px;align-items:center;justify-content:space-between;flex-wrap:wrap;padding-top:12px;padding-bottom:12px}
.pv b{color:#FFB37A}.pv a{display:inline-flex;align-items:center;min-height:42px;padding:8px 16px;border-radius:999px;font-weight:700;text-decoration:none}.pv .ok{background:#FFB37A;color:#16181D}.pv .ch{box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.4);color:#fff}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`.trim();

  const ldjson = JSON.stringify({
    "@context": "https://schema.org", "@type": c.theme === "bakery" ? "Bakery" : c.theme === "restaurant" ? "Restaurant" : c.theme === "auto" ? "AutoRepair" : "LocalBusiness",
    name: c.business_name, url: base || undefined, telephone: c.phone || undefined, email: c.email || undefined, address: c.address || undefined,
    image: c.hero_image && base ? new URL(c.hero_image, base + "/").href : undefined, foundingDate: c.year_founded || undefined,
    openingHours: hours.length ? hours.map((h) => `${h.days} ${h.time}`) : undefined,
    aggregateRating: c.rating && c.review_count ? { "@type": "AggregateRating", ratingValue: c.rating, reviewCount: c.review_count } : undefined,
  });

  const pages: { path: string; depth: number; nav: string; title: string; description: string; body: string }[] = [];
  const navItems = [["", "Home"], [offerSlug + "/", c.offer.title || (offerSlug === "menu" ? "Menu" : "Services")], ["about/", "About"], ["contact/", "Contact"]];

  const shell = (p: (typeof pages)[number]) => {
    const r = (path: string) => src(path, p.depth);
    const href = (path: string) => "../".repeat(p.depth) + path || "./";
    const ctaHref = /^(https?:|tel:|mailto:)/.test(c.primary_cta.href) ? c.primary_cta.href : href(c.primary_cta.href.replace(/^\//, ""));
    const title = p.path ? `${p.title} | ${c.business_name}` : `${c.business_name}${c.city_state ? " | " + c.city_state : ""}`;
    const url = base ? `${base}/${p.path}` : "";
    const og = c.hero_image ? (base ? new URL(c.hero_image, base + "/").href : "") : "";
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(p.description)}">
${opts.preview ? '<meta name="robots" content="noindex">' : url ? `<link rel="canonical" href="${esc(url)}">` : ""}
<meta name="theme-color" content="${dark}">
<meta property="og:type" content="website"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(p.description)}">
${url ? `<meta property="og:url" content="${esc(url)}">` : ""}${og ? `<meta property="og:image" content="${esc(og)}"><meta name="twitter:card" content="summary_large_image">` : ""}
<link rel="icon" href="${href("favicon.svg")}" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=${t.displayQ}&family=${t.bodyQ}&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${href("site.css")}">
${p.path === "" ? `<script type="application/ld+json">${ldjson}</script>` : ""}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
${c.city_state || c.phone ? `<div class="util"><div class="wrap"><span>${esc(c.city_state)}${c.year_founded ? " · Since " + esc(c.year_founded) : ""}</span>${c.phone ? `<span>Call us <a href="${tel(c.phone)}"><b>${esc(c.phone)}</b></a></span>` : ""}</div></div>` : ""}
<header class="nav" id="nav"><div class="wrap">
<a class="logo" href="${href("")}">${c.logo ? `<img src="${esc(r(c.logo))}" alt="">` : `<span class="mono" aria-hidden="true">${esc(initials(c.business_name))}</span>`}<div><b>${esc(c.business_name)}</b>${c.tagline ? `<small>${esc(c.tagline)}</small>` : ""}</div></a>
<button class="menu-btn" type="button" aria-expanded="false" aria-controls="links" aria-label="Menu" onclick="var n=document.getElementById('nav');var o=n.classList.toggle('open');this.setAttribute('aria-expanded',o)"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
<nav class="links" id="links" aria-label="Main">${navItems.map(([path, label]) => `<a href="${href(path)}"${path === p.nav ? ' aria-current="page"' : ""}>${esc(label)}</a>`).join("")}<a class="btn btn-a" href="${esc(ctaHref)}">${esc(c.primary_cta.label)}</a></nav>
</div></header>
<main id="main">
${p.body.replace(/\{\{root\}\}/g, "../".repeat(p.depth)).replace(/\{\{cta\}\}/g, esc(ctaHref))}
</main>
<footer><div class="wrap"><span><b>${esc(c.business_name)}</b></span><span>${[c.address, c.phone ? `<a href="${tel(c.phone)}">${esc(c.phone)}</a>` : "", c.email ? `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>` : ""].filter(Boolean).join(" · ")}</span><span>${c.social.map((s) => `<a href="${esc(s.url)}">${esc(s.label)}</a>`).join(" · ")}${c.social.length ? " · " : ""}© ${new Date().getFullYear()} ${esc(c.business_name)}</span></div></footer>
${opts.preview ? `<div class="pv" role="region" aria-label="Preview"><div class="wrap"><span><b>Private preview</b> from BringsUp. Not live yet.${opts.preview.roundsLeft > 0 ? ` ${opts.preview.roundsLeft} round${opts.preview.roundsLeft === 1 ? "" : "s"} of changes left.` : " Your included rounds are used; one more is $150."}</span><span style="display:flex;gap:10px;flex-wrap:wrap"><a class="ch" href="https://bringsup.com/${opts.preview.roundsLeft > 0 ? "changes" : "extra"}/?ref=${encodeURIComponent(opts.preview.ref)}">${opts.preview.roundsLeft > 0 ? "Request changes" : "One more round ($150)"}</a><a class="ok" href="https://bringsup.com/approve/?ref=${encodeURIComponent(opts.preview.ref)}">Approve and pay $1,000</a></span></div></div>` : ""}
</body>
</html>
`;
  };

  const r0 = (path: string) => src(path, 0);
  const ctaBlock = (ghost = true) => `<div class="ctas"><a class="btn btn-a" href="{{cta}}">${esc(c.primary_cta.label)}</a>${ghost && c.phone && !c.primary_cta.href.startsWith("tel:") ? `<a class="btn btn-g" href="${tel(c.phone)}">Call ${esc(c.phone)}</a>` : ""}</div>`;
  const card = (it: SiteContent["offer"]["groups"][number]["items"][number], depth: number) =>
    `<article class="card">${it.image ? `<img src="${esc(src(it.image, depth))}" alt="${esc(it.name)}" loading="lazy">` : ""}<div class="bd"><h3><span>${esc(it.name)}</span>${it.price ? `<small>${esc(it.price)}</small>` : ""}</h3>${it.description ? `<p>${esc(it.description)}</p>` : ""}</div></article>`;
  const facts: [string, string][] = [];
  if (c.year_founded) facts.push(["Since " + c.year_founded, "Family owned and run"]);
  if (c.rating) facts.push([c.rating + "★", "Average rating"]);
  if (c.review_count) facts.push([c.review_count + "+", "Customer reviews"]);
  if (c.city_state) facts.push(["Local", "Independent, in " + c.city_state.split(",")[0]]);
  const visit = (heading: string) => (hours.length || c.address || c.phone || c.email) ? `<section class="s visit"><div class="wrap"><p class="eyebrow">Visit us</p><h2 class="h2">${esc(heading)}</h2><div class="vg">${hours.length ? `<div class="box"><h3>Hours</h3><ul>${hours.map((h) => `<li><span>${esc(h.days)}</span><span>${esc(h.time)}</span></li>`).join("")}</ul></div>` : ""}<div class="box"><h3>Find us</h3><p>${[esc(c.address), c.phone ? `<a href="${tel(c.phone)}">${esc(c.phone)}</a>` : "", c.email ? `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>` : ""].filter(Boolean).join("<br>")}</p></div></div></div></section>` : "";
  const quote = c.testimonials[0];

  pages.push({
    path: "", depth: 0, nav: "", title: "Home",
    description: c.home.subheadline,
    body: `<section class="hero">${c.hero_image ? `<img class="ph" src="${esc(r0(c.hero_image))}" alt="" fetchpriority="high"><div class="shade"></div>` : ""}<div class="wrap">${c.rating ? `<a class="chip"${c.reviews_url ? ` href="${esc(c.reviews_url)}"` : ""}><i aria-hidden="true">★★★★★</i>${esc(c.rating)}${c.review_count ? " · " + esc(c.review_count) + " reviews" : ""}</a>` : c.tagline ? `<span class="chip">${esc(c.tagline)}${c.city_state ? " · " + esc(c.city_state) : ""}</span>` : ""}<h1>${esc(c.home.headline)}</h1><p>${esc(c.home.subheadline)}</p>${ctaBlock()}</div></section>
${facts.length >= 2 ? `<div class="facts"><div class="wrap">${facts.map((f) => `<div class="fact"><b>${esc(f[0])}</b><span>${esc(f[1])}</span></div>`).join("")}</div></div>` : ""}
${allItems.length ? `<section class="s"><div class="wrap"><p class="eyebrow">${offerSlug === "menu" ? "On the menu" : "What we do"}</p><h2 class="h2">${offerSlug === "menu" ? "What people come back for" : "What we do best"}</h2><div class="cards">${allItems.slice(0, 3).map((it) => card(it, 0)).join("")}</div><p class="more"><a class="btn btn-d" href="{{root}}${offerSlug}/">See the full ${offerSlug}</a></p></div></section>` : ""}
${c.about.paragraphs.length ? `<section class="s band"><div class="wrap split">${c.about.images[0] ? `<img class="photo" src="${esc(r0(c.about.images[0]))}" alt="" loading="lazy">` : ""}<div class="prose"><p class="eyebrow">Our story</p><h2 class="h2">${esc(c.about.heading)}</h2><p>${esc(c.about.paragraphs[0])}</p>${quote ? `<div class="quote"><p>“${esc(quote.quote)}”</p>${quote.author ? `<small>${esc(quote.author)}</small>` : ""}</div>` : ""}<p class="more"><a class="btn btn-d" href="{{root}}about/">More about us</a></p></div></div></section>` : ""}
${visit("Come see us")}
<section class="final"><div class="wrap"><h2>${esc(c.home.final_heading)}</h2>${ctaBlock(false)}</div></section>`,
  });

  pages.push({
    path: offerSlug + "/", depth: 1, nav: offerSlug + "/", title: c.offer.title || "Services",
    description: c.offer.intro || `${c.offer.title} at ${c.business_name}.`,
    body: `<div class="page-head"><div class="wrap"><h1>${esc(c.offer.title)}</h1>${c.offer.intro ? `<p>${esc(c.offer.intro)}</p>` : ""}</div></div>
<section class="s"><div class="wrap">${c.offer.groups.map((g) => `<div class="group">${c.offer.groups.length > 1 || g.name ? `<h2>${esc(g.name)}</h2>` : ""}<div class="cards">${g.items.map((it) => card(it, 1)).join("")}</div></div>`).join("")}</div></section>
<section class="final"><div class="wrap"><h2>${esc(c.home.final_heading)}</h2>${ctaBlock(false)}</div></section>`,
  });

  pages.push({
    path: "about/", depth: 1, nav: "about/", title: "About",
    description: c.about.paragraphs[0] || `About ${c.business_name}.`,
    body: `<div class="page-head"><div class="wrap"><h1>${esc(c.about.heading)}</h1></div></div>
<section class="s"><div class="wrap split">${c.about.images[0] ? `<img class="photo" src="${esc(src(c.about.images[0], 1))}" alt="">` : ""}<div class="prose">${c.about.paragraphs.map((x) => `<p>${esc(x)}</p>`).join("")}</div></div></section>
${c.about.images.length > 1 ? `<section class="s band"><div class="wrap"><div class="gallery">${c.about.images.slice(1, 7).map((im) => `<img src="${esc(src(im, 1))}" alt="" loading="lazy">`).join("")}</div></div></section>` : ""}
${c.testimonials.length ? `<section class="s"><div class="wrap"><p class="eyebrow">Kind words</p><h2 class="h2">What our customers say</h2><div class="quotes">${c.testimonials.map((q) => `<div class="quote"><p>“${esc(q.quote)}”</p>${q.author ? `<small>${esc(q.author)}</small>` : ""}</div>`).join("")}</div></div></section>` : ""}
<section class="final"><div class="wrap"><h2>${esc(c.home.final_heading)}</h2>${ctaBlock(false)}</div></section>`,
  });

  pages.push({
    path: "contact/", depth: 1, nav: "contact/", title: "Contact",
    description: `Hours, directions and how to reach ${c.business_name}${c.city_state ? " in " + c.city_state : ""}.`,
    body: `<div class="page-head"><div class="wrap"><h1>Visit and contact</h1><p>${esc([c.address, c.phone].filter(Boolean).join(" · "))}</p></div></div>
${visit("Hours and directions")}
${c.address ? `<section class="s"><div class="wrap"><iframe class="map" title="Map to ${esc(c.business_name)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=${encodeURIComponent(c.business_name + ", " + c.address)}&output=embed"></iframe>${ctaBlock(false).replace("btn-g", "btn-d")}</div></section>` : ""}`,
  });

  pages.push({
    path: "404.html", depth: 0, nav: "", title: "Page not found",
    description: "This page isn't here.",
    body: `<div class="page-head"><div class="wrap"><h1>This page isn't here.</h1><p>Try the <a href="/">home page</a>, or give us a call${c.phone ? " at " + esc(c.phone) : ""}.</p></div></div>`,
  });

  const files: Record<string, string> = { "site.css": css };
  for (const p of pages) files[p.path.endsWith(".html") ? p.path : p.path + "index.html"] = shell(p);
  files["favicon.svg"] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="${dark}"/><text x="32" y="42" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="26" fill="${accent}">${esc(initials(c.business_name))}</text></svg>`;
  files["robots.txt"] = opts.preview ? "User-agent: *\nDisallow: /\n" : `User-agent: *\nAllow: /\n${base ? `\nSitemap: ${base}/sitemap.xml\n` : ""}`;
  if (base && !opts.preview) {
    files["sitemap.xml"] = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.filter((p) => !p.path.endsWith(".html")).map((p) => `  <url><loc>${base}/${p.path}</loc></url>`).join("\n")}\n</urlset>\n`;
  }
  return files;
}

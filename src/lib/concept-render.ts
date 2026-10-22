/* Turns a redesign (JSON from the redesign function) into a full homepage document.
   Used by /try/ inside a sandboxed iframe. Keep the look in step with tools/concept_template.html. */

export type Theme = "bakery" | "restaurant" | "auto" | "garden" | "trades" | "beauty" | "retail" | "health" | "professional";
export type CtaKind = "call" | "order" | "book" | "quote" | "directions" | "shop" | "contact";

/** A redesign's content, as the redesign function returns it (see SCHEMA in supabase/functions/redesign/prompt.ts). */
export interface Concept {
  not_a_business?: boolean;
  not_a_business_reason?: string;
  business_name: string;
  theme: Theme;
  tagline: string;
  city_state: string;
  phone: string;
  email: string;
  address: string;
  hours: { days: string; time: string }[];
  year_founded: string;
  rating: string;
  review_count: string;
  headline: string;
  subheadline: string;
  primary_cta: string;
  cta_kind: CtaKind;
  services: { name: string; description: string }[];
  story_heading: string;
  story: string;
  testimonials: { quote: string; author: string }[];
  final_heading: string;
  brand_primary: string;
  brand_accent: string;
  /** Index into the images array, or -1. */
  hero_image: number;
  /** Index into the images array, or -1. */
  logo_image: number;
  gallery_images: number[];
  improvements: string[];
}

interface Font { display: string; q: string }
interface ThemeStyle { display: Font; body: [name: string, query: string]; primary: string; accent: string; radius: string; photos: string[] }

const U = (id: string, w?: number) => "https://images.unsplash.com/photo-" + id + "?auto=format&fit=crop&w=" + (w || 1800) + "&q=80";
const SERIF: Font = { display: "Fraunces", q: "Fraunces:opsz,wght@9..144,600;9..144,700" };
const THEMES: Record<Theme, ThemeStyle> = {
  bakery:     { display: SERIF, body: ["Work Sans", "Work+Sans:wght@400;500;600;700"], primary: "#3B2416", accent: "#F2A65A", radius: "999px", photos: [U("1509440159596-0249088772ff"), U("1608198093002-ad4e005484ec", 900), U("1555507036-ab1f4038808a", 900), U("1568254183919-78a4f43a2877", 900)] },
  restaurant: { display: SERIF, body: ["Work Sans", "Work+Sans:wght@400;500;600;700"], primary: "#1F3A2B", accent: "#E8B64C", radius: "999px", photos: [U("1509722747041-616f39b57569"), U("1553909489-cd47e0907980", 900), U("1528735602780-2552fd46c7af", 900), U("1504674900247-0877df9cc836", 900)] },
  auto:       { display: { display: "Archivo", q: "Archivo:wght@600;700;800" }, body: ["Inter", "Inter:wght@400;500;600;700"], primary: "#14181C", accent: "#F5B700", radius: "10px", photos: [U("1619642751034-765dfdf7c58e"), U("1487754180451-c456f719a1fc", 900), U("1625047509248-ec889cbff17f", 900), U("1486262715619-67b85e0b08d3", 900)] },
  garden:     { display: SERIF, body: ["Karla", "Karla:wght@400;500;600;700"], primary: "#23402F", accent: "#E9C46A", radius: "999px", photos: [U("1523348837708-15d4a09cfac2"), U("1466692476868-aef1dfb1e735", 900), U("1490750967868-88aa4486c946", 900), U("1591857177580-dc82b9ac4e1e", 900)] },
  trades:     { display: { display: "Barlow", q: "Barlow:wght@600;700;800" }, body: ["Barlow", "Barlow:wght@400;500;600;700"], primary: "#102A43", accent: "#F0B429", radius: "8px", photos: [U("1607472586893-edb57bdc0e39"), U("1585704032915-c3400ca199e7", 900), U("1621905251189-08b45d6a269e", 900), U("1504148455328-c376907d081c", 900)] },
  beauty:     { display: SERIF, body: ["DM Sans", "DM+Sans:wght@400;500;700"], primary: "#3A2433", accent: "#E8A6A1", radius: "999px", photos: [] },
  retail:     { display: SERIF, body: ["DM Sans", "DM+Sans:wght@400;500;700"], primary: "#22313F", accent: "#F2B880", radius: "999px", photos: [] },
  health:     { display: { display: "Manrope", q: "Manrope:wght@600;700;800" }, body: ["Manrope", "Manrope:wght@400;500;600;700"], primary: "#123B4A", accent: "#7BD3C4", radius: "12px", photos: [] },
  professional: { display: { display: "Manrope", q: "Manrope:wght@600;700;800" }, body: ["Inter", "Inter:wght@400;500;600;700"], primary: "#1C2A3A", accent: "#F2C14E", radius: "10px", photos: [] },
};

const ENTITIES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
function esc(s: unknown): string {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ENTITIES[c]);
}
function hex(c: string | undefined, fallback: string): string { return /^#[0-9a-f]{6}$/i.test(c || "") ? c! : fallback; }
function rgb(h: string): number[] { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
function lum(h: string): number {
  return rgb(h).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); })
    .reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
}
function mix(h: string, to: string, t: number): string {
  const a = rgb(h), b = rgb(to);
  return "#" + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, "0")).join("");
}
function contrast(a: string, b: string): number { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
function initials(name: string): string {
  const w = String(name || "").replace(/'s\b/g, "").split(/[^A-Za-z]+/).filter((x) => x && !/^(the|and|of|inc|llc|co)$/i.test(x));
  return (w.slice(0, 2).map((x) => x[0]).join("") || "?").toUpperCase();
}
function telHref(p: string): string { return "tel:" + String(p || "").replace(/[^\d+]/g, ""); }

/** The full HTML document for a concept. `images` are the photo URLs the concept's indexes point into. */
export function renderConcept(c: Concept, images: string[]): string {
  images = images || [];
  const t = THEMES[c.theme] || THEMES.professional;
  let dark = hex(c.brand_primary, t.primary);
  for (let i = 0; i < 6 && lum(dark) > 0.06; i++) dark = mix(dark, "#000000", 0.25);
  let accent = hex(c.brand_accent, t.accent);
  if (contrast(accent, dark) < 3) accent = t.accent;
  const accentInk = lum(accent) > 0.4 ? "#16181D" : "#FFFFFF";
  const light = mix(dark, "#FFFFFF", 0.94);
  const line = mix(dark, "#FFFFFF", 0.86);
  const img = (n: number): string | null => (n >= 0 && images[n] ? images[n] : null);
  const hero = img(c.hero_image) || t.photos[0] || null;
  const gallery = (c.gallery_images || []).map(img).filter((x): x is string => Boolean(x));
  const cardPhotos = gallery.length ? gallery : t.photos.slice(1);
  const logo = img(c.logo_image);
  const phone = c.phone || "";
  const ctaHref = c.cta_kind === "call" && phone ? telHref(phone) : "#";
  const services = (c.services || []).slice(0, 6);
  const facts: [string, string][] = [];
  if (c.year_founded) facts.push([c.year_founded, "Serving customers since"]);
  if (c.rating) facts.push([c.rating + "★", "Average rating"]);
  if (c.review_count) facts.push([c.review_count + "+", "Customer reviews"]);
  if (c.city_state) facts.push(["Local", "Independent, in " + c.city_state.split(",")[0]]);
  const hours = (c.hours || []).filter((h) => h.days || h.time);
  const quote = (c.testimonials || [])[0];
  const storyPhoto = gallery[1] || gallery[0] || t.photos[3] || hero;
  const menu = c.theme === "bakery" || c.theme === "restaurant";

  const css = [
    ":root{--dark:" + dark + ";--accent:" + accent + ";--accent-ink:" + accentInk + ";--light:" + light + ";--line:" + line + ";--r:" + t.radius + ';--display:"' + t.display.display + '",Georgia,serif;--body:"' + t.body[0] + '",system-ui,sans-serif}',
    "*{box-sizing:border-box}body{margin:0;background:var(--light);color:#1d1d1f;font-family:var(--body);font-size:17px;line-height:1.55;-webkit-font-smoothing:antialiased}",
    "h1,h2,h3,p{margin:0}a{color:inherit}.wrap{max-width:1180px;margin:0 auto;padding:0 28px}",
    ".btn{display:inline-flex;align-items:center;justify-content:center;min-height:52px;padding:14px 26px;border-radius:var(--r);font-weight:700;text-decoration:none;font-size:16px}",
    ".btn-a{background:var(--accent);color:var(--accent-ink)}.btn-g{border:1.5px solid rgba(255,255,255,.75);color:#fff}",
    ".util{background:var(--dark);color:#fff;font-size:14px}.util .wrap{display:flex;justify-content:space-between;gap:12px;padding-top:9px;padding-bottom:9px;opacity:.9;flex-wrap:wrap}.util b{color:var(--accent)}",
    ".nav{background:#fff;border-bottom:1px solid var(--line)}.nav .wrap{display:flex;align-items:center;justify-content:space-between;gap:16px;padding-top:14px;padding-bottom:14px}",
    ".logo{display:flex;align-items:center;gap:12px;min-width:0}.logo img{height:48px;width:auto;max-width:160px;object-fit:contain}",
    ".mono{width:46px;height:46px;border-radius:50%;background:var(--dark);color:var(--accent);display:flex;align-items:center;justify-content:center;font-family:var(--display);font-weight:700;font-size:18px;flex:none}",
    ".logo b{display:block;font-family:var(--display);font-weight:700;font-size:21px;line-height:1.15}.logo small{display:block;font-size:12px;letter-spacing:.1em;text-transform:uppercase;opacity:.65;font-weight:600}",
    ".links{display:flex;gap:24px;align-items:center;font-weight:600;font-size:15px}.links a{text-decoration:none}.links .btn{min-height:42px;padding:10px 18px;font-size:15px}",
    "@media(max-width:820px){.links a:not(.btn){display:none}.logo b{font-size:18px}}",
    ".hero{position:relative;color:#fff;min-height:600px;display:flex;align-items:flex-end;overflow:hidden;background:var(--dark)}",
    ".hero .ph{position:absolute;inset:0;background-size:cover;background-position:center}",
    ".hero .shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.78),rgba(0,0,0,.5) 50%,rgba(0,0,0,.15)),linear-gradient(0deg,rgba(0,0,0,.45),transparent 45%)}",
    ".hero .wrap{position:relative;width:100%;padding-top:110px;padding-bottom:80px}",
    ".chip{display:inline-flex;gap:10px;align-items:center;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.28);padding:7px 15px;border-radius:999px;font-size:14px;font-weight:600}.chip i{font-style:normal;color:#FFC94D;letter-spacing:2px}",
    ".hero h1{font-family:var(--display);font-weight:700;font-size:clamp(42px,6vw,84px);line-height:1.02;margin-top:20px;max-width:820px;text-wrap:balance}",
    ".hero p{font-size:20px;margin-top:20px;max-width:580px;opacity:.95}.ctas{display:flex;flex-wrap:wrap;gap:12px;margin-top:32px}",
    ".facts{background:var(--dark);color:#fff}.facts .wrap{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr))}",
    ".fact{padding:26px 22px 26px 0;border-right:1px solid rgba(255,255,255,.12)}.fact:last-child{border-right:0}.fact b{display:block;font-family:var(--display);font-size:36px;line-height:1;color:var(--accent)}.fact span{font-size:14px;opacity:.85;font-weight:600}",
    "section.s{padding:96px 0}.eyebrow{font-size:13px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:" + mix(dark, accent, 0.35) + "}",
    ".h2{font-family:var(--display);font-weight:700;font-size:clamp(32px,4vw,50px);line-height:1.05;margin-top:10px;max-width:760px;text-wrap:balance}",
    ".cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:22px;margin-top:44px}",
    ".card{background:#fff;border:1px solid var(--line);border-radius:18px;overflow:hidden;box-shadow:0 12px 30px rgba(0,0,0,.06)}.card .im{height:210px;background-size:cover;background-position:center}",
    ".card .bd{padding:22px 24px 24px}.card h3{font-family:var(--display);font-weight:700;font-size:21px}.card p{margin-top:8px;color:#555;font-size:15.5px}",
    ".story{background:#fff;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}.split{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center}",
    ".split .photo{border-radius:18px;min-height:460px;background-size:cover;background-position:center;background-color:var(--line)}",
    ".story p.lead{font-size:19px;color:#444;margin-top:20px}.quote{margin-top:28px;padding:24px 26px;border-radius:18px;background:var(--light);border:1px solid var(--line)}",
    ".quote p{font-family:var(--display);font-size:22px;line-height:1.35}.quote small{display:block;margin-top:10px;color:#666;font-weight:600}",
    "@media(max-width:860px){.split{grid-template-columns:1fr;gap:32px}.split .photo{min-height:300px}}",
    ".visit{background:var(--dark);color:#fff}.visit .eyebrow{color:var(--accent)}.vg{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;margin-top:40px}",
    ".box{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:18px;padding:28px}.box h3{font-size:13px;letter-spacing:.12em;text-transform:uppercase;opacity:.75}",
    ".box ul{list-style:none;padding:0;margin:14px 0 0;font-size:18px;line-height:1.9}.box li{display:flex;justify-content:space-between;gap:16px;border-bottom:1px solid rgba(255,255,255,.08)}",
    ".box p{margin-top:14px;font-size:18px;line-height:1.8}",
    ".final{text-align:center;padding:110px 0;background:" + mix(dark, "#000000", 0.25) + ";color:#fff}.final h2{font-family:var(--display);font-weight:700;font-size:clamp(34px,4.6vw,60px);line-height:1.05;max-width:780px;margin:0 auto;text-wrap:balance}.final .ctas{justify-content:center}",
    "footer{background:#fff;border-top:1px solid var(--line)}footer .wrap{display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;padding-top:32px;padding-bottom:32px;color:#666;font-size:15px}footer b{color:#1d1d1f;font-family:var(--display);font-size:19px}",
    ".label{background:#16181D;color:#E9E7E1;font-family:system-ui,sans-serif;font-size:13px;text-align:center;padding:13px 20px}.label b{color:#FFB37A}",
  ].join("\n");

  const navLinks = (services.length ? '<a href="#services">' + (menu ? "Menu" : "Services") + "</a>" : "") +
    (c.story ? '<a href="#about">About</a>' : "") + ((hours.length || c.address) ? '<a href="#visit">Visit</a>' : "");
  const cta = esc(c.primary_cta || "Contact us");

  const h: string[] = [];
  h.push('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">');
  h.push("<title>" + esc(c.business_name) + " — concept by BringsUp</title>");
  h.push('<link href="https://fonts.googleapis.com/css2?family=' + t.display.q + "&family=" + t.body[1] + '&display=swap" rel="stylesheet">');
  h.push("<style>" + css + "</style></head><body>");
  if (c.city_state || phone) h.push('<div class="util"><div class="wrap"><span>' + esc(c.city_state || "") + (c.year_founded ? " · Since " + esc(c.year_founded) : "") + "</span>" + (phone ? "<span>Call us <b>" + esc(phone) + "</b></span>" : "") + "</div></div>");
  h.push('<header class="nav"><div class="wrap"><div class="logo">' + (logo ? '<img src="' + esc(logo) + '" alt="">' : '<span class="mono">' + esc(initials(c.business_name)) + "</span>") +
    "<div><b>" + esc(c.business_name) + "</b>" + (c.tagline ? "<small>" + esc(c.tagline) + "</small>" : "") + "</div></div>" +
    '<nav class="links">' + navLinks + '<a class="btn btn-a" href="' + ctaHref + '">' + cta + "</a></nav></div></header>");
  h.push('<section class="hero">' + (hero ? '<div class="ph" style="background-image:url(\'' + esc(hero) + '\')"></div><div class="shade"></div>' : "") + '<div class="wrap">' +
    (c.rating ? '<span class="chip"><i>★★★★★</i>' + esc(c.rating) + (c.review_count ? " · " + esc(c.review_count) + " reviews" : "") + "</span>" : (c.tagline ? '<span class="chip">' + esc(c.tagline) + (c.city_state ? " · " + esc(c.city_state) : "") + "</span>" : "")) +
    "<h1>" + esc(c.headline) + "</h1><p>" + esc(c.subheadline) + '</p><div class="ctas"><a class="btn btn-a" href="' + ctaHref + '">' + cta + "</a>" +
    (phone && c.cta_kind !== "call" ? '<a class="btn btn-g" href="' + telHref(phone) + '">Call ' + esc(phone) + "</a>" : "") + "</div></div></section>");
  if (facts.length >= 2) h.push('<div class="facts"><div class="wrap">' + facts.map((f) => '<div class="fact"><b>' + esc(f[0]) + "</b><span>" + esc(f[1]) + "</span></div>").join("") + "</div></div>");
  if (services.length) {
    h.push('<section class="s" id="services"><div class="wrap"><p class="eyebrow">' + (menu ? "On the menu" : "What we do") + '</p><h2 class="h2">' + (menu ? "What people come back for" : "What we do best") + '</h2><div class="cards">' +
      services.map((s, i) => {
        const p = cardPhotos.length && i < 3 ? cardPhotos[i % cardPhotos.length] : null;
        return '<article class="card">' + (p ? '<div class="im" style="background-image:url(\'' + esc(p) + '\')"></div>' : "") + '<div class="bd"><h3>' + esc(s.name) + "</h3><p>" + esc(s.description) + "</p></div></article>";
      }).join("") + "</div></div></section>");
  }
  if (c.story) {
    h.push('<section class="s story" id="about"><div class="wrap split"><div class="photo"' + (storyPhoto ? ' style="background-image:url(\'' + esc(storyPhoto) + '\')"' : "") + '></div><div><p class="eyebrow">Our story</p><h2 class="h2">' + esc(c.story_heading || "Our story") + '</h2><p class="lead">' + esc(c.story) + "</p>" +
      (quote ? '<div class="quote"><p>“' + esc(quote.quote) + "”</p>" + (quote.author ? "<small>" + esc(quote.author) + "</small>" : "") + "</div>" : "") + "</div></div></section>");
  }
  if (hours.length || c.address || phone || c.email) {
    h.push('<section class="s visit" id="visit"><div class="wrap"><p class="eyebrow">Visit us</p><h2 class="h2">Come see us</h2><div class="vg">' +
      (hours.length ? '<div class="box"><h3>Hours</h3><ul>' + hours.map((x) => "<li><span>" + esc(x.days) + "</span><span>" + esc(x.time) + "</span></li>").join("") + "</ul></div>" : "") +
      '<div class="box"><h3>Find us</h3><p>' + [c.address, phone, c.email].filter(Boolean).map(esc).join("<br>") + "</p></div></div></div></section>");
  }
  h.push('<section class="final"' + (hero ? ' style="background:linear-gradient(rgba(0,0,0,.62),rgba(0,0,0,.62)),url(\'' + esc(gallery[0] || hero) + '\') center/cover"' : "") + '><div class="wrap"><h2>' + esc(c.final_heading || "Come see us.") + '</h2><div class="ctas"><a class="btn btn-a" href="' + ctaHref + '">' + cta + "</a></div></div></section>");
  h.push('<footer><div class="wrap"><span><b>' + esc(c.business_name) + "</b></span><span>" + esc([c.city_state, phone].filter(Boolean).join(" · ")) + "</span></div></footer>");
  h.push('<div class="label"><b>Concept by BringsUp</b> · A homepage idea for ' + esc(c.business_name) + " · Not affiliated with " + esc(c.business_name) + " · Not a live site</div>");
  h.push("</body></html>");
  return h.join("\n");
}

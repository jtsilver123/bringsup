// The cheap first look at a prospect's website (tools/RUNBOOK.md step 6, "Research order"): one script run
// instead of the operator reading the site by hand. It reads the homepage, plus the contact page if one is linked,
// and reports what the RUNBOOK's bar needs from the site itself. Read-only: plain GETs and DNS lookups, nothing sent.
//
//   node tools/prospect-check.ts <site-url> [--form]
//
// --form also runs `form-send.ts check` on the contact form (needed for a `channel: form` prospect).
// Prints one JSON line: {site, https, store, storeEvidence[], copyright, viewport, zoomBlocked, builder, outdated[],
// agency, emails[], contactForm, formCheck?, skip, ...}. `skip` is a RUNBOOK skipReason the script can decide on
// its own (store, email-*, form-*), or null. A null skip is not a pass: the operator still judges ownership,
// chains, reviews, agency credits and the rest of the bar. Node 22.6+ runs this file directly.
import { execFile } from "node:child_process";
import { promises as dns } from "node:dns";
import { join } from "node:path";

const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36";
const FREE_MAIL = /^(gmail|googlemail|yahoo|ymail|aol|hotmail|outlook|live|msn|icloud|me|mac|comcast|verizon|cox|earthlink|protonmail|proton|gmx|zoho|sbcglobal|bellsouth|att|optonline|charter|frontier|windstream|centurylink|roadrunner|rr|optimum|juno|netzero)\.(com|net|me)$/i;
const OLD_ISP = /^(bellsouth|att|sbcglobal|optonline|charter|frontier|windstream|centurylink|roadrunner|rr|earthlink|juno|netzero|verizon|cox|comcast)\.(net|com)$/i;
const ROLE = /^(info|contact|office|hello|hi|admin|mail|email|inquiries|inquiry|enquiries|team|service|services|orders?|bookings?|reservations?|events|catering|frontdesk|reception|shop|store|studio|appointments?|help|general|customerservice|accounts?|webmaster|sales|support|billing|careers|jobs|press|media|hr|marketing|no-?reply)$/i;
const BLOCKED_ROLE = /^(sales|support|billing|careers|jobs|press|media|hr|marketing|no-?reply|webmaster)$/i; // RUNBOOK "Address rules"
const PLACEHOLDER = /(^|\.)(example|domain|yourdomain|yoursite|email|test|sentry|sentry-next|wixpress|godaddy|squarespace|wix)\.(com|io|net)$/i;

// Store markers (RUNBOOK step 6 "Brochure sites only"). Matched against the page with outbound link targets removed,
// so a plain button to an outside ordering service (Toast, ChowNow, Square, OpenTable...) doesn't count.
const PLATFORMS: [string, RegExp][] = [
  ["Shopify", /cdn\.shopify\.com|Shopify\.theme|myshopify\.com/i],
  ["WooCommerce", /woocommerce|wc-add-to-cart|wc-cart-fragments/i],
  ["Square Online", /content="Square Online|wsite-com-product|square-online-store/i],
  ["BigCommerce", /cdn\d*\.bigcommerce\.com|stencil-utils/i],
  ["Ecwid", /app\.ecwid\.com|ecwid\.com\/script|Ecwid\.OnAPILoaded/i],
  ["Wix Stores", /wixstores|wix-ecommerce/i],
  ["Squarespace Commerce", /sqs-add-to-cart|squarespace-products-collection|squarespace-product-quick-view/i],
  ["FTD/Teleflora/BloomNet/Lovingly storefront", /teleflora|\bftd\.com|ftdi\.com|bloomnet|lovingly\.com|floristwebsites/i],
  ["add-to-cart", /add[ _-]?to[ _-]?(cart|bag|basket)/i],
];
const STORE_PATH = /^\/(cart|checkout|basket|bag|my-account|account|customer\/account|login|log-in|signin|sign-in)(\/|$|\?|\.)/i;
const BUILDERS: [string, RegExp][] = [
  ["Wix", /static\.wixstatic\.com|wix\.com website builder/i], ["Squarespace", /static1\.squarespace\.com|squarespace-cdn/i],
  ["Weebly", /editmysite\.com|weebly/i], ["GoDaddy Website Builder", /img\d*\.wsimg\.com|godaddy website builder|websites\.godaddy/i],
  ["Yola", /yola/i], ["MechanicNet", /mechanicnet/i], ["Duda", /multiscreensite|dudamobile|dmcdn/i], ["BentoBox", /getbento\.com|bentobox/i],
  ["Webflow", /webflow/i], ["Shopify", /cdn\.shopify\.com/i], ["Jimdo", /jimdo/i], ["Joomla", /joomla/i], ["Drupal", /drupal/i],
  ["Microsoft FrontPage", /frontpage/i], ["Dreamweaver", /dreamweaver/i], ["iWeb", /iweb/i], ["WordPress", /wp-content|wp-includes/i],
];
const TEMPLATE_PLATFORMS = /^(Yola|GoDaddy Website Builder|MechanicNet)$/; // RUNBOOK "Outdated, scored"
const FREE_SUBDOMAIN = /\.(wixsite\.com|weebly\.com|godaddysites\.com|yolasite\.com|square\.site|business\.site|wordpress\.com|webs\.com|jimdosite\.com|site123\.me|mechanicnet\.com)$/i;

type Page = { url: string; status: number; html: string; text: string; rendered: boolean };
type Email = { email: string; kind: "named" | "role"; domain: string; source: string; mx: boolean | null; usable: boolean; why?: string; oldIsp?: boolean };

let browser: { newPage: () => Promise<any>; close: () => Promise<void> } | null = null;
async function render(url: string): Promise<Page | null> {
  if (!browser) {
    const { chromium } = await import("/opt/node-tools/node_modules/playwright/index.mjs" as string);
    browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }).catch(() => chromium.launch());
  }
  const page = await browser!.newPage();
  try {
    const res = await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 }).catch(() => null);
    const html: string = await page.content();
    return { url: page.url(), status: res?.status() ?? 0, html, text: await page.locator("body").innerText().catch(() => textOf(html)), rendered: true };
  } finally {
    await page.close().catch(() => {});
  }
}

function decode(s: string): string {
  return s.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&commat;/g, "@").replace(/&copy;/g, "©").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");
}
function textOf(html: string): string {
  return decode(html.replace(/<(script|style|template)[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}
const looksJsRendered = (p: Page) => p.text.length < 400 || /<div id="(root|app|__next)">\s*<\/div>|enable javascript to/i.test(p.html);

async function get(url: string): Promise<Page | null> {
  try {
    const res = await fetch(url, { redirect: "follow", headers: { "user-agent": UA, accept: "text/html" }, signal: AbortSignal.timeout(20_000) });
    const html = (await res.text()).slice(0, 3_000_000);
    return { url: res.url || url, status: res.status, html, text: textOf(html), rendered: false };
  } catch {
    return null;
  }
}
/** A plain fetch first; Playwright only if the page came back blocked or nearly empty (built in the browser). */
async function load(url: string, forceRender = false): Promise<Page | null> {
  const p = forceRender ? null : await get(url);
  if (p && p.status < 400 && !looksJsRendered(p)) return p;
  return (await render(url).catch(() => null)) || p;
}

/** An attribute's value from one tag, quoted or not. */
const attr = (tag: string, name: string) => tag.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"))?.slice(1).find((v) => v !== undefined) ?? null;
const metaTag = (html: string, name: string) => [...html.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0]).find((t) => attr(t, "name")?.toLowerCase() === name);
const links = (p: Page) => [...p.html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)]
  .map((m) => { try { const h = attr(m[1], "href"); return h ? { href: new URL(decode(h), p.url), text: textOf(m[2]) } : null; } catch { return null; } })
  .filter((l): l is { href: URL; text: string } => !!l);
const baseDomain = (host: string) => host.replace(/^www\./i, "").split(".").slice(-2).join(".").toLowerCase();

async function hasMx(domain: string): Promise<boolean | null> {
  try {
    if ((await dns.resolveMx(domain)).length) return true;
  } catch { /* some resolvers don't answer MX queries: ask DNS-over-HTTPS before saying no */ }
  try {
    const r = await (await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`, { signal: AbortSignal.timeout(10_000) })).json() as { Status: number; Answer?: { type: number }[] };
    return r.Status === 0 ? !!r.Answer?.some((a) => a.type === 15) : r.Status === 3 ? false : null;
  } catch {
    return null;
  }
}

function formSendCheck(url: string): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    execFile(process.execPath, [join(import.meta.dirname, "form-send.ts"), "check", url], { timeout: 120_000 }, (_err, stdout) => {
      const line = String(stdout).trim().split("\n").pop() || "";
      try { resolve(JSON.parse(line)); } catch { resolve({ status: "refused", reason: "form-send.ts gave no result", page: url }); }
    });
  });
}
function formSkip(reason: string): string {
  const r = reason.toLowerCase();
  const slug = /captcha/.test(r) ? "captcha" : /solicit/.test(r) ? "no-solicit" : /no email field/.test(r) ? "no-email-field"
    : /required/.test(r) ? "required-field" : /message box|contact form/.test(r) ? "no-form" : /load/.test(r) ? "no-load" : "refused";
  return `form-${slug}`;
}

async function main() {
  const args = process.argv.slice(2);
  const withForm = args.includes("--form");
  const input = args.find((a) => !a.startsWith("--"));
  if (!input) {
    console.error("Usage: node tools/prospect-check.ts <site-url> [--form]");
    process.exit(1);
  }
  const target = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
  const secure = new URL(target.href); secure.protocol = "https:";
  let home = await load(secure.href);
  const https = !!home && home.status < 400 && home.url.startsWith("https:");
  if (!https) {
    const plain = new URL(target.href); plain.protocol = "http:";
    const p = await load(plain.href);
    if (p && (!home || home.status >= 400 || p.status < 400)) home = p;
  }
  if (!home || home.status >= 400) {
    console.log(JSON.stringify({ site: target.href, error: home ? `homepage returned ${home.status}` : "homepage didn't load", skip: null }));
    return;
  }
  const host = new URL(home.url).host.toLowerCase();
  const sameSite = (u: URL) => baseDomain(u.host) === baseDomain(host);

  // The contact page, if the homepage links one on the same site.
  const contactLink = links(home).find((l) => sameSite(l.href) && /contact|get in touch|reach us/i.test(l.text + " " + l.href.pathname) && l.href.pathname !== new URL(home!.url).pathname);
  const contact = contactLink ? await load(contactLink.href.href, home.rendered) : null;
  const pages = [home, ...(contact ? [contact] : [])].filter((p) => p.status < 400);
  const outdated: { issue: string; url: string }[] = [];
  if (contactLink && (!contact || contact.status >= 400)) outdated.push({ issue: `contact page broken (${contact?.status || "no response"})`, url: contactLink.href.href });

  // Store, cart, checkout and logins.
  const storeEvidence: { marker: string; url: string }[] = [];
  for (const p of pages) {
    const inPage = p.html.replace(/<a\b[^>]*>/gi, "<a>"); // outbound buttons are allowed, so look past link targets
    for (const [name, re] of PLATFORMS) if (re.test(name === "add-to-cart" ? p.text + inPage.replace(/<(script|style)[\s\S]*?<\/\1>/gi, "") : inPage)) storeEvidence.push({ marker: name, url: p.url });
    for (const l of links(p)) {
      if (!sameSite(l.href) || /wp-login|wp-admin/i.test(l.href.pathname)) continue;
      if (l.href.host !== host && /^(shop|store)\./i.test(l.href.host)) storeEvidence.push({ marker: `store site ${l.href.host}`, url: p.url });
      else if (STORE_PATH.test(l.href.pathname) || /^(log ?in|sign ?in|my account|cart|checkout)$/i.test(l.text)) storeEvidence.push({ marker: `link ${l.href.pathname}${l.text ? ` "${l.text.slice(0, 30)}"` : ""}`, url: p.url });
    }
  }
  const store = storeEvidence.length > 0;
  const evidence = [...new Map(storeEvidence.map((e) => [e.marker, e])).values()].slice(0, 8);

  // Copyright year: the latest year written after a © or "Copyright".
  const years = pages.flatMap((p) => [...p.text.matchAll(/(?:©|\(c\)|copyright)[^©]{0,80}?\b((?:19|20)\d{2})\b(?:\s*[-–—]\s*((?:19|20)\d{2}))?/gi)].map((m) => +(m[2] || m[1])));
  const copyright = years.length ? Math.max(...years) : null;
  const copyrightDynamic = !home.rendered && /getFullYear\(\)/.test(home.html);
  if (copyright && copyright <= 2019) outdated.push({ issue: `copyright ${copyright}`, url: pages.find((p) => p.text.includes(String(copyright)))!.url });

  // Mobile viewport and pinch zoom.
  const vp = metaTag(home.html, "viewport");
  const vpContent = vp ? attr(vp, "content") : null;
  const zoomBlocked = !!vpContent && (/user-scalable\s*=\s*(no|0)/i.test(vpContent) || /maximum-scale\s*=\s*(1(\.0+)?|0?\.\d+)\b/i.test(vpContent));
  if (!vp) outdated.push({ issue: "no mobile viewport tag (not mobile-friendly)", url: home.url });
  if (zoomBlocked) outdated.push({ issue: "blocks pinch-zoom", url: home.url });
  if (!https) outdated.push({ issue: "no HTTPS", url: home.url });

  // Builder.
  const gen = metaTag(home.html, "generator");
  const generator = gen ? attr(gen, "content") : null;
  const builder = BUILDERS.find(([, re]) => re.test(generator || "") || re.test(home!.html))?.[0] ?? null;
  if (FREE_SUBDOMAIN.test(host)) outdated.push({ issue: `free builder subdomain (${host})`, url: home.url });
  else if (builder && TEMPLATE_PLATFORMS.test(builder)) outdated.push({ issue: `${builder} template`, url: home.url });

  // Dead social icons and dead embeds the RUNBOOK lists.
  for (const p of pages) {
    if (/plus\.google\.com/i.test(p.html)) outdated.push({ issue: "dead social link (Google+)", url: p.url });
    if (/\.swf\b|application\/x-shockwave-flash/i.test(p.html)) outdated.push({ issue: "Flash embed (no longer plays)", url: p.url });
  }

  // Agency or designer credit in the footer (the operator judges whether the agency is still active).
  let agency: { text: string; url: string | null; page: string } | null = null;
  for (const p of pages) {
    const footer = p.html.match(/<footer[\s\S]*<\/footer>/i)?.[0] || p.html.slice(-6000);
    const m = textOf(footer).match(/(?:web(?:site)?|site)?\s*(?:design(?:ed)?|developed|built|created|powered)\s+(?:and\s+\w+\s+)?by:?\s+([^|©\n]{2,60})/i);
    if (m && !/^(wordpress|squarespace|wix|shopify|godaddy|weebly|webflow|duda|square)\b/i.test(m[1].trim())) {
      const name = m[1].trim().split(/\s+/)[0].toLowerCase();
      const a = [...footer.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].find((x) => textOf(x[2]).toLowerCase().includes(name) || (attr(x[1], "href") || "").toLowerCase().includes(name));
      agency = { text: m[0].trim().slice(0, 80), url: a ? decode(attr(a[1], "href") || "") || null : null, page: p.url };
      break;
    }
  }

  // Published email addresses, with role vs named, and an MX lookup per domain.
  const found = new Map<string, string>();
  for (const p of pages) {
    const add = (e: string) => {
      const em = e.trim().toLowerCase().replace(/^mailto:/, "").split("?")[0];
      if (/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,24}$/.test(em) && !/\.(png|jpe?g|gif|webp|svg)$/.test(em) && !PLACEHOLDER.test(em.split("@")[1]) && !found.has(em)) found.set(em, p.url);
    };
    for (const l of links(p)) if (l.href.protocol === "mailto:") add(decodeURIComponent(l.href.pathname));
    for (const m of p.html.matchAll(/data-cfemail\s*=\s*["']([0-9a-f]+)["']/gi)) { // Cloudflare's email obfuscation
      const b = m[1].match(/../g)!.map((h) => parseInt(h, 16));
      add(String.fromCharCode(...b.slice(1).map((c) => c ^ b[0])));
    }
    for (const m of p.text.replace(/\s*(\[at\]|\(at\))\s*/gi, "@").matchAll(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,24}/gi)) add(m[0]);
  }
  const mx = new Map<string, boolean | null>();
  for (const d of new Set([...found.keys()].map((e) => e.split("@")[1]))) mx.set(d, await hasMx(d));
  const emails: Email[] = [...found].map(([email, source]) => {
    const [local, domain] = email.split("@");
    const e: Email = { email, kind: ROLE.test(local) ? "role" : "named", domain, source, mx: mx.get(domain) ?? null, usable: true };
    if (OLD_ISP.test(domain)) e.oldIsp = true;
    const why = BLOCKED_ROLE.test(local) ? `${local}@ is not allowed` : !FREE_MAIL.test(domain) && baseDomain(domain) !== baseDomain(host) ? "another domain's address" : e.mx === false ? "domain has no MX record" : null;
    if (why) { e.usable = false; e.why = why; }
    return e;
  });

  // A contact form with a message box.
  const formPage = pages.find((p) => [...p.html.matchAll(/<form\b[\s\S]*?<\/form>/gi)].some((f) => /<textarea/i.test(f[0])));
  const embed = pages.map((p) => ({ p, m: p.html.match(/jotform|wufoo|typeform|docs\.google\.com\/forms|formstack|cognitoforms|123formbuilder|hsforms\.net\/forms|hbspt\.forms/i) })).find((x) => x.m);
  const contactForm = formPage ? { url: formPage.url } : embed ? { url: embed.p.url, embed: embed.m![0] } : null;
  const formUrl = contactForm?.url || contact?.url || home.url;
  const formCheck = withForm ? await formSendCheck(formUrl) : undefined;

  // The hard disqualifiers the script can decide on its own (RUNBOOK step 6).
  const usable = emails.filter((e) => e.usable);
  const roles = new Set(emails.filter((e) => e.kind === "role").map((e) => e.email));
  let skip: string | null = null;
  if (store) skip = "store";
  else if (roles.size >= 2) skip = "email-several-role";
  else if (emails.length && !usable.length) skip = emails.every((e) => e.why === "domain has no MX record") ? "email-no-mx" : emails.every((e) => e.why === "another domain's address") ? "email-other-domain" : "email-unusable";
  else if (!emails.length && formCheck?.status === "refused") skip = formSkip(String(formCheck.reason || ""));
  const best = usable.find((e) => e.kind === "named") || usable[0] || null;

  console.log(JSON.stringify({
    site: home.url, ...(baseDomain(host) !== baseDomain(target.host) ? { movedTo: host } : {}), rendered: home.rendered, https, store, storeEvidence: evidence,
    copyright, copyrightDynamic, viewport: vpContent, zoomBlocked, builder, generator,
    outdated, outdatedCount: outdated.length, agency, emails, email: best?.email ?? null, emailKind: best?.kind ?? null, emailSource: best?.source ?? null,
    contactPage: contact?.url ?? null, contactForm, ...(formCheck ? { formCheck: { status: formCheck.status, reason: formCheck.reason, page: formCheck.page } } : {}),
    channel: best ? "email" : contactForm ? "form" : null, skip,
  }));
}

main()
  .catch((e) => console.log(JSON.stringify({ site: process.argv[2], error: String(e).slice(0, 200), skip: null })))
  .finally(() => browser?.close().catch(() => {}));

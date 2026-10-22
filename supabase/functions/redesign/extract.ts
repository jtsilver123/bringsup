// Fetch a business website and pull out what a redesign needs: text, contact
// details, candidate photos and brand colors. No dependencies, so it runs in
// Deno (Supabase Edge) and in Node (for local tests).

export interface SiteImage {
  url: string;
  alt: string;
  logo: boolean;
}

export interface SiteData {
  url: string;
  host: string;
  title: string;
  description: string;
  text: string;
  phones: string[];
  emails: string[];
  images: SiteImage[];
  colors: string[];
}

const UA = "Mozilla/5.0 (compatible; BringsUpBot/1.0; +https://bringsup.com)";
const MAX_BYTES = 1_500_000;
const MAIN_TEXT_CHARS = 12_000;
const SUBPAGE_TEXT_CHARS = 4_000;
const SUBPAGE_HINTS = /(about|menu|services?|contact|hours|location|visit|story|our-)/i;

export class SiteError extends Error {
  code: "bad_url" | "unreachable" | "not_html" | "empty";
  constructor(code: SiteError["code"], message: string) {
    super(message);
    this.code = code;
  }
}

/** Accept "rosasbakery.com", "www.rosasbakery.com" or a full URL; refuse anything that isn't a public website. */
export function normalizeUrl(input: string): URL {
  let raw = (input || "").trim();
  if (!raw) throw new SiteError("bad_url", "Add your website address.");
  if (!/^https?:\/\//i.test(raw)) raw = "https://" + raw;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new SiteError("bad_url", "That doesn't look like a web address.");
  }
  const host = url.hostname.toLowerCase();
  const isIp = /^\d+\.\d+\.\d+\.\d+$/.test(host) || host.includes(":");
  if (
    !["http:", "https:"].includes(url.protocol) || isIp || !host.includes(".") ||
    host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")
  ) {
    throw new SiteError("bad_url", "That doesn't look like a public website.");
  }
  url.hash = "";
  return url;
}

async function fetchHtml(url: URL, timeoutMs: number): Promise<{ html: string; finalUrl: URL }> {
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { "user-agent": UA, accept: "text/html,application/xhtml+xml" },
      redirect: "follow",
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    throw new SiteError("unreachable", "We couldn't reach that website.");
  }
  if (!res.ok) throw new SiteError("unreachable", `That website answered with an error (${res.status}).`);
  const type = res.headers.get("content-type") || "";
  if (!type.includes("html")) throw new SiteError("not_html", "That address isn't a web page.");
  const reader = res.body?.getReader();
  if (!reader) throw new SiteError("empty", "That page was empty.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (size < MAX_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    size += value.length;
  }
  reader.cancel().catch(() => {});
  const buf = new Uint8Array(size);
  let off = 0;
  for (const c of chunks) {
    buf.set(c.subarray(0, Math.min(c.length, size - off)), off);
    off += c.length;
    if (off >= size) break;
  }
  return { html: new TextDecoder().decode(buf), finalUrl: new URL(res.url || url.href) };
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "'", lsquo: "'", rdquo: '"', ldquo: '"', ndash: "-", mdash: "-", hellip: "...", copy: "(c)" };

function decode(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);
}

function attr(tag: string, name: string): string {
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return m ? decode(m[2] ?? m[3] ?? m[4] ?? "").trim() : "";
}

function abs(href: string, base: URL): string | null {
  try {
    const u = new URL(href, base);
    return ["http:", "https:"].includes(u.protocol) ? u.href : null;
  } catch {
    return null;
  }
}

/** Visible text, one block per line. */
export function htmlToText(html: string): string {
  return decode(
    html
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<(script|style|noscript|svg|template|iframe)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/?(p|div|section|article|header|footer|li|ul|ol|h[1-6]|tr|td|th|table|nav|address|blockquote)[^>]*>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  )
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter((l) => l.length > 1)
    .filter((l, i, a) => a.indexOf(l) === i)
    .join("\n");
}

function grey(hex: string): boolean {
  const n = parseInt(hex.slice(1), 16);
  const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  return Math.max(r, g, b) - Math.min(r, g, b) < 24;
}

function colorsIn(html: string): string[] {
  const counts = new Map<string, number>();
  const theme = html.match(/<meta[^>]+name=["']theme-color["'][^>]*>/i);
  if (theme) {
    const c = attr(theme[0], "content").toLowerCase();
    if (/^#[0-9a-f]{6}$/.test(c)) counts.set(c, 50);
  }
  for (const m of html.matchAll(/#([0-9a-f]{6}|[0-9a-f]{3})\b/gi)) {
    let h = m[1].toLowerCase();
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    const hex = "#" + h;
    if (grey(hex)) continue;
    counts.set(hex, (counts.get(hex) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([c]) => c);
}

function imagesIn(html: string, base: URL): SiteImage[] {
  const out: SiteImage[] = [];
  const seen = new Set<string>();
  const add = (src: string, alt: string, hint: string) => {
    const url = abs(src, base);
    if (!url || seen.has(url)) return;
    if (/^data:|\.svg(\?|$)|\.gif(\?|$)|spacer|pixel|sprite|favicon|facebook\.com\/tr|gravatar|badge|icon/i.test(url)) return;
    seen.add(url);
    out.push({ url, alt: alt.slice(0, 120), logo: /logo/i.test(url + " " + alt + " " + hint) });
  };
  const og = html.match(/<meta[^>]+property=["']og:image["'][^>]*>/i);
  if (og) add(attr(og[0], "content"), "social preview image", "");
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = m[0];
    const w = parseInt(attr(tag, "width")) || 0, h = parseInt(attr(tag, "height")) || 0;
    if ((w && w < 120) || (h && h < 90)) continue;
    let src = attr(tag, "data-src") || attr(tag, "data-lazy-src") || attr(tag, "src");
    const srcset = attr(tag, "srcset") || attr(tag, "data-srcset");
    if (srcset) {
      const last = srcset.split(",").map((s) => s.trim().split(/\s+/)[0]).filter(Boolean).pop();
      if (last) src = last;
    }
    if (src) add(src, attr(tag, "alt"), attr(tag, "class") + " " + attr(tag, "id"));
  }
  for (const m of html.matchAll(/background(?:-image)?\s*:\s*url\((['"]?)([^'")]+)\1\)/gi)) add(m[2], "", "background");
  return out.slice(0, 24);
}

function subpageLinks(html: string, base: URL): URL[] {
  const found: URL[] = [];
  for (const m of html.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi)) {
    const href = attr(m[0], "href");
    const label = htmlToText(m[1]);
    const url = abs(href, base);
    if (!url) continue;
    const u = new URL(url);
    u.hash = "";
    if (u.hostname !== base.hostname || u.pathname === base.pathname || /\.(pdf|jpe?g|png|zip)$/i.test(u.pathname)) continue;
    if (!SUBPAGE_HINTS.test(u.pathname + " " + label)) continue;
    if (found.some((f) => f.href === u.href)) continue;
    found.push(u);
  }
  return found.slice(0, 3);
}

/** Read the homepage and up to three helpful inner pages (about, menu, contact...). */
export async function readSite(input: string): Promise<SiteData> {
  const start = normalizeUrl(input);
  const { html, finalUrl } = await fetchHtml(start, 15_000);
  const title = decode((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "").replace(/\s+/g, " ").trim());
  const descTag = html.match(/<meta[^>]+name=["']description["'][^>]*>/i);
  const description = descTag ? attr(descTag[0], "content") : "";

  let text = htmlToText(html).slice(0, MAIN_TEXT_CHARS);
  let images = imagesIn(html, finalUrl);
  const colors = colorsIn(html);
  const sub = await Promise.allSettled(subpageLinks(html, finalUrl).map((u) => fetchHtml(u, 8_000)));
  for (const r of sub) {
    if (r.status !== "fulfilled") continue;
    text += `\n\n--- Page: ${r.value.finalUrl.pathname} ---\n` + htmlToText(r.value.html).slice(0, SUBPAGE_TEXT_CHARS);
    images = images.concat(imagesIn(r.value.html, r.value.finalUrl).filter((i) => !images.some((j) => j.url === i.url)));
  }
  const all = html + sub.map((r) => (r.status === "fulfilled" ? r.value.html : "")).join(" ");
  const phones = [...new Set([
    ...[...all.matchAll(/href=["']tel:([^"']+)["']/gi)].map((m) => decode(m[1]).trim()),
    ...[...text.matchAll(/\(?\b\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/g)].map((m) => m[0]),
  ])].slice(0, 3);
  const emails = [...new Set([...all.matchAll(/mailto:([^"'?\s>]+)/gi)].map((m) => decode(m[1]).toLowerCase()))].slice(0, 3);

  if (text.length < 80 && !title) throw new SiteError("empty", "We couldn't find any text on that page.");
  return { url: finalUrl.href, host: finalUrl.hostname.replace(/^www\./, ""), title, description, text, phones, emails, images: images.slice(0, 24), colors };
}

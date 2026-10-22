// Build a customer site into a folder ready to deploy.
//   node tools/site-kit/build.ts <site.json> <out-dir> [--preview <ref> <rounds-left>]
// Remote images (Tally uploads, stock photos) are downloaded into <out-dir>/assets/ so the site never hotlinks.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { render, type SiteContent } from "./render.ts";

const REQUIRED: (keyof SiteContent)[] = ["business_name", "theme", "phone", "address", "hours", "primary_cta", "home", "offer", "about", "testimonials", "social", "domain"];

export function check(c: SiteContent): string[] {
  const errors = REQUIRED.filter((k) => c[k] === undefined).map((k) => `missing "${k}"`);
  if (!c.home?.headline) errors.push("home.headline is empty");
  if (!c.offer?.groups?.some((g) => g.items.length)) errors.push("offer has no items");
  if (!c.primary_cta?.label || !c.primary_cta?.href) errors.push("primary_cta needs a label and an href");
  if (!c.about?.paragraphs?.length) errors.push("about.paragraphs is empty");
  return errors;
}

async function localize(c: SiteContent, out: string): Promise<SiteContent> {
  const cache = new Map<string, string>();
  const grab = async (url: string): Promise<string> => {
    if (!url || !/^https?:/.test(url)) return url;
    if (cache.has(url)) return cache.get(url)!;
    const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
    if (!res.ok) throw new Error(`Couldn't download ${url}: ${res.status}`);
    const type = res.headers.get("content-type") || "";
    const ext = type.includes("png") ? "png" : type.includes("webp") ? "webp" : type.includes("svg") ? "svg" : type.includes("gif") ? "gif" : "jpg";
    const name = `assets/${createHash("sha1").update(url).digest("hex").slice(0, 12)}.${ext}`;
    mkdirSync(join(out, "assets"), { recursive: true });
    writeFileSync(join(out, name), new Uint8Array(await res.arrayBuffer()));
    cache.set(url, name);
    return name;
  };
  const copy: SiteContent = structuredClone(c);
  copy.logo = await grab(copy.logo);
  copy.hero_image = await grab(copy.hero_image);
  copy.about.images = await Promise.all(copy.about.images.map(grab));
  for (const g of copy.offer.groups) for (const it of g.items) it.image = await grab(it.image);
  return copy;
}

export async function build(content: SiteContent, out: string, preview?: { ref: string; roundsLeft: number }): Promise<string[]> {
  const errors = check(content);
  if (errors.length) throw new Error("site.json problems:\n- " + errors.join("\n- "));
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  const local = await localize(content, out);
  const files = render(local, { preview });
  for (const [path, body] of Object.entries(files)) {
    mkdirSync(dirname(join(out, path)), { recursive: true });
    writeFileSync(join(out, path), body);
  }
  return Object.keys(files);
}

if (process.argv[1] && import.meta.filename === resolve(process.argv[1])) {
  const [file, out, flag, ref, left] = process.argv.slice(2);
  if (!file || !out) {
    console.error("Usage: node tools/site-kit/build.ts <site.json> <out-dir> [--preview <ref> <rounds-left>]");
    process.exit(1);
  }
  const content = JSON.parse(readFileSync(file, "utf8")) as SiteContent;
  const preview = flag === "--preview" ? { ref, roundsLeft: Number(left || 0) } : undefined;
  const written = await build(content, out, preview);
  console.log(`Built ${written.length} files into ${out}${preview ? " (preview)" : ""}`);
}

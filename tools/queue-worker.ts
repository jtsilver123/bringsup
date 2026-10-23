// Work the redesign queue from a Claude Code session (runs on the subscription, no API key).
//
//   node tools/queue-worker.ts pull                 save queued requests to work/<id>/ (prompt.md, system.md, schema.json)
//   node tools/queue-worker.ts complete <id>        validate work/<id>/concept.json and publish it
//   node tools/queue-worker.ts fail <id> "<why>"    mark a request as failed
//   node tools/queue-worker.ts emailed <id>         record that the visitor was emailed
//   node tools/queue-worker.ts outreach <slug> <dir> publish <dir>/concept.json as a cold-email prospect's private
//                                                   preview (bringsup.com/for/<slug>-<code>); <dir>/meta.json may
//                                                   hold {url, email, images: [https urls], rest}; a hand-built
//                                                   <dir>/index.html (self-contained) is published with the BringsUp card
//                                                   in place of its <!--BU-GATE--> marker ({{REST}} from meta.json rest).
//                                                   Every picture is saved in <dir>/shots/. Add the current short code
//                                                   (e.g. scoops-and-cookies-ff8hnwge) to update that preview in place,
//                                                   keeping its link; that reuses the saved "today" pictures of their site
//                                                   unless --recapture is added
//   node tools/queue-worker.ts views                opens and start clicks for every /for/ preview
//   node tools/queue-worker.ts delete <short|id>    delete a preview and its pictures
//
// pull claims what it saves for 90 minutes and also lists finished requests nobody emailed yet.
// Needs BRINGSUP_WORKER_TOKEN (the function's WORKER_TOKEN secret). Node 22.6+ runs this file directly.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { SCHEMA } from "../supabase/functions/redesign/prompt.ts";
import { functionApi, requireWorkerToken } from "./function-api.ts";
import { injectGate } from "./site-kit/gate.ts";

const call = functionApi(process.env.BRINGSUP_API || "https://rgeeynodxvusivfbaxfu.supabase.co/functions/v1/redesign");
const WORK = join(import.meta.dirname, "..", "work");

interface Schema {
  required?: string[];
  properties?: Record<string, { type?: string | string[]; enum?: unknown[] }>;
}

interface QueueItem {
  id: string;
  email: string;
  url: string;
  created_at: string;
  link: string;
  prompt: string;
}

function typeOf(v: unknown): string {
  if (Array.isArray(v)) return "array";
  if (v === null) return "null";
  return Number.isInteger(v) ? "integer" : typeof v;
}

/** Check top-level required keys, types and enums. Enough to catch a malformed concept before it goes live. */
function validate(concept: Record<string, unknown>, schema: Schema): string[] {
  const errors: string[] = [];
  for (const key of schema.required || []) if (!(key in concept)) errors.push(`missing "${key}"`);
  for (const [key, rule] of Object.entries(schema.properties || {})) {
    if (!(key in concept)) continue;
    const want = ([] as string[]).concat(rule.type || []);
    const got = typeOf(concept[key]);
    if (want.length && !want.includes(got) && !(got === "integer" && want.includes("number"))) {
      errors.push(`"${key}" should be ${want.join(" or ")}, got ${got}`);
    }
    if (rule.enum && !rule.enum.includes(concept[key])) errors.push(`"${key}" must be one of ${rule.enum.join(", ")}`);
  }
  return errors;
}

async function pull(): Promise<void> {
  const { system, schema, items, not_emailed } = await call("GET", "?queue=1") as
    { system: string; schema: Schema; items: QueueItem[]; not_emailed?: { id: string; email: string; business_name: string; link: string }[] };
  // Finished but never emailed (a run stopped between "complete" and the email): send these first, then mark them emailed.
  for (const r of not_emailed || []) console.log(`NOT EMAILED  ${r.id}  ${r.email}  ${r.business_name}  ${r.link}`);
  if (!items.length) return console.log("Queue is empty.");
  for (const item of items) {
    const dir = join(WORK, item.id);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "system.md"), system);
    writeFileSync(join(dir, "schema.json"), JSON.stringify(schema, null, 2));
    writeFileSync(join(dir, "prompt.md"), item.prompt);
    writeFileSync(join(dir, "request.json"), JSON.stringify(item, null, 2));
    console.log(`${item.id}  ${item.url}  ${item.email}  -> work/${item.id}/`);
  }
}

async function complete(id: string): Promise<void> {
  const dir = join(WORK, id);
  const concept = JSON.parse(readFileSync(join(dir, "concept.json"), "utf8"));
  const errors = validate(concept, JSON.parse(readFileSync(join(dir, "schema.json"), "utf8")));
  if (errors.length) {
    console.error("concept.json doesn't match the schema:\n- " + errors.join("\n- "));
    process.exit(1);
  }
  const res = await call("POST", "", { action: "complete", id, concept });
  console.log(res.status === "skipped" ? "Skipped (not a business)." : `Published: ${res.link}`);
}

type Shots = { before: { desktop?: string; phone?: string }; after: { desktop?: string; phone?: string }; tall?: TallShots };
/** Long pictures of whole pages (up to TALL_MAX CSS pixels) for the scrollable "Today and new" slider. */
type Tall = { data: string; width: number; height: number };
type TallShots = { before: { desktop?: Tall; phone?: Tall }; after: { desktop?: Tall; phone?: Tall } };
type Capture = { shot?: Buffer; tall?: Tall };
const TALL_MAX = { desktop: 4200, phone: 5200 };
/** A challenge page instead of their site ("Verify you are human"), sometimes sent with a normal 200. */
const BOT_CHECK = /verify(ing)? (that )?you are (a )?human|checking (if the site connection is secure|your browser)|just a moment\.\.\.|are you a robot|press (&|and) hold|attention required|unusual traffic|access denied/i;
const RETRY_WAIT = 30_000;

/** Every picture is also saved in <dir>/shots/ (the build's visual check reads these files):
 *  today-desktop.jpg, today-phone.jpg, today-tall-desktop.jpg, today-tall-phone.jpg (their site now), the same four
 *  with new- (the preview), card.jpg (the link preview card) and tall.json (each tall picture's width and height). */
const SIZES = "tall.json";
const fileOf = (side: "today" | "new", size: "desktop" | "phone", tall = false) => `${side}-${tall ? "tall-" : ""}${size}.jpg`;

/** The "today" pictures saved by an earlier publish, so republishing in place doesn't visit their site again. */
function cachedToday(shotsDir: string): { desktop?: Capture; phone?: Capture } {
  let sizes: Record<string, { width: number; height: number }> = {};
  try { sizes = JSON.parse(readFileSync(join(shotsDir, SIZES), "utf8")); } catch { /* no tall pictures saved */ }
  const read = (name: string) => { try { return readFileSync(join(shotsDir, name)); } catch { return undefined; } };
  const one = (size: "desktop" | "phone"): Capture | undefined => {
    const shot = read(fileOf("today", size)), tallName = fileOf("today", size, true), tall = read(tallName);
    if (!shot) return undefined;
    return { shot, tall: tall && sizes[tallName] ? { data: tall.toString("base64"), ...sizes[tallName] } : undefined };
  };
  return { desktop: one("desktop"), phone: one("phone") };
}

/** Pictures for the preview, all base64 JPEG, made in one browser run:
 *  - og: the link preview card (iMessage, Gmail, WhatsApp), 1200x630: their homepage in a browser frame beside
 *    "This could be your new website. Made for <name>" (tools/worker/og-card.html);
 *  - shots: their site today (from `currentUrl`) and the new one, at desktop and phone size, for the /try/ reveal, plus
 *    shots.tall: the same pages top to bottom (cut off at TALL_MAX) for the scrollable "Today and new" slider.
 *  With `reuseToday` (republishing in place) the "today" pictures come from <dir>/shots/ instead of a new visit; any
 *  that are missing are left out and the backend keeps the ones it has.
 *  Anything that fails is left out; the preview still publishes. */
async function previewImages(file: string, name: string, shotsDir: string, currentUrl?: string, reuseToday = false, replacing = false): Promise<{ og?: string; shots?: Shots }> {
  let browser: any;
  const out: { og?: string; shots?: Shots } = {};
  mkdirSync(shotsDir, { recursive: true });
  let sizes: Record<string, { width: number; height: number }> = {};
  try { sizes = JSON.parse(readFileSync(join(shotsDir, SIZES), "utf8")); } catch { /* first publish */ }
  const save = (side: "today" | "new", size: "desktop" | "phone", got: Capture) => {
    if (got.shot) writeFileSync(join(shotsDir, fileOf(side, size)), got.shot);
    if (got.tall) {
      writeFileSync(join(shotsDir, fileOf(side, size, true)), Buffer.from(got.tall.data, "base64"));
      sizes[fileOf(side, size, true)] = { width: got.tall.width, height: got.tall.height };
    }
  };
  try {
    const { chromium } = await import("/opt/node-tools/node_modules/playwright/index.mjs" as string);
    browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }).catch(() => chromium.launch());
    // One visit per page and size gives both pictures: the screen-sized one for the reveal, then the whole page for the
    // slider. Fewer visits also keeps busy sites (some rate-limit) from refusing the later ones.
    const capture = async (url: string, phone: boolean, retry = true): Promise<Capture> => {
      const dsf = phone ? 2 : 1.5, vw = phone ? 390 : 1280;
      const page = await browser.newPage(phone
        ? { viewport: { width: vw, height: 844 }, deviceScaleFactor: dsf, isMobile: true, hasTouch: true }
        : { viewport: { width: vw, height: 800 }, deviceScaleFactor: dsf });
      try {
        // A page that didn't load (bad address, site down, error status, bot check) must never be shown as "Your site today".
        const res = await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 }).catch(() => null);
        await page.waitForTimeout(1200);
        if (!url.startsWith("file:")) {
          const status: number = res?.status() ?? 0;
          const botCheck = !!res?.ok() && await page.evaluate((src: string) => {
            const re = new RegExp(src, "i"), text = (document.body?.innerText || "").slice(0, 3000);
            return re.test(document.title) || (text.length < 2000 && re.test(text));
          }, BOT_CHECK.source).catch(() => false);
          // A busy site (429, 503) or a bot check often lets the same visit through a little later: try once more.
          if ((status === 429 || status === 503 || botCheck) && retry) {
            console.error(`${url} (${phone ? "phone" : "desktop"}) answered with ${botCheck ? "a bot check" : status}; trying once more in ${RETRY_WAIT / 1000} seconds.`);
            await page.close().catch(() => {});
            await new Promise((r) => setTimeout(r, RETRY_WAIT));
            return capture(url, phone, false);
          }
          if (!res || !res.ok() || botCheck) return {};
        }
        const shot: Buffer = await page.screenshot({ type: "jpeg", quality: 76 });
        let tall: Tall | undefined;
        try {
          // Scroll down once so lazy images and scroll effects load, then back to the top for the picture.
          const h: number = await page.evaluate(async (max: number) => {
            for (let y = 0; y < Math.min(document.documentElement.scrollHeight, max); y += 600) {
              scrollTo(0, y);
              await new Promise((r) => setTimeout(r, 120));
            }
            scrollTo(0, 0);
            await new Promise((r) => setTimeout(r, 600));
            return Math.min(document.documentElement.scrollHeight, max);
          }, TALL_MAX[phone ? "phone" : "desktop"]);
          const buf: Buffer = await page.screenshot({ type: "jpeg", quality: 60, fullPage: true, clip: { x: 0, y: 0, width: vw, height: h } });
          tall = { data: buf.toString("base64"), width: Math.round(vw * dsf), height: Math.round(h * dsf) };
        } catch { /* the reveal still works without the whole-page picture */ }
        return { shot, tall };
      } catch { return {}; } finally { await page.close().catch(() => {}); }
    };
    const page = "file://" + resolve(file);
    // The new page is a local file, so it's captured alongside the visits to their site. Those two stay one after the
    // other: busy sites rate-limit visits that come together.
    const visitTheirs = async (url: string) => { const d = await capture(url, false); return { desktop: d, phone: await capture(url, true) }; };
    const [newD, newP, visited] = await Promise.all([capture(page, false), capture(page, true),
      currentUrl && !reuseToday ? visitTheirs(currentUrl) : undefined]);
    save("new", "desktop", newD);
    save("new", "phone", newP);
    if (visited) {
      save("today", "desktop", visited.desktop);
      save("today", "phone", visited.phone);
    }
    const old = visited || (reuseToday ? cachedToday(shotsDir) : {});
    if (reuseToday) {
      console.error(old.desktop?.shot
        ? `Reusing the "today" pictures in ${shotsDir} (add --recapture to visit their site again).`
        : `No saved "today" pictures in ${shotsDir}; the preview keeps the ones it has. Add --recapture to visit their site again.`);
    }
    writeFileSync(join(shotsDir, SIZES), JSON.stringify(sizes, null, 2));
    const afterDesktop = newD.shot;
    const shots: Shots = {
      before: { desktop: old.desktop?.shot?.toString("base64"), phone: old.phone?.shot?.toString("base64") },
      after: { desktop: newD.shot?.toString("base64"), phone: newP.shot?.toString("base64") },
      tall: { before: { desktop: old.desktop?.tall, phone: old.phone?.tall }, after: { desktop: newD.tall, phone: newP.tall } },
    };
    if (currentUrl && (!old.desktop?.tall || !newD.tall) && !(reuseToday && !old.desktop?.shot)) {
      console.error("No whole-page pictures for the slider this time; it shows the top of each page instead.");
    }
    // Republishing in place may send only the new pictures: the backend keeps the "today" ones it already has.
    if (shots.after.desktop && (shots.before.desktop || replacing)) out.shots = shots;
    if (afterDesktop) {
      const card = await browser.newPage({ viewport: { width: 1200, height: 630 } });
      const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
      const html = readFileSync(join(import.meta.dirname, "worker", "og-card.html"), "utf8")
        .replaceAll("{{NAME}}", esc(name)).replaceAll("{{SHOT}}", "data:image/jpeg;base64," + afterDesktop.toString("base64"));
      await card.setContent(html, { waitUntil: "networkidle", timeout: 30_000 }).catch(() => {});
      await card.evaluate(() => document.fonts.ready);
      const og: Buffer = await card.screenshot({ type: "jpeg", quality: 82 });
      writeFileSync(join(shotsDir, "card.jpg"), og);
      out.og = og.toString("base64");
    }
  } catch (e) {
    console.error(`Some preview pictures weren't made (the link still works): ${String(e).slice(0, 160)}`);
  } finally {
    await browser?.close().catch(() => {});
  }
  return out;
}

async function outreach(slug: string, dir: string, replace?: string, recapture = false): Promise<void> {
  const concept = JSON.parse(readFileSync(join(dir, "concept.json"), "utf8"));
  let html: string | undefined;
  try { html = readFileSync(join(dir, "index.html"), "utf8"); } catch { /* optional: a hand-built page */ }
  // A hand-built page only needs its name and headline in concept.json; the schema applies to generated ones.
  const errors = html ? ["business_name", "headline"].filter((k) => !concept[k]).map((k) => `missing ${k}`) : validate(concept, SCHEMA as unknown as Schema);
  if (errors.length) {
    console.error("concept.json doesn't match the schema:\n- " + errors.join("\n- "));
    process.exit(1);
  }
  let meta: { url?: string; email?: string; images?: string[]; rest?: string } = {};
  try { meta = JSON.parse(readFileSync(join(dir, "meta.json"), "utf8")); } catch { /* optional */ }
  const { rest, ...send } = meta;
  if (html) {
    // The BringsUp card goes where the page has <!--BU-GATE--> (tools/site-kit/gate.html). Older pages carry their own.
    try { html = injectGate(html, slug, rest).html; } catch (e) {
      console.error((e as Error).message);
      process.exit(1);
    }
    if (/href\s*=\s*["']#bu-start["']/.test(html) && !/\bid\s*=\s*["']bu-start["']/.test(html)) {
      console.error('Links point to #bu-start but the card has no id="bu-start"; those links won\'t scroll to it.');
    }
    // /try/ shows the page from a string, so it can't load files next to it: every link and image must be absolute or inline.
    const attrs = [...html.matchAll(/\b(?:src|href|poster|action)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>"']+))/gi)].map((m) => m[1] ?? m[2] ?? m[3]);
    const srcsets = [...html.matchAll(/\b(?:srcset|imagesrcset)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)]
      .flatMap((m) => (m[1] ?? m[2]).split(",").map((c) => c.trim().split(/\s+/)[0]));
    const cssUrls = [...html.matchAll(/url\(\s*["']?([^"')]+?)["']?\s*\)/gi), ...html.matchAll(/@import\s+["']([^"']+)["']/gi)].map((m) => m[1]);
    const relative = [...attrs, ...srcsets, ...cssUrls]
      .filter((u) => u && !/^(https?:|mailto:|tel:|sms:|data:|#|javascript:void)/i.test(u.trim()));
    if (relative.length) {
      console.error("index.html must be self-contained. Make these absolute (https://...) or inline them (data: URIs):\n- " + [...new Set(relative)].join("\n- "));
      process.exit(1);
    }
    // The page exactly as published (card included), for the pictures and for checking it.
    writeFileSync(join(dir, "published.html"), html);
  }
  // Republishing in place reuses the "today" pictures in <dir>/shots/ unless --recapture asks for a new visit.
  const pics = html ? await previewImages(join(dir, "published.html"), String(concept.business_name), join(dir, "shots"), meta.url, !!replace && !recapture, !!replace) : {};
  if (html && !pics.shots) console.error("No Today/New pictures (is meta.json's url their current site?). The preview publishes without the reveal.");
  const res = await call("POST", "", { action: "create", ref: slug, concept, ...(html ? { html } : {}), ...(pics.og ? { og_image: pics.og } : {}), ...(pics.shots ? { shots: pics.shots } : {}), ...send,
    ...(replace ? { replace_short: replace } : {}) });
  if (!res.link) { console.error(JSON.stringify(res)); process.exit(1); }
  for (const w of res.warnings || []) console.error(`Warning: ${w}`);
  console.log(res.link);
}

// --recapture (outreach, republishing in place): visit their site again for new "today" pictures.
const args = process.argv.slice(2).filter((a) => a !== "--recapture");
const recapture = args.length < process.argv.length - 2;
const [cmd, id, reason] = args;
requireWorkerToken();
if (cmd === "pull") await pull();
else if (cmd === "complete" && id) await complete(id);
else if (cmd === "fail" && id) console.log(await call("POST", "", { action: "fail", id, error: reason || "failed" }));
else if (cmd === "emailed" && id) console.log(await call("POST", "", { action: "emailed", id }));
else if (cmd === "outreach" && id && reason) await outreach(id, reason, args[3], recapture);
else if (cmd === "views") console.log(JSON.stringify(await call("GET", "?views=1"), null, 2));
else if (cmd === "delete" && id) console.log(JSON.stringify(await call("POST", "", /^[0-9a-f-]{36}$/i.test(id) ? { action: "delete", id } : { action: "delete", short: id })));
else {
  console.error("Usage: node tools/queue-worker.ts pull | complete <id> | fail <id> \"<why>\" | emailed <id> | outreach <slug> <dir> [short-to-replace] [--recapture] | views | delete <short|id>");
  process.exit(1);
}

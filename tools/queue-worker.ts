// Work the redesign queue from a Claude Code session (runs on the subscription, no API key).
//
//   node tools/queue-worker.ts pull                 save queued requests to work/<id>/ (prompt.md, system.md, schema.json)
//   node tools/queue-worker.ts complete <id>        validate work/<id>/concept.json and publish it
//   node tools/queue-worker.ts fail <id> "<why>"    mark a request as failed
//   node tools/queue-worker.ts emailed <id>         record that the visitor was emailed
//   node tools/queue-worker.ts outreach <slug> <dir> publish <dir>/concept.json as a cold-email prospect's private
//                                                   preview (bringsup.com/for/<slug>-<code>); <dir>/meta.json may
//                                                   hold {url, email, images: [https urls]}; a hand-built <dir>/index.html
//                                                   (self-contained) is published as is. Add the current short code
//                                                   (e.g. scoops-and-cookies-ff8hnwge) to update that preview in place,
//                                                   keeping its link
//   node tools/queue-worker.ts views                opens and start clicks for every /for/ preview
//   node tools/queue-worker.ts delete <short|id>    delete a preview and its pictures
//
// pull claims what it saves for 90 minutes and also lists finished requests nobody emailed yet.
// Needs BRINGSUP_WORKER_TOKEN (the function's WORKER_TOKEN secret). Node 22.6+ runs this file directly.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { SCHEMA } from "../supabase/functions/redesign/prompt.ts";
import { functionApi, requireWorkerToken } from "./function-api.ts";

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
const TALL_MAX = { desktop: 4200, phone: 5200 };

/** Pictures for the preview, all base64 JPEG, made in one browser run:
 *  - og: the link preview card (iMessage, Gmail, WhatsApp), 1200x630: their homepage in a browser frame beside
 *    "This could be your new website. Made for <name>" (tools/worker/og-card.html);
 *  - shots: their site today (from `currentUrl`) and the new one, at desktop and phone size, for the /try/ reveal, plus
 *    shots.tall: the same pages top to bottom (cut off at TALL_MAX) for the scrollable "Today and new" slider.
 *  Anything that fails is left out; the preview still publishes. */
async function previewImages(file: string, name: string, currentUrl?: string): Promise<{ og?: string; shots?: Shots }> {
  let browser: any;
  const out: { og?: string; shots?: Shots } = {};
  try {
    const { chromium } = await import("/opt/node-tools/node_modules/playwright/index.mjs" as string);
    browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }).catch(() => chromium.launch());
    const open = async (url: string, phone: boolean, tall: boolean) => {
      // Tall pictures use a lower pixel density so a whole page stays a reasonable download.
      const page = await browser.newPage(phone
        ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: tall ? 1.5 : 2, isMobile: true, hasTouch: true }
        : { viewport: { width: 1280, height: 800 }, deviceScaleFactor: tall ? 1.5 : 1.3 });
      // A page that didn't load (bad address, site down, error status) must never be shown as "Your site today".
      const res = await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 }).catch(() => null);
      if (!url.startsWith("file:") && (!res || !res.ok())) { await page.close().catch(() => {}); return null; }
      await page.waitForTimeout(1200);
      return page;
    };
    const shoot = async (url: string, phone: boolean): Promise<Buffer | undefined> => {
      const page = await open(url, phone, false).catch(() => null);
      if (!page) return undefined;
      try { return await page.screenshot({ type: "jpeg", quality: 76 }); } catch { return undefined; } finally { await page.close().catch(() => {}); }
    };
    const shootTall = async (url: string, phone: boolean): Promise<Tall | undefined> => {
      const page = await open(url, phone, true).catch(() => null);
      if (!page) return undefined;
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
        const vw = phone ? 390 : 1280, dsf = 1.5;
        const buf: Buffer = await page.screenshot({ type: "jpeg", quality: 70, fullPage: true, clip: { x: 0, y: 0, width: vw, height: h } });
        return { data: buf.toString("base64"), width: Math.round(vw * dsf), height: Math.round(h * dsf) };
      } catch { return undefined; } finally { await page.close().catch(() => {}); }
    };
    const page = "file://" + resolve(file);
    const afterDesktop = await shoot(page, false);
    const shots: Shots = { before: {}, after: { desktop: afterDesktop?.toString("base64"), phone: (await shoot(page, true))?.toString("base64") } };
    if (currentUrl) {
      shots.before.desktop = (await shoot(currentUrl, false))?.toString("base64");
      shots.before.phone = (await shoot(currentUrl, true))?.toString("base64");
      shots.tall = {
        before: { desktop: await shootTall(currentUrl, false), phone: await shootTall(currentUrl, true) },
        after: { desktop: await shootTall(page, false), phone: await shootTall(page, true) },
      };
    }
    if (shots.before.desktop && shots.after.desktop) out.shots = shots;
    if (afterDesktop) {
      const card = await browser.newPage({ viewport: { width: 1200, height: 630 } });
      const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
      const html = readFileSync(join(import.meta.dirname, "worker", "og-card.html"), "utf8")
        .replaceAll("{{NAME}}", esc(name)).replaceAll("{{SHOT}}", "data:image/jpeg;base64," + afterDesktop.toString("base64"));
      await card.setContent(html, { waitUntil: "networkidle", timeout: 30_000 }).catch(() => {});
      await card.evaluate(() => document.fonts.ready);
      out.og = (await card.screenshot({ type: "jpeg", quality: 82 })).toString("base64");
    }
  } catch (e) {
    console.error(`Some preview pictures weren't made (the link still works): ${String(e).slice(0, 160)}`);
  } finally {
    await browser?.close().catch(() => {});
  }
  return out;
}

async function outreach(slug: string, dir: string, replace?: string): Promise<void> {
  const concept = JSON.parse(readFileSync(join(dir, "concept.json"), "utf8"));
  let html: string | undefined;
  try { html = readFileSync(join(dir, "index.html"), "utf8"); } catch { /* optional: a hand-built page */ }
  // A hand-built page only needs its name and headline in concept.json; the schema applies to generated ones.
  const errors = html ? ["business_name", "headline"].filter((k) => !concept[k]).map((k) => `missing ${k}`) : validate(concept, SCHEMA as unknown as Schema);
  if (errors.length) {
    console.error("concept.json doesn't match the schema:\n- " + errors.join("\n- "));
    process.exit(1);
  }
  let meta: { url?: string; email?: string; images?: string[] } = {};
  try { meta = JSON.parse(readFileSync(join(dir, "meta.json"), "utf8")); } catch { /* optional */ }
  if (html) {
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
  }
  const pics = html ? await previewImages(join(dir, "index.html"), String(concept.business_name), meta.url) : {};
  if (html && !pics.shots) console.error("No Today/New pictures (is meta.json's url their current site?). The preview publishes without the reveal.");
  const res = await call("POST", "", { action: "create", ref: slug, concept, ...(html ? { html } : {}), ...(pics.og ? { og_image: pics.og } : {}), ...(pics.shots ? { shots: pics.shots } : {}), ...meta,
    ...(replace ? { replace_short: replace } : {}) });
  if (!res.link) { console.error(JSON.stringify(res)); process.exit(1); }
  console.log(res.link);
}

const [cmd, id, reason] = process.argv.slice(2);
requireWorkerToken();
if (cmd === "pull") await pull();
else if (cmd === "complete" && id) await complete(id);
else if (cmd === "fail" && id) console.log(await call("POST", "", { action: "fail", id, error: reason || "failed" }));
else if (cmd === "emailed" && id) console.log(await call("POST", "", { action: "emailed", id }));
else if (cmd === "outreach" && id && reason) await outreach(id, reason, process.argv[5]);
else if (cmd === "views") console.log(JSON.stringify(await call("GET", "?views=1"), null, 2));
else if (cmd === "delete" && id) console.log(JSON.stringify(await call("POST", "", /^[0-9a-f-]{36}$/i.test(id) ? { action: "delete", id } : { action: "delete", short: id })));
else {
  console.error("Usage: node tools/queue-worker.ts pull | complete <id> | fail <id> \"<why>\" | emailed <id> | outreach <slug> <dir> [short-to-replace] | views | delete <short|id>");
  process.exit(1);
}

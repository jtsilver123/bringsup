// Work the redesign queue from a Claude Code session (runs on the subscription, no API key).
//
//   node tools/queue-worker.ts pull                 save queued requests to work/<id>/ (prompt.md, system.md, schema.json)
//   node tools/queue-worker.ts complete <id>        validate work/<id>/concept.json and publish it
//   node tools/queue-worker.ts fail <id> "<why>"    mark a request as failed
//   node tools/queue-worker.ts emailed <id>         record that the visitor was emailed
//   node tools/queue-worker.ts outreach <slug> <dir> publish <dir>/concept.json as a cold-email prospect's private
//                                                   preview (bringsup.com/try/?id=...&ref=<slug>); <dir>/meta.json may
//                                                   hold {url, email, images: [https urls]}
//
// Needs BRINGSUP_WORKER_TOKEN (the function's WORKER_TOKEN secret). Node 22.6+ runs this file directly.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { SCHEMA } from "../supabase/functions/redesign/prompt.ts";

const API = process.env.BRINGSUP_API || "https://rgeeynodxvusivfbaxfu.supabase.co/functions/v1/redesign";
const TOKEN = process.env.BRINGSUP_WORKER_TOKEN || "";
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

async function call(method: "GET" | "POST", query: string, body?: unknown): Promise<any> {
  const res = await fetch(API + query, {
    method,
    headers: { "x-worker-token": TOKEN, "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${res.status}: ${data.error || "request failed"}`);
  return data;
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
  const { system, schema, items } = await call("GET", "?queue=1") as { system: string; schema: Schema; items: QueueItem[] };
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

async function outreach(slug: string, dir: string): Promise<void> {
  const concept = JSON.parse(readFileSync(join(dir, "concept.json"), "utf8"));
  const errors = validate(concept, SCHEMA as unknown as Schema);
  if (errors.length) {
    console.error("concept.json doesn't match the schema:\n- " + errors.join("\n- "));
    process.exit(1);
  }
  let meta: { url?: string; email?: string; images?: string[] } = {};
  try { meta = JSON.parse(readFileSync(join(dir, "meta.json"), "utf8")); } catch { /* optional */ }
  const res = await call("POST", "", { action: "create", ref: slug, concept, ...meta });
  if (!res.link) { console.error(JSON.stringify(res)); process.exit(1); }
  console.log(res.link);
}

const [cmd, id, reason] = process.argv.slice(2);
if (!TOKEN) {
  console.error("Set BRINGSUP_WORKER_TOKEN first.");
  process.exit(1);
}
if (cmd === "pull") await pull();
else if (cmd === "complete" && id) await complete(id);
else if (cmd === "fail" && id) console.log(await call("POST", "", { action: "fail", id, error: reason || "failed" }));
else if (cmd === "emailed" && id) console.log(await call("POST", "", { action: "emailed", id }));
else if (cmd === "outreach" && id && reason) await outreach(id, reason);
else {
  console.error("Usage: node tools/queue-worker.ts pull | complete <id> | fail <id> \"<why>\" | emailed <id> | outreach <slug> <dir>");
  process.exit(1);
}

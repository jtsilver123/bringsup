// POST /redesign  {url, email, company_site}  -> reads the business's website, saves it to the queue (202).
// GET  /redesign?id=<uuid>                     -> a redesign: 200 when done, 202 while queued.
//
// Redesigns run on the Claude subscription, never an API key: an hourly scheduled Claude Code task
// pulls the queue (GET ?queue=1), designs each homepage with the prompt and schema in prompt.ts,
// posts it back ({action: "complete"}) and emails the visitor their link. See tools/QUEUE_WORKER.md.
// Worker calls need the x-worker-token header. {action: "create", url, email, concept, images?, ref?, html?, og_image?} saves a
// finished homepage for a cold-email prospect who said "send it over" and returns its private short link,
// bringsup.com/for/<slug>-<8 random chars> (tools/email_template.md). og_image is a base64 JPEG for the link preview card;
// shots = {before: {desktop, phone}, after: {desktop, phone}} (base64 JPEGs of their site today and the new one) power the
// /try/ reveal and the "Today / New" compare.
// GET ?for=<short> loads it like ?id=; add &meta=1 for just the name, headline and preview image (the /for/ Cloudflare worker).
//
// Secrets (Supabase dashboard -> Edge Functions -> Secrets): IP_SALT, WORKER_TOKEN.
// Optional: ALLOWED_ORIGINS (comma-separated), DAILY_CAP (default 150), PER_VISITOR_DAILY (default 3).
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided by Supabase automatically.
import { createClient } from "npm:@supabase/supabase-js@2.117.3";
import { readSite, SiteError } from "./extract.ts";
import { SCHEMA, SYSTEM, userMessage } from "./prompt.ts";

const ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") || "https://bringsup.com,https://www.bringsup.com").split(",").map((s) => s.trim());
const DAILY_CAP = Number(Deno.env.get("DAILY_CAP") || 150);
const PER_VISITOR_DAILY = Number(Deno.env.get("PER_VISITOR_DAILY") || 3);
const WORKER_TOKEN = Deno.env.get("WORKER_TOKEN") || "";
const link = (id: string) => `https://bringsup.com/try/?id=${id}`;
const shortLink = (short: string) => `https://bringsup.com/for/${short}`;
const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "preview";
/** Eight random lowercase letters and digits (no look-alikes like 0/o, 1/l/i): about 40 bits, so a preview can't be guessed
 *  from the business's name. 256 isn't a multiple of 31, so out-of-range bytes are redrawn to keep every character equally likely. */
function code(): string {
  const abc = "abcdefghjkmnpqrstuvwxyz23456789";
  let out = "";
  while (out.length < 8) {
    for (const b of crypto.getRandomValues(new Uint8Array(16))) if (b < 248 && out.length < 8) out += abc[b % abc.length];
  }
  return out;
}

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

function cors(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  const allowed = ORIGINS.includes(origin) || /^http:\/\/localhost(:\d+)?$/.test(origin);
  return {
    "access-control-allow-origin": allowed ? origin : ORIGINS[0],
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "content-type, authorization, apikey, x-client-info",
    vary: "origin",
  };
}

function json(req: Request, status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...cors(req), "content-type": "application/json" } });
}

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function countSince(column: string | null, value: string | null): Promise<number> {
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  let q = db.from("redesigns").select("id", { count: "exact", head: true }).gte("created_at", since);
  if (column && value) q = q.eq(column, value);
  const { count, error } = await q;
  if (error) throw error;
  return count ?? 0;
}

function isWorker(req: Request): boolean {
  return WORKER_TOKEN.length >= 24 && req.headers.get("x-worker-token") === WORKER_TOKEN;
}

type SavedSite = Awaited<ReturnType<typeof readSite>>;

/** Just enough of the site to draw a blurred "in progress" draft while a request waits in the queue. */
function preview(site: SavedSite | null) {
  if (!site) return null;
  const name = (site.title || site.host).split(/\s[|\-–—:]\s/)[0].trim().slice(0, 60);
  return { name, phone: site.phones[0] || "", colors: site.colors.slice(0, 3), images: site.images.filter((i) => !i.logo).slice(0, 4).map((i) => i.url) };
}

/** Queued requests with everything a designer needs: the system prompt, the answer schema and a summary of each site. */
async function queue(req: Request): Promise<Response> {
  const { data, error } = await db.from("redesigns").select("id, email, url, site, created_at")
    .eq("status", "queued").order("created_at").limit(10);
  if (error) return json(req, 500, { error: error.message });
  return json(req, 200, {
    system: SYSTEM,
    schema: SCHEMA,
    items: (data || []).map((r) => ({
      id: r.id, email: r.email, url: r.url, created_at: r.created_at, link: link(r.id),
      prompt: userMessage(r.site as SavedSite),
    })),
  });
}

// deno-lint-ignore no-explicit-any
async function work(req: Request, body: any): Promise<Response> {
  if (body.action === "create") {
    // An outreach concept: already designed by the operator, so it's saved done. The ref ties /start/ back to the tracker row.
    const concept = body.concept;
    if (!concept || typeof concept !== "object" || !concept.business_name || !concept.headline) return json(req, 400, { error: "Missing concept (business_name, headline, ...)." });
    // A hand-built page (OPERATOR "Building their homepage") rides along as finished HTML; /try/ shows it as is.
    if (typeof body.html === "string") {
      if (body.html.length > 400_000) return json(req, 400, { error: "html is too large (400 KB max)." });
      concept.html = body.html;
    }
    if (body.ref) concept.ref = String(body.ref);
    // The link preview card (iMessage, Gmail, WhatsApp): a picture of their homepage, kept in public storage.
    const base = slugify(String(body.ref || concept.business_name));
    let short = `${base}-${code()}`;
    for (let i = 0; i < 3; i++) {
      const { data: taken } = await db.from("redesigns").select("id").eq("short", short).maybeSingle();
      if (!taken) break;
      short = `${base}-${code()}`;
    }
    const store = async (b64: unknown, name: string): Promise<string | undefined> => {
      if (typeof b64 !== "string" || b64.length > 1_400_000) return undefined;
      const bytes = Uint8Array.from(atob(b64.replace(/^data:image\/\w+;base64,/, "")), (c) => c.charCodeAt(0));
      const path = `previews/${short}${name}.jpg`;
      const up = await db.storage.from("project-files").upload(path, bytes, { contentType: "image/jpeg", upsert: true });
      return up.error ? undefined : db.storage.from("project-files").getPublicUrl(path).data.publicUrl;
    };
    const og = await store(body.og_image, "");
    if (og) concept.og_image = og;
    const shots = body.shots || {};
    const compare = {
      before: { desktop: await store(shots.before?.desktop, "-before-desktop"), phone: await store(shots.before?.phone, "-before-phone") },
      after: { desktop: await store(shots.after?.desktop, "-after-desktop"), phone: await store(shots.after?.phone, "-after-phone") },
    };
    if (compare.before.desktop && compare.after.desktop) concept.compare = compare;
    concept.short = short;
    const images = Array.isArray(body.images) ? body.images.filter((u: unknown) => typeof u === "string" && /^https:\/\//.test(u)).slice(0, 12) : [];
    const { data: made, error } = await db.from("redesigns").insert({ url: String(body.url || ""), email: String(body.email || "").toLowerCase(), ip_hash: "outreach",
      status: "done", business_name: concept.business_name, content: concept, images, short }).select("id").single();
    if (error || !made) return json(req, 500, { error: String(error?.message || "insert failed") });
    return json(req, 200, { ok: true, id: made.id, link: shortLink(short), long_link: link(made.id) + (body.ref ? `&ref=${encodeURIComponent(String(body.ref))}` : "") });
  }
  const id = String(body.id || "");
  const { data: row } = await db.from("redesigns").select("id, site, status").eq("id", id).maybeSingle();
  if (!row) return json(req, 404, { error: "No such redesign." });
  if (body.action === "fail") {
    await db.from("redesigns").update({ status: "error", error: String(body.error || "worker failed").slice(0, 500) }).eq("id", id);
    return json(req, 200, { ok: true });
  }
  if (body.action === "emailed") {
    await db.from("redesigns").update({ emailed_at: new Date().toISOString() }).eq("id", id);
    return json(req, 200, { ok: true });
  }
  if (body.action !== "complete") return json(req, 400, { error: "Unknown action." });
  const concept = body.concept;
  if (!concept || typeof concept !== "object") return json(req, 400, { error: "Missing concept." });
  if (concept.not_a_business) {
    await db.from("redesigns").update({ status: "skipped", content: concept }).eq("id", id);
    return json(req, 200, { ok: true, status: "skipped" });
  }
  for (const k of ["business_name", "headline", "theme", "services", "improvements"]) {
    if (!(k in concept)) return json(req, 400, { error: `Concept is missing ${k}; follow the schema from the queue.` });
  }
  const images = ((row.site as SavedSite | null)?.images || []).map((i) => i.url);
  await db.from("redesigns").update({ status: "done", business_name: concept.business_name, content: concept, images }).eq("id", id);
  return json(req, 200, { ok: true, status: "done", link: link(id) });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(req) });

  if (req.method === "GET") {
    const params = new URL(req.url).searchParams;
    if (params.has("queue")) return isWorker(req) ? queue(req) : json(req, 401, { error: "Not allowed." });
    const id = params.get("id") || "";
    const short = (params.get("for") || "").toLowerCase();
    if (!/^[0-9a-f-]{36}$/i.test(id) && !/^[a-z0-9-]{3,60}$/.test(short)) return json(req, 400, { error: "Missing id." });
    const sel = db.from("redesigns").select("id, url, status, content, images, site");
    const { data, error } = await (short ? sel.eq("short", short) : sel.eq("id", id)).maybeSingle();
    if (error) return json(req, 500, { error: "Something went wrong." });
    if (short && params.has("meta")) {
      if (data?.status !== "done") return json(req, 404, { error: "Not found." });
      const c = data.content || {};
      return json(req, 200, { business_name: c.business_name, headline: c.headline, og_image: c.og_image || null, id: data.id, ref: c.ref || null });
    }
    if (data?.status === "done") return json(req, 200, { id: data.id, status: "done", url: data.url, concept: data.content, images: data.images });
    if (data?.status === "queued") return json(req, 202, { id: data.id, status: "queued", url: data.url, preview: preview(data.site as SavedSite) });
    if (data?.status === "skipped") {
      return json(req, 422, { error: data.content?.not_a_business_reason || "That doesn't look like a local business website.", code: "not_a_business" });
    }
    return json(req, 404, { error: "We couldn't find that redesign." });
  }

  if (req.method !== "POST") return json(req, 405, { error: "Method not allowed." });

  // deno-lint-ignore no-explicit-any
  let body: any;
  try {
    body = await req.json();
  } catch {
    return json(req, 400, { error: "Bad request." });
  }
  if (body.action) return isWorker(req) ? work(req, body) : json(req, 401, { error: "Not allowed." });
  // Honeypot: real visitors never see or fill this field.
  if (body.company_site) return json(req, 400, { error: "Bad request." });
  const email = (body.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json(req, 400, { error: "Add an email address so we can send you your redesign." });

  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim();
  const ipHash = await sha256((Deno.env.get("IP_SALT") || "bringsup") + ip);
  try {
    if (await countSince(null, null) >= DAILY_CAP) {
      return json(req, 429, { error: "We've hit today's limit for redesigns. Leave your details and we'll make yours by hand.", code: "daily_cap" });
    }
    if (await countSince("ip_hash", ipHash) >= PER_VISITOR_DAILY || await countSince("email", email) >= PER_VISITOR_DAILY) {
      return json(req, 429, { error: "You've made a few redesigns today. Come back tomorrow, or ask us for more.", code: "visitor_cap" });
    }
  } catch {
    return json(req, 500, { error: "Something went wrong. Please try again." });
  }

  const { data: row, error: insertError } = await db.from("redesigns")
    .insert({ url: body.url || "", email, ip_hash: ipHash, status: "pending" })
    .select("id").single();
  if (insertError || !row) return json(req, 500, { error: "Something went wrong. Please try again." });

  try {
    const site = await readSite(body.url || "");
    await db.from("redesigns").update({ status: "queued", url: site.url, site }).eq("id", row.id);
    return json(req, 202, { id: row.id, status: "queued", url: site.url, preview: preview(site) });
  } catch (err) {
    const known = err instanceof SiteError;
    const message = known ? err.message : "We couldn't read that website automatically.";
    await db.from("redesigns").update({ status: "error", error: known ? err.code : String(err).slice(0, 500) }).eq("id", row.id);
    return json(req, known ? 422 : 502, { error: message, code: known ? err.code : "read_failed" });
  }
});

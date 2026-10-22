// POST /redesign  {url, email, company_site}  -> reads the business's website, asks Claude
//                                                for a better homepage, stores it, returns it.
// GET  /redesign?id=<uuid>                     -> a stored redesign, for share links.
//
// Secrets (Supabase dashboard -> Edge Functions -> Secrets): ANTHROPIC_API_KEY, IP_SALT.
// Optional: ALLOWED_ORIGINS (comma-separated), DAILY_CAP (default 150), PER_VISITOR_DAILY (default 3).
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided by Supabase automatically.
import Anthropic from "npm:@anthropic-ai/sdk@0.133.0";
import { createClient } from "npm:@supabase/supabase-js@2.117.3";
import { readSite, SiteError } from "./extract.ts";
import { SCHEMA, SYSTEM, userMessage } from "./prompt.ts";

const MODEL = "claude-opus-5-5";
const ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") || "https://bringsup.com,https://www.bringsup.com").split(",").map((s) => s.trim());
const DAILY_CAP = Number(Deno.env.get("DAILY_CAP") || 150);
const PER_VISITOR_DAILY = Number(Deno.env.get("PER_VISITOR_DAILY") || 3);

const anthropic = new Anthropic();
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

async function generate(site: Awaited<ReturnType<typeof readSite>>) {
  const response = await anthropic.beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "medium", format: { type: "json_schema", schema: SCHEMA as unknown as Record<string, unknown> } },
    system: SYSTEM,
    messages: [{ role: "user", content: userMessage(site) }],
  });
  if (response.stop_reason === "refusal") throw new Error("The model declined this site.");
  if (response.stop_reason === "max_tokens") throw new Error("The redesign ran too long.");
  const text = response.content.find((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")?.text;
  if (!text) throw new Error("The model returned no content.");
  return { concept: JSON.parse(text), usage: response.usage };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(req) });

  if (req.method === "GET") {
    const id = new URL(req.url).searchParams.get("id") || "";
    if (!/^[0-9a-f-]{36}$/i.test(id)) return json(req, 400, { error: "Missing id." });
    const { data, error } = await db.from("redesigns").select("id, url, content, images").eq("id", id).eq("status", "done").maybeSingle();
    if (error) return json(req, 500, { error: "Something went wrong." });
    if (!data) return json(req, 404, { error: "We couldn't find that redesign." });
    return json(req, 200, { id: data.id, url: data.url, concept: data.content, images: data.images });
  }

  if (req.method !== "POST") return json(req, 405, { error: "Method not allowed." });

  let body: { url?: string; email?: string; company_site?: string };
  try {
    body = await req.json();
  } catch {
    return json(req, 400, { error: "Bad request." });
  }
  // Honeypot: real visitors never see or fill this field.
  if (body.company_site) return json(req, 400, { error: "Bad request." });
  const email = (body.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json(req, 400, { error: "Add an email address so we can send you your redesign." });

  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim();
  const ipHash = await sha256((Deno.env.get("IP_SALT") || "bringsup") + ip);
  try {
    if (await countSince(null, null) >= DAILY_CAP) {
      return json(req, 429, { error: "We've hit today's limit for instant redesigns. Leave your details and we'll make yours by hand.", code: "daily_cap" });
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
    const { concept, usage } = await generate(site);
    if (concept.not_a_business) {
      await db.from("redesigns").update({ status: "skipped", url: site.url, content: concept }).eq("id", row.id);
      return json(req, 422, { error: concept.not_a_business_reason || "That doesn't look like a local business website.", code: "not_a_business" });
    }
    const images = site.images.map((i) => i.url);
    await db.from("redesigns").update({
      status: "done", url: site.url, business_name: concept.business_name, content: concept, images,
      input_tokens: usage.input_tokens, output_tokens: usage.output_tokens,
    }).eq("id", row.id);
    return json(req, 200, { id: row.id, url: site.url, concept, images });
  } catch (err) {
    const known = err instanceof SiteError;
    const message = known ? err.message : "We couldn't redesign that site automatically.";
    await db.from("redesigns").update({ status: "error", error: known ? err.code : String(err).slice(0, 500) }).eq("id", row.id);
    return json(req, known ? 422 : 502, { error: message, code: known ? err.code : "generation_failed" });
  }
});

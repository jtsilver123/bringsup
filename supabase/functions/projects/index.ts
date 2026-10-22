// Customer projects, from start form to live site, with no one in the loop.
//
// POST /projects                    Tally webhook (signed). Start, changes, extra-round and approve submissions update
//                                   the project, count rounds and set the builder's next job (`todo`).
// GET  /projects?status=<ref>       Public: rounds used and left, for the /changes/ page.
// GET  /projects?jobs=1             Builder: claim up to 5 projects with work to do (leased 45 min).  (x-worker-token)
// GET  /projects?ref=<ref>          Builder: one project and its history.                            (x-worker-token)
// GET  /projects?health=1           Health check: alerts, stuck projects, failing jobs.               (x-worker-token)
// POST /projects {action, ref, ...} Builder: "update" (set fields, log an event) or "fail".          (x-worker-token)
//
// Rounds: ROUNDS_INCLUDED (2) rounds of changes after the first preview. A request past that is held and the
// builder offers a $150 extra round; paying for it applies the held request. Requests before the first preview
// are added to the brief; requests after approval become Care Plan edits or a polite out-of-scope reply.
//
// Secrets: TALLY_SIGNING_SECRET, WORKER_TOKEN; optional TALLY_EXTRA_FORM, APPROVE_PRICE_CENTS (100000).
// See tools/SITE_BUILDER.md.
import { createClient } from "npm:@supabase/supabase-js@2.117.3";
import { parse, pick, verifySignature, type Submission, type TallyEvent, type TallyFile } from "./tally.ts";

declare const EdgeRuntime: { waitUntil(p: Promise<unknown>): void } | undefined;

const FORMS = {
  start: Deno.env.get("TALLY_START_FORM") || "Ar7yBl",
  changes: Deno.env.get("TALLY_CHANGES_FORM") || "EqkMlA",
  extra: Deno.env.get("TALLY_EXTRA_FORM") || "",
  approve: Deno.env.get("TALLY_APPROVE_FORM") || "VpLDP6",
};
const WORKER_TOKEN = Deno.env.get("WORKER_TOKEN") || "";
const TALLY_SECRET = Deno.env.get("TALLY_SIGNING_SECRET") || "";
const APPROVE_PRICE_CENTS = Number(Deno.env.get("APPROVE_PRICE_CENTS") || 100000);
const ROUNDS_INCLUDED = 2;
const BUCKET = "project-files";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

export interface Project {
  id: string; ref: string; status: string; todo: string | null; email: string; business_name: string; current_site: string;
  rounds_included: number; rounds_extra: number; rounds_used: number; changes_seq: number;
  pending_changes: string | null; held_changes: string | null; care_plan: boolean; paid_cents: number; attempts: number;
  brief: Record<string, string>; files: TallyFile[];
}

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "access-control-allow-origin": "*" } });
const isWorker = (req: Request) => WORKER_TOKEN.length >= 24 && req.headers.get("x-worker-token") === WORKER_TOKEN;
const now = () => new Date().toISOString();
const join = (...parts: (string | null | undefined)[]) => parts.filter((p) => p && p.trim()).join("\n\n");
const background = (p: Promise<unknown>) => (typeof EdgeRuntime !== "undefined" ? EdgeRuntime.waitUntil(p) : p.catch(console.error));

function slugify(s: string): string {
  return s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "project";
}

function hostOf(url: string): string {
  try {
    return new URL(/^https?:\/\//i.test(url) ? url : "https://" + url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

async function alert(source: string, ref: string | null, message: string, payload: unknown = {}) {
  await db.from("alerts").insert({ source, ref, message: message.slice(0, 500), payload });
}

async function log(p: Project, kind: string, summary: string, payload: unknown = {}, round: number | null = null) {
  await db.from("project_events").insert({ project_id: p.id, kind, summary, payload, round });
}

/** Any change to `todo` resets the builder's bookkeeping for the new job. */
function withJob(set: Record<string, unknown>): Record<string, unknown> {
  return "todo" in set ? { next_check_at: null, attempts: 0, claimed_until: null, last_error: null, ...set } : set;
}

async function save(p: Project, set: Record<string, unknown>): Promise<Project> {
  const { data, error } = await db.from("projects").update({ ...withJob(set), updated_at: now() }).eq("id", p.id).select("*").single();
  if (error) throw error;
  return data as Project;
}

async function byRef(ref: string): Promise<Project | null> {
  if (!ref) return null;
  const { data } = await db.from("projects").select("*").eq("ref", ref).maybeSingle();
  return data as Project | null;
}

/** Changes and approvals: the ref from the link, else the most recent open project for that email. */
async function find(sub: Submission): Promise<Project | null> {
  const hit = await byRef(sub.ref);
  if (hit) return hit;
  const email = pick(sub.answers, "Your email").toLowerCase();
  if (!email) return null;
  const { data } = await db.from("projects").select("*").eq("email", email).neq("status", "cancelled").order("created_at", { ascending: false }).limit(1);
  return (data?.[0] as Project) ?? null;
}

/** Copy uploads out of Tally (its links expire) into Storage, then point the project at the copies. */
async function keepFiles(ref: string, files: TallyFile[]): Promise<void> {
  if (!files.length) return;
  const kept: TallyFile[] = [];
  for (const f of files) {
    try {
      const res = await fetch(f.url, { signal: AbortSignal.timeout(30_000) });
      if (!res.ok) throw new Error(String(res.status));
      const path = `${ref}/${Date.now()}-${slugify(f.name.replace(/\.[^.]+$/, ""))}${(f.name.match(/\.[a-z0-9]+$/i) || [""])[0].toLowerCase()}`;
      const up = await db.storage.from(BUCKET).upload(path, await res.arrayBuffer(), { contentType: f.mimeType || res.headers.get("content-type") || undefined, upsert: true });
      if (up.error) throw up.error;
      kept.push({ ...f, url: db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl });
    } catch (e) {
      kept.push(f);
      await alert("projects", ref, `Couldn't copy upload "${f.name}" from Tally: ${String(e)}`);
    }
  }
  const p = await byRef(ref);
  if (!p) return;
  const urls = new Set(files.map((f) => f.url));
  await save(p, { files: [...(p.files || []).filter((f) => !urls.has(f.url)), ...kept] });
}

async function onStart(sub: Submission): Promise<Project> {
  const a = sub.answers;
  const business = pick(a, "Business name");
  const site = pick(a, "Current website");
  const email = pick(a, "Your email").toLowerCase();
  const fields = {
    business_name: business, owner_name: pick(a, "Your name"), email, phone: pick(a, "Phone"),
    current_site: site, domain: hostOf(site), domain_provider: pick(a, "Who manages your web address"),
    last_customer_touch_at: now(),
  };

  // Same business again: by ref, or by the same email AND the same website or name. A different business gets its own project.
  let p = await byRef(sub.ref);
  if (!p && email) {
    const { data } = await db.from("projects").select("*").eq("email", email).order("created_at", { ascending: false });
    p = ((data || []) as Project[]).find((x) => (hostOf(site) && hostOf(x.current_site) === hostOf(site)) || slugify(x.business_name) === slugify(business)) ?? null;
  }

  if (p) {
    const files = [...(p.files || []), ...sub.files];
    if (p.status === "cancelled") {
      p = await save(p, { ...fields, brief: a, files, status: "started", todo: "build" });
      await log(p, "start", "Start form after cancelling: project reopened");
    } else if (p.status === "started") {
      p = await save(p, { ...fields, brief: { ...p.brief, ...a }, files, todo: "build" });
      await log(p, "start", "Start form sent again before the first preview; brief updated");
    } else if (["preview_sent", "changes_requested", "awaiting_extra"].includes(p.status)) {
      // New details after the preview: apply them without using a round.
      const changed = Object.entries(a).filter(([k, v]) => p!.brief[k] !== v && !/agree|sign|sounds good/i.test(k)).map(([k, v]) => `- ${k}: ${v}`);
      const note = changed.length ? `The owner sent the start form again. Update the site with these details (no round used):\n${changed.join("\n")}` : "";
      p = await save(p, {
        ...fields, brief: { ...p.brief, ...a }, files,
        ...(note ? { pending_changes: join(p.pending_changes, note), changes_seq: p.changes_seq + 1, status: "changes_requested", todo: "revise" } : {}),
      });
      await log(p, "start", changed.length ? `Start form sent again after the preview; ${changed.length} details to update (no round used)` : "Start form sent again, nothing new");
    } else {
      await log(p, "start", `Start form sent again while ${p.status}; nothing changed`, { answers: a });
    }
    return p;
  }

  let ref = sub.ref && !(await byRef(sub.ref)) ? sub.ref : slugify(business);
  if (await byRef(ref)) ref = `${ref}-${crypto.randomUUID().slice(0, 4)}`;
  const { data, error } = await db.from("projects").insert({
    ref, ...fields, brief: a, files: sub.files, status: "started", todo: "build", rounds_included: ROUNDS_INCLUDED,
  }).select("*").single();
  if (error) throw error;
  await log(data as Project, "start", `New project: ${business || ref}`);
  return data as Project;
}

async function onChanges(sub: Submission, paidExtra: boolean): Promise<Project> {
  let p = await find(sub);
  if (!p) throw new Error(`No project for a change request (ref "${sub.ref}", email "${pick(sub.answers, "Your email")}")`);
  let request = pick(sub.answers, "What would you like changed", "Changes");
  if (sub.files.length) request = join(request, "Attachments:\n" + sub.files.map((f) => f.url).join("\n"));
  const touch = { last_customer_touch_at: now() };

  if (paidExtra) {
    p = await save(p, { ...touch, rounds_extra: p.rounds_extra + 1, paid_cents: p.paid_cents + sub.paidCents });
    await log(p, "extra_round", `Paid $${(sub.paidCents / 100).toFixed(2)} for extra round ${p.rounds_extra}`);
    request = join(p.held_changes, request);
    p = await save(p, { held_changes: null });
  }
  if (!request.trim()) {
    await log(p, "note", "A change form arrived with no changes listed");
    return p;
  }

  switch (p.status) {
    case "started": {
      // No preview yet: fold it into the brief for the first build.
      p = await save(p, { ...touch, brief: { ...p.brief, "Extra notes from the owner": join(p.brief["Extra notes from the owner"], request) } });
      await log(p, "changes", "Arrived before the first preview; added to the brief (no round used)", { request });
      return p;
    }
    case "approved":
    case "launching":
    case "live": {
      if (p.care_plan) {
        p = await save(p, { ...touch, pending_changes: join(p.pending_changes, request), changes_seq: p.changes_seq + 1, todo: "care_edit" });
        await log(p, "care_edit", "Care Plan edit requested", { request });
      } else {
        p = await save(p, { ...touch, held_changes: join(p.held_changes, request), todo: "reply_out_of_scope" });
        await log(p, "out_of_scope", "Change requested after approval without the Care Plan", { request });
      }
      return p;
    }
    case "cancelled":
      await alert("projects", p.ref, "Change request for a cancelled project", { request });
      return p;
  }

  // preview_sent, changes_requested, awaiting_extra
  if (p.status === "changes_requested" && p.pending_changes) {
    p = await save(p, { ...touch, pending_changes: join(p.pending_changes, request), changes_seq: p.changes_seq + 1 });
    await log(p, "changes", `Added to round ${p.rounds_used} (not applied yet, so no extra round used)`, { request }, p.rounds_used);
    return p;
  }
  const round = p.rounds_used + 1;
  const allowed = p.rounds_included + p.rounds_extra;
  if (round > allowed) {
    p = await save(p, { ...touch, status: "awaiting_extra", held_changes: join(p.held_changes, request), todo: "offer_extra" });
    await log(p, "changes_over_limit", `Round ${round} requested after ${allowed} used; offering an extra round`, { request }, round);
    return p;
  }
  p = await save(p, { ...touch, status: "changes_requested", rounds_used: round, pending_changes: request, changes_seq: p.changes_seq + 1, todo: "revise" });
  await log(p, "changes", `Round ${round} of ${allowed}`, { request }, round);
  return p;
}

async function onApprove(sub: Submission): Promise<Project> {
  let p = await find(sub);
  if (!p) throw new Error(`No project for an approval (ref "${sub.ref}")`);
  const a = sub.answers;
  if (["approved", "launching", "live"].includes(p.status)) {
    await log(p, "approve", `Approve form sent again while ${p.status}; ignored`, { paidCents: sub.paidCents });
    if (sub.paidCents) await alert("projects", p.ref, `Second payment of $${(sub.paidCents / 100).toFixed(2)} on an approved project. Refund it in Stripe.`);
    return p;
  }
  if (p.status === "started" || p.status === "cancelled") {
    await alert("projects", p.ref, `Approved while ${p.status} (no preview sent yet)`, { paidCents: sub.paidCents });
    return p;
  }
  const paid = sub.paidCents >= APPROVE_PRICE_CENTS;
  p = await save(p, {
    last_customer_touch_at: now(),
    care_plan: /^yes/i.test(pick(a, "Want the Care Plan")),
    domain_helper: pick(a, "Who should connect your domain"),
    domain_helper_email: pick(a, "Your web person's email").toLowerCase(),
    paid_cents: p.paid_cents + sub.paidCents,
    ...(paid ? { status: "approved", todo: "launch" } : {}),
  });
  if (paid) {
    await log(p, "approve", `Approved and paid $${(sub.paidCents / 100).toFixed(2)}`, { answers: a });
    await log(p, "payment", `$${(sub.paidCents / 100).toFixed(2)} through Stripe`);
  } else {
    await log(p, "approve", "Approval arrived without the full payment; not launching", { paidCents: sub.paidCents });
    await alert("projects", p.ref, `Approval with $${(sub.paidCents / 100).toFixed(2)} paid (expected $${(APPROVE_PRICE_CENTS / 100).toFixed(2)})`);
  }
  return p;
}

async function webhook(req: Request): Promise<Response> {
  if (!TALLY_SECRET) {
    await alert("projects", null, "TALLY_SIGNING_SECRET is not set, so Tally submissions are being rejected");
    return json(500, { error: "Not configured" });
  }
  const body = await req.text();
  if (!(await verifySignature(body, req.headers.get("tally-signature"), TALLY_SECRET))) return json(401, { error: "Bad signature" });
  const event = JSON.parse(body) as TallyEvent;
  if (event.eventType !== "FORM_RESPONSE") return json(200, { ignored: event.eventType });
  const sub = parse(event);

  // Exactly once: a retried delivery hits the primary key and stops here.
  const receipt = await db.from("webhook_receipts").insert({ response_id: sub.responseId, form_id: sub.formId, ref: sub.ref || null, payload: event });
  if (receipt.error) {
    if (receipt.error.code === "23505") return json(200, { duplicate: true });
    throw receipt.error;
  }

  try {
    let p: Project;
    if (sub.formId === FORMS.start) p = await onStart(sub);
    else if (sub.formId === FORMS.changes) p = await onChanges(sub, false);
    else if (FORMS.extra && sub.formId === FORMS.extra) p = await onChanges(sub, sub.paidCents > 0);
    else if (sub.formId === FORMS.approve) p = await onApprove(sub);
    else return json(200, { ignored: sub.formId });
    if (sub.files.length) background(keepFiles(p.ref, sub.files));
    return json(200, { ok: true, ref: p.ref });
  } catch (err) {
    // Answer Tally with 200 so it doesn't retry; the receipt keeps the raw submission and the alert gets it looked at.
    console.error(err);
    await alert("projects", sub.ref || null, `Couldn't process a ${sub.formId} submission: ${String(err)}`, { responseId: sub.responseId });
    return json(200, { ok: false });
  }
}

const SETTABLE = new Set([
  "status", "todo", "preview_url", "live_url", "next_check_at", "pending_changes", "held_changes", "domain", "domain_provider",
  "domain_helper", "domain_helper_email", "care_plan", "brief", "site", "pages_project", "last_customer_touch_at",
]);
const TRANSITIONS: Record<string, string[]> = {
  started: ["preview_sent", "cancelled"],
  preview_sent: ["changes_requested", "awaiting_extra", "approved", "cancelled"],
  changes_requested: ["preview_sent", "awaiting_extra", "approved", "cancelled"],
  awaiting_extra: ["changes_requested", "preview_sent", "approved", "cancelled"],
  approved: ["launching", "live", "cancelled"],
  launching: ["live", "cancelled"],
  live: ["cancelled"],
  cancelled: ["started"],
};

async function work(req: Request): Promise<Response> {
  const body = await req.json() as {
    action?: string; ref?: string; set?: Record<string, unknown>; error?: string;
    /** For "update": the changes_seq the builder applied. pending_changes is only cleared if nothing new arrived since. */
    applied_seq?: number;
    event?: { kind: string; summary?: string; payload?: unknown; round?: number };
  };
  const p0 = await byRef(body.ref || "");
  if (!p0) return json(404, { error: "No such project" });
  let p = p0;

  if (body.action === "fail") {
    p = await save(p, { last_error: String(body.error || "failed").slice(0, 1000), claimed_until: null });
    await log(p, "error", `Builder failed (${p.attempts}/5): ${String(body.error).slice(0, 200)}`);
    if (p.attempts >= 5) await alert("builder", p.ref, `Job "${p.todo}" failed 5 times: ${String(body.error).slice(0, 300)}`);
    return json(200, { ok: true });
  }
  if (body.action !== "update") return json(400, { error: 'Use {action: "update" | "fail", ref, ...}' });

  const set = Object.fromEntries(Object.entries(body.set || {}).filter(([k]) => SETTABLE.has(k)));
  if (typeof set.status === "string" && set.status !== p.status && !TRANSITIONS[p.status]?.includes(set.status)) {
    return json(409, { error: `Can't move from ${p.status} to ${set.status}` });
  }
  if ("pending_changes" in set && set.pending_changes === null && body.applied_seq !== undefined && body.applied_seq !== p.changes_seq) {
    // New requests arrived while the builder worked: keep them and keep the job.
    delete set.pending_changes;
    set.todo = p.todo === "care_edit" ? "care_edit" : "revise";
    if (set.status === "preview_sent") set.status = "changes_requested";
  }
  // A successful update ends the lease and clears the failure count (repeating jobs like DNS checks claim again later).
  p = await save(p, { ...set, claimed_until: null, attempts: 0, last_error: null });
  if (body.event?.kind) await log(p, body.event.kind, body.event.summary || "", body.event.payload ?? {}, body.event.round ?? null);
  return json(200, { ok: true, project: p });
}

async function health(): Promise<Response> {
  const day = (n: number) => new Date(Date.now() - n * 86400_000).toISOString();
  const [alerts, failing, waitingOnUs, quiet, receipts] = await Promise.all([
    db.from("alerts").select("*").is("resolved_at", null).order("created_at"),
    db.from("projects").select("ref,todo,attempts,last_error,updated_at").gte("attempts", 5).not("todo", "is", null),
    db.from("projects").select("ref,status,todo,updated_at").not("todo", "is", null).lt("updated_at", day(1)),
    db.from("projects").select("ref,status,last_customer_touch_at,updated_at").in("status", ["preview_sent", "awaiting_extra", "launching"]).lt("updated_at", day(7)),
    db.from("webhook_receipts").select("response_id", { count: "exact", head: true }).gte("received_at", day(1)),
  ]);
  return json(200, {
    alerts: alerts.data, failing_jobs: failing.data, stuck_on_us: waitingOnUs.data, quiet_customers: quiet.data,
    submissions_last_24h: receipts.count,
  });
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-methods": "GET" } });
  if (req.method === "POST" && req.headers.has("tally-signature")) return webhook(req);

  const status = url.searchParams.get("status");
  if (req.method === "GET" && status) {
    const p = await byRef(status);
    if (!p) return json(404, { error: "Not found" });
    return json(200, {
      business_name: p.business_name, status: p.status,
      rounds_included: p.rounds_included, rounds_extra: p.rounds_extra, rounds_used: p.rounds_used,
      rounds_left: Math.max(0, p.rounds_included + p.rounds_extra - p.rounds_used),
    });
  }

  if (!isWorker(req)) return json(401, { error: "Not allowed" });
  if (req.method === "POST") return work(req);
  if (url.searchParams.has("health")) return health();
  if (url.searchParams.has("jobs")) {
    const { data, error } = await db.rpc("claim_project_jobs", { n: 5 });
    if (error) return json(500, { error: error.message });
    return json(200, { jobs: data });
  }
  const ref = url.searchParams.get("ref");
  if (ref) {
    const p = await byRef(ref);
    if (!p) return json(404, { error: "No such project" });
    const { data: events } = await db.from("project_events").select("*").eq("project_id", p.id).order("created_at");
    return json(200, { project: p, events });
  }
  return json(400, { error: "Use ?jobs=1, ?ref=, ?health=1 or ?status=" });
});

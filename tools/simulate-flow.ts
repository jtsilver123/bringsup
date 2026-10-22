// End-to-end check of the customer pipeline with signed, fake Tally submissions. Safe to run against production:
// it uses a throwaway ref (test-...) and deletes it at the end.
//   BRINGSUP_WORKER_TOKEN=... TALLY_SIGNING_SECRET=... node tools/simulate-flow.ts
import { createHmac, randomUUID } from "node:crypto";

const API = process.env.BRINGSUP_PROJECTS_API || "https://rgeeynodxvusivfbaxfu.supabase.co/functions/v1/projects";
const TOKEN = process.env.BRINGSUP_WORKER_TOKEN || "";
const SECRET = process.env.TALLY_SIGNING_SECRET || "";
const FORMS = { start: "Ar7yBl", changes: "EqkMlA", approve: "VpLDP6", extra: process.env.TALLY_EXTRA_FORM || "5XBMpd" };
const ref = `test-${randomUUID().slice(0, 8)}`;
const email = `${ref}@example.com`;

type Field = { key: string; label: string; type: string; value: unknown; options?: { id: string; text: string }[] };
const text = (label: string, value: string): Field => ({ key: label, label, type: "INPUT_TEXT", value });
async function submit(formId: string, fields: Field[], responseId = randomUUID()): Promise<any> {
  const body = JSON.stringify({
    eventId: randomUUID(), eventType: "FORM_RESPONSE", createdAt: new Date().toISOString(),
    data: { responseId, submissionId: responseId, formId, formName: "test", createdAt: new Date().toISOString(),
      fields: [{ key: "ref", label: "ref", type: "HIDDEN_FIELDS", value: ref }, ...fields] },
  });
  const sig = createHmac("sha256", SECRET).update(body).digest("base64");
  const res = await fetch(API, { method: "POST", headers: { "content-type": "application/json", "tally-signature": sig }, body });
  return res.json();
}

async function worker(method: "GET" | "POST", query: string, body?: unknown): Promise<any> {
  const res = await fetch(API + query, { method, headers: { "x-worker-token": TOKEN, "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  return res.json();
}

let failures = 0;
async function expect(step: string, want: Record<string, unknown>) {
  const { project } = await worker("GET", `?ref=${ref}`);
  const wrong = Object.entries(want).filter(([k, v]) => JSON.stringify(project?.[k]) !== JSON.stringify(v));
  console.log(`${wrong.length ? "FAIL" : "ok  "}  ${step}${wrong.length ? "  " + wrong.map(([k, v]) => `${k}=${JSON.stringify(project?.[k])} (want ${JSON.stringify(v)})`).join(", ") : ""}`);
  failures += wrong.length ? 1 : 0;
}

if (!TOKEN || !SECRET) {
  console.error("Set BRINGSUP_WORKER_TOKEN and TALLY_SIGNING_SECRET.");
  process.exit(1);
}

try {
  // Bad signature is refused.
  const bad = await fetch(API, { method: "POST", headers: { "tally-signature": "nope", "content-type": "application/json" }, body: "{}" });
  console.log(`${bad.status === 401 ? "ok  " : "FAIL"}  bad signature -> ${bad.status}`);
  if (bad.status !== 401) failures++;

  const startId = randomUUID();
  await submit(FORMS.start, [text("Business name", "Test Bakery"), text("Your name", "Rosa"), text("Your email", email), text("Current website", "testbakery.example"), text("Opening hours", "Tue-Fri 6-3")], startId);
  await expect("start creates the project", { status: "started", todo: "build", rounds_used: 0, domain: "testbakery.example" });

  const dup = await submit(FORMS.start, [text("Business name", "Test Bakery")], startId);
  console.log(`${dup.duplicate ? "ok  " : "FAIL"}  duplicate delivery is ignored`);
  if (!dup.duplicate) failures++;

  await submit(FORMS.changes, [text("Your email", email), text("What would you like changed?", "Before preview: use the storefront photo")]);
  await expect("change before the preview goes into the brief, no round used", { status: "started", rounds_used: 0 });

  // The builder sends the first preview.
  await worker("POST", "", { action: "update", ref, set: { status: "preview_sent", todo: null, preview_url: "https://preview.example" }, event: { kind: "preview_sent", summary: "test" } });
  await expect("builder sends the preview", { status: "preview_sent", todo: null });

  await submit(FORMS.changes, [text("Your email", email), text("What would you like changed?", "Round 1: bigger logo")]);
  await expect("round 1", { status: "changes_requested", rounds_used: 1, todo: "revise", changes_seq: 1 });

  await submit(FORMS.changes, [text("Your email", email), text("What would you like changed?", "Also: add catering")]);
  await expect("a second request before the builder applies round 1 joins it", { rounds_used: 1, changes_seq: 2 });

  // The builder applied seq 1 only; seq 2 arrived meanwhile, so the job must stay.
  await worker("POST", "", { action: "update", ref, applied_seq: 1, set: { status: "preview_sent", todo: null, pending_changes: null } });
  await expect("stale apply keeps the newer request", { status: "changes_requested", todo: "revise" });
  await worker("POST", "", { action: "update", ref, applied_seq: 2, set: { status: "preview_sent", todo: null, pending_changes: null } });
  await expect("builder applies round 1", { status: "preview_sent", todo: null, pending_changes: null });

  await submit(FORMS.changes, [text("Your email", email), text("What would you like changed?", "Oh, and Sunday hours")]);
  await expect("a follow-up within 2 days of the updated preview stays in round 1", { status: "changes_requested", rounds_used: 1, todo: "revise" });
  await worker("POST", "", { action: "update", ref, applied_seq: 3, set: { status: "preview_sent", todo: null, pending_changes: null, last_preview_at: "2000-01-01T00:00:00Z" } });

  await submit(FORMS.changes, [text("Your email", email), text("What would you like changed?", "Round 2: new hours")]);
  await expect("round 2", { status: "changes_requested", rounds_used: 2 });
  await worker("POST", "", { action: "update", ref, applied_seq: 4, set: { status: "preview_sent", todo: null, pending_changes: null, last_preview_at: "2000-01-01T00:00:00Z" } });

  await submit(FORMS.changes, [text("Your email", email), text("What would you like changed?", "Round 3: different font")]);
  await expect("a third request is held and an extra round offered", { status: "awaiting_extra", rounds_used: 2, todo: "offer_extra", held_changes: "Round 3: different font" });

  // The extra-round form carries no payment (the page sends them to Stripe); the builder then posts the payment it finds.
  await submit(FORMS.extra, [text("Your email", email), text("What would you like changed?", "And a bigger map")]);
  await expect("the extra form without a payment only adds to the held request", { status: "awaiting_extra", todo: "offer_extra", rounds_extra: 0, held_changes: "Round 3: different font\n\nAnd a bigger map" });
  await worker("POST", "", { action: "payment", ref, stripe_id: `cs_test_${ref}_extra`, kind: "extra", cents: 15000 });
  await expect("paying for the extra round applies the held request", { status: "changes_requested", rounds_extra: 1, rounds_used: 3, held_changes: null, paid_cents: 15000 });
  const dupPay = await worker("POST", "", { action: "payment", ref, stripe_id: `cs_test_${ref}_extra`, kind: "extra", cents: 15000 });
  console.log(`${dupPay.duplicate ? "ok  " : "FAIL"}  the same Stripe payment posted twice counts once`);
  if (!dupPay.duplicate) failures++;
  await worker("POST", "", { action: "update", ref, applied_seq: 5, set: { status: "preview_sent", todo: null, pending_changes: null } });

  const found = await worker("GET", `?email=${encodeURIComponent(email)}`);
  console.log(`${found.projects?.[0]?.ref === ref ? "ok  " : "FAIL"}  sender lookup finds the project`);
  if (found.projects?.[0]?.ref !== ref) failures++;

  const status = await (await fetch(`${API}?status=${ref}`)).json();
  console.log(`${typeof status.rounds_left === "number" ? "ok  " : "FAIL"}  public status: ${JSON.stringify(status)}`);

  await submit(FORMS.approve, [text("Your email", email), text("Want us to handle updates later?", "Yes, send me the Care Plan link ($79/mo)")]);
  await expect("the approve form alone records the answers and waits for payment", { status: "preview_sent", care_plan_requested: true, care_plan: false });
  await worker("POST", "", { action: "payment", ref, stripe_id: `cs_test_${ref}_approve`, kind: "approve", cents: 100000 });
  await expect("the $1,000 payment approves and queues the launch", { status: "approved", todo: "launch", care_plan_requested: true, paid_cents: 115000 });

  await worker("POST", "", { action: "payment", ref, stripe_id: `cs_test_${ref}_approve2`, kind: "approve", cents: 100000 });
  await expect("a second payment doesn't double count (it's flagged for a refund)", { status: "approved", paid_cents: 115000 });

  await submit(FORMS.changes, [text("Your email", email), text("What would you like changed?", "Spotted a typo after paying")]);
  await expect("a change after approval is applied at launch, free", { status: "approved", todo: "launch", pending_changes: "Spotted a typo after paying" });
  await worker("POST", "", { action: "update", ref, set: { pending_changes: null } });

  // Managed plan ($49/month), as the operator runs it (OPERATOR.md "Managed plan"): live site, subscription recorded.
  await worker("POST", "", { action: "update", ref, set: { status: "live", todo: null, live_url: "https://www.testbakery.example" } });
  const live = await (await fetch(`${API}?status=${ref}`)).json();
  console.log(`${live.status === "live" ? "ok  " : "FAIL"}  /managed/ sees a live site, so checkout opens`);
  if (live.status !== "live") failures++;
  await worker("POST", "", { action: "update", ref, set: { care_plan: true, plan_subscription: `sub_test_${ref}` }, event: { kind: "plan_started", summary: "test" } });
  const plans = await worker("GET", "?plans=1");
  const listed = plans.projects?.find((x: { ref: string }) => x.ref === ref);
  console.log(`${listed?.plan_subscription === `sub_test_${ref}` && listed?.domain === "testbakery.example" ? "ok  " : "FAIL"}  the plan list has it, with its subscription and domain, for the daily checks`);
  if (!(listed?.plan_subscription === `sub_test_${ref}` && listed?.domain === "testbakery.example")) failures++;
  await submit(FORMS.changes, [text("Your email", email), text("What would you like changed?", "New holiday hours")]);
  await expect("on the managed plan, a change after launch is an included edit", { status: "live", todo: "care_edit" });
  await worker("POST", "", { action: "update", ref, applied_seq: (await worker("GET", `?ref=${ref}`)).project.changes_seq, set: { todo: null, pending_changes: null } });
  await expect("the edit is applied and the job clears", { status: "live", todo: null, pending_changes: null });

  // Two submissions at the same moment: both must survive (optimistic locking with retry).
  const before = (await worker("GET", `?ref=${ref}`)).project;
  await Promise.all([
    submit(FORMS.changes, [text("Your email", email), text("What would you like changed?", "Concurrent A")]),
    submit(FORMS.changes, [text("Your email", email), text("What would you like changed?", "Concurrent B")]),
  ]);
  const after = (await worker("GET", `?ref=${ref}`)).project;
  const both = after.pending_changes?.includes("Concurrent A") && after.pending_changes?.includes("Concurrent B") && after.changes_seq === before.changes_seq + 2;
  console.log(`${both ? "ok  " : "FAIL"}  two simultaneous change requests both survive`);
  if (!both) failures++;

  // The plan ends (cancelled in Stripe's portal, or the card failed for good): back to $150 a round.
  await worker("POST", "", { action: "update", ref, applied_seq: (await worker("GET", `?ref=${ref}`)).project.changes_seq, set: { care_plan: false, todo: null, pending_changes: null }, event: { kind: "plan_ended", summary: "test" } });
  const after2 = await worker("GET", "?plans=1");
  const gone = !after2.projects?.some((x: { ref: string }) => x.ref === ref);
  console.log(`${gone ? "ok  " : "FAIL"}  once the plan ends it drops off the plan list`);
  if (!gone) failures++;
  await submit(FORMS.changes, [text("Your email", email), text("What would you like changed?", "Change the photo")]);
  await expect("after the plan ends, a change waits for the $150 offer", { status: "live", todo: "reply_out_of_scope", held_changes: "Change the photo" });

  const { events } = await worker("GET", `?ref=${ref}`);
  console.log(`\n${events.length} events logged:`);
  for (const e of events) console.log(`  ${e.kind.padEnd(19)} ${e.round ?? ""}  ${e.summary}`);
} finally {
  const del = await worker("POST", "", { action: "delete", ref });
  console.log(`\ncleanup: ${JSON.stringify(del)}`);
}
console.log(failures ? `\n${failures} check(s) failed` : "\nAll checks passed");
process.exit(failures ? 1 : 0);

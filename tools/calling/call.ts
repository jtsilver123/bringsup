// Phone follow-ups through an ElevenLabs voice agent on BringsUp's Twilio number (tools/RUNBOOK.md "Calls").
// The agent, Emily, says up front that she's Jake's AI cofounder, asks one question (would they like a free demo
// homepage?), and on a yes confirms an email address. The hourly operator places calls and reads the outcomes.
//
//   node tools/calling/call.ts sync                         create or update the agent from tools/calling/agent.md
//   node tools/calling/call.ts check <+1number>             is this number allowed? (a business landline, not a mobile)
//   node tools/calling/call.ts place <+1number> <vars.json> [--test]   place one call (vars: business_name, town, tz,
//                                                           compliment, compliment_short, owner_name)
//   node tools/calling/call.ts results [hours]              outcomes of calls in the last <hours> (default 26)
//
// Needs ELEVENLABS_API_KEY. `check` and `place` also need TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN (Twilio Lookup
// tells a landline from a mobile, and a business from a consumer). `place --test` only calls BRINGSUP_TEST_PHONE.
// Prints JSON. Node 22.6+ runs this file directly.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DIR = import.meta.dirname;
const CONFIG = join(DIR, "agent.json"); // {agent_id, phone_number_id}: ids only, no secrets
// From the environment, or a git-ignored tools/calling/.env.local (ELEVENLABS_API_KEY=...) for local setup.
const KEY = process.env.ELEVENLABS_API_KEY || (() => {
  try { return /^ELEVENLABS_API_KEY=(.+)$/m.exec(readFileSync(join(DIR, ".env.local"), "utf8"))?.[1].trim() || ""; } catch { return ""; }
})();
const API = "https://api.elevenlabs.io/v1/convai";

// Her opening line. It carries the AI disclosure, so it's the fixed first message, held a beat after pickup.
const OPENING = "Hey, it's Emily with BringsUp, I'm Jake's AI cofounder. Did I catch {{business_name}} at a bad time?";
const OUTCOMES = "yes, not_interested, call_back, owner_unavailable, do_not_call, voicemail, phone_menu, wrong_number, unclear";

function die(msg: string): never {
  console.log(JSON.stringify({ ok: false, error: msg }));
  process.exit(1);
}
if (!KEY) die("Set ELEVENLABS_API_KEY first.");

async function xi(method: string, path: string, body?: unknown): Promise<any> {
  const res = await fetch(API + path, { method, headers: { "xi-api-key": KEY, "content-type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) die(`ElevenLabs ${res.status}: ${JSON.stringify(data.detail ?? data).slice(0, 400)}`);
  return data;
}

const config = (): { agent_id?: string; phone_number_id?: string } => { try { return JSON.parse(readFileSync(CONFIG, "utf8")); } catch { return {}; } };

async function sync() {
  const agent = {
    name: "BringsUp follow-up calls",
    conversation_config: {
      agent: {
        // Always the opening, so the AI disclosure is guaranteed (a prompt-only opening got skipped in testing).
        first_message: OPENING,
        language: "en",
        prompt: {
          prompt: readFileSync(join(DIR, "agent.md"), "utf8").replace("{{opening}}", OPENING),
          llm: "claude-haiku-5-5",
          temperature: 0.5,
          // Voicemail: hang up without a message (an AI voice on a machine is a prerecorded message).
          built_in_tools: {
            end_call: { name: "end_call", description: "", params: { system_tool_type: "end_call" } },
            voicemail_detection: { name: "voicemail_detection", description: "", params: { system_tool_type: "voicemail_detection", voicemail_message: "" } },
          },
        },
      },
      // Hope (library voice with natural mmms, pauses and chuckles; Jake's pick); lower stability lets her delivery vary.
      tts: { voice_id: "uYXf8XasLslADfZ2MB4u", model_id: "eleven_v4_turbo", stability: 0.32, similarity_boost: 0.75, speed: 1.03 },
      // A quiet office under her voice; she has already said she's an AI, so it's ambience, not a disguise.
      conversation: { max_duration_seconds: 180, background_sound: { source_type: "preset", source_id: "office1", volume: 0.04, crossfade_loop: true } },
      // Answer quickly, and cover a slow reply with a short filler instead of dead air.
      turn: {
        turn_eagerness: "eager", speculative_turn: true,
        initial_wait_time: 2.5, // let them say "Hello?" before she speaks
        soft_timeout_config: { timeout_seconds: 2.0, message: "Mm-hm.", additional_soft_timeout_messages: ["Yeah,", "Oh, okay,", "Um,"], randomize_fillers: true, use_llm_generated_message: false, max_soft_timeouts_per_generation: 1 },
      },
    },
    platform_settings: {
      data_collection: {
        outcome: { type: "string", description: `How the call ended. Exactly one of: ${OUTCOMES}.` },
        email: { type: "string", description: "The email address they confirmed for the demo link, spelled exactly as confirmed. Empty if none." },
        contact_name: { type: "string", description: "The name of the person who said yes or who we should talk to, if they gave one." },
        call_back_when: { type: "string", description: "When they said to call back or when the owner is in, in their words. Empty if not asked." },
        note: { type: "string", description: "One short line Jake should know (a question they asked, a concern). Empty if nothing." },
      },
      evaluation: { criteria: [
        { id: "disclosed_ai", name: "Said it was an AI", conversation_goal_prompt: "Did the agent say it is an AI (an AI cofounder or AI assistant) at the start and never claim or suggest it is a person?" },
        { id: "no_pressure", name: "No pressure", conversation_goal_prompt: "Did the agent accept a no or a do-not-call request at once, without pushing again?" },
      ] },
    },
  };
  const c = config();
  if (!c.phone_number_id) {
    const nums = await xi("GET", "/phone-numbers");
    const out = (nums || []).find((n: { supports_outbound: boolean }) => n.supports_outbound);
    if (!out) die("No outbound phone number in ElevenLabs. Import the Twilio number first.");
    c.phone_number_id = out.phone_number_id;
  }
  if (c.agent_id) await xi("PATCH", `/agents/${c.agent_id}`, agent);
  else c.agent_id = (await xi("POST", "/agents/create", agent)).agent_id;
  writeFileSync(CONFIG, JSON.stringify(c, null, 2) + "\n");
  console.log(JSON.stringify({ ok: true, ...c }));
}

/** Twilio Lookup: line type and caller type. Only business landlines may get an AI call (TCPA). */
async function check(number: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID, token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) die("Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN first (Twilio Lookup checks the line type).");
  const res = await fetch(`https://lookups.twilio.com/v2/PhoneNumbers/${encodeURIComponent(number)}?Fields=line_type_intelligence,caller_name`, {
    headers: { authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64") },
  });
  const d = await res.json().catch(() => ({}));
  if (!res.ok) die(`Twilio Lookup ${res.status}: ${d.message || "failed"}`);
  const line = d.line_type_intelligence?.type ?? null; // landline, mobile, fixedVoip, nonFixedVoip, tollFree, ...
  const caller = d.caller_name?.caller_type ?? null; // BUSINESS, CONSUMER or null
  const allowed = d.valid && (line === "landline" || line === "fixedVoip") && caller !== "CONSUMER";
  return { number: d.phone_number || number, valid: !!d.valid, line, caller, caller_name: d.caller_name?.caller_name ?? null, allowed,
    reason: allowed ? null : !d.valid ? "not a valid number" : caller === "CONSUMER" ? "registered to a person, not a business" : `line type ${line}: only business landlines` };
}

/** Weekdays 10:00-11:30 and 14:00-16:30 in the business's own time zone: between the rushes. */
function callWindow(tz: string): boolean {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date()).map((x) => [x.type, x.value]));
  if (["Sat", "Sun"].includes(p.weekday)) return false;
  const m = Number(p.hour) * 60 + Number(p.minute);
  return (m >= 600 && m < 690) || (m >= 840 && m < 990);
}

async function place(number: string, varsFile: string, test: boolean) {
  const c = config();
  if (!c.agent_id || !c.phone_number_id) die("Run `sync` first.");
  const vars = JSON.parse(readFileSync(varsFile, "utf8"));
  for (const k of ["business_name", "town", "compliment", "compliment_short"]) if (!vars[k]) die(`vars.json needs ${k}.`);
  // The live agent must open by saying it's an AI (TCPA artificial-voice rules, and honesty). A dashboard edit that
  // drops it stops every call, test calls included, until `sync` puts the disclosed opening back.
  const live = await xi("GET", `/agents/${c.agent_id}`);
  if (!/\bAI\b/.test(live.conversation_config?.agent?.first_message || "")) die("Not calling: the agent's live opening line doesn't say it's an AI. Run `sync` to restore it.");
  if (test) {
    if (!process.env.BRINGSUP_TEST_PHONE || number !== process.env.BRINGSUP_TEST_PHONE) die("--test only calls BRINGSUP_TEST_PHONE.");
  } else {
    if (!vars.tz) die("vars.json needs tz (the business's IANA time zone).");
    if (!callWindow(vars.tz)) die(`Outside the call window in ${vars.tz} (weekdays 10-11:30 AM and 2-4:30 PM).`);
    const line = await check(number);
    if (!line.allowed) die(`Not calling: ${line.reason}.`);
  }
  const r = await xi("POST", "/twilio/outbound-call", {
    agent_id: c.agent_id, agent_phone_number_id: c.phone_number_id, to_number: number, call_recording_enabled: false,
    conversation_initiation_client_data: { dynamic_variables: { owner_name: "unknown", ...vars } },
  });
  console.log(JSON.stringify({ ok: !!r.success, conversation_id: r.conversation_id, message: r.message }));
}

async function results(hours: number) {
  const c = config();
  if (!c.agent_id) die("Run `sync` first.");
  const since = Date.now() / 1000 - hours * 3600;
  const list = await xi("GET", `/conversations?agent_id=${c.agent_id}&page_size=100`);
  const out = [];
  for (const conv of list.conversations || []) {
    if (conv.start_time_unix_secs < since) continue;
    const d = await xi("GET", `/conversations/${conv.conversation_id}`);
    const val = (k: string) => d.analysis?.data_collection_results?.[k]?.value ?? null;
    out.push({
      conversation_id: d.conversation_id, status: d.status, to: d.metadata?.phone_call?.external_number ?? null,
      at: new Date(d.metadata?.start_time_unix_secs * 1000).toISOString(), seconds: d.metadata?.call_duration_secs,
      outcome: val("outcome"), email: val("email"), contact_name: val("contact_name"), call_back_when: val("call_back_when"), note: val("note"),
      summary: d.analysis?.transcript_summary ?? null, cost: d.metadata?.cost_fiat ?? null,
      checks: Object.fromEntries(Object.entries(d.analysis?.evaluation_criteria_results || {}).map(([k, v]: [string, any]) => [k, v.result])),
    });
  }
  console.log(JSON.stringify({ ok: true, calls: out }));
}

const [cmd, a, b, flag] = process.argv.slice(2);
if (cmd === "sync") await sync();
else if (cmd === "check" && a) console.log(JSON.stringify(await check(a)));
else if (cmd === "place" && a && b) await place(a, b, flag === "--test" || process.argv.includes("--test"));
else if (cmd === "results") await results(Number(a) || 26);
else {
  console.error("Usage: node tools/calling/call.ts sync | check <+1number> | place <+1number> <vars.json> [--test] | results [hours]");
  process.exit(1);
}

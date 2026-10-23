// The first thing every operator run does (tools/OPERATOR.md step 0): one call that says what is due, so a quiet hour
// ends in a few steps instead of walking every step by hand. It does the clock and calendar math (Eastern time, US
// federal holidays, business days, the send slice) so the run doesn't have to.
//
//   node tools/preflight.ts [meta.json]
//
// meta.json: the tracker's `meta/pipeline` doc saved to a file (its fields: lastDailyCareAt, lastMonthlyCareAt,
// lastOutreachDate, capToday, sentToday, sentTodayDate, formsToday, formsTodayDate). Without it, the once-a-day and
// once-a-month checks show as unknown. Read-only: it claims no jobs and changes nothing.
// Prints one JSON object. `due` lists the steps that have work; the inbox (1) and payments (1b) need Gmail and Stripe,
// which only the run itself can read, so they are always listed.
import { readFileSync } from "node:fs";
import { functionApi, requireWorkerToken } from "./function-api.ts";

requireWorkerToken();
const projects = functionApi("https://rgeeynodxvusivfbaxfu.supabase.co/functions/v1/projects");
const redesign = functionApi("https://rgeeynodxvusivfbaxfu.supabase.co/functions/v1/redesign");
const meta = process.argv[2] ? JSON.parse(readFileSync(process.argv[2], "utf8")) : null;
const m = meta?.data ?? meta; // a saved ArtifactData doc, or just its fields

/** Date and time parts in America/New_York. */
function eastern(d: Date) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", weekday: "short", hourCycle: "h23",
  }).formatToParts(d).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, month: `${p.year}-${p.month}`, hour: Number(p.hour), minute: Number(p.minute), weekday: p.weekday as string };
}

/** US federal holidays (observed) for a year, as YYYY-MM-DD. */
function holidays(y: number): Set<string> {
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const nth = (month: number, dow: number, n: number) => { // n-th weekday of a month; n = -1 is the last
    if (n > 0) { const d = new Date(Date.UTC(y, month, 1)); d.setUTCDate(1 + ((dow - d.getUTCDay() + 7) % 7) + (n - 1) * 7); return iso(d); }
    const d = new Date(Date.UTC(y, month + 1, 0)); d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() - dow + 7) % 7)); return iso(d);
  };
  const fixed = (month: number, day: number) => { // Saturday → Friday, Sunday → Monday
    const d = new Date(Date.UTC(y, month, day)); const w = d.getUTCDay();
    if (w === 6) d.setUTCDate(day - 1); if (w === 0) d.setUTCDate(day + 1); return iso(d);
  };
  return new Set([fixed(0, 1), nth(0, 1, 3), nth(1, 1, 3), nth(4, 1, -1), fixed(5, 19), fixed(6, 4), nth(8, 1, 1), nth(9, 1, 2), fixed(10, 11), nth(10, 4, 4), fixed(11, 25)]);
}

const now = new Date();
const et = eastern(now);
const year = Number(et.date.slice(0, 4));
const holiday = holidays(year).has(et.date);
const weekday = !["Sat", "Sun"].includes(et.weekday);
const businessDay = weekday && !holiday;
// Cold sends: business days, 8 AM–4 PM in the prospect's time; ET runs from 8 AM to 7 PM cover every US zone (OPERATOR 5a).
const sendHours = businessDay && et.hour >= 8 && et.hour < 19;
const sendRunsLeft = sendHours ? 19 - et.hour : 0; // this run included
const sentToday = m && m.sentTodayDate === et.date ? Number(m.sentToday || 0) : 0;
const capToday = m ? Number(m.capToday || 0) : null;
const slice = sendHours && capToday !== null ? Math.min(6, Math.max(0, Math.ceil((capToday - sentToday) / sendRunsLeft))) : 0;
const formsToday = m && m.formsTodayDate === et.date ? Number(m.formsToday || 0) : 0;
const known = (v: boolean) => (m ? v : "unknown");

const [summary, health, capacity, views, pulse] = await Promise.all([
  projects("GET", "?summary=1"), projects("GET", "?health=1"), projects("GET", "?capacity=1"), redesign("GET", "?views=1"), projects("GET", "?pulse=1"),
]);
const daily = known(et.hour >= 8 && m?.lastDailyCareAt?.slice(0, 10) !== et.date);
const monthly = known(m?.lastMonthlyCareAt !== et.month);
const refill = known(businessDay && et.hour >= 15 && m?.lastOutreachDate !== et.date);
const jobsWaiting = summary.building + summary.launching; // builds, revisions and launches the run picks up with `jobs`

const due = ["1 inbox", "1b payments"];
if (daily === true) due.push("1b disputes + plan checks (daily)");
if (monthly === true) due.push("1b books (monthly)");
if (jobsWaiting || daily === true) due.push("2 customer jobs");
if ((health.quiet_customers || []).length) due.push("3 reminders");
due.push("4 redesign queue"); // `pull` is cheap and claims, so the run checks it itself
if (sendHours && (slice > 0 || formsToday < 10)) due.push(`5a send slice (up to ${slice} emails, ${Math.min(3, 10 - formsToday)} forms)`);
if (refill === true) due.push("5b refill");
// Calls: weekdays 10-11:30 AM and 2-4:30 PM in the business's zone, which across US zones is about 10 AM-7:30 PM ET.
if (businessDay && et.hour >= 10 && et.hour < 20) due.push("5c calls (if any row qualifies)");
if ((health.alerts || []).length || (health.failing_jobs || []).length || (health.stuck_on_us || []).length) due.push("6 health");

console.log(JSON.stringify({
  now: { et: `${et.date} ${String(et.hour).padStart(2, "0")}:${String(et.minute).padStart(2, "0")}`, weekday: et.weekday, holiday, businessDay },
  sendHours, sendRunsLeft, capToday, sentToday, slice, formsToday,
  dailyDue: daily, monthlyDue: monthly, refillDue: refill,
  customers: summary, capacity,
  alerts: health.alerts, failing_jobs: health.failing_jobs, stuck_on_us: health.stuck_on_us, quiet_customers: health.quiet_customers,
  previews: (views.previews || []).filter((p: { first_viewed_at: string | null }) => p.first_viewed_at).map((p: Record<string, unknown>) => ({
    ref: p.ref, short: p.short, first_viewed_at: p.first_viewed_at, view_count: p.view_count, start_clicked_at: p.start_clicked_at,
  })),
  lastHeartbeatMinutesAgo: pulse.minutes_since,
  due,
}));

// The site builder's toolbox: read jobs, save content, build and deploy customer sites, record what happened.
// Runs inside the scheduled "BringsUp operator" Claude Code task (see tools/OPERATOR.md).
//
//   node tools/projects-worker.ts jobs                         save each job to work/projects/<ref>/ and list them
//   node tools/projects-worker.ts show <ref>                   print a project and its history
//   node tools/projects-worker.ts preview <ref>                build work/projects/<ref>/site.json with the preview bar and deploy it
//   node tools/projects-worker.ts launch <ref>                 build without the preview bar, deploy to production, attach the domain
//   node tools/projects-worker.ts dns <ref>                    is the domain pointed at the site and serving it?
//   node tools/projects-worker.ts update <ref> <json-file>     apply {set?, event?, applied_seq?} from a file (see SETTABLE in the projects function)
//   node tools/projects-worker.ts fail <ref> "<what went wrong>"  record a failed job (5 failures raise an alert)
//   node tools/projects-worker.ts email-changes <ref> <txt-file>  a change request that came by email: same round rules as the form
//   node tools/projects-worker.ts payment <ref> <approve|extra> <cents> <stripe-session-id>  record a completed Stripe payment (once per session)
//   node tools/projects-worker.ts find <email>                 which project an email address belongs to
//   node tools/projects-worker.ts health                       alerts, failing jobs, stuck projects, quiet customers
//   node tools/projects-worker.ts plans                        every project on the managed plan (for the daily checks)
//   node tools/projects-worker.ts heartbeat "<run summary>"    the last step of every run: tells the outside watchdog we're alive
//
// Env: BRINGSUP_WORKER_TOKEN, CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { build } from "./site-kit/build.ts";
import type { SiteContent } from "./site-kit/render.ts";

const API = process.env.BRINGSUP_PROJECTS_API || "https://rgeeynodxvusivfbaxfu.supabase.co/functions/v1/projects";
const TOKEN = process.env.BRINGSUP_WORKER_TOKEN || "";
const CF_TOKEN = process.env.CLOUDFLARE_API_TOKEN || "";
const CF_ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID || "";
const WRANGLER = "wrangler@4.152.0";
const WORK = join(import.meta.dirname, "..", "work", "projects");

interface Project {
  id: string; ref: string; status: string; todo: string | null; business_name: string; email: string; owner_name: string;
  rounds_included: number; rounds_extra: number; rounds_used: number; pending_changes: string | null; held_changes: string | null;
  preview_url: string | null; live_url: string | null; domain: string; domain_provider: string; domain_helper_email: string;
  care_plan: boolean; care_plan_requested: boolean; brief: Record<string, string>; files: { name: string; url: string }[]; site: SiteContent | null; pages_project: string;
}

async function api(method: "GET" | "POST", query: string, body?: unknown): Promise<any> {
  const res = await fetch(API + query, {
    method,
    headers: { "x-worker-token": TOKEN, "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${res.status}: ${data.error || "request failed"}`);
  return data;
}

const update = (ref: string, set?: Record<string, unknown>, event?: { kind: string; summary?: string; payload?: unknown; round?: number }) =>
  api("POST", "", { action: "update", ref, set, event });

async function cf(path: string, init: RequestInit = {}): Promise<any> {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}${path}`, {
    ...init,
    headers: { authorization: `Bearer ${CF_TOKEN}`, "content-type": "application/json", ...(init.headers || {}) },
  });
  return res.json();
}

/** Cloudflare Pages project names: lowercase letters, numbers and dashes, at most 58 characters. */
const pagesName = (ref: string) => ("bu-" + ref.toLowerCase().replace(/[^a-z0-9-]+/g, "-")).slice(0, 58).replace(/-+$/, "");

async function ensurePagesProject(name: string): Promise<void> {
  const got = await cf(`/pages/projects/${name}`);
  if (got.success) return;
  const made = await cf(`/pages/projects`, { method: "POST", body: JSON.stringify({ name, production_branch: "main" }) });
  if (!made.success) throw new Error(`Couldn't create Pages project ${name}: ${JSON.stringify(made.errors)}`);
}

function deploy(dir: string, project: string, branch: "main" | "preview"): string {
  const out = execFileSync("npx", ["--yes", WRANGLER, "pages", "deploy", dir, "--project-name", project, "--branch", branch, "--commit-dirty=true"], {
    encoding: "utf8", env: { ...process.env, CLOUDFLARE_API_TOKEN: CF_TOKEN, CLOUDFLARE_ACCOUNT_ID: CF_ACCOUNT },
  });
  const url = out.match(/https:\/\/[^\s]+\.pages\.dev/g)?.pop();
  if (!url) throw new Error("Deploy finished but printed no URL:\n" + out.slice(-800));
  return url;
}

function siteFile(ref: string): SiteContent {
  const file = join(WORK, ref, "site.json");
  if (!existsSync(file)) throw new Error(`Write ${file} first`);
  return JSON.parse(readFileSync(file, "utf8"));
}

async function jobs(): Promise<void> {
  const { jobs } = await api("GET", "?jobs=1") as { jobs: Project[] };
  if (!jobs.length) return console.log("No jobs.");
  for (const p of jobs) {
    const dir = join(WORK, p.ref);
    mkdirSync(dir, { recursive: true });
    const { events } = await api("GET", `?ref=${encodeURIComponent(p.ref)}`);
    writeFileSync(join(dir, "project.json"), JSON.stringify(p, null, 2));
    writeFileSync(join(dir, "events.json"), JSON.stringify(events, null, 2));
    if (p.site && !existsSync(join(dir, "site.json"))) writeFileSync(join(dir, "site.json"), JSON.stringify(p.site, null, 2));
    const left = p.rounds_included + p.rounds_extra - p.rounds_used;
    console.log(`${p.todo?.padEnd(11)} ${p.ref}  ${p.business_name}  <${p.email}>  status=${p.status} roundsLeft=${left}  -> work/projects/${p.ref}/`);
  }
}

async function preview(ref: string): Promise<void> {
  const { project } = await api("GET", `?ref=${encodeURIComponent(ref)}`) as { project: Project };
  const site = siteFile(ref);
  const roundsLeft = project.rounds_included + project.rounds_extra - project.rounds_used;
  const dir = join(WORK, ref, "dist-preview");
  await build(site, dir, { ref, roundsLeft }, join(WORK, ref));
  const name = project.pages_project || pagesName(ref);
  await ensurePagesProject(name);
  const url = deploy(dir, name, "preview");
  const stable = `https://preview.${name}.pages.dev`;
  await update(ref, { site, pages_project: name, preview_url: stable });
  console.log(`Preview deployed: ${stable} (this deploy: ${url})`);
}

async function launch(ref: string): Promise<void> {
  const { project } = await api("GET", `?ref=${encodeURIComponent(ref)}`) as { project: Project };
  const site = siteFile(ref);
  const dir = join(WORK, ref, "dist-live");
  await build(site, dir, undefined, join(WORK, ref));
  const name = project.pages_project || pagesName(ref);
  await ensurePagesProject(name);
  deploy(dir, name, "main");
  const added: string[] = [];
  if (project.domain) {
    for (const host of [project.domain, `www.${project.domain}`]) {
      const r = await cf(`/pages/projects/${name}/domains`, { method: "POST", body: JSON.stringify({ name: host }) });
      if (r.success || JSON.stringify(r.errors).includes("already")) added.push(host);
      else console.error(`Couldn't attach ${host}: ${JSON.stringify(r.errors)}`);
    }
  }
  await update(ref, { site, pages_project: name }, { kind: "deployed", summary: `Production deploy to ${name}.pages.dev; domains: ${added.join(", ") || "none"}` });
  console.log(`Live on https://${name}.pages.dev. Point the domain with a CNAME: www -> ${name}.pages.dev`);
}

async function dns(ref: string): Promise<void> {
  const { project } = await api("GET", `?ref=${encodeURIComponent(ref)}`) as { project: Project };
  if (!project.domain) throw new Error("No domain on this project");
  const result: Record<string, string> = {};
  for (const host of [`www.${project.domain}`, project.domain]) {
    try {
      const res = await fetch(`https://${host}/`, { redirect: "follow", signal: AbortSignal.timeout(15_000) });
      const html = await res.text();
      const ours = html.includes('rel="stylesheet" href="site.css"') || html.includes('href="site.css"');
      result[host] = `${res.status}${ours ? " serving the new site" : " not the new site yet"} (${res.url})`;
    } catch (e) {
      result[host] = `unreachable: ${String(e).slice(0, 120)}`;
    }
  }
  console.log(JSON.stringify(result, null, 2));
}

const [cmd, ref, file] = process.argv.slice(2);
if (!TOKEN) {
  console.error("Set BRINGSUP_WORKER_TOKEN first.");
  process.exit(1);
}
if ((cmd === "preview" || cmd === "launch") && (!CF_TOKEN || !CF_ACCOUNT)) {
  console.error("CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID must be set in the environment.");
  process.exit(1);
}
if (cmd === "jobs") await jobs();
else if (cmd === "show" && ref) console.log(JSON.stringify(await api("GET", `?ref=${encodeURIComponent(ref)}`), null, 2));
else if (cmd === "preview" && ref) await preview(ref);
else if (cmd === "launch" && ref) await launch(ref);
else if (cmd === "dns" && ref) await dns(ref);
else if (cmd === "update" && ref && file) {
  const { set, event, applied_seq } = JSON.parse(readFileSync(file, "utf8"));
  console.log(JSON.stringify(await api("POST", "", { action: "update", ref, set, event, applied_seq }), null, 2));
} else if (cmd === "fail" && ref) console.log(await api("POST", "", { action: "fail", ref, error: file || "failed" }));
else if (cmd === "payment" && ref && process.argv[4] && process.argv[5] && process.argv[6]) console.log(JSON.stringify(await api("POST", "", { action: "payment", ref, kind: process.argv[4], cents: Number(process.argv[5]), stripe_id: process.argv[6] }), null, 2));
else if (cmd === "email-changes" && ref && file) console.log(JSON.stringify(await api("POST", "", { action: "email_changes", ref, text: readFileSync(file, "utf8") }), null, 2));
else if (cmd === "find" && ref) console.log(JSON.stringify(await api("GET", `?email=${encodeURIComponent(ref)}`), null, 2));
else if (cmd === "health") console.log(JSON.stringify(await api("GET", "?health=1"), null, 2));
else if (cmd === "plans") console.log(JSON.stringify(await api("GET", "?plans=1"), null, 2));
else if (cmd === "heartbeat") console.log(JSON.stringify(await api("POST", "", { action: "heartbeat", text: ref || "" })));
else {
  console.error("Usage: node tools/projects-worker.ts jobs | show <ref> | preview <ref> | launch <ref> | dns <ref> | update <ref> <json-file> | fail <ref> <msg> | email-changes <ref> <txt-file> | payment <ref> <approve|extra> <cents> <stripe-session-id> | find <email> | health | plans | heartbeat <summary>");
  process.exit(1);
}

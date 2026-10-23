// Send the first cold message through a business's own website contact form, for prospects that publish no
// email address (tools/RUNBOOK.md "Contact forms"). One message per business, ever. It never gets past a CAPTCHA
// and never writes to a site that asks not to be solicited: it refuses instead, and the operator skips the prospect.
//
//   node tools/form-send.ts check <page-url>                     find the form and show how each field would be filled
//   node tools/form-send.ts send <page-url> <message.json> [shot.png]   fill it in, submit, and confirm it went through
//
// message.json: {"subject": "...", "message": "..."}; the sender is always Jake Silver, jake@bringsup.com.
// Prints one JSON line: {status: "ready" | "sent" | "unconfirmed" | "refused", reason?, page, fields}.
// "unconfirmed" means it submitted but saw no thank-you: treat it as sent (never submit twice) and note it.
// Node 22.6+ runs this file directly.
import { readFileSync } from "node:fs";

const SENDER = { first: "Jake", last: "Silver", name: "Jake Silver", email: "jake@bringsup.com", company: "BringsUp", website: "https://bringsup.com" };
const NO_SOLICIT = /\b(no|not accepting|do not send|we do not accept)\s+(unsolicited\s+)?(solicitations?|sales|marketing|vendor|advertising)|\bdo not solicit\b|\bsolicitors?\s+(are\s+)?not\b/i;
const THANKS = /thank(s| you)|been (sent|received)|message (was )?(sent|received)|we('|’)ll (be in touch|get back)|get back to you|submission (was )?(successful|received)|success/i;

type Field = { key: string; kind: string; required: boolean; value?: string; label: string };
type Result = { status: "ready" | "sent" | "unconfirmed" | "refused"; reason?: string; page: string; fields: Field[] };

function out(r: Result): never {
  console.log(JSON.stringify(r));
  process.exit(r.status === "refused" ? 2 : 0);
}

/** What a field is for, from its type, name, id, placeholder, aria-label and label text. */
function classify(type: string, tag: string, text: string): string {
  const t = text.toLowerCase();
  if (type === "email" || /e-?mail/.test(t)) return "email";
  if (type === "tel" || /phone|tel\b|mobile|cell/.test(t)) return "phone";
  if (tag === "textarea" || /message|comment|question|inquiry|enquiry|details|how can we help|tell us/.test(t)) return "message";
  if (/subject|topic|regarding|reason/.test(t)) return "subject";
  if (/first/.test(t) && /name/.test(t)) return "first";
  if (/last|surname/.test(t) && /name/.test(t)) return "last";
  if (/company|business|organi[sz]ation/.test(t)) return "company";
  if (/website|url|web site/.test(t)) return "website";
  if (/name/.test(t)) return "name";
  if (type === "checkbox" && /consent|agree|privacy|terms|accept/.test(t)) return "consent";
  return "other";
}

async function main() {
  const [cmd, url, msgFile, shot] = process.argv.slice(2);
  if (!["check", "send"].includes(cmd || "") || !/^https?:\/\//.test(url || "") || (cmd === "send" && !msgFile)) {
    console.error("Usage: node tools/form-send.ts check <page-url> | send <page-url> <message.json> [shot.png]");
    process.exit(1);
  }
  const msg = cmd === "send" ? JSON.parse(readFileSync(msgFile, "utf8")) as { subject?: string; message?: string } : { subject: "Website", message: "(message)" };
  if (!msg.message) out({ status: "refused", reason: "message.json has no message", page: url, fields: [] });

  const { chromium } = await import("/opt/node-tools/node_modules/playwright/index.mjs" as string);
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }).catch(() => chromium.launch());
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const res = await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 }).catch(() => null);
    if (!res || !res.ok()) out({ status: "refused", reason: "page didn't load", page: url, fields: [] });

    // The form with a message box; if this page has none, follow one "Contact" link on the same site.
    const hasForm = async () => (await page.locator("form:has(textarea)").count()) > 0;
    if (!(await hasForm())) {
      const link = page.locator("a", { hasText: /contact|get in touch|reach us/i }).first();
      const href = await link.getAttribute("href").catch(() => null);
      if (href) {
        const next = new URL(href, page.url());
        if (next.host === new URL(page.url()).host) await page.goto(next.href, { waitUntil: "networkidle", timeout: 30_000 }).catch(() => null);
      }
    }
    if (!(await hasForm())) out({ status: "refused", reason: "no contact form with a message box", page: page.url(), fields: [] });

    const body = await page.locator("body").innerText().catch(() => "");
    if (NO_SOLICIT.test(body)) out({ status: "refused", reason: "the site asks not to be solicited", page: page.url(), fields: [] });

    const form = page.locator("form:has(textarea)").first();
    // A CAPTCHA a person would have to solve means stop. Invisible reCAPTCHA (no widget) is the site's own check and is left alone.
    const captcha = await form.locator(
      'iframe[src*="hcaptcha"], iframe[src*="turnstile"], iframe[src*="recaptcha"]:not([src*="size=invisible"]), .g-recaptcha:not([data-size="invisible"]), .h-captcha, .cf-turnstile, input[name*="captcha" i]',
    ).count();
    if (captcha > 0) out({ status: "refused", reason: "the form has a CAPTCHA", page: page.url(), fields: [] });

    const fields: Field[] = [];
    const controls = form.locator("input, textarea, select");
    for (let i = 0; i < (await controls.count()); i++) {
      const el = controls.nth(i);
      if (!(await el.isVisible().catch(() => false))) continue; // hidden fields and honeypots stay empty
      const info = await el.evaluate((n: HTMLInputElement) => {
        const label = (n.id && document.querySelector(`label[for="${CSS.escape(n.id)}"]`)?.textContent) || n.closest("label")?.textContent || "";
        return {
          tag: n.tagName.toLowerCase(), type: (n.getAttribute("type") || "").toLowerCase(),
          text: [n.name, n.id, n.getAttribute("placeholder"), n.getAttribute("aria-label"), label].filter(Boolean).join(" "),
          required: n.required || n.getAttribute("aria-required") === "true" || /\*/.test(label),
        };
      });
      if (["submit", "button", "hidden", "file", "image", "reset", "password"].includes(info.type)) continue;
      const kind = classify(info.type, info.tag, info.text);
      const f: Field = { key: info.text.slice(0, 60), kind, required: info.required, label: info.text.slice(0, 80) };
      const values: Record<string, string | undefined> = {
        email: SENDER.email, first: SENDER.first, last: SENDER.last, name: SENDER.name, company: SENDER.company,
        website: SENDER.website, subject: msg.subject || "Website", message: msg.message,
      };
      if (info.tag === "select") {
        if (info.required) {
          const opts: string[] = await el.locator("option").allTextContents();
          // Only a neutral choice; picking a real service, location or customer type would be making something up.
          const pick = opts.find((o) => /other|general|question|inquiry|enquiry/i.test(o));
          if (!pick) out({ status: "refused", reason: `can't answer the required choice "${f.label}"`, page: page.url(), fields });
          f.value = pick!.trim();
          if (cmd === "send") await el.selectOption({ label: f.value });
        }
      } else if (info.type === "checkbox" || info.type === "radio") {
        if (info.required && kind !== "consent") out({ status: "refused", reason: `can't answer the required choice "${f.label}"`, page: page.url(), fields });
        if (kind === "consent" && info.required) { f.value = "checked"; if (cmd === "send") await el.check(); }
      } else if (values[kind] !== undefined) {
        f.value = values[kind];
        if (cmd === "send") await el.fill(f.value!);
      } else if (info.required) {
        // A required phone number or an unknown question: we don't make things up, so we don't send.
        out({ status: "refused", reason: `can't fill the required field "${f.label}"`, page: page.url(), fields });
      }
      fields.push(f);
    }
    if (!fields.some((f) => f.kind === "email")) out({ status: "refused", reason: "the form has no email field, so they couldn't reply", page: page.url(), fields });
    if (!fields.some((f) => f.kind === "message")) out({ status: "refused", reason: "no message box found", page: page.url(), fields });
    if (cmd === "check") out({ status: "ready", page: page.url(), fields });

    const before = page.url();
    const submit = form.locator('button[type="submit"], input[type="submit"], button:not([type])').filter({ hasNotText: /search|subscribe/i }).first();
    if (!(await submit.count())) out({ status: "refused", reason: "no send button found", page: page.url(), fields });
    await submit.click();
    await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});
    await page.waitForTimeout(2500);
    if (shot) await page.screenshot({ path: shot, fullPage: false }).catch(() => {});
    const after = await page.locator("body").innerText().catch(() => "");
    const thanked = (THANKS.test(after) && !THANKS.test(body)) || (page.url() !== before && /thank|success|sent/i.test(page.url()));
    out({ status: thanked ? "sent" : "unconfirmed", page: before, fields });
  } finally {
    await browser.close().catch(() => {});
  }
}

main().catch((e) => out({ status: "refused", reason: `error: ${String(e).slice(0, 200)}`, page: process.argv[3] || "", fields: [] }));

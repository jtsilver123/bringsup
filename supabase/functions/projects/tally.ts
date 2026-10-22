// Tally webhook payloads: verify the signature and flatten the answers into { question label: text }.
// Payload reference: https://tally.so/help/webhooks

export interface TallyField {
  key: string;
  label: string;
  type: string;
  value: unknown;
  options?: { id: string; text: string }[];
}

export interface TallyEvent {
  eventId: string;
  eventType: string;
  createdAt: string;
  data: { responseId: string; submissionId: string; formId: string; formName: string; createdAt: string; fields: TallyField[] };
}

export interface TallyFile {
  name: string;
  url: string;
  mimeType?: string;
}

export interface Submission {
  formId: string;
  responseId: string;
  /** Question label -> answer as plain text. Checkbox and choice answers are their option text, joined with ", ". */
  answers: Record<string, string>;
  files: TallyFile[];
  ref: string;
  paidCents: number;
}

/** Tally signs the raw body with HMAC-SHA256 and sends it base64-encoded in the Tally-Signature header. */
export async function verifySignature(body: string, signature: string | null, secret: string): Promise<boolean> {
  if (!signature || !secret) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body)));
  const expected = btoa(String.fromCharCode(...mac));
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}

function text(f: TallyField): string {
  const v = f.value;
  if (v == null) return "";
  if (Array.isArray(v)) {
    if (f.options) return v.map((id) => f.options!.find((o) => o.id === id)?.text ?? String(id)).join(", ");
    if (v.every((x) => typeof x === "object" && x && "url" in x)) return v.map((x) => (x as TallyFile).url).join("\n");
    return v.map(String).join(", ");
  }
  if (typeof v === "object") return JSON.stringify(v);
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return String(v);
}

export function parse(event: TallyEvent): Submission {
  const answers: Record<string, string> = {};
  const files: TallyFile[] = [];
  let ref = "";
  let paidCents = 0;
  for (const f of event.data.fields) {
    if (f.type === "HIDDEN_FIELDS" && f.label === "ref") ref = String(f.value ?? "").trim();
    if (f.type === "FILE_UPLOAD" && Array.isArray(f.value)) {
      for (const x of f.value as TallyFile[]) files.push({ name: x.name, url: x.url, mimeType: x.mimeType });
    }
    if (f.type === "PAYMENT" && f.value && typeof f.value === "object") {
      const price = Number((f.value as { price?: number }).price || 0);
      paidCents = Math.round(price * 100);
    }
    const label = (f.label || f.key).trim();
    // Checkbox groups report each option as its own field as well as the group; keep the first non-empty answer.
    const t = text(f);
    if (t && !answers[label]) answers[label] = t;
  }
  return { formId: event.data.formId, responseId: event.data.responseId, answers, files, ref, paidCents };
}

/** First answer whose label starts with any of the given prefixes (case-insensitive). */
export function pick(answers: Record<string, string>, ...prefixes: string[]): string {
  for (const p of prefixes) {
    const key = Object.keys(answers).find((k) => k.toLowerCase().startsWith(p.toLowerCase()));
    if (key && answers[key]) return answers[key];
  }
  return "";
}

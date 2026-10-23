// Puts the standard BringsUp preview card (tools/site-kit/gate.html) into a hand-built preview. Used by
// `queue-worker.ts outreach`; not a command itself. The builder writes only
//   <div class="bu-gate"><div class="bu-blur" aria-hidden="true" inert> ... </div><!--BU-GATE--></div>
// and this fills the marker with the card, its {{REST}} sentence and the prospect's start link.
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const GATE_MARKER = "<!--BU-GATE-->";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** The page with the card in place of the marker. A page without the marker that already has the card (built before
 *  the marker existed) comes back unchanged. Throws, with a message for the builder, when neither is there, when the
 *  marker is used without a `rest` sentence (meta.json), or when it appears more than once. */
export function injectGate(html: string, slug: string, rest?: string): { html: string; injected: boolean } {
  const count = html.split(GATE_MARKER).length - 1;
  if (!count) {
    if (/\bbu-card\b/.test(html)) return { html, injected: false };
    throw new Error(`index.html has no gate: end the blurred part with ${GATE_MARKER} inside bu-gate (tools/site-kit/gate.html).`);
  }
  if (count > 1) throw new Error(`index.html has ${GATE_MARKER} ${count} times; it goes once, right after the bu-blur div.`);
  if (/\bbu-card\b/.test(html)) throw new Error(`index.html has both ${GATE_MARKER} and its own bu-card; keep only the marker.`);
  if (!rest?.trim()) throw new Error(`meta.json needs "rest": one plain sentence about what the full site adds (it fills the card).`);
  const kit = readFileSync(join(import.meta.dirname, "gate.html"), "utf8")
    .replace(/^\s*<!--[\s\S]*?-->\s*/, "") // the instructions for builders
    .replaceAll("{{REST}}", () => esc(rest.trim()))
    .replaceAll("{{START_URL}}", () => `https://bringsup.com/start/?ref=${encodeURIComponent(slug)}`);
  // A function, so "$" in the card ("$1,000") or the sentence is never read as a replacement pattern.
  return { html: html.replace(GATE_MARKER, () => `<!-- BringsUp preview gate (tools/site-kit/gate.html) -->\n${kit.trimEnd()}\n`), injected: true };
}

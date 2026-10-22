// Render the link preview images (what shows when bringsup.com links are texted or posted).
//   node tools/make-og.ts            -> public/assets/og.png, og-try.png, og-start.png
// Re-run it whenever the sample work images in public/assets/work change. Needs Playwright's Chromium (preinstalled in Claude Code cloud sessions).
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const PW = process.env.PLAYWRIGHT_MODULE || "/opt/node-tools/node_modules/playwright/index.mjs";
const { chromium } = await import(PW);
const root = join(import.meta.dirname, "..");
const card = pathToFileURL(join(root, "tools", "og", "card.html")).href;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const v of ["home", "try", "start"]) {
  await page.goto(`${card}?v=${v}`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  const out = join(root, "public", "assets", v === "home" ? "og.png" : `og-${v}.png`);
  await page.screenshot({ path: out });
  console.log("wrote", out);
}
await browser.close();

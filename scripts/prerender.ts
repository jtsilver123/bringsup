// Fill every built page with server-rendered HTML so it shows instantly and reads well to search engines.
// React then hydrates it in the browser. Runs after `vite build` and the SSR build (see package.json).
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { pages } from "../vite.config.ts";

const root = join(import.meta.dirname, "..");
const { render } = await import(pathToFileURL(join(root, "dist-ssr", "server.js")).href) as { render: (page: string) => string };

for (const [name, file] of Object.entries(pages)) {
  const path = join(root, "dist", file);
  const html = readFileSync(path, "utf8");
  if (!html.includes("<!--app-->")) throw new Error(`${file} is missing the <!--app--> placeholder`);
  writeFileSync(path, html.replace("<!--app-->", render(name)));
  console.log(`prerendered ${file}`);
}
rmSync(join(root, "dist-ssr"), { recursive: true, force: true });

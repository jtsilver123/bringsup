import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { headTags, META } from "./src/lib/seo.ts";

// One HTML entry per URL so the site keeps its paths (/try/, /start/, ...) on GitHub Pages.
// After the client build, scripts/prerender.ts fills each page with server-rendered HTML.
export const pages = {
  home: "index.html",
  try: "try/index.html",
  start: "start/index.html",
  changes: "changes/index.html",
  approve: "approve/index.html",
  extra: "extra/index.html",
  managed: "managed/index.html",
  terms: "terms/index.html",
  privacy: "privacy/index.html",
  brand: "brand/index.html",
  notFound: "404.html",
} as const;

/** Writes each page's title, description, share preview and icons into its <!--meta--> placeholder. */
function pageMeta(): Plugin {
  return {
    name: "bringsup-page-meta",
    transformIndexHtml(html, ctx) {
      const file = ctx.filename.slice(import.meta.dirname.length + 1).replace(/\\/g, "/");
      const name = Object.entries(pages).find(([, f]) => f === file)?.[0];
      if (!name || !META[name]) throw new Error(`No META entry for ${file}`);
      return html.replace("<!--meta-->", headTags(META[name]));
    },
  };
}

export default defineConfig({
  plugins: [react(), pageMeta()],
  build: {
    rollupOptions: {
      input: Object.fromEntries(Object.entries(pages).map(([name, file]) => [name, resolve(import.meta.dirname, file)])),
    },
  },
});

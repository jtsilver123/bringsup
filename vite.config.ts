import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// One HTML entry per URL so the site keeps its paths (/try/, /start/, ...) on GitHub Pages.
// After the client build, scripts/prerender.ts fills each page with server-rendered HTML.
export const pages = {
  home: "index.html",
  try: "try/index.html",
  start: "start/index.html",
  changes: "changes/index.html",
  approve: "approve/index.html",
  terms: "terms/index.html",
  privacy: "privacy/index.html",
  brand: "brand/index.html",
  notFound: "404.html",
} as const;

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: Object.fromEntries(Object.entries(pages).map(([name, file]) => [name, resolve(import.meta.dirname, file)])),
    },
  },
});

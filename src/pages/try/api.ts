// Talking to the redesign function, plus the small pure helpers the /try/ page needs.
import type { Concept } from "../../lib/concept-render.ts";
import { renderConcept } from "../../lib/concept-render.ts";

/** A finished redesign: GET ?id= with 200, or /try/demo.json. */
export interface Redesign {
  id: string;
  status?: "done";
  url: string;
  concept: Concept;
  images?: string[];
}

/** Just enough of the site to draw a blurred draft while a request waits in the queue. */
export interface Preview {
  name: string;
  phone: string;
  colors: string[];
  images: string[];
}

/** A request waiting in the queue: POST or GET ?id= with 202. */
export interface QueuedRedesign {
  id: string;
  status: "queued";
  url: string;
  preview?: Preview | null;
}

export interface ApiError {
  error?: string;
  code?: string;
}

export interface ApiResponse<T> {
  ok: boolean;
  status: number;
  body: T;
}

/** Fetch and parse JSON, keeping the status. Rejects if the network or the JSON fails. */
export async function request<T>(url: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const r = await fetch(url, init);
  const body = (await r.json()) as T;
  return { ok: r.ok, status: r.status, body };
}

/** "https://www.rosasbakery.com/menu" → "rosasbakery.com" */
export const hostOf = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/.*$/, "");
/** "https://www.rosasbakery.com/" → "rosasbakery.com" (keeps any path, like the address bar). */
export const addressOf = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

export const isUrl = (s: string) => /[^\s.]+\.[a-z]{2,}/i.test(s);
export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);

/** Drop photos that don't load, so the preview never shows a broken image. Returns a copy of the concept. */
export async function checkImages(concept: Concept, images: string[]): Promise<Concept> {
  const c: Concept = { ...concept, gallery_images: [...(concept.gallery_images || [])] };
  const picks = [c.hero_image, c.logo_image, ...c.gallery_images].filter((i) => i >= 0 && images[i]);
  const res = await Promise.all(picks.map((i) => new Promise<[number, boolean]>((ok) => {
    const im = new Image();
    const done = (good: boolean) => ok([i, good]);
    const to = setTimeout(() => done(false), 5000);
    im.onload = () => { clearTimeout(to); done(im.naturalWidth >= 200 || i === c.logo_image); };
    im.onerror = () => { clearTimeout(to); done(false); };
    im.src = images[i];
  })));
  const bad = res.filter((r) => !r[1]).map((r) => r[0]);
  if (bad.includes(c.hero_image)) c.hero_image = -1;
  if (bad.includes(c.logo_image)) c.logo_image = -1;
  c.gallery_images = c.gallery_images.filter((i) => !bad.includes(i));
  return c;
}

const FILLER = "Built from what your customers already love about you, with your hours, photos and story up front.";

/** A draft homepage from their own name, photos and colors, so the wait shows something that's clearly theirs. */
export function renderDraft(pv: Preview): string {
  const dark = (pv.colors || []).filter((c) => {
    const n = parseInt(c.slice(1), 16);
    return 0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255) < 90;
  })[0];
  const imgs = pv.images || [];
  const draft: Concept = {
    business_name: pv.name || "Your business", theme: "professional", tagline: "", city_state: "", phone: pv.phone || "", email: "", address: "",
    hours: [], year_founded: "", rating: "", review_count: "", headline: pv.name || "Your new homepage", subheadline: FILLER,
    primary_cta: "Get in touch", cta_kind: "contact",
    services: [1, 2, 3].map(() => ({ name: "What you do best", description: FILLER })),
    story_heading: "Your story", story: FILLER + " " + FILLER, testimonials: [], final_heading: "Come see us.",
    brand_primary: dark || "#16181D", brand_accent: "#C2410C", hero_image: imgs.length ? 0 : -1, logo_image: -1,
    gallery_images: imgs.length > 1 ? [1, 2, 3].filter((i) => i < imgs.length) : [], improvements: [],
  };
  return renderConcept(draft, imgs);
}

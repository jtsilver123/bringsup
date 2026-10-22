/* Turns a redesign (JSON from the redesign function) into a full homepage document.
   Used by /try/ inside a sandboxed iframe. It maps the concept onto the same SiteContent the real site is built from
   and renders it with tools/site-kit/render.ts, so the concept a prospect sees is the look of the site we'd build. */
import { render, type SiteContent } from "../../tools/site-kit/render.ts";

type Theme = "bakery" | "restaurant" | "auto" | "garden" | "trades" | "beauty" | "retail" | "health" | "professional";
type CtaKind = "call" | "order" | "book" | "quote" | "directions" | "shop" | "contact";

/** A redesign's content, as the redesign function returns it (see SCHEMA in supabase/functions/redesign/prompt.ts). */
export interface Concept {
  not_a_business?: boolean;
  not_a_business_reason?: string;
  business_name: string;
  theme: Theme;
  tagline: string;
  city_state: string;
  phone: string;
  email: string;
  address: string;
  hours: { days: string; time: string }[];
  year_founded: string;
  rating: string;
  review_count: string;
  headline: string;
  subheadline: string;
  primary_cta: string;
  cta_kind: CtaKind;
  services: { name: string; description: string }[];
  story_heading: string;
  story: string;
  testimonials: { quote: string; author: string }[];
  final_heading: string;
  brand_primary: string;
  brand_accent: string;
  /** Index into the images array, or -1. */
  hero_image: number;
  /** Index into the images array, or -1. */
  logo_image: number;
  gallery_images: number[];
  improvements: string[];
}

/** The concept as site content. Only what the concept says: no stock photos, no invented facts. */
function conceptToSite(c: Concept, images: string[]): SiteContent {
  images = images || [];
  const img = (n: number) => (n >= 0 && images[n] ? images[n] : "");
  const phone = c.phone || "";
  const menu = c.theme === "bakery" || c.theme === "restaurant";
  const services = (c.services || []).filter((s) => s && s.name).slice(0, 6);
  const gallery = (c.gallery_images || []).map(img).filter((u, i, a) => u && u !== img(c.hero_image) && a.indexOf(u) === i);
  return {
    business_name: c.business_name || "",
    theme: c.theme,
    tagline: c.tagline || "",
    city_state: c.city_state || "",
    phone,
    email: c.email || "",
    address: c.address || "",
    hours: (c.hours || []).filter((h) => h && (h.days || h.time)),
    year_founded: c.year_founded || "",
    rating: c.rating || "",
    review_count: c.review_count || "",
    reviews_url: "",
    brand_primary: c.brand_primary || "",
    brand_accent: c.brand_accent || "",
    logo: img(c.logo_image),
    hero_image: img(c.hero_image),
    // Nothing in a concept is live yet: calling works, every other button scrolls to how to reach them.
    primary_cta: { label: c.primary_cta || (phone ? "Call us" : "Visit us"), href: c.cta_kind === "call" && phone ? "tel:" + phone.replace(/[^\d+]/g, "") : "#visit" },
    home: { headline: c.headline || c.business_name, subheadline: c.subheadline || "", final_heading: c.final_heading || "Come see us." },
    offer: { title: menu ? "Menu" : "Services", intro: "", groups: services.length ? [{ name: "", items: services.map((s) => ({ name: s.name, description: s.description || "", price: "", image: "" })) }] : [] },
    about: { heading: c.story_heading || "Our story", paragraphs: c.story ? [c.story] : [], images: [] },
    testimonials: (c.testimonials || []).filter((t) => t && t.quote),
    domain: "",
    social: [],
    gallery: gallery.map((image) => ({ image, caption: "" })),
  };
}

/** The full HTML document for a concept. `images` are the photo URLs the concept's indexes point into. */
export function renderConcept(c: Concept, images: string[]): string {
  const name = c.business_name || "this business";
  return render(conceptToSite(c, images), {
    standalone: { note: `Concept by BringsUp · A homepage idea for ${name} · Not affiliated with ${name} · Not a live site` },
  })["index.html"];
}

// Titles, descriptions and link previews (Open Graph / Twitter cards) for every page.
// vite.config.ts writes these into each page's <head> at build time, so texts and social posts get a rich preview.
export const SITE = "https://bringsup.com";

export interface PageMeta {
  path: string;
  title: string;
  description: string;
  /** Shorter line for link previews; falls back to description. */
  share?: string;
  image: string;
  imageAlt: string;
  noindex?: boolean;
}

const HOME_IMAGE = { image: "/assets/og.png", imageAlt: "BringsUp: websites as good as your reviews. A redesigned bakery homepage on a laptop and phone." };
const TRY_IMAGE = { image: "/assets/og-try.png", imageAlt: "An outdated bakery website and its redesigned homepage, side by side." };
const START_IMAGE = { image: "/assets/og-start.png", imageAlt: "Let's build your new site. $0 until you approve, then a flat $1,000." };

export const META: Record<string, PageMeta> = {
  home: {
    path: "/",
    title: "BringsUp — Websites as good as your reviews",
    description: "Your reviews say you're the best in town. Your website should too. See your new homepage free, then we build the whole site and refresh your brand. You pay a flat $1,000 only when you approve it.",
    share: "See your new homepage free. Love it? We build the whole site and refresh your brand for a flat $1,000, live in about two weeks.",
    ...HOME_IMAGE,
  },
  try: {
    path: "/try/",
    title: "See your website, redone — BringsUp",
    description: "Paste your website. We rebuild your homepage from your own photos, services and story and email it to you within the hour. Free, no call.",
    share: "Paste your website and get your new homepage by email, free. No call.",
    ...TRY_IMAGE,
  },
  start: {
    path: "/start/",
    title: "Start my website — BringsUp",
    description: "Start your new BringsUp website. Ten minutes, no call, nothing to pay until you approve it.",
    ...START_IMAGE,
    noindex: true,
  },
  changes: {
    path: "/changes/",
    title: "Request changes — BringsUp",
    description: "Request changes to your BringsUp website preview.",
    ...START_IMAGE,
    noindex: true,
  },
  approve: {
    path: "/approve/",
    title: "Approve and launch — BringsUp",
    description: "Approve your BringsUp website and go live.",
    ...START_IMAGE,
    noindex: true,
  },
  extra: {
    path: "/extra/",
    title: "One more round of changes — BringsUp",
    description: "Pay for one more round of changes to your BringsUp website preview.",
    ...START_IMAGE,
    noindex: true,
  },
  terms: {
    path: "/terms/",
    title: "Terms of Service — BringsUp",
    description: "The terms for BringsUp websites: free concepts, nothing to pay until you approve, a flat $1,000, and you own everything.",
    ...HOME_IMAGE,
  },
  privacy: {
    path: "/privacy/",
    title: "Privacy Policy — BringsUp",
    description: "What BringsUp collects, why, who helps us, and how to have your information deleted.",
    ...HOME_IMAGE,
  },
  brand: {
    path: "/brand/",
    title: "BringsUp brand guide",
    description: "Logo, colors, type, motion and voice for BringsUp.",
    ...HOME_IMAGE,
    noindex: true,
  },
  notFound: {
    path: "/404.html",
    title: "Page not found — BringsUp",
    description: "This page isn't here.",
    ...HOME_IMAGE,
    noindex: true,
  },
};

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/** The <head> tags for one page. */
export function headTags(m: PageMeta): string {
  const url = SITE + m.path;
  const image = SITE + m.image;
  const share = m.share || m.description;
  return [
    `<title>${esc(m.title)}</title>`,
    `<meta name="description" content="${esc(m.description)}">`,
    m.noindex ? `<meta name="robots" content="noindex">` : `<link rel="canonical" href="${url}">`,
    `<meta name="theme-color" content="#16181D">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="BringsUp">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:title" content="${esc(m.title)}">`,
    `<meta property="og:description" content="${esc(share)}">`,
    `<meta property="og:image" content="${image}">`,
    `<meta property="og:image:type" content="image/png">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="${esc(m.imageAlt)}">`,
    `<meta property="og:locale" content="en_US">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(m.title)}">`,
    `<meta name="twitter:description" content="${esc(share)}">`,
    `<meta name="twitter:image" content="${image}">`,
    `<meta name="twitter:image:alt" content="${esc(m.imageAlt)}">`,
    `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`,
    `<link rel="icon" href="/assets/brand/favicon-32.png" sizes="32x32" type="image/png">`,
    `<link rel="apple-touch-icon" href="/assets/brand/apple-touch-icon.png">`,
    `<link rel="manifest" href="/site.webmanifest">`,
  ].join("\n");
}

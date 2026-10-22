// Repetitive homepage copy, kept as data. Markup lives in ./sections.
import type { ListIcon } from "./icons.tsx";

export type NavLink = { href: string; label: string; sheetLabel: string };
export const NAV: NavLink[] = [
  { href: "#work", label: "Work", sheetLabel: "Sample work" },
  { href: "#how", label: "How it works", sheetLabel: "How it works" },
  { href: "#pricing", label: "Pricing", sheetLabel: "Pricing" },
  { href: "#faq", label: "FAQ", sheetLabel: "FAQ" },
];

export const HERO_CHECKS = ["No calls", "Pay only when you approve", "You own everything"];

export type Fact = { value: string; label: string };
export const FACTS: Fact[] = [
  { value: "$0", label: "until you approve your finished site" },
  { value: "Same day", label: "your free homepage concept, by email" },
  { value: "0 calls", label: "one 10-minute form, the rest by email" },
  { value: "$1,000", label: "flat, with a brand refresh included" },
];

export const TRADES = ["Bakeries", "Diners & delis", "Auto shops", "Plumbers & HVAC", "Garden centers", "Hardware stores"];

export type TitledItem = { title: string; text: string };
export const NEXT: TitledItem[] = [
  { title: "Start online", text: "One 10-minute form: hours, services, a few photos. No call, nothing to pay." },
  { title: "We build your whole site", text: "A private preview in about two weeks, plus two rounds of changes." },
  { title: "Approve, then pay", text: "Love it? Pay the flat $1,000 and it goes live. Don't? You owe nothing." },
];

export type IconItem = TitledItem & { icon: ListIcon };
export const PAINS: IconItem[] = [
  { icon: "phone", title: "Hard to use on a phone", text: "Tiny text and pinch-to-zoom menus send people to the next result." },
  { icon: "clock", title: "Hours and info out of date", text: "Wrong hours or a dead link make people wonder if you're still open." },
  { icon: "star", title: "Your best asset is hidden", text: "Hundreds of glowing reviews, and not one of them on your site." },
];

export type WorkSample = { slug: string; name: string; ariaName: string; kind: string; text: string; height: number };
export const WORK: WorkSample[] = [
  { slug: "bakery", name: "Marigold Bakery", ariaName: "Marigold Bakery", kind: "Bakery · Westbrook, CT", text: "Warm and family-run, with ordering for pickup and holiday trays up front.", height: 3766 },
  { slug: "auto", name: "Delgado Auto Repair", ariaName: "Delgado Auto Repair", kind: "Auto repair · Mesa, AZ", text: "Straightforward and trustworthy, with booking online in under a minute.", height: 3733 },
  { slug: "plumbing", name: "Whitfield Plumbing & Heating", ariaName: "Whitfield Plumbing and Heating", kind: "Plumbing & HVAC · Dayton, OH", text: "Clean and dependable, with a quote request and the phone number always in reach.", height: 3733 },
];

export type Step = TitledItem & { when: string };
export const STEPS: Step[] = [
  { title: "We mock it up", text: "Your real name, services or menu, and the things your reviews keep mentioning.", when: "Free" },
  { title: "You fill in one form", text: "Ten minutes online: hours, services, a few photos. No call needed.", when: "Still $0" },
  { title: "We build it", text: "Every page, plus cleaned-up colors and fonts. Love your logo as it is? It stays. Two rounds of changes to make it yours.", when: "About 2 weeks" },
  { title: "You approve, then pay", text: "Love it? It goes live on your domain, and your email keeps working. Don't? You owe nothing.", when: "$1,000 when you approve" },
];

export const INCLUDED = [
  "Custom design, every page you need (usually four or five)",
  "Made for phones first, fast on any device",
  "Logo cleanup (only if you ask), brand colors and fonts",
  "Your Google reviews, front and center",
  "Menu, services or product pages",
  "Call, book, order or directions buttons",
  "Hours, address and phone matched to your Google listing, so people get the same answer everywhere",
  "Connected to your existing domain",
  "Hosting included, with no monthly fee",
  "Two rounds of changes (extra rounds $150, only if you ask)",
  "You own the site and every file",
];

export const COMPARE_COLUMNS = { diy: "Do it yourself", agency: "Traditional agency", us: "BringsUp" } as const;
export type CompareRow = { label: string } & Record<keyof typeof COMPARE_COLUMNS, string>;
export const COMPARE: CompareRow[] = [
  { label: "Who does the work", diy: "You, after closing time", agency: "Them, after a few meetings", us: "Us. You fill in one 10-minute form." },
  { label: "See it before you pay", diy: "Only what you build", agency: "Usually after a deposit", us: "Yes, your entire finished site" },
  { label: "Price", diy: "Monthly subscription, forever", agency: "Custom quote, often much higher", us: "Flat $1,000, when you approve" },
  { label: "Brand refresh", diy: "Not included", agency: "Usually a separate project", us: "Included" },
  { label: "Hosting", diy: "Part of the monthly plan", agency: "Usually a monthly fee", us: "Included, no monthly fee" },
  { label: "Who owns it", diy: "Tied to the builder's plan", agency: "Depends on the contract", us: "You, every file" },
];

export const PROMISES: IconItem[] = [
  { icon: "mail", title: "Three short emails, then we stop", text: "Reply \"no thanks\" anytime and you'll never hear from us again." },
  { icon: "dollar", title: "Pay only when you love it", text: "Flat $1,000, after you approve your finished site. No calls, no upsell, no surprise invoices." },
  { icon: "lock", title: "You keep the keys", text: "Your domain, your files, your site. Leave the Care Plan anytime and take it all with you." },
  { icon: "star", title: "We lead with what's great", text: "Your reviews and your history. That's what the new site is built around." },
];

export type FaqItem = { q: string; a: string };
export const FAQ: FaqItem[] = [
  { q: "Is the concept really free?", a: "Yes. We make your homepage concept before we ever talk money. If it's not for you, that's the end of it. No follow-up calls, no invoice." },
  { q: "How did you find my business?", a: "Your reviews. We look for family-owned businesses with a great reputation on Google and a website that hasn't caught up yet. Your email came from your own website or Google listing; we never buy lists. Everything in your concept came from what you've already published, and if you reply \"no thanks\" we delete it and never write again." },
  { q: "Why make a concept before I've asked?", a: "Because \"we'll make you a great website\" is easy to say. Showing you is better. If you like what you see, we both save time." },
  { q: "Do I have to change my domain or email?", a: "No. We launch the new site on the domain you already have. We only change the two settings that point your web address at the new site. The settings that run your email (called MX records) stay exactly as they are, and we check your email works before and after." },
  { q: "When do I pay?", a: "Only after you've seen your finished site and approved it. One flat $1,000, by card through Stripe. If you don't love it, you owe nothing." },
  { q: "Do I have to get on a call?", a: "No. Everything happens through one short form and email, on your schedule. Anything you'd say on a call, you can just reply with, and you'll get a real answer the same day." },
  { q: "What do you need from me?", a: "One 10-minute form, plus any photos you like. We pull your hours, menu or services and reviews from what's already online." },
  { q: "What if I need more pages, or online ordering?", a: "Tell us in the start form. We connect the ordering or booking service you already use, like Square, Toast or Calendly. If you don't have one, the button calls you or opens a quote form. Those services' own fees are theirs, not ours. Need something bigger? You'll get a flat price before any work starts." },
  { q: "What if I want more changes?", a: "Two rounds of changes are included, and we keep count for you. Anything you send within two days of an updated preview is part of the same round. After that, extra rounds are $150 each, and we always ask before charging." },
  { q: "What if I decide not to go ahead?", a: "Then you owe nothing. If we don't hear from you for 60 days after a preview, we take it down and delete your photos. Reply anytime before then to pick it back up." },
  { q: "Who owns the website?", a: "You do. The design, the files and the domain are yours, whether or not you keep the Care Plan." },
  { q: "Is there a monthly fee?", a: "No. Hosting is included, so your site stays up with no monthly bill. The optional Care Plan ($79/mo) is only if you'd like us to make updates for you, like new hours, specials and photos, by email. The files are yours, so your own web person can edit them too." },
  { q: "What if I already have a web person?", a: "Great. Share the concept with them. We're happy to hand over the design, or to work alongside them." },
];

export const CTA_LIST = ["No calls, ever", "Built from your real details and reviews", "Not for you? You'll never hear from us again"];

export const DONE_STEPS = [
  "We read your reviews and your current site.",
  "Your free concept arrives within 48 hours.",
  "Like it? Reply. Don't? No hard feelings.",
];

// Homepage copy that repeats or runs long, kept as data. Markup lives in ./sections.

export type NavLink = { href: string; label: string };
export const NAV: NavLink[] = [
  { href: "#work", label: "Work" },
  { href: "#how", label: "How it works" },
  { href: "#pricing", label: "Price" },
  { href: "#faq", label: "Questions" },
];

export type WorkSample = { slug: string; name: string; ariaName: string; kind: string; text: string; height: number };
export const WORK: WorkSample[] = [
  { slug: "bakery", name: "Marigold Bakery", ariaName: "Marigold Bakery", kind: "Bakery · Westbrook, CT", text: "Set like a printed menu: a serif nameplate, real prices on dotted leaders, and the hours right under the headline.", height: 4718 },
  { slug: "auto", name: "Linde Motorwerk", ariaName: "Linde Motorwerk", kind: "Porsche & BMW specialist · Boulder, CO", text: "Bold and technical, like a spec sheet: numbered services with prices, and the phone number big enough to tap from across the room.", height: 5163 },
  { slug: "carpentry", name: "Hartwell Joinery", ariaName: "Hartwell Joinery", kind: "Custom carpentry · Hudson, NY", text: "Quiet and led by the work: big project photos with captions, and how a job runs, told in plain words.", height: 5386 },
];

/** How it works, as a timeline: when, what happens, and what it costs at that point. */
export type Step = { when: string; title: string; text: string; cost: string };
export const STEPS: Step[] = [
  { when: "Same day", title: "I make your homepage", text: "From your real menu or services, your hours, and the things your reviews keep mentioning. You get a private link to open on your phone.", cost: "Free" },
  { when: "10 minutes", title: "You fill in one form", text: "Hours, services, a few photos, and your logo if you have one. Skip anything you don't have. No call.", cost: "Free" },
  { when: "About two weeks", title: "I build the whole site", text: "Every page. Your logo and colors stay as they are, or I tidy them up or make new ones if you ask, with a one-page brand guide. You get a private preview and two rounds of changes.", cost: "Free" },
  { when: "When you approve", title: "You pay, and it goes live", text: "On the web address you already have. Your email keeps working. If you don't love it, you owe nothing.", cost: "$1,000" },
];

export const INCLUDED = [
  "A custom design, with every page you need (usually four or five)",
  "Made for phones first, and fast on any device",
  "Brand colors and fonts, and logo cleanup if you ask",
  "Your Google reviews, front and center",
  "Menu, services or product pages",
  "Call, book, order or directions buttons",
  "Hours, address and phone matched to your Google listing",
  "Connected to the web address you already have",
  "Hosting, with no monthly fee",
  "Two rounds of changes (extra rounds are $150, and I always ask first)",
  "The site and every file, yours to keep",
];

export type FaqItem = { q: string; a: string };
export const FAQ: FaqItem[] = [
  { q: "Is the homepage really free?", a: "Yes. I make it before we ever talk money. If it's not for you, that's the end of it. No follow-up calls, no invoice." },
  { q: "How did you find my business?", a: "Your reviews. I look for family-owned businesses with a great reputation on Google and a website that hasn't caught up yet. Your email address came from your own website or Google listing. I never buy lists. Anything I make for you is built from what you've already published, and if you reply \"no thanks\", I delete it and never write again." },
  { q: "Why make it for free?", a: "Because \"I'll make you a great website\" is easy to say. Showing you is better. If you like what you see, we both save time." },
  { q: "Do I have to change my domain or email?", a: "No. Your new site goes live on the web address you already have. I only change the two settings that point that address at the new site. The settings that run your email (called MX records) stay exactly as they are, and I check your email works before and after." },
  { q: "When do I pay?", a: "Only after you've seen your finished site and approved it. One flat $1,000, by card through Stripe. If you don't love it, you owe nothing." },
  { q: "Do I have to get on a call?", a: "No. Everything happens through one short form and email, on your schedule. Anything you'd say on a call, you can write instead, and you'll get a real answer the same day." },
  { q: "What do you need from me?", a: "One 10-minute form, plus any photos you like. I pull your hours, menu or services and reviews from what's already online." },
  { q: "What if I need more pages, or online ordering?", a: "Say so in the start form. I connect the ordering or booking service you already use, like Square, Toast or Calendly. If you don't have one, the button calls you or opens a quote form. Those services' own fees are theirs, not mine. Need something bigger? You'll get a flat price before any work starts." },
  { q: "What if I want more changes?", a: "Two rounds of changes are included, and I keep count for you. Anything you send within two days of an updated preview is part of the same round. After that, extra rounds are $150 each, and I always ask before charging." },
  { q: "What if I decide not to go ahead?", a: "Then you owe nothing. If I don't hear from you for 60 days after a preview, I take it down and delete your photos. Reply anytime before then to pick it back up." },
  { q: "Who owns the website?", a: "You do. The design, the files and the domain are yours." },
  { q: "Is there a monthly fee?", a: "No. Hosting is included, so your site stays up with no monthly bill. If you'd rather never think about updates, there's an optional managed plan for $49 a month: changes by email are included, and I keep watch on your web address, email settings and renewal." },
  { q: "What about updates after launch?", a: "Anything I got wrong is fixed free. Other updates, like new hours, specials or photos, are $150 a round, the same as an extra round of changes. Just reply by email. The files are yours, so your own web person can edit them too." },
  { q: "What if I already have a web person?", a: "Good. Share the homepage with them. I'm happy to hand over the design, or to work alongside them." },
];

export const DONE_STEPS = [
  "I read your reviews and your current site.",
  "Your free homepage arrives within 48 hours.",
  "Like it? Reply. Don't? No hard feelings.",
];

import type { ReactNode } from "react";

// Plain-English terms and privacy policy. Bump UPDATED when either changes.
export const UPDATED = "October 22, 2026";

export interface LegalDoc {
  title: string;
  summary: string[];
  sections: { title: string; body: ReactNode }[];
}

export const TERMS: LegalDoc = {
  title: "Terms of Service",
  summary: [
    "The homepage we make you is free. You never owe anything for it.",
    "Nothing to pay while we build. You pay the flat $1,000 only if you approve the finished site.",
    "Once you pay, the site, its files and its design are yours.",
    "Hosting is included with no monthly fee. After launch, we fix anything we got wrong for free, and other changes are $150 a round.",
    "Two rounds of changes are included. Extra rounds are $150, and we always ask first.",
  ],
  sections: [
    {
      title: "Who we are",
      body: <><p>BringsUp ("we", "us") designs and builds websites for local businesses. These terms cover bringsup.com, the free homepages we make, and any website we build for you. By submitting one of our forms, signing, or paying, you agree to them.</p></>,
    },
    {
      title: "Your free homepage",
      body: <><p>If you ask us to, we make you a sample homepage from information that is already public, like your current website and reviews. It's an idea, not your live website. It lives only at a private link on bringsup.com that we send you, and it doesn't mean you're affiliated with us or have agreed to anything.</p><p>Don't want one? Reply to our email or write to <a href="mailto:jake@bringsup.com">jake@bringsup.com</a> and we'll delete it and won't contact you again.</p></>,
    },
    {
      title: "Building your website",
      body: <><p>When you fill in our start form, you're asking us to build your full website. We aim to send a private preview within about two weeks. Your project includes two rounds of changes after that preview, requested by form or email, and we keep count for you. Anything you send within two days of an updated preview is part of the same round. Fixing something we got wrong, like a typo or a wrong phone number, never counts as a round. Extra rounds are $150 each, and we always ask before charging. Brand-new pages or features that weren't in scope get a flat price before any work starts.</p><p>If we don't hear from you for 60 days after a preview, we take the preview down and delete the photos you sent us. You owe nothing, and you can reply anytime before then to pick it back up.</p></>,
    },
    {
      title: "Approval and payment",
      body: <><p>You pay nothing up front. If you approve your finished site, you pay a flat fee of $1,000 (US dollars) by card through Stripe when you approve it. Payments are processed through the Stripe account of InstateMe, our founder's other company, so its name appears on the payment page and receipt. If you decide not to approve it, you can walk away and you owe nothing. We don't publish an unapproved site.</p><p>Because you see and approve the finished work before paying, payments are generally non-refundable. If something we built doesn't work as shown in the approved preview, tell us within 30 days of launch and we'll fix it at no charge.</p></>,
    },
    {
      title: "Who owns what",
      body: <><p>Once you've paid, you own the finished website, its design and its files, and we'll hand over everything if you ask. Your domain always stays in your name. We may show your site in our portfolio unless you ask us not to.</p><p>You keep ownership of everything you send us, like your logo, photos and text. You give us permission to use it to build and run your site, and you confirm you have the right to share it. Stock photos we add are licensed for use on your website.</p></>,
    },
    {
      title: "The managed plan (optional)",
      body: <><p>After launch you can choose the managed plan for $49 (US dollars) a month, billed monthly by card through Stripe (processed through the Stripe account of InstateMe, as above). It includes small updates requested by email (text, hours, prices, menu items, photos, notices and links), usually done within a day; a daily check that your web address leads to your site and your email settings are intact, with a fix or exact steps if they aren't; a monthly check of your site against your Google listing; and reminders before your domain's renewal date. Larger work, like a new page or reworking a section, is $150 a round, and we always ask first.</p><p>You can cancel anytime from the link in your welcome email or at bringsup.com/managed/. The plan runs to the end of the month you've paid for, with no partial refunds. If you cancel, your site stays up, hosting stays included, and updates go back to $150 a round. Your domain stays in your name and registered where it is; renewing it is up to you.</p></>,
    },
    {
      title: "Hosting and changes after launch",
      body: <><p>Hosting is included with your website at no monthly cost. If we ever stop hosting sites, we'll give you at least 60 days' notice and move your site to a host of your choice, or hand you the files.</p><p>After launch, we fix anything we got wrong (something that doesn't match your approved preview, or details that were right on your start form) for free. Other changes, like new hours, specials, photos or text, are $150 a round, requested by email, and we always tell you before charging. The files are yours, so your own web person can edit them too.</p></>,
    },
    {
      title: "Your domain and email",
      body: <><p>Connecting your domain to your new site means changing two settings at your domain provider, which we explain step by step for your provider (or send straight to your web person). We never ask you to change the settings that run your email (MX records), and we check that your email still works before and after. You stay in charge of your domain account, and we aren't liable for issues caused by your provider or by changes we didn't make.</p></>,
    },
    {
      title: "Electronic signatures",
      body: <><p>You agree that signing our forms electronically, by drawing your signature or ticking a box to agree, is legally binding, the same as signing on paper, and that we can send agreements, receipts and notices to you by email.</p></>,
    },
    {
      title: "What we're not responsible for",
      body: <><p>We work hard to build sites that bring in customers, but we can't promise specific results, rankings or sales. Our sites are provided as approved, and to the fullest extent the law allows, our total responsibility for any claim related to our work is limited to the amount you paid us in the 12 months before the claim. We're not liable for indirect losses like lost profits.</p></>,
    },
    {
      title: "Ending things",
      body: <><p>Either of us can stop a project before you approve it, for any reason, and nobody owes anything. We may decline or stop work that is unlawful, harmful or infringes someone else's rights.</p></>,
    },
    {
      title: "Changes to these terms",
      body: <><p>If we update these terms, we'll change the date at the top of this page. The version in place when you approved your site applies to that project.</p></>,
    },
    {
      title: "Contact",
      body: <><p>Questions about these terms? Email <a href="mailto:jake@bringsup.com">jake@bringsup.com</a>.</p></>,
    },
  ],
};

export const PRIVACY: LegalDoc = {
  title: "Privacy Policy",
  summary: [
    "We collect only what we need to design and build your website.",
    "We never sell your information or share it for advertising.",
    "Card payments go straight to Stripe. We never see your card number.",
    "Ask us anytime to see or delete your information.",
  ],
  sections: [
    {
      title: "What we collect",
      body: <><ul><li><b>What you send us.</b> Your name, business name, email, phone, website, hours, services, photos, logo, signature and anything else you enter in our forms.</li><li><b>Public business information.</b> To design free concepts, we look at public information about local businesses, like their website, address, hours and reviews.</li><li><b>The website redesign tool.</b> When you use it, we save the web address and email you enter, the redesign we create, and a scrambled (one-way hashed) version of your IP address that we use only to prevent abuse. We never store your IP address itself.</li><li><b>Payments.</b> Stripe collects and processes your card details. We only see that a payment happened, the amount and your receipt email.</li></ul></>,
    },
    {
      title: "How we use it",
      body: <><p>To design, build, launch and look after your website; to send you previews, receipts and project emails; to answer your questions; and to keep our site and tools safe from abuse. We may send a business up to three short emails about a free concept, then we stop. Every one of those emails says how to opt out, and we honor it right away.</p></>,
    },
    {
      title: "Who helps us",
      body: <><p>We use a small set of trusted services to run BringsUp, and they only get what they need to do their job:</p><ul><li><b>Tally</b>, for our forms and file uploads</li><li><b>Stripe</b>, for payments (through the Stripe account of InstateMe, our founder's other company)</li><li><b>Supabase</b>, for storing redesign requests, projects and the files you upload</li><li><b>Cloudflare</b>, which hosts the websites we build</li><li><b>Anthropic (Claude)</b>, the AI that helps us draft designs and copy from your website's content</li><li><b>GitHub Pages</b>, which hosts bringsup.com</li><li>Our email provider, for sending and receiving email</li></ul><p>We don't sell your information, and we don't share it with advertisers. We'd only share it otherwise if the law requires us to.</p></>,
    },
    {
      title: "Cookies",
      body: <><p>bringsup.com doesn't use advertising or tracking cookies. Our form and payment providers may set the cookies they need to work securely.</p></>,
    },
    {
      title: "How long we keep it",
      body: <><p>Project information stays for as long as we're working together, plus the time we need for taxes and records. Free homepages and redesign requests that don't become projects are deleted within 12 months, or sooner if you ask.</p></>,
    },
    {
      title: "Your choices",
      body: <><p>You can ask to see, correct or delete your information, or to stop hearing from us, at any time. Email <a href="mailto:jake@bringsup.com">jake@bringsup.com</a> and we'll take care of it within 30 days. Depending on where you live, you may have extra rights under laws like the CCPA or GDPR, and we'll honor those too.</p></>,
    },
    {
      title: "Children",
      body: <><p>Our services are for businesses and aren't meant for anyone under 18.</p></>,
    },
    {
      title: "Security",
      body: <><p>We use reputable providers, encrypted connections and limited access to protect your information. No system is perfect, and if something ever went wrong that affected you, we'd tell you promptly.</p></>,
    },
    {
      title: "Changes",
      body: <><p>If we update this policy, we'll change the date at the top of this page. Big changes will be emailed to current customers.</p></>,
    },
    {
      title: "Contact",
      body: <><p>Questions about privacy? Email <a href="mailto:jake@bringsup.com">jake@bringsup.com</a>.</p></>,
    },
  ],
};

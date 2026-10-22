# BringsUp brand guide

One source of truth for the website, cold emails, prospect concept mockups and anything else with the BringsUp name on it.

## Name and positioning
- **Name:** BringsUp. One word, capital B and capital U. Never "Brings Up", "Bringsup" or "BRINGSUP".
- **Tagline:** Websites as good as your reviews. (The whole business in five words. Use it in the footer, social bios, email signature and link previews.)
- **Descriptor:** For the businesses your town already loves. (Supporting line, never the headline.)
- **Promise:** Your reviews say you're the best in town. Your website should too.
- **Offer:** A free homepage first, made only after they say yes. Then the owner fills in one 10-minute form (no calls), we build the full site and brand refresh, and they pay one flat $1,000 only when they approve the finished site. Preview in about two weeks, two rounds of changes. After launch: hosting stays included with no monthly fee, anything we got wrong is fixed free, other updates are $150 a round (same as an extra round), and the files are theirs so their own web person can edit them. No Care Plan for now.
- **The promise behind it:** See it first. Pay only if you love it. Nothing is charged before approval, and everything happens by email, so there's nothing to schedule.
- **Who we serve:** family-owned local businesses with strong reviews and an outdated website (European auto specialists, remodelers and custom carpenters, landscapers, upholsterers, framers, jewelers, tailors, high-end bakeries; see tools/RUNBOOK.md step 6 for the current list).

## Logo
- **Mark: the review bubble.** A speech bubble (what your customers say) with an up arrow inside (we bring it up). Ink `#16181D` bubble, Glow `#FFB37A` arrow. 48-unit grid: bubble body 40×36 with 10-unit corners, tail at the bottom left; arrow stroke 3.6 with round caps and joins, centered on the body.
- **Wordmark:** "BringsUp" in Bricolage Grotesque 800, letter-spacing -0.02em, Ink, converted to outlines. Cap height = 20/48 of the mark, centered on the bubble body.
- **Lockup:** mark left of wordmark, gap = 28% of mark size. Minimum mark size 16px (favicon). Clear space = half the mark on every side.
- **Colorways:** primary (Ink bubble, Glow arrow) on Paper, Sand or white; reverse (Paper bubble, Ink arrow) on Ink or dark photos; app icon (Glow bubble, Ink arrow on an Ink square) for avatars and home-screen icons.
- **Never** rotate or mirror the bubble (the tail always sits bottom left), outline it, add a second arrow, swap in a different icon, or put the mark on Ember.

### Asset files
All in `assets/brand/` (wordmark converted to outlines, so no font is needed):

| File | Use |
|---|---|
| `logo.svg` | Primary lockup on Paper, Sand or white |
| `logo-reverse.svg` | Lockup on Ink or dark photos |
| `mark.svg` / `mark-reverse.svg` / `mark-glow.svg` | Mark alone in each colorway |
| `avatar.png` | 400×400 profile picture for email, LinkedIn, Google Business |
| `wordmark.svg` | Wordmark alone, when the mark already appears nearby |
| `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, `favicon-32.png`, `/favicon.svg` | App and browser icons |
| `../og.png` | 1200x630 link preview for bringsup.com |

The visual version of this guide lives at `bringsup.com/brand/` (not indexed).

## Color
| Token | Hex | Use |
|---|---|---|
| Ink | `#16181D` | Text, dark sections, primary dark buttons, logo mark |
| Paper | `#FBFAF7` | Page background |
| Sand | `#F1EEE6` | Alternate section background |
| Line | `#E4E1D9` | Borders, section hairlines |
| Rule | `#D6D2C8` | Rules between list items |
| Ember | `#C2410C` | The one accent: the primary button, and the price that's due |
| Ember Deep | `#9A3412` | Accent text and links, Ember hover |
| Glow | `#FFB37A` | Accent on Ink only (logo arrow, buttons on dark) |
| Tint | `#FFE8DC` | Text selection only |
| Muted | `#3D414B` | Body copy |
| Subtle | `#5A5F6B` | Captions, fine print |

Rules: one accent (Ember) per screen. No gradients. No other hues in BringsUp-branded surfaces. Prospect concept mockups use the *prospect's* colors, not ours.

## Type
Typography carries the page. No decorative icons, badges or illustrations.
- **Display:** Bricolage Grotesque 800, letter-spacing -0.025em (-0.035em at the largest size). Two sizes only: page title `clamp(40px, 6.2vw, 84px)`, section title `clamp(30px, 3.6vw, 46px)`. Small headings (22px) use it too.
- **Body:** DM Sans 400/700. Body 18px, line-height 1.6. Lead paragraphs 20px (18px on phones). Small print 16px. Nothing on a phone is smaller than 16px.
- **No eyebrows.** A heading says what the section is; there's no uppercase label above it.
- Keep text to a readable measure (about 34em for leads, 40em for answers).

## Layout
- One rhythm for sections: a 1px hairline on top, generous space (104px desktop, 64px phone), and the heading sitting next to or above a short intro. Vary what follows: the work full width, the process as a ruled timeline, a letter, the FAQ.
- Lists are ruled (hairlines between items), never check-icon bullets. Numbered steps use a plain numeral, never a filled circle.
- Show real artifacts instead of decoration: the before/after, the sample homepages, the actual first email.
- No stat strips, chips or pills, no glowing buttons, no fade-in-on-scroll. Everything is visible without JavaScript.

## Shape
- Radius: 6px for buttons, inputs, cards and images. The slider handle is the only circle.
- Buttons: min height 52px (44px in the header). Primary = Ember fill + white text, one per screen. Secondary = 1.5px Ink outline, or a plain underlined text link. Ink fill for the header button and on-page "back" actions.
- Borders over shadows. A shadow is allowed only on the email artifact, to read as a sheet of paper.

## Motion
Almost none. Motion explains something or confirms an action; it is never decoration. Quick and ease-out (120 to 250ms), CSS first, and nothing ever makes someone wait to read.
- Hovers: 150 to 200ms color changes. Link underlines thicken and settle closer; they never draw in. The sample homepages scroll inside their frame on hover.
- Presses: a button settles 1px (and to 98.5%) while held. The arrow in a button leans 4px toward where it goes. No bounce, no ripple.
- Confirmations happen in place: a copy button turns its icon into a check and says "Copied" for two seconds; a fixed form field gets a small Success check.
- Opening and closing: FAQ answers open to their height, menus unfold over the page (never pushing it down), dialogs rise a few pixels as they fade in. Closing is a little quicker than opening.
- The before/after sways once the first time it's seen, to show it can be dragged. Its handle grows while held, and a click or arrow key glides it to the spot.
- On /try/, Desktop and Phone morph into each other instead of swapping, and the phone overlapping the browser lifts a little on hover.
- Images fade in once loaded, in space that was already reserved. Nothing shifts.
- No reveals on scroll, no parallax, no hand-drawn underlines, no lighting-up stars, no glow.
- Headline emphasis: a straight Ember underline (`.key`) under at most two short phrases in a headline, like "the best in town". It never draws in or animates.
- Everything respects `prefers-reduced-motion`, and everything that works without JavaScript today still does.

## Color in UI states
Functional colors are allowed only for form feedback: Error `#B42318` (border + message), Success `#1F7A4D` (check mark). Nothing decorative.

## Voice
- Plain, warm and specific. Write like a neighbor who happens to build websites.
- Their pride, not our pitch. Every headline should be about the owner's business, not about BringsUp.
- The owner test: would a busy bakery owner read the sentence to the end? If not, cut it.
- Lead with what's great about the business (their reviews, their history). Then show the gap.
- **Never** mention or quote a business's bad reviews. Never insult their current site; say "outdated" or "doesn't match your reputation".
- No jargon (SEO, conversion, UX), no hype words (revolutionary, cutting-edge), no emojis.
- Always say "flat $1,000". To owners, the free concept is "your new homepage" ("free concept" is fine internally). Never invent stats or client results.
- On the website, Jake speaks in the first person ("I"). Legal pages say "we".
- No em dashes, no exclamation marks, and none of the phrases on the banned list in tools/email_template.md.

### Microcopy
- Buttons say what happens, in the visitor's words: "Get my free concept", "Send me my free concept", "View the full homepage". Never "Submit", "Learn more" or "Click here".
- Form errors are helpful, not scolding, and offer a way out: "Add your web address, like rosasbakery.com. No website yet? Your Facebook or Google page works too."
- Confirmations say what happens next, in steps, and how to undo: "Almost there… Edit my details".
- Reassurance sits right under the action: "Free, no strings · No contract · You own everything".

## Email signature
```
Jake Silver
BringsUp, websites as good as your reviews
bringsup.com
```

## Website
- React + TypeScript (Vite), pre-rendered to static HTML at build time and deployed by a GitHub Action to GitHub Pages at bringsup.com. Run `npm install`, then `npm run dev` to work on it locally or `npm run build` to build. The homepage lives in `src/pages/home/`. Order: hero (the promise, Jake's one-paragraph intro, one button, then the before/after) → "Got an email from me?" (who Jake is, next to the actual first email) → sample homepages → what happens and what it costs (timeline, price, what's included, after launch) → FAQ → the request form. Shared base styles live in `src/components/site.css`; the sub-page header and footer in `src/components/Chrome.tsx`.
- Sample concepts on the site (`assets/work/`) are **fictional businesses**, generated with `tools/make_concept.py`, and must always be labeled as fictional with stock photos. Never show a real prospect's concept on the site without their written OK.
- The site's promises must stay true to the runbook: three cold emails maximum (one drip, never repeated), flat $1,000 paid only on approval, no calls, the owner keeps everything.
- Contact: `jake@bringsup.com` for everything: outreach, customers and support. It's the only address we send from or publish.
- The concept request form is the Tally form "Get your free homepage concept" (`bZ5vj0`, https://tally.so/r/bZ5vj0), embedded in the last section. Hidden fields: `source` (always `website`) and `ref` (copied from the page URL, e.g. `bringsup.com/?ref=marigold-bakery`). Submissions are emailed to the Tally account owner. Edit questions in Tally, not in the site code.
- Website redesigns: `/try/` takes a website and email, shows a blurred draft while it waits, and emails the finished homepage within the hour (backend in `supabase/`, see `supabase/README.md`). Set `REDESIGN_API` in `src/lib/config.ts` to "" to switch it off; then every "free concept" button uses the Tally form.
- Customer flow pages: `/start/` (Tally `Ar7yBl`), `/changes/` (`EqkMlA`), `/approve/` (`VpLDP6`, takes the $1,000 through Stripe). Their copy is in `src/pages/flow/FlowPage.tsx`. They're `noindex`; reach them from emails with `?ref=<slug>`.

## Concept mockup labeling
Every prospect concept carries a small footer: "Concept by BringsUp · Not affiliated with [Business] · Not a live site".

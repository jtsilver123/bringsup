# BringsUp brand guide

One source of truth for the website, cold emails, prospect concept mockups and anything else with the BringsUp name on it.

## Name and positioning
- **Name:** BringsUp. One word, capital B and capital U. Never "Brings Up", "Bringsup" or "BRINGSUP".
- **Tagline:** Websites for the businesses your town already loves.
- **Promise:** Your reviews say you're the best in town. Your website should too.
- **Offer:** Free homepage concept first. Then one flat $1,000 for a new website and brand refresh: $500 to start, $500 at launch, live in about two weeks. Optional Care Plan $79/mo.
- **Who we serve:** family-owned local businesses with strong reviews and an outdated website (bakeries, diners and delis, auto shops, florists, plumbers and HVAC, hardware stores).

## Logo
- Mark: an up arrow (24-unit grid, stroke 2.8, round caps and joins) in Glow `#FFB37A` on an Ink `#16181D` rounded square. Radius = 28% of the tile; the arrow fills about 56% of it.
- Wordmark: "BringsUp" in Bricolage Grotesque 800, letter-spacing -0.02em, Ink. Cap height = half the mark.
- Lockup: mark left of wordmark, gap = 28% of mark size. Minimum mark size 24px. Clear space on every side = half the mark.
- Reverse (on Ink or photos): Paper tile with an Ink arrow, Paper wordmark. This is the only other colorway.
- Never recolor the arrow outside these two colorways, stretch or rotate the mark, outline the wordmark, or put either on Ember.

### Asset files
All in `assets/brand/` (wordmark converted to outlines, so no font is needed):

| File | Use |
|---|---|
| `logo.svg` | Primary lockup on Paper, Sand or white |
| `logo-reverse.svg` | Lockup on Ink or dark photos |
| `mark.svg` / `mark-reverse.svg` | Mark alone: avatars, social profiles, small spaces |
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
| Line | `#E4E1D9` | Borders, dividers |
| Ember | `#C2410C` | The one accent: primary buttons, numbers, icons, CTA panel |
| Ember Deep | `#9A3412` | Accent text and links, Ember hover |
| Glow | `#FFB37A` | Accent on Ink only (logo arrow, buttons on dark) |
| Tint | `#FFE8DC` | Icon tiles, eyebrow pills |
| Muted | `#3D414B` | Body copy |
| Subtle | `#5A5F6B` | Captions, fine print |

Rules: one accent (Ember) per screen. No gradients. No other hues in BringsUp-branded surfaces. Prospect concept mockups use the *prospect's* colors, not ours.

## Type
- **Display:** Bricolage Grotesque 800, letter-spacing -0.03em, line-height ~1.0. H1 clamp(42–80px), H2 clamp(34–56px).
- **Body:** DM Sans 400/500/700. Body 17–20px, line-height 1.55.
- **Eyebrow:** DM Sans 700, 15px, uppercase, +0.06em, Ember Deep. Every section opens with one.

## Shape
- Radius: 12px (inputs, icon tiles), 20px (cards), 32px (big panels), pill (all buttons).
- Buttons: pill, min height 56px (44px in nav). Primary = Ember fill + white text. Secondary = 2px Ink outline. On dark = Glow fill + Ink text.

## Voice
- Plain, warm and specific. Write like a neighbor who happens to build websites.
- Lead with what's great about the business (their reviews, their history). Then show the gap.
- **Never** mention or quote a business's bad reviews. Never insult their current site; say "outdated" or "doesn't match your reputation".
- No jargon (SEO, conversion, UX), no hype words (revolutionary, cutting-edge), no emojis.
- Always say "flat $1,000" and "free concept". Never invent stats or client results.

## Email signature
```
Jake Silver
BringsUp — websites for the businesses your town already loves
bringsup.com
```

## Website
- One page at `index.html`, deployed by GitHub Pages to bringsup.com. Order: hero with before/after slider → "Got an email from Jake?" (for prospects arriving from outreach) → why it matters → sample concepts → how it works → included, pricing, comparison → who we are and our promises → FAQ → concept request form.
- Sample concepts on the site (`assets/work/`) are **fictional businesses**, generated with `tools/make_concept.py`, and must always be labeled as fictional with stock photos. Never show a real prospect's concept on the site without their written OK.
- The site's promises must stay true to the runbook: two emails maximum, flat $1,000 split $500/$500, the owner keeps everything.
- Contact: `hello@bringsup.com` for general mail, `jake@bringsup.com` for outreach replies.

## Concept mockup labeling
Every prospect concept carries a small footer: "Concept by BringsUp · Not affiliated with [Business] · Not a live site".

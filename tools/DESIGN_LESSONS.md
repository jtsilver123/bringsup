# Design lessons from real previews

Read this before building any homepage (tools/email_template.md "Building their homepage"). Each line is something a real
preview taught us. When a build runs into something new, it goes here, so every next site starts better.
(The hourly operator can't edit the repo: it appends new lessons to the tracker doc `meta/lessons`, and the next
development session folds them into this file.)

## Content and facts
- **Every fact needs a source** (`sources.md`). If reviews can't be checked (Google or Yelp blocked, rate-limited), quote none and make no review claims. A page with no quotes beats one with a wrong one. (NakedQ, Oct 2026)
- **Multi-location businesses:** put every location on the homepage with address (tap for directions), tap-to-call number, and today's open/closed status from their real hours. It's the thing their current site usually hides. (NakedQ)
- **Hours run in the business's own time zone.** Arizona has no daylight saving: use `America/Phoenix`, never Denver or Los Angeles. (NakedQ)
- **One ordering link may cover every location.** Check each location page: if they all point to the same Toast/Square link (a location picker), use that one link everywhere instead of guessing per-location links. (NakedQ)
- **Use their story's own words for the headline.** "Smoked naked. Sauced your way." came straight from their About page ("we serve our meats naked, you choose the sauce"). Their voice beats a clever line of ours.

## Look and feel
- **Reuse a distinctive brand font.** If their current site uses a font customers know them by (NakedQ's typewriter face), load the same file from their site (check it allows cross-origin use: `access-control-allow-origin: *`) for headlines, nav, labels and buttons. Keep paragraphs in a plain, readable sans so phones stay easy to read. (NakedQ, Jake's call)
- **Their own photos first.** Wix and Squarespace serve the original size if you drop the resize part of the URL, or ask for an exact size (`/v1/fill/w_1200,h_900,al_c,q_82/<file>`). Make a contact sheet of every photo before choosing.
- **Images: always `height:auto`.** Give every `<img>` its `width` and `height` attributes and set `img{height:auto}`, or `aspect-ratio` is ignored and photos stretch into tall strips. (NakedQ hero)

## How the preview behaves (handled by /try, but build with it in mind)
- **Links that leave the page open in a new tab.** The preview sits in a frame, and Toast, Google Maps and Stripe refuse to load inside one, so a click there would just hang. /try adds `target="_blank"` to every web, phone, email and text link automatically. Don't add your own targets. (NakedQ "Order pickup")
- **In-page links (`#find`) must keep working.** /try adds `<base href="about:srcdoc">` so they scroll in place instead of loading BringsUp inside the frame. Use plain `#id` links and never relative page links (the page must be self-contained anyway). (NakedQ "Find the closest one")
- **The phone frame can be wider than 390px** (about 420 on big screens). Layouts must be fluid: no fixed 390px widths.

## Capturing their site today
- **Busy sites rate-limit repeat visits.** The capture tool loads each page once per size for both pictures. If publishing prints "No whole-page pictures for the slider", wait a few minutes and republish in place (`outreach <slug> <dir> <short>`). (NakedQ, Wix)
- **Some sites show a bot check ("Verify you are human") to automated browsers**, sometimes with a normal 200 status. After every publish, open the stored "today" pictures and make sure they show their real site, never a challenge page. If one does, republish later. (NakedQ, Wix on phone)

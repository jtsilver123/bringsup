# Sample work for bringsup.com

The sample sites on the homepage are **fictional businesses** (`.example` domains, 555 phone numbers, stock photos). They show the work without using a real prospect's name. Never put a real prospect's site on bringsup.com without their written OK.

## Where they come from

Each sample is a `SiteContent` file in `tools/site-kit/examples/`, built with the same kit as customer sites:

    node tools/site-kit/build.ts tools/site-kit/examples/marigold.json work/samples/marigold

| Homepage name (`public/assets/work/<name>-*`) | Source |
| --- | --- |
| `bakery` (Marigold Bakery) | `tools/site-kit/examples/marigold.json` |
| `auto` (Linde Motorwerk) | `tools/site-kit/examples/linde.json` |
| `carpentry` (Hartwell Joinery) | `tools/site-kit/examples/hartwell.json` |

`before.html` (in this folder) is the made-up "old site" for Marigold Bakery in the homepage before/after slider.

## Refreshing the images

Open the built `index.html` in a browser (Playwright's Chromium works) and save to `public/assets/work/`:

- `<name>-full.jpg`: a full-page screenshot at 1440 wide, saved 1200 wide. Update that sample's `height` in `src/pages/home/data.ts` to the new image height.
- `<name>-full@2x.webp`: the same full page as a 2400-wide WebP, for the sharp viewer.
- `<name>-phone.jpg`: the top of the page in a 390x844 phone viewport.
- `bakery-hero.jpg`, and `bakery-before.jpg` from `before.html`: the top of the page at 1664x1040, for the before/after slider.

The link preview cards (`tools/og/card.html`) use `bakery-hero.jpg`, `bakery-before.jpg` and `carpentry-hero.jpg`; re-run `node tools/make-og.ts` after changing any of them.

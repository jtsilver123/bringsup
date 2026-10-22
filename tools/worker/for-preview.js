// Cloudflare Worker on bringsup.com/for/* : serves a prospect's preview page at its short address, with a link preview card
// (iMessage, Gmail, WhatsApp, Slack) made for that business instead of BringsUp's generic one.
// It fetches the /try/ page from the origin (GitHub Pages) and rewrites the title and share tags; the /try/ app reads the
// short code from the path and loads the preview itself. Deploy: tools/worker/README.md.
const API = "https://rgeeynodxvusivfbaxfu.supabase.co/functions/v1/redesign";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

export default {
  async fetch(req) {
    const url = new URL(req.url);
    const m = url.pathname.match(/^\/for\/([a-z0-9-]{3,60})\/?$/i);
    if (!m) return fetch(req);
    const short = m[1].toLowerCase();
    const [metaRes, page] = await Promise.all([
      fetch(`${API}?for=${short}&meta=1`, { cf: { cacheTtl: 300, cacheEverything: true } }).catch(() => null),
      fetch(new URL("/try/", url.origin), { cf: { cacheTtl: 300 } }),
    ]);
    if (!page.ok) return fetch(req);
    const meta = metaRes && metaRes.ok ? await metaRes.json().catch(() => null) : null;
    const headers = new Headers(page.headers);
    headers.set("content-type", "text/html; charset=utf-8");
    headers.set("cache-control", "public, max-age=300");
    headers.set("x-robots-tag", "noindex");
    // Unknown code: the app shows "We couldn't find that redesign"; keep the generic card.
    if (!meta || !meta.business_name) return new Response(page.body, { status: 404, headers });

    const name = meta.business_name;
    const title = `${name}, this could be your new website`;
    const desc = `Made just for ${name} by Jake at BringsUp. Take a look. Like it? It can be yours, and you pay nothing unless you love the finished site.`;
    const set = (attr, value) => ({ element(el) { el.setAttribute(attr, value); } });
    let rw = new HTMLRewriter()
      .on("title", { element(el) { el.setInnerContent(title); } })
      .on('meta[name="description"]', set("content", desc))
      .on('link[rel="canonical"]', set("href", url.origin + url.pathname))
      .on('meta[property="og:url"]', set("content", url.origin + url.pathname))
      .on('meta[property="og:title"], meta[name="twitter:title"]', set("content", title))
      .on('meta[property="og:description"], meta[name="twitter:description"]', set("content", desc))
      .on("head", { element(el) { el.append('<meta name="robots" content="noindex">', { html: true }); } });
    if (meta.og_image) {
      rw = rw
        .on('meta[property="og:image"], meta[name="twitter:image"]', set("content", meta.og_image))
        .on('meta[property="og:image:type"]', set("content", "image/jpeg"))
        .on('meta[property="og:image:alt"], meta[name="twitter:image:alt"]', set("content", `A new website made for ${esc(name)}`));
    }
    return rw.transform(new Response(page.body, { status: 200, headers }));
  },
};

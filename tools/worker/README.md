# bringsup.com/for/* worker

Short preview links (`bringsup.com/for/<slug>-<code>`) with a link preview card made for that business. See `for-preview.js`.

Deploy (only when the script changes; the hourly operator never needs to):

    cd tools/worker && CLOUDFLARE_API_TOKEN=... npx wrangler@4.152.0 deploy

The token needs Account → Workers Scripts: Edit and Zone (bringsup.com) → Workers Routes: Edit.
If the worker is ever down, `/for/` links still work: GitHub Pages serves 404.html, which forwards to `/try/?for=<code>` (with the generic BringsUp card).

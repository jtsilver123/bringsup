# Instant redesigns backend

Powers `bringsup.com/try/`: a visitor enters their website and email, and gets an AI-redesigned homepage in about a minute.

```
/try/ (browser)  --POST {url, email}-->  functions/redesign  --> reads their site (extract.ts)
                                                              --> Claude writes the new homepage as JSON (prompt.ts)
                                                              --> saves it in table `redesigns`
                 <--{id, concept, images}--                   (GET ?id= returns a saved one for share links)
/try/ renders the JSON with assets/js/concept-render.js inside a sandboxed iframe.
```

## Where it runs
Supabase project `bringsup` (ref `rgeeynodxvusivfbaxfu`, Personal Projects org). The function URL is
`https://rgeeynodxvusivfbaxfu.supabase.co/functions/v1/redesign`.

## Modes
- **Queue (current)**: no `ANTHROPIC_API_KEY`. Requests are saved as `queued`, and an hourly scheduled Claude Code task designs them on the Claude subscription and emails each visitor. See `tools/QUEUE_WORKER.md`.
- **Instant**: add `ANTHROPIC_API_KEY` and set `instant: true` in `assets/js/config.js`. Visitors see their redesign in about a minute.

## Deploying changes
Run `tools/bundle_function.sh`, push, then deploy `supabase/dist/redesign.ts` (dashboard editor, CLI, or the Management API). Deploys through the API turn JWT verification back on, so switch it off again afterwards.

## One-time setup (BringsUp's own Supabase project only)
1. Apply the files in `migrations/` in order.
2. Deploy `functions/redesign` with JWT verification off (see `config.toml`; the function does its own validation and rate limits).
3. Add secrets under Edge Functions → Secrets:
   - `WORKER_TOKEN` (long random string; lets the queue worker read and publish requests)
   - `ANTHROPIC_API_KEY` (only for instant mode)
   - `IP_SALT` (any long random string; visitor IPs are stored only as salted hashes)
   - optional: `DAILY_CAP` (default 150 redesigns a day site-wide), `PER_VISITOR_DAILY` (default 3), `ALLOWED_ORIGINS`
4. Set `api` in `assets/js/config.js` to `https://<project-ref>.supabase.co/functions/v1/redesign`. That switches on the homepage form and `/try/`.

## Day to day
- Every request is a row in `redesigns` (email, website, status, the generated content). Filter `status = 'done'` for leads.
- `/try/?id=<id>` shows any saved redesign. `/try/?demo` shows a sample without calling the backend.
- Cost is roughly 5–10 cents per redesign (Claude Opus 5.5). The daily cap bounds the worst case.

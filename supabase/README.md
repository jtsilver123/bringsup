# BringsUp backend

Two Supabase Edge Functions in `functions/`, with their tables in `migrations/`:

- `redesign`: instant redesigns for `bringsup.com/try/` and the private preview links for cold-email prospects (`bringsup.com/for/...`).
- `projects`: customer projects from the start form to the live site (Tally webhooks, rounds of changes, payments, the builder's jobs). See the header of `functions/projects/index.ts` for its endpoints and `tools/OPERATOR.md` for how the operator uses it.

## Instant redesigns

A visitor enters their website and email, and gets a redesigned homepage by email, usually within the hour.

```
/try/ (browser)  --POST {url, email}-->  functions/redesign  --> reads their site (extract.ts)
                 <--202 {id, queued}--                       --> saves it as `queued` in table `redesigns`
hourly operator  --GET ?queue=1-->       functions/redesign  (the prompt and schema from prompt.ts, per request)
                 --POST {action: "complete", id, concept}--> saves the new homepage JSON as `done`
/try/?id=<id>    --GET ?id=-->           functions/redesign  --> {concept, images}
/try/ renders the JSON with src/lib/concept-render.ts inside a sandboxed iframe.
```

Redesigns are made only on the Claude subscription, never an API key: the hourly "BringsUp operator" task designs the queued ones (OPERATOR.md step 4) and emails each visitor. See `tools/QUEUE_WORKER.md`.

## Where it runs
Supabase project `bringsup` (ref `rgeeynodxvusivfbaxfu`, Personal Projects org). The function URLs are
`https://rgeeynodxvusivfbaxfu.supabase.co/functions/v1/redesign` and `.../functions/v1/projects`.

## Deploying changes
Merge to main. `.github/workflows/functions.yml` deploys `redesign` and `projects` from `supabase/functions/` with the Supabase CLI (repo secret `SUPABASE_ACCESS_TOKEN`), keeps JWT verification off per `config.toml`, and checks both answer. To deploy by hand: `SUPABASE_ACCESS_TOKEN=... npx supabase@2 functions deploy redesign projects --project-ref rgeeynodxvusivfbaxfu --use-api`. Database changes in `migrations/` are still applied by hand. (`tools/bundle_function.sh` only makes a single-file copy in `dist/` for the dashboard editor; deploys don't need it.)

## One-time setup (BringsUp's own Supabase project only)
1. Apply the files in `migrations/` in order.
2. Deploy both functions with JWT verification off (see `config.toml`; they do their own validation, signatures and rate limits).
3. Add secrets under Edge Functions → Secrets:
   - `WORKER_TOKEN` (long random string, at least 24 characters; lets the operator's tools call both functions)
   - `IP_SALT` (redesign; any long random string; visitor IPs are stored only as salted hashes)
   - `TALLY_SIGNING_SECRET` (projects; the signing secret of the Tally webhooks)
   - optional for redesign: `DAILY_CAP` (default 150 redesigns a day site-wide), `PER_VISITOR_DAILY` (default 3), `ALLOWED_ORIGINS`
   - optional for projects: the Tally form ids (`TALLY_START_FORM`, `TALLY_CHANGES_FORM`, `TALLY_EXTRA_FORM`, `TALLY_APPROVE_FORM`), `APPROVE_PRICE_CENTS` (default 100000), `MONTHLY_CAP` (default 8)
4. Set `REDESIGN_API` and `PROJECTS_API` in `src/lib/config.ts` to the function URLs. `REDESIGN_API` switches on the homepage form and `/try/`.

## Day to day
- Every redesign request is a row in `redesigns` (email, website, status, the generated content). Filter `status = 'done'` for leads.
- `/try/?id=<id>` shows any saved redesign. `/try/?demo` shows a sample without calling the backend.
- Redesigns run on the Claude subscription (no per-request cost). The daily cap bounds the queue.
- Customer projects are rows in `projects`, with their history in `project_events`; `node tools/projects-worker.ts health` shows alerts and stuck jobs.

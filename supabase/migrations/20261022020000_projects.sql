-- Customer projects after a "yes": one row per business, and an append-only log of everything that happens.
-- Rows are written by the `projects` edge function (Tally webhooks and the site builder). Nobody edits them by hand.
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  ref text not null unique,                       -- the slug that rides along as ?ref= on every link
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  business_name text not null default '',
  owner_name text not null default '',
  email text not null default '',
  phone text not null default '',
  current_site text not null default '',
  status text not null default 'started' check (status in (
    'started',            -- start form in; the builder makes the first version
    'preview_sent',       -- preview emailed; waiting on the owner
    'changes_requested',  -- a round of changes is waiting for the builder
    'awaiting_extra',     -- both rounds used; asked to pay $150 for another
    'approved',           -- approved (and paid, when Stripe is connected)
    'launching',          -- domain steps sent; waiting for DNS
    'live',
    'cancelled'
  )),
  rounds_included integer not null default 2,
  rounds_extra integer not null default 0,        -- paid extra rounds ($150 each)
  rounds_used integer not null default 0,
  pending_changes text,                           -- the change request the builder should apply next
  held_changes text,                              -- a request that arrived after the included rounds, applied once an extra round is paid
  todo text,                                      -- the builder's next job (see projects_todo_check); null = nothing to do
  preview_url text,
  live_url text,
  domain text not null default '',
  domain_provider text not null default '',
  domain_helper_email text not null default '',
  care_plan boolean not null default false,
  paid_cents integer not null default 0,
  brief jsonb not null default '{}'::jsonb,       -- the start form, by question
  site jsonb,                                     -- the site's content (tools/site-kit SiteContent); the builder edits and redeploys it
  pages_project text not null default '',         -- Cloudflare Pages project serving the site
  files jsonb not null default '[]'::jsonb,       -- uploaded photos and logo
  next_check_at timestamptz                       -- when the builder should look again (DNS checks)
);

create table if not exists public.project_events (
  id bigint generated always as identity primary key,
  project_id uuid references public.projects(id) on delete cascade,  -- null only for submissions that matched no project
  created_at timestamptz not null default now(),
  kind text not null,      -- start | changes | changes_over_limit | extra_round | approve | payment | built | preview_sent | revised | launch_steps_sent | live | email | note | error
  round integer,           -- for changes: which round this was (1, 2, then 3+ for paid extras)
  summary text not null default '',
  payload jsonb not null default '{}'::jsonb
);

create index if not exists project_events_project_idx on public.project_events (project_id, created_at);
create index if not exists projects_status_idx on public.projects (status, updated_at);

alter table public.projects enable row level security;
alter table public.project_events enable row level security;
-- No policies: only the edge function (service role) can read or write.

-- Hardening (operator audit): exactly-once webhooks, safe job claiming, and alerts someone will see.
alter table public.project_events add column if not exists response_id text;
create unique index if not exists project_events_response_idx on public.project_events (response_id) where response_id is not null;

alter table public.projects add column if not exists changes_seq integer not null default 0;  -- bumps on every appended change request
alter table public.projects add column if not exists claimed_until timestamptz;               -- builder lease
alter table public.projects add column if not exists attempts integer not null default 0;     -- failed tries at the current job
alter table public.projects add column if not exists last_error text;
alter table public.projects add column if not exists last_customer_touch_at timestamptz;     -- for reminders and stuck-project checks
alter table public.projects add column if not exists domain_helper text not null default ''; -- "I'll do it" or "My web person will"

create table if not exists public.alerts (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  source text not null,            -- projects | redesign | builder | health
  ref text,
  message text not null,
  payload jsonb not null default '{}'::jsonb,
  resolved_at timestamptz
);
alter table public.alerts enable row level security;

-- Hand the builder up to `n` jobs, each leased for 45 minutes so overlapping runs never work the same project.
create or replace function public.claim_project_jobs(n integer default 5)
returns setof public.projects
language sql
as $$
  update public.projects p
     set claimed_until = now() + interval '45 minutes', attempts = p.attempts + 1
   where p.id in (
     select id from public.projects
      where todo is not null
        and (claimed_until is null or claimed_until < now())
        and coalesce(next_check_at, now()) <= now()
        and attempts < 5
      order by updated_at
      limit n
      for update skip locked)
  returning p.*;
$$;
revoke all on function public.claim_project_jobs(integer) from public, anon, authenticated;

-- Uploaded photos and logos are copied here from Tally, whose file links expire.
insert into storage.buckets (id, name, public) values ('project-files', 'project-files', true) on conflict (id) do nothing;

-- Every Tally submission, raw, exactly once. The primary key makes retried deliveries harmless.
create table if not exists public.webhook_receipts (
  response_id text primary key,
  received_at timestamptz not null default now(),
  form_id text not null,
  ref text,
  payload jsonb not null
);
alter table public.webhook_receipts enable row level security;

alter table public.projects drop constraint if exists projects_todo_check;
alter table public.projects add constraint projects_todo_check
  check (todo in ('build', 'revise', 'offer_extra', 'launch', 'check_dns', 'care_edit', 'reply_out_of_scope', 'remind'));

-- Follow-ups sent within 2 days of a new preview join that round instead of using another (owner walkthrough).
alter table public.projects add column if not exists last_preview_at timestamptz;

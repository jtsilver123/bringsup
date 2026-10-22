-- One row per hourly operator run (its heartbeat). The public ?pulse=1 endpoint reads the newest one so an outside
-- watchdog (.github/workflows/watchdog.yml) notices when the operator stops running.
create table if not exists public.operator_runs (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  summary text
);
alter table public.operator_runs enable row level security;
create index if not exists operator_runs_at on public.operator_runs (at desc);

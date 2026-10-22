-- Operator and outreach audit fixes.

-- Alerts can be closed once handled (projects-worker resolve), with a note on what was done.
alter table public.alerts add column if not exists resolution text;

-- One free follow-up per round after an updated preview: remembers which round already used it.
alter table public.projects add column if not exists grace_round integer;

-- Redesign queue claims, so overlapping runs never design the same request twice.
alter table public.redesigns add column if not exists claimed_until timestamptz;

-- Preview opens and "Start my website" clicks on /for/ links, for the outreach tracker.
alter table public.redesigns add column if not exists first_viewed_at timestamptz;
alter table public.redesigns add column if not exists last_viewed_at timestamptz;
alter table public.redesigns add column if not exists view_count integer not null default 0;
alter table public.redesigns add column if not exists start_clicked_at timestamptz;

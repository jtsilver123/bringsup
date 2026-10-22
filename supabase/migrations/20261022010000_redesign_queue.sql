-- Queue mode: without ANTHROPIC_API_KEY the function saves what it read from the site
-- and a scheduled Claude Code task designs the homepage and emails the link.
alter table public.redesigns drop constraint if exists redesigns_status_check;
alter table public.redesigns add constraint redesigns_status_check
  check (status in ('pending', 'queued', 'done', 'skipped', 'error'));
alter table public.redesigns add column if not exists site jsonb;
alter table public.redesigns add column if not exists emailed_at timestamptz;
create index if not exists redesigns_queued_idx on public.redesigns (created_at) where status = 'queued';

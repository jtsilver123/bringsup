-- Instant homepage redesigns requested from bringsup.com/try/.
-- Only the edge function (service role) reads or writes this table.
create table if not exists public.redesigns (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  url text not null default '',
  email text not null,
  ip_hash text not null,
  status text not null default 'pending' check (status in ('pending', 'done', 'skipped', 'error')),
  business_name text,
  content jsonb,
  images jsonb,
  error text,
  input_tokens integer,
  output_tokens integer
);

create index if not exists redesigns_created_at_idx on public.redesigns (created_at desc);
create index if not exists redesigns_ip_hash_idx on public.redesigns (ip_hash, created_at desc);
create index if not exists redesigns_email_idx on public.redesigns (email, created_at desc);

alter table public.redesigns enable row level security;
-- No policies: anon and authenticated users get no access. The service role bypasses RLS.

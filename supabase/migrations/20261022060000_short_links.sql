-- Short, readable preview links: bringsup.com/for/<slug>-<8 chars>. The 8 random characters keep a preview private.
alter table public.redesigns add column if not exists short text;
create unique index if not exists redesigns_short on public.redesigns (short) where short is not null;

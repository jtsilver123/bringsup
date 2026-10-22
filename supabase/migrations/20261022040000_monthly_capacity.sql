-- When this month's cap of new sites (MONTHLY_CAP in the projects function) is reached, a new project gets the date its
-- build begins: the first business day of next month. The operator sends the start email right away and builds on that date.
alter table public.projects add column if not exists starts_on date;
create index if not exists projects_created_at on public.projects (created_at);

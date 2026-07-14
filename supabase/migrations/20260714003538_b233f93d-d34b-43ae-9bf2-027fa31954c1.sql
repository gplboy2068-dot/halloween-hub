create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  path text,
  referrer text,
  session_id text,
  user_id uuid references auth.users(id) on delete set null,
  props jsonb not null default '{}'::jsonb,
  user_agent text,
  created_at timestamptz not null default now()
);

create index analytics_events_created_at_idx on public.analytics_events (created_at desc);
create index analytics_events_event_idx on public.analytics_events (event, created_at desc);
create index analytics_events_path_idx on public.analytics_events (path, created_at desc);

grant select on public.analytics_events to authenticated;
grant all on public.analytics_events to service_role;

alter table public.analytics_events enable row level security;

create policy "Admins read analytics"
on public.analytics_events for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));
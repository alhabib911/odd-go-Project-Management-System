create table public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 160),
  email text not null check (char_length(trim(email)) between 3 and 320),
  company text check (company is null or char_length(company) <= 160),
  phone text check (phone is null or char_length(phone) <= 40),
  message text not null check (char_length(trim(message)) between 1 and 5000),
  source text not null default 'website',
  status text not null default 'New'
    check (status in ('New', 'Contacted', 'Qualified', 'Converted', 'Lost')),
  created_at timestamptz not null default now()
);

create index leads_created_at_idx on public.leads (created_at desc);

alter table public.leads enable row level security;

grant insert on public.leads to anon, authenticated;
grant select, update, delete on public.leads to authenticated;

create policy "Public website can submit new leads"
  on public.leads
  for insert
  to anon, authenticated
  with check (status = 'New' and source = 'website');

create policy "Authenticated users can read leads"
  on public.leads
  for select
  to authenticated
  using ((auth.jwt() ->> 'email') = 'devcluster24@gmail.com');

create policy "Authenticated users can update leads"
  on public.leads
  for update
  to authenticated
  using ((auth.jwt() ->> 'email') = 'devcluster24@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'devcluster24@gmail.com');

create policy "Authenticated users can delete leads"
  on public.leads
  for delete
  to authenticated
  using ((auth.jwt() ->> 'email') = 'devcluster24@gmail.com');

create table public.workspace_data (
  key text primary key check (
    key in (
      'dev-cluster-projects',
      'dev-cluster-tasks',
      'dev-cluster-clients',
      'dev-cluster-activity',
      'dev-cluster-team',
      'dev-cluster-teams',
      'dev-cluster-team-activity',
      'dev-cluster-role-requests',
      'dev-cluster-profile'
    )
    or key like 'dev-cluster-profile:%'
    or key like 'dev-cluster-profile-documents:%'
  ),
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.workspace_data enable row level security;

grant select, insert, update on public.workspace_data to authenticated;

create policy "Workspace owner can read workspace data"
  on public.workspace_data
  for select
  to authenticated
  using ((auth.jwt() ->> 'email') = 'devcluster24@gmail.com');

create policy "Workspace owner can insert workspace data"
  on public.workspace_data
  for insert
  to authenticated
  with check ((auth.jwt() ->> 'email') = 'devcluster24@gmail.com');

create policy "Workspace owner can update workspace data"
  on public.workspace_data
  for update
  to authenticated
  using ((auth.jwt() ->> 'email') = 'devcluster24@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'devcluster24@gmail.com');
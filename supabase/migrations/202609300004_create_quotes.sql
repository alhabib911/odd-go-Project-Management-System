create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 160),
  email text not null check (char_length(trim(email)) between 3 and 320),
  phone text check (phone is null or char_length(phone) <= 40),
  message text not null check (char_length(trim(message)) between 1 and 5000),
  status text not null default 'New'
    check (status in ('New', 'Reviewing', 'Quoted', 'Accepted', 'Declined')),
  created_at timestamptz not null default now()
);

create index quotes_created_at_idx on public.quotes (created_at desc);

alter table public.quotes enable row level security;

grant insert on public.quotes to anon, authenticated;
grant select, update, delete on public.quotes to authenticated;

create policy "Public website can submit new quotes"
  on public.quotes
  for insert
  to anon, authenticated
  with check (status = 'New');

create policy "Owner can read quotes"
  on public.quotes
  for select
  to authenticated
  using ((auth.jwt() ->> 'email') = 'devcluster24@gmail.com');

create policy "Owner can update quotes"
  on public.quotes
  for update
  to authenticated
  using ((auth.jwt() ->> 'email') = 'devcluster24@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'devcluster24@gmail.com');

create policy "Owner can delete quotes"
  on public.quotes
  for delete
  to authenticated
  using ((auth.jwt() ->> 'email') = 'devcluster24@gmail.com');
alter policy "Authenticated users can read leads"
  on public.leads
  using ((auth.jwt() ->> 'email') = 'devcluster24@gmail.com');

alter policy "Authenticated users can update leads"
  on public.leads
  using ((auth.jwt() ->> 'email') = 'devcluster24@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'devcluster24@gmail.com');

alter policy "Authenticated users can delete leads"
  on public.leads
  using ((auth.jwt() ->> 'email') = 'devcluster24@gmail.com');

alter policy "Workspace owner can read workspace data"
  on public.workspace_data
  using ((auth.jwt() ->> 'email') = 'devcluster24@gmail.com');

alter policy "Workspace owner can insert workspace data"
  on public.workspace_data
  with check ((auth.jwt() ->> 'email') = 'devcluster24@gmail.com');

alter policy "Workspace owner can update workspace data"
  on public.workspace_data
  using ((auth.jwt() ->> 'email') = 'devcluster24@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'devcluster24@gmail.com');
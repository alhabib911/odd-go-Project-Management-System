alter table public.workspace_data
  drop constraint if exists workspace_data_key_check;

alter table public.workspace_data
  add constraint workspace_data_key_check check (
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
  );
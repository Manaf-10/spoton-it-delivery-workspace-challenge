create table if not exists work_items (
  id text primary key,
  title text not null,
  description text not null,
  type text not null check (type in ('feature', 'bug', 'improvement', 'maintenance')),
  status text not null check (status in ('backlog', 'planned', 'in_progress', 'qa', 'ready_for_release', 'released')),
  priority text not null check (priority in ('low', 'medium', 'high', 'urgent')),
  assignee text not null,
  due_date date,
  created_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists qa_checks (
  id text primary key,
  work_item_id text not null references work_items(id) on delete cascade,
  test_title text not null,
  expected_result text not null,
  actual_result text,
  status text not null check (status in ('pending', 'passed', 'failed')),
  tester text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists releases (
  id text primary key,
  version text not null unique,
  release_date date not null,
  summary text not null,
  deployment_status text not null check (deployment_status in ('draft', 'scheduled', 'deployed', 'rolled_back')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists release_work_items (
  release_id text not null references releases(id) on delete cascade,
  work_item_id text not null references work_items(id) on delete restrict,
  primary key (release_id, work_item_id)
);
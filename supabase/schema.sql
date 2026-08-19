-- LPS Command Center — Supabase schema + Row Level Security
-- Run this once in Supabase: Project → SQL Editor → New query → paste → Run

create extension if not exists "pgcrypto";

-- ========== TABLES ==========

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists company_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  unique (company_id, user_id)
);

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  building text,
  current_week int not null default 1,
  milestone text,
  created_at timestamptz not null default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  trade text,
  zone text,
  week int not null default 1,
  duration int not null default 1,
  status text not null default 'Ready',
  predecessor text,
  created_at timestamptz not null default now()
);

create table if not exists constraints (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  task_id uuid references tasks(id) on delete set null,
  task_name text,
  type text,
  owner text,
  due_date date,
  status text not null default 'Open',
  notes text,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists commitments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  task_name text not null,
  trade text,
  foreman text,
  due_date date,
  status text not null default 'Committed',
  variance text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  created_at timestamptz not null default now()
);

-- ========== HELPER (avoids RLS recursion on company_members) ==========

create or replace function public.user_company_ids()
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  select company_id from company_members where user_id = auth.uid()
$$;

-- ========== ENABLE RLS ==========

alter table companies enable row level security;
alter table company_members enable row level security;
alter table profiles enable row level security;
alter table projects enable row level security;
alter table tasks enable row level security;
alter table constraints enable row level security;
alter table commitments enable row level security;
alter table activity_log enable row level security;

-- ========== POLICIES ==========

-- companies: any signed-in user can create one (Setup page); members can view theirs
create policy "companies_insert" on companies
  for insert to authenticated
  with check (true);

create policy "companies_select" on companies
  for select to authenticated
  using (id in (select public.user_company_ids()));

-- company_members: user can add themselves (first-time Setup); members can view their company's roster
create policy "company_members_insert_self" on company_members
  for insert to authenticated
  with check (user_id = auth.uid());

create policy "company_members_select" on company_members
  for select to authenticated
  using (company_id in (select public.user_company_ids()));

-- profiles: user manages their own row
create policy "profiles_select_own" on profiles
  for select to authenticated
  using (id = auth.uid());

create policy "profiles_upsert_own" on profiles
  for insert to authenticated
  with check (id = auth.uid());

create policy "profiles_update_own" on profiles
  for update to authenticated
  using (id = auth.uid());

-- projects: scoped to the user's company
create policy "projects_select" on projects
  for select to authenticated
  using (company_id in (select public.user_company_ids()));

create policy "projects_insert" on projects
  for insert to authenticated
  with check (company_id in (select public.user_company_ids()));

create policy "projects_update" on projects
  for update to authenticated
  using (company_id in (select public.user_company_ids()));

-- tasks / constraints / commitments: scoped via their project's company
create policy "tasks_all" on tasks
  for all to authenticated
  using (project_id in (select id from projects where company_id in (select public.user_company_ids())))
  with check (project_id in (select id from projects where company_id in (select public.user_company_ids())));

create policy "constraints_all" on constraints
  for all to authenticated
  using (project_id in (select id from projects where company_id in (select public.user_company_ids())))
  with check (project_id in (select id from projects where company_id in (select public.user_company_ids())));

create policy "commitments_all" on commitments
  for all to authenticated
  using (project_id in (select id from projects where company_id in (select public.user_company_ids())))
  with check (project_id in (select id from projects where company_id in (select public.user_company_ids())));

-- activity_log: readable/writable within the user's company
create policy "activity_log_select" on activity_log
  for select to authenticated
  using (company_id in (select public.user_company_ids()));

create policy "activity_log_insert" on activity_log
  for insert to authenticated
  with check (company_id in (select public.user_company_ids()));

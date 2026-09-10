-- ============================================================================
-- Home Hub — Supabase schema
-- ============================================================================
-- Run this in Supabase Studio → SQL Editor (or via `supabase db push` if you
-- use the CLI) on a fresh project. It creates every table the app will read
-- from once screens are wired to real data, plus Row Level Security (RLS)
-- policies that isolate each household ("group") from every other one and
-- support belonging to more than one group at a time.
--
-- Design notes:
--   * `auth.users` (managed by Supabase Auth) is extended with a `profiles`
--     table (1-to-1, same id) for app-visible fields (name, avatar, points).
--   * A user can belong to many `groups` via `group_members` — this is what
--     makes "pertenecer a más de un grupo familiar" possible.
--   * `tasks.assignee_id` is nullable: NULL means "open task", claimable by
--     any member of the group via `task_occurrences` / by setting assignee.
--   * `task_occurrences` tracks each completion of a task (including each
--     time a recurring task comes due) so points/ranking/history are exact.
--   * `categories` are per-group; a fixed set of defaults is seeded into every
--     new group, and members can add their own on top (`is_default = false`).
--   * Expense tracking: `shared_accounts` (e.g. "Cuenta del hogar") contain
--     `expenses`, each optionally itemized via `expense_items` (from a
--     scanned invoice) and divided among members via `expense_splits`.
--   * All tables have RLS enabled. The helper function `is_group_member`
--     centralizes the "can this user see this group's data" check.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Extensions
-- ----------------------------------------------------------------------------
create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ----------------------------------------------------------------------------
-- profiles  (1-to-1 with auth.users)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  avatar_color text not null default '#E86545',
  initials text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are viewable by anyone signed in"
  on public.profiles for select
  to authenticated
  using (true);

create policy "users can update their own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid());

create policy "users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

-- ----------------------------------------------------------------------------
-- groups  (households / family groups)
-- ----------------------------------------------------------------------------
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  emoji text not null default '🏠',
  invite_code text not null unique default substr(md5(random()::text), 1, 8),
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

alter table public.groups enable row level security;

-- ----------------------------------------------------------------------------
-- group_members  (many-to-many profiles <-> groups, with role + points)
-- ----------------------------------------------------------------------------
create table if not exists public.group_members (
  group_id uuid not null references public.groups (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'member')),
  points integer not null default 0,
  joined_at timestamptz not null default now(),
  primary key (group_id, profile_id)
);

alter table public.group_members enable row level security;

-- Helper: is the current user a member of the given group?
-- SECURITY DEFINER + fixed search_path so it can be used inside policies
-- without those policies re-triggering RLS on group_members recursively.
create or replace function public.is_group_member(check_group_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.group_members
    where group_id = check_group_id and profile_id = auth.uid()
  );
$$;

create or replace function public.is_group_admin(check_group_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.group_members
    where group_id = check_group_id and profile_id = auth.uid() and role = 'admin'
  );
$$;

-- groups policies (defined after the helper function exists)
create policy "members can view their groups"
  on public.groups for select
  to authenticated
  using (public.is_group_member(id));

create policy "any signed-in user can create a group"
  on public.groups for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "admins can update their group"
  on public.groups for update
  to authenticated
  using (public.is_group_admin(id));

create policy "admins can delete their group"
  on public.groups for delete
  to authenticated
  using (public.is_group_admin(id));

-- group_members policies
create policy "members can view membership of their groups"
  on public.group_members for select
  to authenticated
  using (public.is_group_member(group_id));

create policy "users can join a group (insert own membership)"
  on public.group_members for insert
  to authenticated
  with check (profile_id = auth.uid());

create policy "admins can update member roles/points"
  on public.group_members for update
  to authenticated
  using (public.is_group_admin(group_id));

create policy "users can leave a group / admins can remove members"
  on public.group_members for delete
  to authenticated
  using (profile_id = auth.uid() or public.is_group_admin(group_id));

-- Joining a group by invite code needs to look up a group the user isn't a
-- member of yet, which the "members can view their groups" select policy
-- above deliberately blocks. This SECURITY DEFINER function does the lookup
-- and membership insert atomically, without ever exposing groups the caller
-- doesn't already belong to through a general-purpose select.
create or replace function public.join_group_by_invite_code(code text)
returns public.groups
language plpgsql
security definer
set search_path = public
as $$
declare
  target public.groups;
begin
  select * into target from public.groups where invite_code = code;
  if target.id is null then
    raise exception 'Código de invitación inválido.';
  end if;
  insert into public.group_members (group_id, profile_id)
  values (target.id, auth.uid())
  on conflict (group_id, profile_id) do nothing;
  return target;
end;
$$;

grant execute on function public.join_group_by_invite_code(text) to authenticated;

-- ----------------------------------------------------------------------------
-- categories  (per-group; defaults seeded + custom ones allowed)
-- ----------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  name text not null,
  icon text not null default 'sparkles',
  color text not null default '#E86545',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "members can view their group's categories"
  on public.categories for select
  to authenticated
  using (public.is_group_member(group_id));

create policy "members can create categories in their group"
  on public.categories for insert
  to authenticated
  with check (public.is_group_member(group_id));

create policy "members can update non-default categories"
  on public.categories for update
  to authenticated
  using (public.is_group_member(group_id) and is_default = false);

create policy "members can delete non-default categories"
  on public.categories for delete
  to authenticated
  using (public.is_group_member(group_id) and is_default = false);

-- Seed a group's default categories automatically when it's created.
create or replace function public.seed_default_categories()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.categories (group_id, name, icon, color, is_default) values
    (new.id, 'Cocina', 'utensils', '#DC932E', true),
    (new.id, 'Limpieza', 'droplet', '#30A4AA', true),
    (new.id, 'Servicios', 'bolt', '#427FD8', true),
    (new.id, 'Mantenimiento', 'wrench', '#825EB9', true),
    (new.id, 'Eventos', 'gift', '#DF5770', true);
  return new;
end;
$$;

drop trigger if exists trg_seed_default_categories on public.groups;
create trigger trg_seed_default_categories
  after insert on public.groups
  for each row execute function public.seed_default_categories();

-- Add the creator as an admin member automatically.
create or replace function public.add_creator_as_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.group_members (group_id, profile_id, role)
  values (new.id, new.created_by, 'admin');
  return new;
end;
$$;

drop trigger if exists trg_add_creator_as_admin on public.groups;
create trigger trg_add_creator_as_admin
  after insert on public.groups
  for each row execute function public.add_creator_as_admin();

-- ----------------------------------------------------------------------------
-- tasks  (assignee_id NULL = open/claimable by anyone in the group)
-- ----------------------------------------------------------------------------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  category_id uuid references public.categories (id) on delete set null,
  title text not null,
  notes text,
  assignee_id uuid references public.profiles (id) on delete set null,
  created_by uuid not null references public.profiles (id),
  points integer not null default 10,
  due_date date,
  recurrence text not null default 'none' check (recurrence in ('none', 'daily', 'weekly', 'monthly')),
  status text not null default 'pending' check (status in ('pending', 'done')),
  created_at timestamptz not null default now()
);

alter table public.tasks enable row level security;

create policy "members can view their group's tasks"
  on public.tasks for select
  to authenticated
  using (public.is_group_member(group_id));

create policy "members can create tasks in their group"
  on public.tasks for insert
  to authenticated
  with check (public.is_group_member(group_id) and created_by = auth.uid());

create policy "members can update tasks in their group"
  on public.tasks for update
  to authenticated
  using (public.is_group_member(group_id));

create policy "members can delete tasks they created, admins any"
  on public.tasks for delete
  to authenticated
  using (created_by = auth.uid() or public.is_group_admin(group_id));

-- ----------------------------------------------------------------------------
-- task_occurrences  (completion history — one row per time a task is done;
-- recurring tasks accumulate many rows here over time)
-- ----------------------------------------------------------------------------
create table if not exists public.task_occurrences (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  group_id uuid not null references public.groups (id) on delete cascade,
  completed_by uuid not null references public.profiles (id),
  points_awarded integer not null default 0,
  completed_at timestamptz not null default now()
);

alter table public.task_occurrences enable row level security;

create policy "members can view their group's task history"
  on public.task_occurrences for select
  to authenticated
  using (public.is_group_member(group_id));

create policy "members can log completions in their group"
  on public.task_occurrences for insert
  to authenticated
  with check (public.is_group_member(group_id) and completed_by = auth.uid());

-- Award points to the member automatically when a completion is logged.
create or replace function public.apply_task_points()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.group_members
  set points = points + new.points_awarded
  where group_id = new.group_id and profile_id = new.completed_by;
  return new;
end;
$$;

drop trigger if exists trg_apply_task_points on public.task_occurrences;
create trigger trg_apply_task_points
  after insert on public.task_occurrences
  for each row execute function public.apply_task_points();

-- ----------------------------------------------------------------------------
-- achievements  (catalog) + member_achievements  (unlocks)
-- ----------------------------------------------------------------------------
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  description text not null,
  icon text not null default 'trophy',
  points_required integer,
  created_at timestamptz not null default now()
);

alter table public.achievements enable row level security;

create policy "achievements are viewable by anyone signed in"
  on public.achievements for select
  to authenticated
  using (true);

create table if not exists public.member_achievements (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  achievement_id uuid not null references public.achievements (id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  unique (group_id, profile_id, achievement_id)
);

alter table public.member_achievements enable row level security;

create policy "members can view achievements unlocked in their group"
  on public.member_achievements for select
  to authenticated
  using (public.is_group_member(group_id));

create policy "system/user can unlock an achievement for themselves"
  on public.member_achievements for insert
  to authenticated
  with check (public.is_group_member(group_id) and profile_id = auth.uid());

-- ----------------------------------------------------------------------------
-- shared_accounts  (e.g. "Cuenta del hogar", "Cuenta del viaje")
-- ----------------------------------------------------------------------------
create table if not exists public.shared_accounts (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  name text not null,
  icon text not null default 'wallet',
  currency text not null default 'USD',
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

alter table public.shared_accounts enable row level security;

create policy "members can view their group's shared accounts"
  on public.shared_accounts for select
  to authenticated
  using (public.is_group_member(group_id));

create policy "members can create shared accounts in their group"
  on public.shared_accounts for insert
  to authenticated
  with check (public.is_group_member(group_id) and created_by = auth.uid());

create policy "admins can update/delete shared accounts"
  on public.shared_accounts for update
  to authenticated
  using (public.is_group_admin(group_id));

create policy "admins can delete shared accounts"
  on public.shared_accounts for delete
  to authenticated
  using (public.is_group_admin(group_id));

-- ----------------------------------------------------------------------------
-- expenses  (a single charge/invoice against a shared account)
-- ----------------------------------------------------------------------------
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.shared_accounts (id) on delete cascade,
  group_id uuid not null references public.groups (id) on delete cascade,
  category_id uuid references public.categories (id) on delete set null,
  merchant text not null,
  total numeric(12, 2) not null,
  currency text not null default 'USD',
  paid_by uuid not null references public.profiles (id),
  receipt_url text,
  expense_date date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.expenses enable row level security;

create policy "members can view their group's expenses"
  on public.expenses for select
  to authenticated
  using (public.is_group_member(group_id));

create policy "members can create expenses in their group"
  on public.expenses for insert
  to authenticated
  with check (public.is_group_member(group_id) and paid_by = auth.uid());

create policy "members can update expenses in their group"
  on public.expenses for update
  to authenticated
  using (public.is_group_member(group_id));

create policy "creator or admin can delete an expense"
  on public.expenses for delete
  to authenticated
  using (paid_by = auth.uid() or public.is_group_admin(group_id));

-- ----------------------------------------------------------------------------
-- expense_items  (line items from a scanned invoice)
-- ----------------------------------------------------------------------------
create table if not exists public.expense_items (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references public.expenses (id) on delete cascade,
  group_id uuid not null references public.groups (id) on delete cascade,
  label text not null,
  amount numeric(12, 2) not null,
  assignee_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.expense_items enable row level security;

create policy "members can view expense items in their group"
  on public.expense_items for select
  to authenticated
  using (public.is_group_member(group_id));

create policy "members can manage expense items in their group"
  on public.expense_items for insert
  to authenticated
  with check (public.is_group_member(group_id));

create policy "members can update expense items in their group"
  on public.expense_items for update
  to authenticated
  using (public.is_group_member(group_id));

create policy "members can delete expense items in their group"
  on public.expense_items for delete
  to authenticated
  using (public.is_group_member(group_id));

-- ----------------------------------------------------------------------------
-- expense_splits  (how one expense divides across members)
-- ----------------------------------------------------------------------------
create table if not exists public.expense_splits (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references public.expenses (id) on delete cascade,
  group_id uuid not null references public.groups (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  amount numeric(12, 2) not null,
  settled boolean not null default false,
  unique (expense_id, profile_id)
);

alter table public.expense_splits enable row level security;

create policy "members can view expense splits in their group"
  on public.expense_splits for select
  to authenticated
  using (public.is_group_member(group_id));

create policy "members can manage expense splits in their group"
  on public.expense_splits for insert
  to authenticated
  with check (public.is_group_member(group_id));

create policy "members can update expense splits in their group"
  on public.expense_splits for update
  to authenticated
  using (public.is_group_member(group_id));

create policy "members can delete expense splits in their group"
  on public.expense_splits for delete
  to authenticated
  using (public.is_group_member(group_id));

-- ----------------------------------------------------------------------------
-- notifications  (per-user; may reference a group for context)
-- ----------------------------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  group_id uuid references public.groups (id) on delete cascade,
  type text not null check (type in ('tarea', 'factura', 'ranking', 'recomendacion', 'logro', 'gasto')),
  title text not null,
  body text,
  unread boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "users can view their own notifications"
  on public.notifications for select
  to authenticated
  using (profile_id = auth.uid());

create policy "users can update (mark read) their own notifications"
  on public.notifications for update
  to authenticated
  using (profile_id = auth.uid());

create policy "system can insert notifications for group members"
  on public.notifications for insert
  to authenticated
  with check (group_id is null or public.is_group_member(group_id));

-- ----------------------------------------------------------------------------
-- Helpful indexes
-- ----------------------------------------------------------------------------
create index if not exists idx_group_members_profile on public.group_members (profile_id);
create index if not exists idx_categories_group on public.categories (group_id);
create index if not exists idx_tasks_group on public.tasks (group_id);
create index if not exists idx_tasks_assignee on public.tasks (assignee_id);
create index if not exists idx_task_occurrences_group on public.task_occurrences (group_id);
create index if not exists idx_task_occurrences_task on public.task_occurrences (task_id);
create index if not exists idx_shared_accounts_group on public.shared_accounts (group_id);
create index if not exists idx_expenses_group on public.expenses (group_id);
create index if not exists idx_expenses_account on public.expenses (account_id);
create index if not exists idx_expense_items_expense on public.expense_items (expense_id);
create index if not exists idx_expense_splits_expense on public.expense_splits (expense_id);
create index if not exists idx_notifications_profile on public.notifications (profile_id, unread);

-- ============================================================================
-- End of schema.
-- Next steps once you run this in Supabase Studio:
--   1. Auth → Providers: enable Email (and any others you want).
--   2. Storage: create a bucket named `receipts` if you want invoice photos
--      uploaded to Storage instead of an external URL (set `receipt_url`
--      to the resulting public/signed URL).
--   3. Copy Project Settings → API → Project URL and anon public key into
--      your local `.env` (see `.env.example`).
-- ============================================================================

-- ============================================================
-- Tables
-- ============================================================

create table households (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  invite_code text unique not null,
  created_at  timestamptz default now()
);

create table household_members (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  created_at   timestamptz default now(),
  unique(household_id, user_id)
);

create table budgets (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  month        date not null,  -- always stored as first day of month (e.g. 2026-06-01)
  amount       numeric(12,2) not null check (amount >= 0),
  created_at   timestamptz default now(),
  unique(household_id, month)
);

create table expenses (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  user_id      uuid not null references auth.users(id),
  amount       numeric(12,2) not null check (amount > 0),
  description  text not null,
  date         date not null,
  created_at   timestamptz default now()
);

-- ============================================================
-- Indexes
-- ============================================================

create index on household_members(user_id);
create index on household_members(household_id);
create index on expenses(household_id, date);
create index on budgets(household_id, month);

-- ============================================================
-- Row-Level Security
-- ============================================================

alter table households        enable row level security;
alter table household_members enable row level security;
alter table budgets            enable row level security;
alter table expenses          enable row level security;

-- Helper: returns the household_id for the current user (null if not in any)
create or replace function my_household_id()
returns uuid
language sql
security definer
stable
as $$
  select household_id
  from household_members
  where user_id = auth.uid()
  limit 1
$$;

-- households: members can read their own household
create policy "members can read own household"
  on households for select
  using (id = my_household_id());

-- households: authenticated users can create a household
create policy "authenticated users can create household"
  on households for insert
  with check (auth.uid() is not null);

-- household_members: members can read memberships in their household
create policy "members can read own household members"
  on household_members for select
  using (household_id = my_household_id());

-- household_members: authenticated users can insert themselves into a household
create policy "users can join a household"
  on household_members for insert
  with check (user_id = auth.uid());

-- budgets: members can read budgets for their household
create policy "members can read budgets"
  on budgets for select
  using (household_id = my_household_id());

-- budgets: members can insert budgets for their household
create policy "members can insert budgets"
  on budgets for insert
  with check (household_id = my_household_id());

-- budgets: members can update budgets for their household
create policy "members can update budgets"
  on budgets for update
  using (household_id = my_household_id());

-- expenses: members can read expenses for their household
create policy "members can read expenses"
  on expenses for select
  using (household_id = my_household_id());

-- expenses: members can insert expenses for their household
create policy "members can insert expenses"
  on expenses for insert
  with check (household_id = my_household_id() and user_id = auth.uid());

-- expenses: the user who created an expense can delete it
create policy "owner can delete expense"
  on expenses for delete
  using (household_id = my_household_id() and user_id = auth.uid());

-- ============================================================
-- MealCart schema for Neon
-- Run this in the Neon SQL Editor (console.neon.tech)
-- ============================================================

-- ingredients
create table if not exists ingredients (
  id          text primary key,
  user_id     text not null default auth.user_id(),
  name        text not null,
  department  text not null
);

-- meals (days_of_week is a legacy field kept for compatibility)
create table if not exists meals (
  id            text primary key,
  user_id       text not null default auth.user_id(),
  name          text not null,
  days_of_week  text[] not null default '{}'
);

-- meal <-> ingredient junction
create table if not exists meal_ingredients (
  meal_id        text not null references meals(id) on delete cascade,
  ingredient_id  text not null references ingredients(id) on delete cascade,
  user_id        text not null default auth.user_id(),
  primary key (meal_id, ingredient_id)
);

-- meal plans (mealDays is a JSONB map of mealId -> DayOfWeek[])
create table if not exists meal_plans (
  id          text primary key,
  user_id     text not null default auth.user_id(),
  name        text not null,
  meal_days   jsonb not null default '{}',
  created_at  text not null,
  updated_at  text not null
);

-- shopping lists
create table if not exists shopping_lists (
  id          text primary key,
  user_id     text not null default auth.user_id(),
  name        text not null,
  created_at  text not null,
  updated_at  text not null
);

-- shopping list <-> ingredient junction (includes checked state)
create table if not exists shopping_list_ingredients (
  list_id        text not null references shopping_lists(id) on delete cascade,
  ingredient_id  text not null references ingredients(id) on delete cascade,
  user_id        text not null default auth.user_id(),
  checked        boolean not null default false,
  primary key (list_id, ingredient_id)
);

-- per-user preferences (current active list/plan)
create table if not exists user_preferences (
  user_id                   text primary key default auth.user_id(),
  current_shopping_list_id  text,
  current_meal_plan_id      text
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table ingredients                enable row level security;
alter table meals                      enable row level security;
alter table meal_ingredients           enable row level security;
alter table meal_plans                 enable row level security;
alter table shopping_lists             enable row level security;
alter table shopping_list_ingredients  enable row level security;
alter table user_preferences           enable row level security;

-- Each user can only see and modify their own rows
create policy "user_isolation" on ingredients
  using (user_id = auth.user_id()) with check (user_id = auth.user_id());

create policy "user_isolation" on meals
  using (user_id = auth.user_id()) with check (user_id = auth.user_id());

create policy "user_isolation" on meal_ingredients
  using (user_id = auth.user_id()) with check (user_id = auth.user_id());

create policy "user_isolation" on meal_plans
  using (user_id = auth.user_id()) with check (user_id = auth.user_id());

create policy "user_isolation" on shopping_lists
  using (user_id = auth.user_id()) with check (user_id = auth.user_id());

create policy "user_isolation" on shopping_list_ingredients
  using (user_id = auth.user_id()) with check (user_id = auth.user_id());

create policy "user_isolation" on user_preferences
  using (user_id = auth.user_id()) with check (user_id = auth.user_id());

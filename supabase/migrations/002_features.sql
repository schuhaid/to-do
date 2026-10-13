-- Migration 002: subtasks, notes, due dates, priorities, tags, completion times.
-- Run once in Supabase: SQL Editor → New query → paste → Run.
-- Additive only: nothing is dropped, and existing tasks keep all their data.
-- Safe to re-run.

-- 1. New columns on todos ----------------------------------------------------
alter table public.todos
  add column if not exists due_date     date,
  add column if not exists priority     smallint not null default 0,
  add column if not exists tags         text[]   not null default '{}',
  add column if not exists completed_at timestamptz;

-- 0 = none, 1 = low, 2 = medium, 3 = high
do $$ begin
  alter table public.todos
    add constraint todos_priority_range check (priority between 0 and 3);
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.todos
    add constraint todos_tags_limit check (cardinality(tags) <= 10);
exception when duplicate_object then null; end $$;

-- Existing finished tasks have no completion time yet; use their creation time.
update public.todos
   set completed_at = created_at
 where done and completed_at is null;

create index if not exists todos_user_id_due_date_idx
  on public.todos (user_id, due_date) where due_date is not null;
create index if not exists todos_tags_idx
  on public.todos using gin (tags);

-- 2. Subtasks table ------------------------------------------------------------
create table if not exists public.subtasks (
  id           uuid primary key default gen_random_uuid(),
  todo_id      uuid not null references public.todos (id) on delete cascade,
  user_id      uuid not null default auth.uid()
                 references auth.users (id) on delete cascade,
  title        text not null check (char_length(trim(title)) between 1 and 500),
  done         boolean not null default false,
  note         text check (note is null or char_length(note) <= 20000),
  due_date     date,
  position     integer not null default 0,
  created_at   timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists subtasks_todo_id_position_idx
  on public.subtasks (todo_id, position);
create index if not exists subtasks_user_id_idx
  on public.subtasks (user_id);

-- 3. Keep completed_at in sync when something is checked off ----------------
create or replace function public.set_completed_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.done and (tg_op = 'INSERT' or not old.done) then
    new.completed_at := now();
  elsif not new.done then
    new.completed_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists todos_set_completed_at on public.todos;
create trigger todos_set_completed_at
  before insert or update of done on public.todos
  for each row execute function public.set_completed_at();

drop trigger if exists subtasks_set_completed_at on public.subtasks;
create trigger subtasks_set_completed_at
  before insert or update of done on public.subtasks
  for each row execute function public.set_completed_at();

-- 4. Permissions + Row Level Security for subtasks --------------------------
revoke all on public.subtasks from anon;
grant select, insert, update, delete on public.subtasks to authenticated;

alter table public.subtasks enable row level security;

drop policy if exists "Users can read their own subtasks"   on public.subtasks;
drop policy if exists "Users can create their own subtasks" on public.subtasks;
drop policy if exists "Users can update their own subtasks" on public.subtasks;
drop policy if exists "Users can delete their own subtasks" on public.subtasks;

create policy "Users can read their own subtasks"
  on public.subtasks for select to authenticated
  using ((select auth.uid()) = user_id);

-- Creating or moving a subtask also requires owning the parent task,
-- so nobody can attach subtasks to someone else's task.
create policy "Users can create their own subtasks"
  on public.subtasks for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.todos t
      where t.id = todo_id and t.user_id = (select auth.uid())
    )
  );

create policy "Users can update their own subtasks"
  on public.subtasks for update to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.todos t
      where t.id = todo_id and t.user_id = (select auth.uid())
    )
  );

create policy "Users can delete their own subtasks"
  on public.subtasks for delete to authenticated
  using ((select auth.uid()) = user_id);

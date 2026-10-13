-- To-do app schema
-- Run this once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Safe to re-run: it drops and recreates the policies.

-- 1. Table ------------------------------------------------------------------
create table if not exists public.todos (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid()
                references auth.users (id) on delete cascade,
  title       text not null check (char_length(trim(title)) between 1 and 500),
  done        boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists todos_user_id_created_at_idx
  on public.todos (user_id, created_at desc);

-- 2. Permissions ------------------------------------------------------------
-- Only logged-in users may touch the table at all; anonymous visitors get nothing.
revoke all on public.todos from anon;
grant select, insert, update, delete on public.todos to authenticated;

-- 3. Row Level Security -----------------------------------------------------
-- With RLS on, every query is filtered by these policies, so a user can only
-- ever see or change rows where user_id is their own id.
alter table public.todos enable row level security;

drop policy if exists "Users can read their own todos"   on public.todos;
drop policy if exists "Users can create their own todos" on public.todos;
drop policy if exists "Users can update their own todos" on public.todos;
drop policy if exists "Users can delete their own todos" on public.todos;

create policy "Users can read their own todos"
  on public.todos for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own todos"
  on public.todos for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own todos"
  on public.todos for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own todos"
  on public.todos for delete to authenticated
  using ((select auth.uid()) = user_id);

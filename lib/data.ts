import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Subtask, Todo, TodoWithSubtasks } from "@/lib/types";

// All reads go through here. RLS in the database guarantees every query
// only ever returns the logged-in user's rows.

const TODO_COLUMNS = "id, title, done, created_at, completed_at, due_date, priority, tags";

// getClaims() checks the session token's signature locally instead of asking
// the Auth server, which saves a network round trip on every request.
// RLS still checks the same token in the database on every query.
export const getUser = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) redirect("/login");
  return { supabase, user: { id: claims.sub, email: claims.email } };
});

export async function getTodosWithSubtasks(): Promise<TodoWithSubtasks[]> {
  const { supabase } = await getUser();
  const { data, error } = await supabase
    .from("todos")
    .select(`${TODO_COLUMNS}, subtasks (id, title, done, due_date, completed_at)`)
    .order("created_at", { ascending: false });
  if (error) throw new Error("Couldn't load your tasks.");
  return (data ?? []) as TodoWithSubtasks[];
}

export async function getTodo(id: string): Promise<(Todo & { subtasks: Subtask[] }) | null> {
  const { supabase } = await getUser();
  const { data, error } = await supabase
    .from("todos")
    .select(
      `${TODO_COLUMNS}, subtasks (id, todo_id, title, done, note, due_date, position, created_at, completed_at)`,
    )
    .eq("id", id)
    .order("position", { referencedTable: "subtasks", ascending: true })
    .order("created_at", { referencedTable: "subtasks", ascending: true })
    .maybeSingle();
  if (error) throw new Error("Couldn't load this task.");
  return data as (Todo & { subtasks: Subtask[] }) | null;
}

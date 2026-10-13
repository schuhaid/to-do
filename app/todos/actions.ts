"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/data";
import type { Priority } from "@/lib/types";
import {
  UUID_RE,
  cleanDate,
  cleanPriority,
  cleanTags,
  cleanTitle,
  extractTags,
} from "@/lib/validate";

// Every action checks the user itself. RLS in the database is the real
// guard; the extra user_id filter keeps the intent obvious.

function refresh() {
  // List, task pages, dashboard and graph all read the same data.
  revalidatePath("/", "layout");
}

function assertId(id: string) {
  if (!UUID_RE.test(id)) throw new Error("Invalid task.");
}

// ---------- Tasks ----------

export async function addTodo(formData: FormData) {
  const { title: raw, tags } = extractTags(String(formData.get("title") ?? ""));
  const title = cleanTitle(raw);
  if (!title) return;
  const due_date = cleanDate(formData.get("due_date")) ?? null;

  const { supabase, user } = await getUser();
  const { error } = await supabase
    .from("todos")
    .insert({ title, tags, due_date, user_id: user.id });
  if (error) throw new Error("Couldn't add the task.");
  refresh();
}

export type TodoPatch = {
  title?: string;
  due_date?: string | null;
  priority?: Priority;
  tags?: string[];
};

export async function updateTodo(id: string, patch: TodoPatch) {
  assertId(id);
  const update: Record<string, unknown> = {};
  if (patch.title !== undefined) {
    const title = cleanTitle(patch.title);
    if (!title) return;
    update.title = title;
  }
  if (patch.due_date !== undefined) {
    const due = cleanDate(patch.due_date);
    if (due === undefined) return;
    update.due_date = due;
  }
  if (patch.priority !== undefined) {
    const priority = cleanPriority(patch.priority);
    if (priority === undefined) return;
    update.priority = priority;
  }
  if (patch.tags !== undefined) update.tags = cleanTags(patch.tags);
  if (Object.keys(update).length === 0) return;

  const { supabase, user } = await getUser();
  const { error } = await supabase
    .from("todos")
    .update(update)
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw new Error("Couldn't save the task.");
  refresh();
}

export async function renameTodo(id: string, title: string) {
  return updateTodo(id, { title });
}

export async function setTodoDone(id: string, done: boolean) {
  assertId(id);
  const { supabase, user } = await getUser();
  const { error } = await supabase
    .from("todos")
    .update({ done })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw new Error("Couldn't update the task.");
  refresh();
}

export async function deleteTodo(id: string) {
  assertId(id);
  const { supabase, user } = await getUser();
  // Subtasks are removed automatically (on delete cascade).
  const { error } = await supabase.from("todos").delete().eq("id", id).eq("user_id", user.id);
  if (error) throw new Error("Couldn't delete the task.");
  refresh();
}

// ---------- Subtasks ----------

export async function addSubtask(todoId: string, rawTitle: string) {
  assertId(todoId);
  const title = cleanTitle(rawTitle);
  if (!title) return;

  const { supabase, user } = await getUser();
  const { data: last } = await supabase
    .from("subtasks")
    .select("position")
    .eq("todo_id", todoId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("subtasks").insert({
    todo_id: todoId,
    user_id: user.id,
    title,
    position: (last?.position ?? -1) + 1,
  });
  if (error) throw new Error("Couldn't add the subtask.");
  refresh();
}

export type SubtaskPatch = {
  title?: string;
  done?: boolean;
  note?: string | null;
  due_date?: string | null;
};

export async function updateSubtask(id: string, patch: SubtaskPatch) {
  assertId(id);
  const update: Record<string, unknown> = {};
  if (patch.title !== undefined) {
    const title = cleanTitle(patch.title);
    if (!title) return;
    update.title = title;
  }
  if (patch.done !== undefined) update.done = Boolean(patch.done);
  if (patch.note !== undefined) {
    const note = (patch.note ?? "").slice(0, 20000);
    update.note = note.trim() ? note : null;
  }
  if (patch.due_date !== undefined) {
    const due = cleanDate(patch.due_date);
    if (due === undefined) return;
    update.due_date = due;
  }
  if (Object.keys(update).length === 0) return;

  const { supabase, user } = await getUser();
  const { error } = await supabase
    .from("subtasks")
    .update(update)
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw new Error("Couldn't save the subtask.");
  refresh();
}

export async function deleteSubtask(id: string) {
  assertId(id);
  const { supabase, user } = await getUser();
  const { error } = await supabase.from("subtasks").delete().eq("id", id).eq("user_id", user.id);
  if (error) throw new Error("Couldn't delete the subtask.");
  refresh();
}

/** Saves a new order: `orderedIds` is the full list of a task's subtask ids. */
export async function reorderSubtasks(todoId: string, orderedIds: string[]) {
  assertId(todoId);
  if (!orderedIds.every((id) => UUID_RE.test(id))) throw new Error("Invalid subtask.");

  const { supabase, user } = await getUser();
  const results = await Promise.all(
    orderedIds.map((id, position) =>
      supabase
        .from("subtasks")
        .update({ position })
        .eq("id", id)
        .eq("todo_id", todoId)
        .eq("user_id", user.id),
    ),
  );
  if (results.some((r) => r.error)) throw new Error("Couldn't reorder the subtasks.");
  refresh();
}

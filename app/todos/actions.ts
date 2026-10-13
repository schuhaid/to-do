"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Every action checks the user itself. RLS in the database is the real
// guard; the extra user_id filter just keeps the intent obvious.
async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

function cleanTitle(value: unknown) {
  const title = String(value ?? "").trim();
  return title.length > 0 && title.length <= 500 ? title : null;
}

export async function addTodo(formData: FormData) {
  const title = cleanTitle(formData.get("title"));
  if (!title) return;

  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("todos").insert({ title, user_id: user.id });
  if (error) throw new Error("Couldn't add the task.");
  revalidatePath("/todos");
}

export async function renameTodo(id: string, rawTitle: string) {
  const title = cleanTitle(rawTitle);
  if (!title) return;

  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("todos")
    .update({ title })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw new Error("Couldn't save the task.");
  revalidatePath("/todos");
}

export async function setTodoDone(id: string, done: boolean) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("todos")
    .update({ done })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw new Error("Couldn't update the task.");
  revalidatePath("/todos");
}

export async function deleteTodo(id: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("todos")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw new Error("Couldn't delete the task.");
  revalidatePath("/todos");
}

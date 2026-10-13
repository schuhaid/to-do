import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Filter, Todo } from "@/lib/types";
import { logout } from "@/app/(auth)/actions";
import Wordmark from "@/components/Wordmark";
import AddTodo from "@/components/AddTodo";
import FilterTabs from "@/components/FilterTabs";
import TodoItem from "@/components/TodoItem";

export const metadata: Metadata = { title: "Your tasks · Ticked" };

const emptyText: Record<Filter, string> = {
  all: "No tasks yet. Add your first one above.",
  open: "Nothing open. Enjoy the quiet.",
  done: "Nothing checked off yet.",
};

function parseFilter(value: string | string[] | undefined): Filter {
  return value === "open" || value === "done" ? value : "all";
}

export default async function TodosPage({ searchParams }: PageProps<"/todos">) {
  const filter = parseFilter((await searchParams).filter);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // RLS makes sure this only ever returns the current user's rows.
  const { data, error } = await supabase
    .from("todos")
    .select("id, title, done, created_at")
    .order("done", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw new Error("Couldn't load your tasks.");

  const todos: Todo[] = data ?? [];
  const counts = {
    all: todos.length,
    open: todos.filter((t) => !t.done).length,
    done: todos.filter((t) => t.done).length,
  };
  const visible =
    filter === "all" ? todos : todos.filter((t) => (filter === "done" ? t.done : !t.done));

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 pb-16">
      <header className="flex items-center justify-between gap-4 py-6">
        <Wordmark />
        <div className="flex min-w-0 items-center gap-3">
          <span className="hidden truncate text-sm text-muted sm:block">{user.email}</span>
          <form action={logout}>
            <button type="submit" className="btn-quiet">Log out</button>
          </form>
        </div>
      </header>

      <main className="mt-4 sm:mt-10">
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Your tasks
        </h1>
        <p className="mt-2 text-muted">
          {counts.open} open, {counts.done} done
        </p>

        <div className="mt-8">
          <AddTodo />
        </div>

        <div className="mt-8">
          <FilterTabs current={filter} counts={counts} />
        </div>

        {visible.length > 0 ? (
          <ul className="mt-2 divide-y divide-line border-y border-line">
            {visible.map((todo) => (
              <TodoItem key={todo.id} todo={todo} />
            ))}
          </ul>
        ) : (
          <p className="mt-2 border-y border-line py-10 text-center text-muted">
            {emptyText[filter]}
          </p>
        )}
      </main>
    </div>
  );
}

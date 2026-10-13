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
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pb-16 sm:px-6">
      <header className="flex items-center justify-between gap-4 py-5">
        <Wordmark />
        <div className="flex min-w-0 items-center gap-2">
          <span className="hidden truncate text-sm text-muted sm:block">{user.email}</span>
          <form action={logout}>
            <button type="submit" className="btn-quiet">Log out</button>
          </form>
        </div>
      </header>

      <main className="mt-6 sm:mt-12">
        <div className="mb-6 px-1">
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight sm:text-[32px]">
            Your tasks
          </h1>
          <p className="mt-1 text-muted">
            {counts.all === 0
              ? "Nothing on your list yet."
              : `${counts.open} open, ${counts.done} done`}
          </p>
        </div>

        <section className="panel overflow-hidden">
          <div className="p-4 sm:p-5">
            <AddTodo />
          </div>

          <div className="border-t border-line px-4 py-3 sm:px-5">
            <FilterTabs current={filter} counts={counts} />
          </div>

          {visible.length > 0 ? (
            <ul className="divide-y divide-line border-t border-line">
              {visible.map((todo) => (
                <TodoItem key={todo.id} todo={todo} />
              ))}
            </ul>
          ) : (
            <p className="border-t border-line px-5 py-14 text-center text-muted">
              {emptyText[filter]}
            </p>
          )}
        </section>
      </main>
    </div>
  );
}

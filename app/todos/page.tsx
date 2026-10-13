import type { Metadata } from "next";
import { getTodosWithSubtasks } from "@/lib/data";
import { applyListQuery, parseListQuery } from "@/lib/list-query";
import AddTodo from "@/components/AddTodo";
import FilterTabs from "@/components/FilterTabs";
import ListControls from "@/components/ListControls";
import TodoItem from "@/components/TodoItem";

export const metadata: Metadata = { title: "Your tasks · Ticked" };

export default async function TodosPage({ searchParams }: PageProps<"/todos">) {
  const query = parseListQuery(await searchParams);
  const todos = await getTodosWithSubtasks();
  const { visible, counts, today } = applyListQuery(todos, query);

  const totalOpen = todos.filter((t) => !t.done).length;
  const totalDone = todos.length - totalOpen;
  const filtered = query.q || query.tag || query.due !== "any";

  const emptyText =
    todos.length === 0
      ? "No tasks yet. Add your first one above."
      : filtered
        ? "No tasks match these filters."
        : query.filter === "open"
          ? "Nothing open. Enjoy the quiet."
          : "Nothing checked off yet.";

  return (
    <main className="mx-auto mt-4 w-full max-w-2xl sm:mt-8">
      <div className="mb-6 px-1">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight sm:text-[32px]">
          Your tasks
        </h1>
        <p className="mt-1 text-muted">
          {todos.length === 0 ? "Nothing on your list yet." : `${totalOpen} open, ${totalDone} done`}
        </p>
      </div>

      <section className="panel overflow-hidden">
        <div className="p-4 sm:p-5">
          <AddTodo />
        </div>

        <div className="space-y-3 border-t border-line px-4 py-3 sm:px-5">
          <ListControls query={query} />
          <FilterTabs query={query} counts={counts} />
        </div>

        {visible.length > 0 ? (
          <ul className="divide-y divide-line border-t border-line">
            {visible.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                today={today}
                query={query}
              />
            ))}
          </ul>
        ) : (
          <p className="border-t border-line px-5 py-14 text-center text-muted">{emptyText}</p>
        )}
      </section>
    </main>
  );
}

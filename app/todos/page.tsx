import type { Metadata } from "next";
import { getTodosWithSubtasks } from "@/lib/data";
import { applyListQuery, parseListQuery } from "@/lib/list-query";
import { formatShortDate } from "@/lib/dates";
import AddTodo from "@/components/AddTodo";
import FilterTabs from "@/components/FilterTabs";
import ListControls from "@/components/ListControls";
import TodoItem from "@/components/TodoItem";

export const metadata: Metadata = { title: "Tasks – Ticked" };

export default async function TodosPage({ searchParams }: PageProps<"/todos">) {
  const query = parseListQuery(await searchParams);
  const todos = await getTodosWithSubtasks();
  const { visible, counts, today } = applyListQuery(todos, query);

  const totalOpen = todos.filter((t) => !t.done).length;
  const totalDone = todos.length - totalOpen;
  const pct = todos.length ? Math.round((totalDone / todos.length) * 100) : 0;
  const filtered = query.q || query.tag || query.due !== "any";

  const empty =
    todos.length === 0
      ? { title: "No tasks yet", text: "Type your first one above. Press n from anywhere to come back here." }
      : filtered
        ? { title: "No matches", text: "Nothing fits this search or date. Clear a filter to see more." }
        : query.filter === "open"
          ? { title: "Nothing open", text: "Everything on your list is ticked off." }
          : { title: "Nothing done yet", text: "Ticked tasks collect here." };

  return (
    <main className="mx-auto w-full max-w-[44rem] lg:mx-0">
      <header className="mb-8">
        <h1 className="page-title">Tasks</h1>
        <div className="meta mt-1 flex items-center gap-3">
          <span>{formatShortDate(today)}</span>
          {todos.length > 0 && (
            <span className="flex items-center gap-2" aria-label={`${totalDone} of ${todos.length} tasks done`}>
              <span className="tabular-nums">
                {totalOpen} open, {totalDone} done
              </span>
              <span className="h-1 w-16 overflow-hidden rounded-full bg-line" aria-hidden="true">
                <span className="block h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${pct}%` }} />
              </span>
            </span>
          )}
        </div>
      </header>

      <AddTodo />

      <div className="mt-6 flex flex-col-reverse gap-2 border-b border-line sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <FilterTabs query={query} counts={counts} />
        <ListControls query={query} />
      </div>

      {visible.length > 0 ? (
        <>
          <ul className="-mx-2 mt-2">
            {visible.map((todo) => (
              <TodoItem key={todo.id} todo={todo} today={today} query={query} />
            ))}
          </ul>
          <p className="meta mt-6 hidden pointer-coarse:block">
            Swipe a task right to tick it off, left to delete it.
          </p>
        </>
      ) : (
        <div className="py-16">
          <p className="font-medium">{empty.title}</p>
          <p className="meta mt-1 max-w-xs">{empty.text}</p>
        </div>
      )}
    </main>
  );
}

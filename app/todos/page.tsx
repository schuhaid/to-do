import type { Metadata } from "next";
import { getTodosWithSubtasks } from "@/lib/data";
import { applyListQuery, parseListQuery } from "@/lib/list-query";
import { formatShortDate } from "@/lib/dates";
import AddTodo from "@/components/AddTodo";
import FilterTabs from "@/components/FilterTabs";
import ListControls from "@/components/ListControls";
import TodoItem from "@/components/TodoItem";
import Icon from "@/components/Icon";

export const metadata: Metadata = { title: "Your tasks · Ticked" };

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
      ? { title: "A clean slate", text: "Add your first task above. Press n anytime to jump there." }
      : filtered
        ? { title: "No matches", text: "Nothing fits these filters. Try a different search or due date." }
        : query.filter === "open"
          ? { title: "All clear", text: "Nothing open. Enjoy the quiet." }
          : { title: "Nothing done yet", text: "Tick something off and it shows up here." };

  return (
    <main className="mx-auto w-full max-w-3xl">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{formatShortDate(today)}</p>
          <h1 className="page-title mt-1">Your tasks</h1>
        </div>
        {todos.length > 0 && (
          <div className="w-full sm:w-56" aria-label={`${totalDone} of ${todos.length} tasks done`}>
            <div className="mb-1.5 flex items-baseline justify-between text-sm">
              <span className="text-muted">
                <span className="font-semibold text-ink tabular-nums">{totalOpen}</span> open
              </span>
              <span className="font-semibold tabular-nums text-accent">{pct}% done</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-line" aria-hidden="true">
              <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}
      </header>

      <AddTodo />

      <div className="mb-3 mt-6 flex flex-col gap-3">
        <ListControls query={query} />
        <FilterTabs query={query} counts={counts} />
      </div>

      {visible.length > 0 ? (
        <>
          <ul className="panel overflow-hidden">
            {visible.map((todo, i) => (
              <TodoItem key={todo.id} todo={todo} today={today} query={query} index={i} />
            ))}
          </ul>
          <p className="mt-3 hidden text-center text-xs text-muted pointer-coarse:block">
            Swipe a task right to tick it off, left to delete it.
          </p>
        </>
      ) : (
        <div className="panel flex flex-col items-center px-6 py-16 text-center">
          <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent" aria-hidden="true">
            <Icon name={todos.length === 0 || query.filter === "open" ? "check" : "search"} className="size-6" strokeWidth={2.2} />
          </span>
          <p className="font-bold">{empty.title}</p>
          <p className="mt-1 max-w-xs text-sm text-muted">{empty.text}</p>
        </div>
      )}
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTodo } from "@/lib/data";
import { todayISO } from "@/lib/dates";
import { UUID_RE } from "@/lib/validate";
import TaskHeader from "@/components/task/TaskHeader";
import TaskMeta from "@/components/task/TaskMeta";
import SubtaskList from "@/components/task/SubtaskList";
import { ProgressBadge } from "@/components/Badges";
import Icon from "@/components/Icon";

export const metadata: Metadata = { title: "Task · Ticked" };

export default async function TaskPage({ params }: PageProps<"/todos/[id]">) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  // RLS returns nothing for someone else's task, so this 404s for them.
  const todo = await getTodo(id);
  if (!todo) notFound();

  const done = todo.subtasks.filter((s) => s.done).length;
  const total = todo.subtasks.length;
  const today = todayISO();

  return (
    <main className="mx-auto w-full max-w-5xl">
      <Link href="/todos" className="btn-quiet -ml-3 mb-4">
        <Icon name="back" className="size-4" strokeWidth={2.2} />
        All tasks
      </Link>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-5">
          <section className="panel p-5 sm:p-6">
            <TaskHeader id={todo.id} title={todo.title} done={todo.done} />
          </section>

          <section className="panel overflow-hidden" aria-labelledby="subtasks-title">
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
              <h2 id="subtasks-title" className="flex items-center gap-2 font-bold">
                Subtasks
                {total > 0 && (
                  <span className="rounded-full bg-sunken px-2 text-xs font-semibold tabular-nums text-muted">{total}</span>
                )}
              </h2>
              {total > 0 ? <ProgressBadge done={done} total={total} /> : null}
            </div>
            <SubtaskList todoId={todo.id} subtasks={todo.subtasks} today={today} />
          </section>
        </div>

        <aside className="panel p-5 lg:sticky lg:top-10" aria-label="Task details">
          <h2 className="eyebrow mb-4">Details</h2>
          <TaskMeta
            id={todo.id}
            dueDate={todo.due_date}
            priority={todo.priority}
            tags={todo.tags}
            done={todo.done}
            today={today}
          />
        </aside>
      </div>
    </main>
  );
}

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

export const metadata: Metadata = { title: "Task · Ticked" };

export default async function TaskPage({ params }: PageProps<"/todos/[id]">) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  // RLS returns nothing for someone else's task, so this 404s for them.
  const todo = await getTodo(id);
  if (!todo) notFound();

  const done = todo.subtasks.filter((s) => s.done).length;
  const total = todo.subtasks.length;

  return (
    <main className="mx-auto mt-4 w-full max-w-2xl sm:mt-8">
      <Link href="/todos" className="btn-quiet -ml-3 mb-4 inline-flex items-center gap-1">
        <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M10 3.5L5.5 8l4.5 4.5" />
        </svg>
        All tasks
      </Link>

      <section className="panel overflow-hidden">
        <div className="p-5 sm:p-6">
          <TaskHeader id={todo.id} title={todo.title} done={todo.done} />
          <TaskMeta
            id={todo.id}
            dueDate={todo.due_date}
            priority={todo.priority}
            tags={todo.tags}
            done={todo.done}
            today={todayISO()}
          />
        </div>

        <div className="border-t border-line">
          <div className="flex items-center justify-between gap-3 px-5 pb-1 pt-4 sm:px-6">
            <h2 className="font-semibold">Subtasks</h2>
            {total > 0 ? <ProgressBadge done={done} total={total} /> : null}
          </div>
          <SubtaskList todoId={todo.id} subtasks={todo.subtasks} today={todayISO()} />
        </div>
      </section>
    </main>
  );
}

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

export const metadata: Metadata = { title: "Task – Ticked" };

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
    <main className="mx-auto w-full max-w-[44rem] lg:mx-0">
      <Link href="/todos" className="btn-quiet -ml-2.5 mb-6">
        <Icon name="back" />
        Tasks
      </Link>

      <TaskHeader id={todo.id} title={todo.title} done={todo.done} />

      <section aria-label="Task details" className="mt-6 sm:pl-[1.875rem]">
        <TaskMeta
          id={todo.id}
          dueDate={todo.due_date}
          priority={todo.priority}
          tags={todo.tags}
          done={todo.done}
          today={today}
        />
      </section>

      <section aria-labelledby="subtasks-title" className="mt-12 sm:pl-[1.875rem]">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <h2 id="subtasks-title" className="section-title">Subtasks</h2>
          {total > 0 ? <ProgressBadge done={done} total={total} /> : null}
        </div>
        <SubtaskList todoId={todo.id} subtasks={todo.subtasks} today={today} />
      </section>
    </main>
  );
}

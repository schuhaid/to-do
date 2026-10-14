"use client";

import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import type { TodoWithSubtasks } from "@/lib/types";
import { listHref, type ListQuery } from "@/lib/list-query";
import { deleteTodo, renameTodo, setTodoDone } from "@/app/todos/actions";
import { DueBadge, PriorityBadge, ProgressBadge, TagChip } from "./Badges";
import Checkbox from "./Checkbox";

export default function TodoItem({
  todo,
  today,
  query,
  index = 0,
}: {
  todo: TodoWithSubtasks;
  today: string;
  query: ListQuery;
  index?: number;
}) {
  const [done, setOptimisticDone] = useOptimistic(todo.done);
  const [title, setOptimisticTitle] = useOptimistic(todo.title);
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  const subDone = todo.subtasks.filter((s) => s.done).length;
  const hasMeta = todo.due_date || todo.priority || todo.tags.length || todo.subtasks.length;

  function toggle() {
    startTransition(async () => {
      setOptimisticDone(!done);
      await setTodoDone(todo.id, !done);
    });
  }

  function save(formData: FormData) {
    const next = String(formData.get("title") ?? "").trim();
    setEditing(false);
    if (!next || next === title) return;
    startTransition(async () => {
      setOptimisticTitle(next);
      await renameTodo(todo.id, next);
    });
  }

  return (
    <li
      style={{ animationDelay: `${Math.min(index * 25, 250)}ms` }}
      className={`rise group relative flex items-start gap-3.5 px-4 py-3.5 transition-colors duration-150 hover:bg-hover sm:px-5 ${
        pending ? "opacity-60" : ""
      }`}
    >
      {todo.priority === 3 && !done && (
        <span className="absolute inset-y-3 left-0 w-[3px] rounded-r-full bg-warn" aria-hidden="true" />
      )}
      <div className="pt-0.5">
        <Checkbox checked={done} onToggle={toggle} label={title} />
      </div>

      {editing ? (
        <form action={save} className="flex flex-1 items-center gap-2">
          <label htmlFor={`edit-${todo.id}`} className="sr-only">Edit task</label>
          <input
            id={`edit-${todo.id}`}
            name="title"
            defaultValue={title}
            required
            maxLength={500}
            autoFocus
            onKeyDown={(e) => e.key === "Escape" && setEditing(false)}
            className="field flex-1 py-2"
          />
          <button type="submit" className="btn btn-sm">Save</button>
          <button type="button" onClick={() => setEditing(false)} className="btn-quiet">Cancel</button>
        </form>
      ) : (
        <>
          <div className="min-w-0 flex-1 py-0.5">
            <Link
              href={`/todos/${todo.id}`}
              onDoubleClick={(e) => {
                e.preventDefault();
                setEditing(true);
              }}
              className={`task-title block break-words font-medium hover:text-accent ${done ? "task-done" : ""}`}
            >
              {title}
            </Link>
            {hasMeta ? (
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                <DueBadge due={todo.due_date} done={done} today={today} />
                <ProgressBadge done={subDone} total={todo.subtasks.length} />
                <PriorityBadge priority={todo.priority} />
                {todo.tags.map((tag) => (
                  <TagChip key={tag} tag={tag} href={listHref(query, { tag })} />
                ))}
              </div>
            ) : null}
          </div>
          <div className="-my-1 flex shrink-0 gap-0.5 text-muted sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
            <IconButton label={`Rename "${title}"`} onClick={() => setEditing(true)}>
              <path d="M10.8 2.7l2.5 2.5-7.6 7.6-3.2.7.7-3.2 7.6-7.6z" />
            </IconButton>
            <IconButton label={`Delete "${title}"`} onClick={() => startTransition(() => deleteTodo(todo.id))} danger>
              <path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5" />
            </IconButton>
          </div>
        </>
      )}
    </li>
  );
}

export function IconButton({
  label,
  onClick,
  danger,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`grid size-10 place-items-center rounded-lg transition-colors duration-150 hover:bg-panel hover:ring-1 hover:ring-line disabled:pointer-events-none disabled:opacity-30 ${
        danger ? "hover:text-danger" : "hover:text-ink"
      }`}
    >
      <svg viewBox="0 0 16 16" className="size-[17px]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {children}
      </svg>
    </button>
  );
}

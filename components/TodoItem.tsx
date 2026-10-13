"use client";

import { useOptimistic, useState, useTransition } from "react";
import type { Todo } from "@/lib/types";
import { deleteTodo, renameTodo, setTodoDone } from "@/app/todos/actions";

export default function TodoItem({ todo }: { todo: Todo }) {
  const [done, setOptimisticDone] = useOptimistic(todo.done);
  const [title, setOptimisticTitle] = useOptimistic(todo.title);
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

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

  function remove() {
    startTransition(() => deleteTodo(todo.id));
  }

  return (
    <li className={`group flex items-center gap-3 py-3 ${pending ? "opacity-60" : ""}`}>
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={done ? `Mark "${title}" as open` : `Mark "${title}" as done`}
        onClick={toggle}
        className={`check ${done ? "check-on" : ""}`}
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M3.5 8.5l3 3 6-6.5" />
        </svg>
      </button>

      {editing ? (
        <form action={save} className="flex flex-1 gap-2">
          <label htmlFor={`edit-${todo.id}`} className="sr-only">Edit task</label>
          <input
            id={`edit-${todo.id}`}
            name="title"
            defaultValue={title}
            required
            maxLength={500}
            autoFocus
            onKeyDown={(e) => e.key === "Escape" && setEditing(false)}
            className="field flex-1 py-1.5"
          />
          <button type="submit" className="btn-quiet">Save</button>
        </form>
      ) : (
        <>
          <span className="min-w-0 flex-1 break-words">
            <span className={`marker ${done ? "marker-on text-muted" : ""}`}>{title}</span>
          </span>
          <div className="flex shrink-0 gap-0.5 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
            <IconButton label={`Edit "${title}"`} onClick={() => setEditing(true)}>
              <path d="M11.5 2.5l2 2L6 12l-3 1 1-3 7.5-7.5z" />
            </IconButton>
            <IconButton label={`Delete "${title}"`} onClick={remove} danger>
              <path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5" />
            </IconButton>
          </div>
        </>
      )}
    </li>
  );
}

function IconButton({
  label,
  onClick,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid size-9 place-items-center rounded-lg text-muted transition-colors hover:bg-hover ${
        danger ? "hover:text-danger" : "hover:text-ink"
      }`}
    >
      <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {children}
      </svg>
    </button>
  );
}

"use client";

import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import type { TodoWithSubtasks } from "@/lib/types";
import { listHref, type ListQuery } from "@/lib/list-query";
import { deleteTodo, renameTodo, setTodoDone } from "@/app/todos/actions";
import { DueBadge, PriorityBadge, ProgressBadge, TagChip } from "./Badges";
import Checkbox from "./Checkbox";
import Icon, { type IconName } from "./Icon";
import SwipeRow from "./SwipeRow";
import { useUndo } from "./Undo";

export default function TodoItem({
  todo,
  today,
  query,
}: {
  todo: TodoWithSubtasks;
  today: string;
  query: ListQuery;
}) {
  const [done, setOptimisticDone] = useOptimistic(todo.done);
  const [title, setOptimisticTitle] = useOptimistic(todo.title);
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const { hidden, remove } = useUndo();

  const subDone = todo.subtasks.filter((s) => s.done).length;
  const hasMeta = todo.due_date || todo.priority >= 2 || todo.tags.length || todo.subtasks.length;

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

  function del() {
    remove(todo.id, `Deleted “${title}”`, () => deleteTodo(todo.id));
  }

  if (hidden.has(todo.id)) return null;

  return (
    <SwipeRow
      right={done ? { label: "Reopen", icon: "rotate", tone: "accent" } : { label: "Done", icon: "check", tone: "accent" }}
      left={{ label: "Delete", icon: "trash", tone: "danger" }}
      onRight={toggle}
      onLeft={del}
      className="rounded-md"
    >
      <div
        className={`group flex items-start gap-3 rounded-md px-2 py-2.5 transition-colors duration-150 hover:bg-hover ${
          pending ? "opacity-60" : ""
        }`}
      >
        <div className="pt-[3px]">
          <Checkbox checked={done} onToggle={toggle} label={title} />
        </div>

        {editing ? (
          <form action={save} className="-my-1 flex flex-1 items-center gap-2">
            <label htmlFor={`edit-${todo.id}`} className="sr-only">Edit task</label>
            <input
              id={`edit-${todo.id}`}
              name="title"
              defaultValue={title}
              required
              maxLength={500}
              autoFocus
              onKeyDown={(e) => e.key === "Escape" && setEditing(false)}
              className="field-sm flex-1"
            />
            <button type="submit" className="btn btn-sm">Save</button>
            <button type="button" onClick={() => setEditing(false)} className="btn-quiet">Cancel</button>
          </form>
        ) : (
          <>
            <div className="min-w-0 flex-1">
              <Link
                href={`/todos/${todo.id}`}
                onDoubleClick={(e) => {
                  e.preventDefault();
                  setEditing(true);
                }}
                className={`task-title block break-words ${done ? "task-done" : ""}`}
              >
                {title}
              </Link>
              {hasMeta ? (
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                  <DueBadge due={todo.due_date} done={done} today={today} />
                  <ProgressBadge done={subDone} total={todo.subtasks.length} />
                  <PriorityBadge priority={todo.priority} />
                  {todo.tags.map((tag) => (
                    <TagChip key={tag} tag={tag} href={listHref(query, { tag })} />
                  ))}
                </div>
              ) : null}
            </div>
            <div className="-my-1.5 flex shrink-0 text-faint opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 pointer-coarse:hidden">
              <IconButton label={`Rename "${title}"`} icon="pencil" onClick={() => setEditing(true)} />
              <IconButton label={`Delete "${title}"`} icon="trash" onClick={del} danger />
            </div>
          </>
        )}
      </div>
    </SwipeRow>
  );
}

export function IconButton({
  label,
  icon,
  onClick,
  danger,
  disabled,
}: {
  label: string;
  icon: IconName;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`press grid size-8 place-items-center rounded-md hover:bg-paper disabled:pointer-events-none disabled:opacity-30 ${
        danger ? "hover:text-danger" : "hover:text-ink"
      }`}
    >
      <Icon name={icon} />
    </button>
  );
}

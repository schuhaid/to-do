"use client";

import { useOptimistic, useState, useTransition } from "react";
import { deleteSubtask, updateSubtask } from "@/app/todos/actions";
import type { Subtask } from "@/lib/types";
import Checkbox from "@/components/Checkbox";
import { DueBadge } from "@/components/Badges";
import { IconButton } from "@/components/TodoItem";
import Note from "./Note";

export default function SubtaskItem({
  subtask,
  today,
  canMoveUp,
  canMoveDown,
  onMove,
}: {
  subtask: Subtask;
  today: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMove: (delta: -1 | 1) => void;
}) {
  const [s, setS] = useOptimistic(subtask);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  function save(patch: Partial<Pick<Subtask, "title" | "done" | "note" | "due_date">>) {
    startTransition(async () => {
      setS({ ...s, ...patch });
      await updateSubtask(s.id, patch);
    });
  }

  function saveTitle(formData: FormData) {
    const title = String(formData.get("title") ?? "").trim();
    setEditing(false);
    if (title && title !== s.title) save({ title });
  }

  const detailsId = `subtask-${s.id}-details`;

  return (
    <li className={pending ? "opacity-70" : ""}>
      <div className="group flex items-start gap-3 px-5 py-2.5 transition-colors duration-150 hover:bg-hover sm:px-6">
        <div className="pt-[11px]">
          <Checkbox small checked={s.done} label={s.title} onToggle={() => save({ done: !s.done })} />
        </div>

        {editing ? (
          <form action={saveTitle} className="flex flex-1 items-center gap-2">
            <label htmlFor={`edit-sub-${s.id}`} className="sr-only">Edit subtask</label>
            <input
              id={`edit-sub-${s.id}`}
              name="title"
              defaultValue={s.title}
              required
              maxLength={500}
              autoFocus
              onKeyDown={(e) => e.key === "Escape" && setEditing(false)}
              className="field flex-1 py-1.5"
            />
            <button type="submit" className="btn btn-sm">Save</button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls={detailsId}
            className="min-h-11 min-w-0 flex-1 py-2 text-left"
          >
            <span className={`task-title break-words ${s.done ? "task-done" : ""}`}>{s.title}</span>
            {(s.due_date || s.note) && (
              <span className="mt-1 flex flex-wrap items-center gap-2">
                <DueBadge due={s.due_date} done={s.done} today={today} />
                {s.note && (
                  <span className="chip bg-sunken text-muted">
                    <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                      <path d="M4 2.5h5.5L12.5 5.5v8h-8.5z M9.5 2.5v3h3 M6 8.5h4.5M6 11h3" strokeLinejoin="round" strokeLinecap="round" />
                    </svg>
                    Note
                  </span>
                )}
              </span>
            )}
          </button>
        )}

        <div className="flex shrink-0 items-center text-muted">
          <div className="flex sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
            <IconButton label="Move up" onClick={() => onMove(-1)} disabled={!canMoveUp}>
              <path d="M8 12.5v-9M4.5 7L8 3.5 11.5 7" />
            </IconButton>
            <IconButton label="Move down" onClick={() => onMove(1)} disabled={!canMoveDown}>
              <path d="M8 3.5v9M4.5 9L8 12.5 11.5 9" />
            </IconButton>
          </div>
          <IconButton label={open ? "Hide details" : "Show note and details"} onClick={() => setOpen(!open)}>
            <path d={open ? "M4 10l4-4 4 4" : "M4 6l4 4 4-4"} />
          </IconButton>
        </div>
      </div>

      {open && (
        <div id={detailsId} className="space-y-4 border-t border-dashed border-line bg-sunken/60 px-5 py-4 sm:pl-[3.75rem] sm:pr-6">
          <Note note={s.note} onSave={(note) => save({ note })} />
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <label className="flex items-center gap-2">
              <span className="font-semibold">Due</span>
              <input
                type="date"
                value={s.due_date ?? ""}
                onChange={(e) => save({ due_date: e.target.value || null })}
                className="field min-h-9 w-auto py-1.5 text-sm"
              />
            </label>
            {s.due_date && (
              <button type="button" onClick={() => save({ due_date: null })} className="btn-quiet">Clear</button>
            )}
            <span className="flex-1" />
            <button type="button" onClick={() => setEditing(true)} className="btn-quiet">Rename</button>
            <button
              type="button"
              onClick={() => startTransition(() => deleteSubtask(s.id))}
              className="btn-quiet hover:bg-danger-soft! hover:text-danger!"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

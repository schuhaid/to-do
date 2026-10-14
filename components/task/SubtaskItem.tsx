"use client";

import { useOptimistic, useState, useTransition } from "react";
import { deleteSubtask, updateSubtask } from "@/app/todos/actions";
import type { Subtask } from "@/lib/types";
import Checkbox from "@/components/Checkbox";
import { DueBadge } from "@/components/Badges";
import { IconButton } from "@/components/TodoItem";
import Note from "./Note";
import Icon from "@/components/Icon";
import SwipeRow from "@/components/SwipeRow";
import { useUndo } from "@/components/Undo";

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
  const { hidden, remove } = useUndo();

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
  const del = () => remove(`sub:${s.id}`, `Deleted “${s.title}”`, () => deleteSubtask(s.id));

  if (hidden.has(`sub:${s.id}`)) return null;

  return (
    <SwipeRow
      right={s.done ? { label: "Reopen", icon: "rotate", tone: "accent" } : { label: "Done", icon: "check", tone: "accent" }}
      left={{ label: "Delete", icon: "trash", tone: "danger" }}
      onRight={() => save({ done: !s.done })}
      onLeft={del}
      className={`rounded-md ${pending ? "opacity-70" : ""}`}
    >
      <div className="group flex items-start gap-3 rounded-md px-2 py-1 transition-colors duration-150 hover:bg-hover">
        <div className="pt-[9px]">
          <Checkbox small checked={s.done} label={s.title} onToggle={() => save({ done: !s.done })} />
        </div>

        {editing ? (
          <form action={saveTitle} className="flex flex-1 items-center gap-2 py-1">
            <label htmlFor={`edit-sub-${s.id}`} className="sr-only">Edit subtask</label>
            <input
              id={`edit-sub-${s.id}`}
              name="title"
              defaultValue={s.title}
              required
              maxLength={500}
              autoFocus
              onKeyDown={(e) => e.key === "Escape" && setEditing(false)}
              className="field-sm flex-1"
            />
            <button type="submit" className="btn btn-sm">Save</button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls={detailsId}
            className="min-h-9 min-w-0 flex-1 py-1.5 text-left"
          >
            <span className={`task-title break-words ${s.done ? "task-done" : ""}`}>{s.title}</span>
            {(s.due_date || s.note) && (
              <span className="mt-0.5 flex flex-wrap items-center gap-x-3">
                <DueBadge due={s.due_date} done={s.done} today={today} />
                {s.note && (
                  <span className="inline-flex items-center gap-1 text-[0.8125rem] text-muted">
                    <Icon name="note" className="size-3.5" />
                    Note
                  </span>
                )}
              </span>
            )}
          </button>
        )}

        <div className="flex shrink-0 items-center text-faint">
          <div className="flex opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 pointer-coarse:hidden">
            <IconButton label="Move up" icon="up" onClick={() => onMove(-1)} disabled={!canMoveUp} />
            <IconButton label="Move down" icon="down" onClick={() => onMove(1)} disabled={!canMoveDown} />
          </div>
          <IconButton
            label={open ? "Hide details" : "Show note and details"}
            icon={open ? "chevronUp" : "chevronDown"}
            onClick={() => setOpen(!open)}
          />
        </div>
      </div>

      {/* Details open in place: the row grows, nothing jumps. */}
      <div
        id={detailsId}
        inert={!open}
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="space-y-3 pb-3 pl-[2.375rem] pr-2 pt-1">
            <Note note={s.note} onSave={(note) => save({ note })} />
            <div className="flex flex-wrap items-center gap-1">
              <label className="meta flex items-center gap-2 pr-1">
                Due
                <input
                  type="date"
                  value={s.due_date ?? ""}
                  onChange={(e) => save({ due_date: e.target.value || null })}
                  className="field-sm w-auto"
                />
              </label>
              {s.due_date && (
                <button type="button" onClick={() => save({ due_date: null })} className="btn-quiet">Clear</button>
              )}
              <span className="flex-1" />
              <button type="button" onClick={() => setEditing(true)} className="btn-quiet">Rename</button>
              <button type="button" onClick={del} className="btn-quiet hover:text-danger!">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </SwipeRow>
  );
}

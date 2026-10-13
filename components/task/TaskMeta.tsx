"use client";

import { useOptimistic, useState, useTransition } from "react";
import { updateTodo } from "@/app/todos/actions";
import { DueBadge, PriorityIcon } from "@/components/Badges";
import { PRIORITY_LABELS, type Priority } from "@/lib/types";

const PRIORITIES: Priority[] = [0, 1, 2, 3];

/** Due date, priority and tags. Every change saves immediately. */
export default function TaskMeta({
  id,
  dueDate,
  priority,
  tags,
  done,
  today,
}: {
  id: string;
  dueDate: string | null;
  priority: Priority;
  tags: string[];
  done: boolean;
  today: string;
}) {
  const [state, setState] = useOptimistic({ dueDate, priority, tags });
  const [tagInput, setTagInput] = useState("");
  const [, startTransition] = useTransition();

  function save(patch: Partial<typeof state>) {
    startTransition(async () => {
      setState({ ...state, ...patch });
      await updateTodo(id, {
        ...(patch.dueDate !== undefined && { due_date: patch.dueDate }),
        ...(patch.priority !== undefined && { priority: patch.priority }),
        ...(patch.tags !== undefined && { tags: patch.tags }),
      });
    });
  }

  function addTag() {
    const tag = tagInput.trim().replace(/^#/, "").toLowerCase();
    setTagInput("");
    if (tag && !state.tags.includes(tag)) save({ tags: [...state.tags, tag] });
  }

  return (
    <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-[7rem_1fr] sm:items-center sm:gap-x-4 sm:gap-y-3 sm:pl-9">
      <dt className="font-medium text-muted">Due date</dt>
      <dd className="flex flex-wrap items-center gap-2">
        <input
          type="date"
          aria-label="Due date"
          value={state.dueDate ?? ""}
          onChange={(e) => save({ dueDate: e.target.value || null })}
          className="field w-auto py-2 text-sm"
        />
        <DueBadge due={state.dueDate} done={done} today={today} />
        {state.dueDate && (
          <button type="button" onClick={() => save({ dueDate: null })} className="btn-quiet">
            Clear
          </button>
        )}
      </dd>

      <dt className="font-medium text-muted">Priority</dt>
      <dd>
        <div role="radiogroup" aria-label="Priority" className="inline-flex flex-wrap rounded-xl bg-hover p-1">
          {PRIORITIES.map((p) => {
            const active = state.priority === p;
            return (
              <button
                key={p}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => save({ priority: p })}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors ${
                  active ? "bg-panel text-ink shadow-sm" : "text-muted hover:text-ink"
                }`}
              >
                {p > 0 && <PriorityIcon priority={p} />}
                {PRIORITY_LABELS[p]}
              </button>
            );
          })}
        </div>
      </dd>

      <dt className="font-medium text-muted">Tags</dt>
      <dd className="flex flex-wrap items-center gap-1.5">
        {state.tags.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-hover py-1 pl-2 pr-1 text-xs font-medium text-muted">
            #{tag}
            <button
              type="button"
              onClick={() => save({ tags: state.tags.filter((t) => t !== tag) })}
              aria-label={`Remove tag ${tag}`}
              className="grid size-4 place-items-center rounded hover:bg-line hover:text-ink"
            >
              ×
            </button>
          </span>
        ))}
        {state.tags.length < 10 && (
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTag();
              }
            }}
            onBlur={addTag}
            aria-label="Add a tag"
            placeholder="Add tag…"
            maxLength={30}
            className="w-28 rounded-md bg-transparent px-1.5 py-1 text-xs outline-none placeholder:text-faint focus:bg-hover"
          />
        )}
      </dd>
    </dl>
  );
}

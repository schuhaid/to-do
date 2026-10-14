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
    <dl className="space-y-5 text-sm">
      <div>
      <dt className="mb-2 font-semibold">Due date</dt>
      <dd className="flex flex-wrap items-center gap-2">
        <input
          type="date"
          aria-label="Due date"
          value={state.dueDate ?? ""}
          onChange={(e) => save({ dueDate: e.target.value || null })}
          className="field min-h-10 w-full py-2 text-sm"
        />
        <DueBadge due={state.dueDate} done={done} today={today} />
        {state.dueDate && (
          <button type="button" onClick={() => save({ dueDate: null })} className="btn-quiet">
            Clear
          </button>
        )}
      </dd>
      </div>

      <div>
      <dt className="mb-2 font-semibold">Priority</dt>
      <dd>
        <div role="radiogroup" aria-label="Priority" className="segmented grid w-full grid-cols-2 gap-1">
          {PRIORITIES.map((p) => {
            const active = state.priority === p;
            return (
              <button
                key={p}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => save({ priority: p })}
                className={`segment justify-center ${active ? "segment-on" : ""}`}
              >
                {p > 0 && <PriorityIcon priority={p} />}
                {PRIORITY_LABELS[p]}
              </button>
            );
          })}
        </div>
      </dd>
      </div>

      <div>
      <dt className="mb-2 font-semibold">Tags</dt>
      <dd className="flex flex-wrap items-center gap-1.5">
        {state.tags.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-accent-soft py-1 pl-2 pr-1 text-xs font-semibold text-accent">
            #{tag}
            <button
              type="button"
              onClick={() => save({ tags: state.tags.filter((t) => t !== tag) })}
              aria-label={`Remove tag ${tag}`}
              className="grid size-5 place-items-center rounded hover:bg-accent hover:text-accent-ink"
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
            className="min-h-8 w-28 rounded-md border border-dashed border-line-strong bg-transparent px-2 py-1 text-xs outline-none placeholder:text-faint focus:border-accent focus:border-solid"
          />
        )}
      </dd>
      </div>
    </dl>
  );
}

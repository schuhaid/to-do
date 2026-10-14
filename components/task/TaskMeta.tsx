"use client";

import { useOptimistic, useState, useTransition } from "react";
import { updateTodo } from "@/app/todos/actions";
import { DueBadge, PriorityIcon } from "@/components/Badges";
import Icon from "@/components/Icon";
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
    <dl className="grid grid-cols-1 gap-x-3 text-[0.8125rem] sm:grid-cols-[5.5rem_minmax(0,1fr)] sm:items-center sm:gap-y-1">
      <dt className="flex items-center gap-2 text-muted">
        <Icon name="calendar" className="size-3.5" />
        Due
      </dt>
      <dd className="mb-3 flex min-h-9 flex-wrap items-center gap-1 sm:mb-0">
        <input
          type="date"
          aria-label="Due date"
          value={state.dueDate ?? ""}
          onChange={(e) => save({ dueDate: e.target.value || null })}
          className="select-quiet -ml-2 text-ink"
        />
        <DueBadge due={state.dueDate} done={done} today={today} />
        {state.dueDate && (
          <button type="button" onClick={() => save({ dueDate: null })} className="btn-quiet">
            Clear
          </button>
        )}
      </dd>

      <dt className="flex items-center gap-2 text-muted">
        <Icon name="flag" className="size-3.5" />
        Priority
      </dt>
      <dd className="mb-3 flex min-h-9 items-center sm:mb-0">
        <div role="radiogroup" aria-label="Priority" className="segmented grid w-full grid-cols-4 sm:inline-flex sm:w-auto">
          {PRIORITIES.map((p) => {
            const active = state.priority === p;
            return (
              <button
                key={p}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => save({ priority: p })}
                className={`segment ${active ? "segment-on" : ""}`}
              >
                {p > 0 && <PriorityIcon priority={p} />}
                {PRIORITY_LABELS[p]}
              </button>
            );
          })}
        </div>
      </dd>

      <dt className="flex items-center gap-2 text-muted sm:self-start sm:pt-2">
        <span className="w-3.5 text-center" aria-hidden="true">#</span>
        Tags
      </dt>
      <dd className="flex min-h-9 flex-wrap items-center gap-x-2 gap-y-1">
        {state.tags.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-0.5 text-ink">
            #{tag}
            <button
              type="button"
              onClick={() => save({ tags: state.tags.filter((t) => t !== tag) })}
              aria-label={`Remove tag ${tag}`}
              className="grid size-6 place-items-center rounded text-faint hover:bg-hover hover:text-ink"
            >
              <Icon name="x" className="size-3" />
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
            placeholder="Add tag"
            maxLength={30}
            className="h-8 w-24 bg-transparent text-ink outline-none placeholder:text-faint"
          />
        )}
      </dd>
    </dl>
  );
}

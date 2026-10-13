"use client";

import { useOptimistic, useRef, useTransition } from "react";
import { addSubtask, reorderSubtasks } from "@/app/todos/actions";
import type { Subtask } from "@/lib/types";
import SubtaskItem from "./SubtaskItem";

export default function SubtaskList({
  todoId,
  subtasks,
  today,
}: {
  todoId: string;
  subtasks: Subtask[];
  today: string;
}) {
  const [items, setItems] = useOptimistic(subtasks);
  const [, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function move(index: number, delta: -1 | 1) {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    startTransition(async () => {
      setItems(next);
      await reorderSubtasks(todoId, next.map((s) => s.id));
    });
  }

  async function add(formData: FormData) {
    const title = String(formData.get("title") ?? "");
    await addSubtask(todoId, title);
    formRef.current?.querySelector("input")?.focus();
  }

  return (
    <div>
      {items.length > 0 ? (
        <ul className="mt-2 divide-y divide-line border-y border-line">
          {items.map((s, i) => (
            <SubtaskItem
              key={s.id}
              subtask={s}
              today={today}
              canMoveUp={i > 0}
              canMoveDown={i < items.length - 1}
              onMove={(d) => move(i, d)}
            />
          ))}
        </ul>
      ) : (
        <p className="px-5 pb-2 pt-1 text-sm text-muted sm:px-6">
          Break this task into smaller steps. Each one can have its own note and due date.
        </p>
      )}

      <form ref={formRef} action={add} className="flex gap-2 p-4 sm:px-6">
        <label htmlFor="new-subtask" className="sr-only">New subtask</label>
        <input
          id="new-subtask"
          name="title"
          required
          maxLength={500}
          autoComplete="off"
          placeholder="Add a subtask…"
          className="field flex-1 py-2.5"
        />
        <button type="submit" className="btn py-2.5">Add</button>
      </form>
    </div>
  );
}

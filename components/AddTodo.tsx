"use client";

import { useFormStatus } from "react-dom";
import { addTodo } from "@/app/todos/actions";
import Icon from "./Icon";

// One composer bar: title, optional due date, add button.
// React resets the form after the action finishes, clearing the inputs.
export default function AddTodo() {
  return (
    <form
      action={addTodo}
      className="flex flex-wrap items-center gap-2 border border-line px-2 py-1.5 transition-colors duration-150 hover:border-line-strong focus-within:border-accent sm:flex-nowrap"
      style={{ borderRadius: "var(--radius)" }}
    >
      <span className="hidden pl-1 text-faint sm:block" aria-hidden="true">
        <Icon name="plus" />
      </span>
      <label htmlFor="new-todo" className="sr-only">New task</label>
      <input
        id="new-todo"
        name="title"
        required
        maxLength={500}
        autoComplete="off"
        placeholder="New task, use #tag to label it"
        className="h-9 min-w-0 flex-1 basis-full bg-transparent px-1 text-ink outline-none placeholder:text-faint sm:basis-auto"
      />
      <label className="sr-only" htmlFor="new-todo-due">Due date (optional)</label>
      <input
        id="new-todo-due"
        name="due_date"
        type="date"
        title="Due date (optional)"
        className="select-quiet h-9 flex-1 sm:w-36 sm:flex-none"
      />
      <AddButton />
    </form>
  );
}

function AddButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-sm h-9 shrink-0">
      {pending ? "Adding…" : "Add"}
    </button>
  );
}

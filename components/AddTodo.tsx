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
      className="panel flex flex-wrap items-center gap-2 p-2 transition-colors duration-150 focus-within:border-accent focus-within:ring-3 focus-within:ring-accent-soft sm:flex-nowrap"
    >
      <span className="hidden pl-2 text-accent sm:block" aria-hidden="true">
        <Icon name="plus" className="size-5" strokeWidth={2.2} />
      </span>
      <label htmlFor="new-todo" className="sr-only">New task</label>
      <input
        id="new-todo"
        name="title"
        required
        maxLength={500}
        autoComplete="off"
        placeholder="Add a task… type #tag to label it"
        className="min-h-11 min-w-0 flex-1 basis-full rounded-lg bg-transparent px-2 text-base text-ink outline-none placeholder:text-faint sm:basis-auto"
      />
      <label className="sr-only" htmlFor="new-todo-due">Due date (optional)</label>
      <input
        id="new-todo-due"
        name="due_date"
        type="date"
        title="Due date (optional)"
        className="min-h-11 flex-1 rounded-lg border border-line bg-sunken px-3 text-sm text-muted outline-none transition-colors hover:border-line-strong focus:border-accent sm:w-40 sm:flex-none"
      />
      <AddButton />
    </form>
  );
}

function AddButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn shrink-0 px-5">
      {pending ? "Adding…" : "Add task"}
    </button>
  );
}

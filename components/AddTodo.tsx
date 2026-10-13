"use client";

import { useFormStatus } from "react-dom";
import { addTodo } from "@/app/todos/actions";

// React resets the form after the action finishes, clearing the inputs.
export default function AddTodo() {
  return (
    <form action={addTodo} className="flex flex-wrap gap-2 sm:flex-nowrap">
      <label htmlFor="new-todo" className="sr-only">New task</label>
      <input
        id="new-todo"
        name="title"
        required
        maxLength={500}
        autoComplete="off"
        placeholder="Add a task… use #tag to label it"
        className="field min-w-0 flex-1 basis-full sm:basis-auto"
      />
      <label className="sr-only" htmlFor="new-todo-due">Due date (optional)</label>
      <input
        id="new-todo-due"
        name="due_date"
        type="date"
        title="Due date (optional)"
        className="field w-auto flex-1 text-sm text-muted sm:w-40 sm:flex-none"
      />
      <AddButton />
    </form>
  );
}

function AddButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn shrink-0">
      {pending ? "Adding…" : "Add"}
    </button>
  );
}

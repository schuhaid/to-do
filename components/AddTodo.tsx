"use client";

import { useFormStatus } from "react-dom";
import { addTodo } from "@/app/todos/actions";

// React resets the form after the action finishes, clearing the input.
export default function AddTodo() {
  return (
    <form action={addTodo} className="flex gap-2">
      <label htmlFor="new-todo" className="sr-only">New task</label>
      <input
        id="new-todo"
        name="title"
        required
        maxLength={500}
        autoComplete="off"
        placeholder="Add a task…"
        className="field flex-1"
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

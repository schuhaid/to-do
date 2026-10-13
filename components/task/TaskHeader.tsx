"use client";

import { useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteTodo, renameTodo, setTodoDone } from "@/app/todos/actions";
import Checkbox from "@/components/Checkbox";

export default function TaskHeader({ id, title, done }: { id: string; title: string; done: boolean }) {
  const router = useRouter();
  const [optimisticDone, setOptimisticDone] = useOptimistic(done);
  const [optimisticTitle, setOptimisticTitle] = useOptimistic(title);
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  function save(formData: FormData) {
    const next = String(formData.get("title") ?? "").trim();
    setEditing(false);
    if (!next || next === optimisticTitle) return;
    startTransition(async () => {
      setOptimisticTitle(next);
      await renameTodo(id, next);
    });
  }

  function remove() {
    startTransition(async () => {
      await deleteTodo(id);
      router.push("/todos");
    });
  }

  return (
    <div className={`flex items-start gap-3.5 ${pending ? "opacity-70" : ""}`}>
      <div className="pt-1.5">
        <Checkbox
          checked={optimisticDone}
          label={optimisticTitle}
          onToggle={() =>
            startTransition(async () => {
              setOptimisticDone(!optimisticDone);
              await setTodoDone(id, !optimisticDone);
            })
          }
        />
      </div>
      {editing ? (
        <form action={save} className="flex flex-1 flex-wrap items-center gap-2">
          <label htmlFor="task-title" className="sr-only">Task title</label>
          <input
            id="task-title"
            name="title"
            defaultValue={optimisticTitle}
            required
            maxLength={500}
            autoFocus
            onKeyDown={(e) => e.key === "Escape" && setEditing(false)}
            className="field min-w-0 flex-1 text-lg font-semibold"
          />
          <button type="submit" className="btn py-2.5">Save</button>
          <button type="button" onClick={() => setEditing(false)} className="btn-quiet">Cancel</button>
        </form>
      ) : (
        <>
          <h1
            className={`task-title min-w-0 flex-1 break-words text-xl font-semibold leading-snug tracking-tight sm:text-2xl ${
              optimisticDone ? "task-done" : ""
            }`}
          >
            {optimisticTitle}
          </h1>
          <div className="flex shrink-0 gap-1">
            <button type="button" onClick={() => setEditing(true)} className="btn-quiet">Rename</button>
            <button type="button" onClick={remove} className="btn-quiet hover:text-danger!">Delete</button>
          </div>
        </>
      )}
    </div>
  );
}

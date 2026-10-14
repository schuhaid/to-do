"use client";

import Icon from "@/components/Icon";

export default function TodosError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto w-full max-w-xl py-16">
      <span className="mb-5 grid size-12 place-items-center rounded-2xl bg-danger-soft text-danger" aria-hidden="true">
        <Icon name="alert" className="size-6" />
      </span>
      <h1 className="page-title">Something went wrong</h1>
      <p className="mt-2 text-muted">
        {error.message || "Couldn't reach the database."} Check your connection and try again.
      </p>
      <button onClick={reset} className="btn mt-6">Try again</button>
    </main>
  );
}

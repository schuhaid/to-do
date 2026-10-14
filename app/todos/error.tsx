"use client";

export default function TodosError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="w-full max-w-[44rem] py-10">
      <h1 className="page-title">Couldn&apos;t load your tasks</h1>
      <p className="mt-2 text-muted">
        {error.message || "The database didn't answer."} Check your connection and try again.
      </p>
      <button onClick={reset} className="btn btn-sm mt-6">Try again</button>
    </main>
  );
}

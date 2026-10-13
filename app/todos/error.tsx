"use client";

export default function TodosError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto w-full max-w-xl px-4 py-20">
      <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="mt-2 text-muted">
        {error.message || "Couldn't reach the database."} Check your connection and try again.
      </p>
      <button onClick={reset} className="btn mt-6">Try again</button>
    </main>
  );
}

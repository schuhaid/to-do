import Link from "next/link";

export default function TaskNotFound() {
  return (
    <main className="mx-auto mt-16 max-w-md text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Task not found</h1>
      <p className="mt-2 text-muted">It may have been deleted, or the link is wrong.</p>
      <Link href="/todos" className="btn mt-6">Back to your tasks</Link>
    </main>
  );
}

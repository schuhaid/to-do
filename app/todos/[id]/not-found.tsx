import Link from "next/link";

export default function TaskNotFound() {
  return (
    <main className="mx-auto mt-16 flex max-w-md flex-col items-center text-center">
      <p className="eyebrow">404</p>
      <h1 className="page-title mt-1">Task not found</h1>
      <p className="mt-2 text-muted">It may have been deleted, or the link is wrong.</p>
      <Link href="/todos" className="btn mt-6">Back to your tasks</Link>
    </main>
  );
}

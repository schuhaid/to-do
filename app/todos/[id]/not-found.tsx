import Link from "next/link";

export default function TaskNotFound() {
  return (
    <main className="w-full max-w-[44rem] py-10">
      <h1 className="page-title">Task not found</h1>
      <p className="mt-2 text-muted">It may have been deleted, or the link is wrong.</p>
      <Link href="/todos" className="btn btn-sm mt-6">Back to tasks</Link>
    </main>
  );
}

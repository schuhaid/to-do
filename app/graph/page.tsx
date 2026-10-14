import type { Metadata } from "next";
import Link from "next/link";
import { getTodosWithSubtasks } from "@/lib/data";
import { todayISO } from "@/lib/dates";
import { buildGraph } from "@/lib/graph";
import TaskGraph from "@/components/graph/TaskGraph";

export const metadata: Metadata = { title: "Graph – Ticked" };

export default async function GraphPage() {
  const todos = await getTodosWithSubtasks();
  const graph = buildGraph(todos, todayISO());

  return (
    <main className="w-full max-w-6xl">
      <header className="mb-8">
        <h1 className="page-title">Graph</h1>
        <p className="meta mt-1 max-w-xl">
          Every task and its subtasks. Drag to move, scroll or pinch to zoom, click a node to open it.
        </p>
      </header>
      {todos.length === 0 ? (
        <div className="py-10">
          <p className="font-medium">Nothing to map yet</p>
          <p className="meta mt-1">The graph grows as you add tasks and subtasks.</p>
          <Link href="/todos" className="btn btn-sm mt-5">Add a task</Link>
        </div>
      ) : (
        <TaskGraph nodes={graph.nodes} links={graph.links} />
      )}
    </main>
  );
}

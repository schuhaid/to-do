import type { Metadata } from "next";
import Link from "next/link";
import { getTodosWithSubtasks } from "@/lib/data";
import { todayISO } from "@/lib/dates";
import { buildGraph } from "@/lib/graph";
import TaskGraph from "@/components/graph/TaskGraph";

export const metadata: Metadata = { title: "Graph · Ticked" };

export default async function GraphPage() {
  const todos = await getTodosWithSubtasks();
  const graph = buildGraph(todos, todayISO());

  return (
    <main>
      <header className="mb-6">
        <p className="eyebrow">Map</p>
        <h1 className="page-title mt-2">Graph</h1>
        <p className="mt-1.5 max-w-xl text-muted">
          Every task and its subtasks. Drag to move, scroll or pinch to zoom, click a node to open it.
        </p>
      </header>
      {todos.length === 0 ? (
        <div className="panel flex flex-col items-center px-6 py-16 text-center">
          <p className="section-title">An empty map</p>
          <p className="mt-1 text-sm text-muted">Your graph grows as you add tasks and subtasks.</p>
          <Link href="/todos" className="btn mt-5">Add your first task</Link>
        </div>
      ) : (
        <TaskGraph nodes={graph.nodes} links={graph.links} />
      )}
    </main>
  );
}

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
    <main className="mt-4 sm:mt-8">
      <div className="mb-5 px-1">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight sm:text-[32px]">Graph</h1>
        <p className="mt-1 text-muted">
          Every task and its subtasks. Drag to move, scroll or pinch to zoom, click a node to open it.
        </p>
      </div>
      {todos.length === 0 ? (
        <div className="panel px-6 py-14 text-center">
          <p className="text-muted">Your graph grows as you add tasks and subtasks.</p>
          <Link href="/todos" className="btn mt-5">Add your first task</Link>
        </div>
      ) : (
        <TaskGraph nodes={graph.nodes} links={graph.links} />
      )}
    </main>
  );
}

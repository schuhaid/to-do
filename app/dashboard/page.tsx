import type { Metadata } from "next";
import Link from "next/link";
import { getTodosWithSubtasks } from "@/lib/data";
import { formatShortDate, todayISO } from "@/lib/dates";
import { buildStats } from "@/lib/stats";
import DashboardCharts from "@/components/dashboard/DashboardCharts";

export const metadata: Metadata = { title: "Dashboard – Ticked" };

export default async function DashboardPage() {
  const todos = await getTodosWithSubtasks();
  const today = todayISO();
  const stats = buildStats(todos, today);

  return (
    <main className="w-full max-w-5xl">
      <header className="mb-10">
        <h1 className="page-title">Dashboard</h1>
        <p className="meta mt-1">{formatShortDate(today)}</p>
      </header>
      {todos.length === 0 ? (
        <div className="py-10">
          <p className="font-medium">Nothing to show yet</p>
          <p className="meta mt-1">The numbers fill in as you add and tick off tasks.</p>
          <Link href="/todos" className="btn btn-sm mt-5">Add a task</Link>
        </div>
      ) : (
        <DashboardCharts stats={stats} today={today} />
      )}
    </main>
  );
}

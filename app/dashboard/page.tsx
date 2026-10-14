import type { Metadata } from "next";
import Link from "next/link";
import { getTodosWithSubtasks } from "@/lib/data";
import { formatShortDate, todayISO } from "@/lib/dates";
import { buildStats } from "@/lib/stats";
import DashboardCharts from "@/components/dashboard/DashboardCharts";

export const metadata: Metadata = { title: "Dashboard · Ticked" };

export default async function DashboardPage() {
  const todos = await getTodosWithSubtasks();
  const today = todayISO();
  const stats = buildStats(todos, today);

  return (
    <main>
      <header className="mb-6">
        <p className="eyebrow">{formatShortDate(today)}</p>
        <h1 className="page-title mt-1">Dashboard</h1>
        <p className="mt-1.5 text-muted">What&apos;s left, what&apos;s due, and what you&apos;ve finished.</p>
      </header>
      {todos.length === 0 ? (
        <div className="panel flex flex-col items-center px-6 py-16 text-center">
          <p className="font-bold">Nothing to chart yet</p>
          <p className="mt-1 text-sm text-muted">Your dashboard fills up as you add tasks.</p>
          <Link href="/todos" className="btn mt-5">Add your first task</Link>
        </div>
      ) : (
        <DashboardCharts stats={stats} today={today} />
      )}
    </main>
  );
}

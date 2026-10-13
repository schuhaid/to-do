import type { Metadata } from "next";
import Link from "next/link";
import { getTodosWithSubtasks } from "@/lib/data";
import { todayISO } from "@/lib/dates";
import { buildStats } from "@/lib/stats";
import DashboardCharts from "@/components/dashboard/DashboardCharts";

export const metadata: Metadata = { title: "Dashboard · Ticked" };

export default async function DashboardPage() {
  const todos = await getTodosWithSubtasks();
  const today = todayISO();
  const stats = buildStats(todos, today);

  return (
    <main className="mt-4 sm:mt-8">
      <div className="mb-6 px-1">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight sm:text-[32px]">Dashboard</h1>
        <p className="mt-1 text-muted">What&apos;s left, what&apos;s due, and what you&apos;ve finished.</p>
      </div>
      {todos.length === 0 ? (
        <div className="panel px-6 py-14 text-center">
          <p className="text-muted">Your dashboard fills up as you add tasks.</p>
          <Link href="/todos" className="btn mt-5">Add your first task</Link>
        </div>
      ) : (
        <DashboardCharts stats={stats} today={today} />
      )}
    </main>
  );
}

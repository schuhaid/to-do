"use client";

import Link from "next/link";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DashboardStats } from "@/lib/stats";
import { DueBadge } from "@/components/Badges";

// Charts follow the page: grey for "still open", the accent only for what's
// done, red only for what's overdue. No legends where the title already says it.
const C = {
  open: "var(--line-strong)",
  done: "var(--accent)",
  overdue: "var(--danger)",
  grid: "var(--line)",
  axis: "var(--faint)",
};
const AXIS_TICK = { fill: C.axis, fontSize: 12 };

export default function DashboardCharts({ stats, today }: { stats: DashboardStats; today: string }) {
  const { totals } = stats;
  return (
    <div className="space-y-12">
      <dl className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
        <Figure label="Open" value={totals.open} href="/todos?filter=open" />
        <Figure label="Done" value={totals.done} href="/todos?filter=done" />
        <Figure
          label="Overdue"
          value={totals.overdue}
          href="/todos?due=overdue"
          danger={totals.overdue > 0}
          note={
            totals.overdue > 0
              ? `Oldest is ${totals.oldestOverdueDays} day${totals.oldestOverdueDays === 1 ? "" : "s"} late`
              : "Nothing late"
          }
        />
        <Figure
          label="Due in 7 days"
          value={totals.dueThisWeek}
          href="/todos?due=week"
          note={totals.dueToday > 0 ? `${totals.dueToday} due today` : undefined}
        />
      </dl>

      <div className="grid gap-x-16 gap-y-14 lg:grid-cols-2">
        <Section title="Progress" note="How much of everything is ticked off">
          <ul className="space-y-4">
            {stats.split.map((row) => {
              const total = row.open + row.done;
              return (
                <li key={row.name}>
                  <Meter label={row.name} done={row.done} total={total} />
                </li>
              );
            })}
          </ul>
        </Section>

        <Section
          title="Completed in the last 30 days"
          note={`${stats.completedTotal} finished, ${stats.completedLast7} of them this week`}
        >
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={stats.completed} margin={{ top: 4, right: 0, bottom: 0, left: -16 }} barCategoryGap={2}>
              <CartesianGrid vertical={false} stroke={C.grid} />
              <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} interval={6} />
              <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} width={32} />
              <Tooltip cursor={{ fill: "var(--hover)" }} content={ChartTooltip} isAnimationActive={false} />
              <Bar dataKey="count" name="Completed" fill={C.done} radius={[2, 2, 0, 0]} maxBarSize={10} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </Section>

        <Section title="Deadlines" note="Open tasks and subtasks due in the next 14 days">
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={stats.deadlines} margin={{ top: 4, right: 0, bottom: 0, left: -16 }} barCategoryGap={3}>
              <CartesianGrid vertical={false} stroke={C.grid} />
              <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={8} />
              <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} width={32} />
              <Tooltip cursor={{ fill: "var(--hover)" }} content={ChartTooltip} isAnimationActive={false} />
              <Bar dataKey="count" name="Due" radius={[2, 2, 0, 0]} maxBarSize={14} isAnimationActive={false}>
                {stats.deadlines.map((d) => (
                  <Cell key={d.key} fill={d.overdue ? C.overdue : C.open} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {stats.upcoming.length > 0 ? (
            <ul className="-mx-2 mt-4">
              {stats.upcoming.map((d) => (
                <li key={d.id}>
                  <Link
                    href={`/todos/${d.todoId}`}
                    className="flex min-h-9 items-center gap-3 rounded-md px-2 text-[0.875rem] hover:bg-hover"
                  >
                    <span className="min-w-0 flex-1 truncate">
                      {d.title}
                      {d.kind === "subtask" && <span className="text-faint"> in {d.parent}</span>}
                    </span>
                    <DueBadge due={d.due} done={false} today={today} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="meta mt-4">Nothing due in the next two weeks.</p>
          )}
        </Section>

        <Section title="Progress per task" note="Open tasks with subtasks, most urgent first">
          {stats.progress.length > 0 ? (
            <ul className="space-y-4">
              {stats.progress.map((p) => (
                <li key={p.id}>
                  <Link href={`/todos/${p.id}`} className="group block" title={p.fullName}>
                    <Meter label={p.name} done={p.done} total={p.total} hover />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="meta">Add subtasks to a task to track its progress here.</p>
          )}
        </Section>
      </div>
    </div>
  );
}

function Figure({
  label,
  value,
  href,
  note,
  danger,
}: {
  label: string;
  value: number;
  href: string;
  note?: string;
  danger?: boolean;
}) {
  return (
    <div className="min-w-0">
      <dt className="meta">{label}</dt>
      <dd>
        <Link
          href={href}
          className={`mt-1 inline-block text-[2rem] font-semibold leading-none tracking-[-0.02em] tabular-nums hover:underline hover:decoration-1 hover:underline-offset-4 ${
            danger ? "text-danger" : ""
          }`}
        >
          {value}
        </Link>
        {note && <p className={`mt-2 text-[0.8125rem] ${danger ? "text-danger" : "text-muted"}`}>{note}</p>}
      </dd>
    </div>
  );
}

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="min-w-0">
      <h2 className="section-title">{title}</h2>
      {note && <p className="meta mb-5 mt-0.5">{note}</p>}
      {children}
    </section>
  );
}

/** A thin line that fills with the accent as things get done. */
function Meter({ label, done, total, hover }: { label: string; done: number; total: number; hover?: boolean }) {
  const pct = total ? (done / total) * 100 : 0;
  return (
    <>
      <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[0.875rem]">
        <span className={`truncate ${hover ? "group-hover:underline group-hover:underline-offset-2" : ""}`}>{label}</span>
        <span className="meta shrink-0 tabular-nums">
          {done} of {total}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-line" aria-hidden="true">
        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
    </>
  );
}

type TipEntry = { dataKey?: unknown; name?: unknown; value?: unknown; color?: string; payload?: { overdue?: boolean } };

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: readonly TipEntry[]; label?: unknown }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-line bg-paper px-2.5 py-1.5 text-[0.75rem] shadow-[var(--shadow-overlay)]">
      <div className="text-muted">{String(label)}</div>
      {payload.map((p) => (
        <div key={String(p.dataKey)} className="font-medium tabular-nums">
          {String(p.value)} {String(p.name).toLowerCase()}
          {p.payload?.overdue ? <span className="text-danger"> (overdue)</span> : null}
        </div>
      ))}
    </div>
  );
}

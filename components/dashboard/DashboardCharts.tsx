"use client";

import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardStats } from "@/lib/stats";
import { DueBadge } from "@/components/Badges";
import Icon, { type IconName } from "@/components/Icon";

// Colors come from CSS variables, so charts follow light/dark mode automatically.
const C = {
  open: "var(--open)",
  done: "var(--done)",
  overdue: "var(--danger)",
  track: "var(--line)",
  grid: "var(--line)",
  axis: "var(--muted)",
};
const AXIS_TICK = { fill: C.axis, fontSize: 12 };

export default function DashboardCharts({ stats, today }: { stats: DashboardStats; today: string }) {
  const { totals } = stats;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatTile label="Open tasks" value={totals.open} href="/todos?filter=open" icon="circle" tone="open" />
        <StatTile label="Done" value={totals.done} href="/todos?filter=done" icon="check" tone="accent" />
        <StatTile
          label="Overdue"
          value={totals.overdue}
          href="/todos?due=overdue"
          icon="alert"
          tone={totals.overdue > 0 ? "danger" : "muted"}
          note={totals.overdue > 0 ? `Oldest: ${totals.oldestOverdueDays} day${totals.oldestOverdueDays === 1 ? "" : "s"}` : "Nothing late"}
        />
        <StatTile
          label="Due in 7 days"
          value={totals.dueThisWeek}
          href="/todos?due=week"
          icon="clock"
          tone="warn"
          note={totals.dueToday > 0 ? `${totals.dueToday} due today` : undefined}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Open vs done" subtitle="Tasks and subtasks">
          <Legend items={[{ label: "Open", color: C.open }, { label: "Done", color: C.done }]} />
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={stats.split} layout="vertical" margin={{ top: 4, right: 12, bottom: 0, left: 0 }} barCategoryGap={14}>
              <XAxis type="number" hide allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} width={72} />
              <Tooltip cursor={{ fill: "var(--hover)" }} content={ChartTooltip} />
              <Bar dataKey="open" name="Open" stackId="s" fill={C.open} stroke="var(--panel)" strokeWidth={2} radius={[4, 0, 0, 4]}>
                <LabelList dataKey="open" position="insideLeft" fill="var(--accent-ink)" fontSize={12} fontWeight={600} formatter={hideZero} />
              </Bar>
              <Bar dataKey="done" name="Done" stackId="s" fill={C.done} stroke="var(--panel)" strokeWidth={2} radius={[0, 4, 4, 0]}>
                <LabelList dataKey="done" position="insideRight" fill="var(--accent-ink)" fontSize={12} fontWeight={600} formatter={hideZero} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card
          title="Completed, last 30 days"
          subtitle={`${stats.completedTotal} finished · ${stats.completedLast7} in the last week`}
        >
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={stats.completed} margin={{ top: 8, right: 4, bottom: 0, left: -24 }} barCategoryGap={2}>
              <CartesianGrid vertical={false} stroke={C.grid} />
              <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} interval={6} />
              <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} width={40} />
              <Tooltip cursor={{ fill: "var(--hover)" }} content={ChartTooltip} />
              <Bar dataKey="count" name="Completed" fill={C.done} radius={[4, 4, 0, 0]} maxBarSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Deadlines" subtitle="Open tasks and subtasks due in the next 14 days">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={stats.deadlines} margin={{ top: 8, right: 4, bottom: 0, left: -24 }} barCategoryGap={3}>
              <CartesianGrid vertical={false} stroke={C.grid} />
              <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={8} />
              <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} width={40} />
              <Tooltip cursor={{ fill: "var(--hover)" }} content={ChartTooltip} />
              <Bar dataKey="count" name="Due" radius={[4, 4, 0, 0]} maxBarSize={18}>
                {stats.deadlines.map((d) => (
                  <Cell key={d.key} fill={d.overdue ? C.overdue : C.open} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {stats.upcoming.length > 0 ? (
            <ul className="mt-3 divide-y divide-line border-t border-line text-sm">
              {stats.upcoming.map((d) => (
                <li key={d.id}>
                  <Link href={`/todos/${d.todoId}`} className="flex min-h-11 items-center gap-3 py-2 hover:text-accent">
                    <span className="min-w-0 flex-1 truncate">
                      {d.title}
                      {d.kind === "subtask" && <span className="text-faint"> · in {d.parent}</span>}
                    </span>
                    <DueBadge due={d.due} done={false} today={today} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">Nothing due in the next two weeks.</p>
          )}
        </Card>

        <Card title="Progress per task" subtitle="Open tasks with subtasks, most urgent first">
          {stats.progress.length > 0 ? (
            <ul className="space-y-3">
              {stats.progress.map((p) => (
                <li key={p.id}>
                  <Link href={`/todos/${p.id}`} className="group block" title={p.fullName}>
                    <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                      <span className="truncate group-hover:text-accent">{p.name}</span>
                      <span className="shrink-0 tabular-nums text-muted">{p.done}/{p.total}</span>
                    </div>
                    <div className="flex h-2 gap-0.5 overflow-hidden rounded-full" aria-hidden="true">
                      {p.done > 0 && <span className="rounded-full bg-done" style={{ flex: p.done }} />}
                      {p.open > 0 && <span className="rounded-full bg-line" style={{ flex: p.open }} />}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">Add subtasks to a task to track its progress here.</p>
          )}
        </Card>
      </div>
    </div>
  );
}

function hideZero(value: unknown) {
  return typeof value === "number" && value > 0 ? value : "";
}

function StatTile({
  label,
  value,
  href,
  note,
  icon,
  tone,
}: {
  label: string;
  value: number;
  href: string;
  note?: string;
  icon: IconName;
  tone: "open" | "accent" | "danger" | "warn" | "muted";
}) {
  const chip = {
    open: "bg-open/10 text-open",
    accent: "bg-accent-soft text-accent",
    danger: "bg-danger-soft text-danger",
    warn: "bg-warn-soft text-warn",
    muted: "bg-sunken text-muted",
  }[tone];
  return (
    <Link
      href={href}
      className="panel rise group block min-w-0 p-4 transition-colors duration-150 hover:border-line-strong hover:bg-hover sm:p-5"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-muted">{label}</span>
        <span className={`grid size-8 place-items-center rounded-[9px] ${chip}`} aria-hidden="true">
          <Icon name={icon} className="size-[18px]" strokeWidth={2.1} />
        </span>
      </div>
      <div className={`mt-2 text-[34px] font-bold leading-none tabular-nums tracking-[-0.03em] ${tone === "danger" ? "text-danger" : ""}`}>
        {value}
      </div>
      <div className={`mt-2 min-h-4 text-xs font-medium ${tone === "danger" ? "text-danger" : "text-muted"}`}>
        {note ?? "\u00a0"}
      </div>
    </Link>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="panel rise min-w-0 p-5 sm:p-6">
      <h2 className="font-bold">{title}</h2>
      {subtitle && <p className="mb-4 mt-0.5 text-sm text-muted">{subtitle}</p>}
      {children}
    </section>
  );
}

function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="mb-1 flex gap-4 text-xs text-muted">
      {items.map((i) => (
        <span key={i.label} className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-[3px]" style={{ background: i.color }} aria-hidden="true" />
          {i.label}
        </span>
      ))}
    </div>
  );
}

type TipEntry = { dataKey?: unknown; name?: unknown; value?: unknown; color?: string; payload?: { overdue?: boolean } };

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: readonly TipEntry[]; label?: unknown }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[10px] border border-line-strong bg-panel px-3 py-2 text-xs">
      <div className="mb-1 font-medium text-ink">{String(label)}</div>
      {payload.map((p) => (
        <div key={String(p.dataKey)} className="flex items-center gap-2 text-muted">
          <span className="size-2 rounded-sm" style={{ background: p.payload?.overdue ? "var(--danger)" : p.color }} aria-hidden="true" />
          {String(p.name)}: <span className="font-medium tabular-nums text-ink">{String(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

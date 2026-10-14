import Link from "next/link";
import { dueStatus, formatDue, formatShortDate, todayISO } from "@/lib/dates";
import { PRIORITY_LABELS, type Priority } from "@/lib/types";

const dueStyles = {
  overdue: "bg-danger-soft text-danger",
  today: "bg-warn-soft text-warn",
  soon: "bg-accent-soft text-accent",
  later: "bg-sunken text-muted",
} as const;

/** Due date pill, colored by urgency. Text always says the state, not just color. */
export function DueBadge({
  due,
  done,
  today = todayISO(),
}: {
  due: string | null;
  done: boolean;
  today?: string;
}) {
  if (!due) return null;
  const status = dueStatus(due, done, today);
  const style = status ? dueStyles[status] : "bg-sunken text-faint";
  return (
    <span className={`chip ${style}`}>
      <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <rect x="2.5" y="3.5" width="11" height="10" rx="2" />
        <path d="M2.5 7h11M5.5 2v3M10.5 2v3" strokeLinecap="round" />
      </svg>
      {done ? formatShortDate(due) : formatDue(due, today)}
    </span>
  );
}

/** Signal-bar icon + word. Neutral ink so it never competes with due-date colors. */
export function PriorityBadge({ priority }: { priority: Priority }) {
  if (!priority) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted" title={`${PRIORITY_LABELS[priority]} priority`}>
      <PriorityIcon priority={priority} />
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

export function PriorityIcon({ priority }: { priority: Priority }) {
  return (
    <svg viewBox="0 0 12 12" className="size-3" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={1 + i * 3.8}
          y={8 - i * 3}
          width="2.6"
          height={3 + i * 3}
          rx="1"
          className={i < priority ? (priority === 3 ? "fill-warn" : "fill-ink") : "fill-faint opacity-35"}
        />
      ))}
    </svg>
  );
}

export function ProgressBadge({ done, total }: { done: number; total: number }) {
  if (total === 0) return null;
  const complete = done === total;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold tabular-nums ${complete ? "text-accent" : "text-muted"}`}>
      <span className="relative h-1.5 w-10 overflow-hidden rounded-full bg-line" aria-hidden="true">
        <span className="absolute inset-y-0 left-0 rounded-full bg-accent" style={{ width: `${(done / total) * 100}%` }} />
      </span>
      {done}/{total} done
    </span>
  );
}

export function TagChip({ tag, href }: { tag: string; href?: string }) {
  const cls = "chip bg-accent-soft/60 text-accent";
  return href ? (
    <Link href={href} className={`${cls} hover:bg-accent hover:text-accent-ink`}>#{tag}</Link>
  ) : (
    <span className={cls}>#{tag}</span>
  );
}

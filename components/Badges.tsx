import Link from "next/link";
import { dueStatus, formatDue, formatShortDate, todayISO } from "@/lib/dates";
import { PRIORITY_LABELS, type Priority } from "@/lib/types";
import Icon from "./Icon";

// Meta items under a task: plain muted text with a small icon. Colour is kept
// for the two states that need action: overdue (red) and due today (accent).
// The words always say the state too, so colour is never the only signal.

const dueTone = {
  overdue: "text-danger",
  today: "text-accent font-medium",
  soon: "text-muted",
  later: "text-muted",
} as const;

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
  const tone = status ? dueTone[status] : "text-faint";
  return (
    <span className={`inline-flex items-center gap-1 text-[0.8125rem] ${tone}`}>
      <Icon name="calendar" className="size-3.5" />
      {done ? formatShortDate(due) : formatDue(due, today)}
    </span>
  );
}

/** Only medium and high are shown in lists; low priority isn't worth the noise. */
export function PriorityBadge({ priority }: { priority: Priority }) {
  if (priority < 2) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[0.8125rem] ${priority === 3 ? "font-medium text-ink" : "text-muted"}`}
      title={`${PRIORITY_LABELS[priority]} priority`}
    >
      <Icon name="flag" className="size-3.5" />
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

/** Three bars, filled up to the priority. Used in the priority picker. */
export function PriorityIcon({ priority }: { priority: Priority }) {
  return (
    <svg viewBox="0 0 12 12" className="size-3" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={1 + i * 3.8}
          y={8 - i * 3}
          width="2.4"
          height={3 + i * 3}
          rx="0.8"
          className={i < priority ? "fill-current" : "fill-current opacity-20"}
        />
      ))}
    </svg>
  );
}

export function ProgressBadge({ done, total }: { done: number; total: number }) {
  if (total === 0) return null;
  const complete = done === total;
  return (
    <span className={`inline-flex items-center gap-1 text-[0.8125rem] tabular-nums ${complete ? "text-accent" : "text-muted"}`}>
      <Icon name="list" className="size-3.5" />
      {done}/{total}
    </span>
  );
}

export function TagChip({ tag, href }: { tag: string; href?: string }) {
  const cls = "text-[0.8125rem] text-muted";
  return href ? (
    <Link href={href} className={`${cls} hover:text-ink hover:underline hover:underline-offset-2`}>
      #{tag}
    </Link>
  ) : (
    <span className={cls}>#{tag}</span>
  );
}

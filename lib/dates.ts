// "Today" is computed in one fixed timezone so the server and the browser
// agree on what is overdue. Change it with NEXT_PUBLIC_APP_TIMEZONE.
export const APP_TIMEZONE = process.env.NEXT_PUBLIC_APP_TIMEZONE || "Europe/Vienna";

/** Today's date as YYYY-MM-DD in the app timezone. */
export function todayISO(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Adds whole days to a YYYY-MM-DD string. */
export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Whole days from `from` to `to` (both YYYY-MM-DD). */
export function daysBetween(from: string, to: string): number {
  return Math.round(
    (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000,
  );
}

export type DueStatus = "overdue" | "today" | "soon" | "later";

/** How urgent a due date is. "soon" means within the next 3 days. */
export function dueStatus(due: string | null, done: boolean, today = todayISO()): DueStatus | null {
  if (!due || done) return null;
  const diff = daysBetween(today, due);
  if (diff < 0) return "overdue";
  if (diff === 0) return "today";
  if (diff <= 3) return "soon";
  return "later";
}

/** Short human label: "Today", "Tomorrow", "3 days ago", "Fri 17 Oct". */
export function formatDue(due: string, today = todayISO()): string {
  const diff = daysBetween(today, due);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff < 0) return `${-diff} days overdue`;
  return formatShortDate(due, diff > 300);
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * "Fri 17 Oct". Built by hand instead of Intl, because Node and browsers
 * format slightly differently and that would break hydration.
 */
export function formatShortDate(iso: string, withYear = false, withWeekday = true): string {
  const d = new Date(`${iso}T00:00:00Z`);
  const parts = [
    withWeekday ? WEEKDAYS[d.getUTCDay()] : null,
    String(d.getUTCDate()),
    MONTHS[d.getUTCMonth()],
    withYear ? String(d.getUTCFullYear()) : null,
  ];
  return parts.filter(Boolean).join(" ");
}

/** YYYY-MM-DD of a timestamp in the app timezone. */
export function isoDateOf(timestamp: string): string {
  return todayISO(new Date(timestamp));
}

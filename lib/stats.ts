import { addDays, daysBetween, formatShortDate, isoDateOf } from "@/lib/dates";
import type { TodoWithSubtasks } from "@/lib/types";

export type DashboardStats = ReturnType<typeof buildStats>;

/** Turns the user's tasks into the numbers the dashboard charts need. */
export function buildStats(todos: TodoWithSubtasks[], today: string) {
  const subtasks = todos.flatMap((t) => t.subtasks.map((s) => ({ ...s, parentDone: t.done })));

  const openTodos = todos.filter((t) => !t.done);
  const overdue = openTodos.filter((t) => t.due_date && t.due_date < today);
  const dueToday = openTodos.filter((t) => t.due_date === today);
  const weekEnd = addDays(today, 7);
  const dueThisWeek = openTodos.filter((t) => t.due_date && t.due_date >= today && t.due_date <= weekEnd);

  // Open vs done, for tasks and for subtasks.
  const split = [
    { name: "Tasks", open: openTodos.length, done: todos.length - openTodos.length },
    {
      name: "Subtasks",
      open: subtasks.filter((s) => !s.done).length,
      done: subtasks.filter((s) => s.done).length,
    },
  ];

  // Progress per open task that has subtasks, most urgent first.
  const progress = openTodos
    .filter((t) => t.subtasks.length > 0)
    .map((t) => {
      const done = t.subtasks.filter((s) => s.done).length;
      return {
        id: t.id,
        name: t.title.length > 34 ? `${t.title.slice(0, 33)}…` : t.title,
        fullName: t.title,
        done,
        open: t.subtasks.length - done,
        total: t.subtasks.length,
        due: t.due_date,
      };
    })
    .sort((a, b) => (a.due ?? "9999").localeCompare(b.due ?? "9999") || b.total - a.total)
    .slice(0, 8);

  // Deadlines: overdue bucket + each of the next 14 days (open tasks and subtasks).
  const dated = [
    ...openTodos.filter((t) => t.due_date).map((t) => ({ id: t.id, title: t.title, due: t.due_date!, kind: "task" as const, todoId: t.id })),
    ...todos.flatMap((t) =>
      t.subtasks
        .filter((s) => s.due_date && !s.done && !t.done)
        .map((s) => ({ id: s.id, title: s.title, due: s.due_date!, kind: "subtask" as const, todoId: t.id, parent: t.title })),
    ),
  ];
  const deadlines = [
    { key: "overdue", label: "Overdue", count: dated.filter((d) => d.due < today).length, overdue: true },
    ...Array.from({ length: 14 }, (_, i) => {
      const day = addDays(today, i);
      return {
        key: day,
        label: i === 0 ? "Today" : formatShortDate(day).split(" ").slice(0, 2).join(" "),
        count: dated.filter((d) => d.due === day).length,
        overdue: false,
      };
    }),
  ];
  const upcoming = dated
    .filter((d) => d.due <= addDays(today, 14))
    .sort((a, b) => a.due.localeCompare(b.due))
    .slice(0, 6);

  // Completed per day over the last 30 days (tasks + subtasks).
  const completedDays = [...todos, ...subtasks]
    .filter((x) => x.done && x.completed_at)
    .map((x) => isoDateOf(x.completed_at!));
  const completed = Array.from({ length: 30 }, (_, i) => {
    const day = addDays(today, i - 29);
    return {
      day,
      label: formatShortDate(day, false, false),
      count: completedDays.filter((d) => d === day).length,
    };
  });
  const completedTotal = completed.reduce((n, d) => n + d.count, 0);
  const completedLast7 = completed.slice(-7).reduce((n, d) => n + d.count, 0);

  return {
    totals: {
      open: openTodos.length,
      done: todos.length - openTodos.length,
      overdue: overdue.length,
      dueToday: dueToday.length,
      dueThisWeek: dueThisWeek.length,
      oldestOverdueDays: overdue.length
        ? Math.max(...overdue.map((t) => daysBetween(t.due_date!, today)))
        : 0,
    },
    split,
    progress,
    deadlines,
    upcoming,
    completed,
    completedTotal,
    completedLast7,
  };
}

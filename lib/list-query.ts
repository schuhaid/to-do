import { addDays, dueStatus, todayISO } from "@/lib/dates";
import type { DueFilter, Filter, SortKey, TodoWithSubtasks } from "@/lib/types";

export type ListQuery = {
  filter: Filter;
  due: DueFilter;
  sort: SortKey;
  q: string;
  tag: string;
};

type Params = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export function parseListQuery(params: Params): ListQuery {
  const filter = one(params.filter);
  const due = one(params.due);
  const sort = one(params.sort);
  return {
    filter: filter === "open" || filter === "done" ? filter : "all",
    due: ["overdue", "today", "week", "none"].includes(due) ? (due as DueFilter) : "any",
    sort: ["due", "priority", "newest"].includes(sort) ? (sort as SortKey) : "smart",
    q: one(params.q).trim().slice(0, 100),
    tag: one(params.tag).trim().toLowerCase().slice(0, 30),
  };
}

/** Builds a /todos URL from the current query plus changes; defaults are left out. */
export function listHref(query: ListQuery, changes: Partial<ListQuery> = {}) {
  const next = { ...query, ...changes };
  const p = new URLSearchParams();
  if (next.filter !== "all") p.set("filter", next.filter);
  if (next.due !== "any") p.set("due", next.due);
  if (next.sort !== "smart") p.set("sort", next.sort);
  if (next.q) p.set("q", next.q);
  if (next.tag) p.set("tag", next.tag);
  const s = p.toString();
  return s ? `/todos?${s}` : "/todos";
}

/** Everything except the open/done filter, so the tab counts stay meaningful. */
function matchesOtherFilters(t: TodoWithSubtasks, query: ListQuery, today: string) {
  if (query.tag && !t.tags.includes(query.tag)) return false;
  if (query.q) {
    const q = query.q.toLowerCase();
    const inTitle = t.title.toLowerCase().includes(q);
    const inSubtasks = t.subtasks.some((s) => s.title.toLowerCase().includes(q));
    const inTags = t.tags.some((tag) => tag.includes(q.replace(/^#/, "")));
    if (!inTitle && !inSubtasks && !inTags) return false;
  }
  if (query.due !== "any") {
    const status = dueStatus(t.due_date, t.done, today);
    if (query.due === "none" && t.due_date) return false;
    if (query.due === "overdue" && status !== "overdue") return false;
    if (query.due === "today" && status !== "today") return false;
    if (query.due === "week" && !(t.due_date && !t.done && t.due_date <= addDays(today, 7)))
      return false;
  }
  return true;
}

export function applyListQuery(todos: TodoWithSubtasks[], query: ListQuery) {
  const today = todayISO();
  const base = todos.filter((t) => matchesOtherFilters(t, query, today));
  const counts = {
    all: base.length,
    open: base.filter((t) => !t.done).length,
    done: base.filter((t) => t.done).length,
  };
  const visible = base.filter((t) =>
    query.filter === "all" ? true : query.filter === "done" ? t.done : !t.done,
  );

  const byDue = (a: TodoWithSubtasks, b: TodoWithSubtasks) =>
    (a.due_date ?? "9999") < (b.due_date ?? "9999") ? -1 : (a.due_date ?? "9999") > (b.due_date ?? "9999") ? 1 : 0;
  const byNewest = (a: TodoWithSubtasks, b: TodoWithSubtasks) => (a.created_at < b.created_at ? 1 : -1);

  visible.sort((a, b) => {
    if (query.sort === "newest") return byNewest(a, b);
    if (query.sort === "due") return byDue(a, b) || byNewest(a, b);
    if (query.sort === "priority") return b.priority - a.priority || byDue(a, b) || byNewest(a, b);
    // "smart": open first, then by due date, then priority, then newest.
    return Number(a.done) - Number(b.done) || byDue(a, b) || b.priority - a.priority || byNewest(a, b);
  });

  return { visible, counts, today };
}

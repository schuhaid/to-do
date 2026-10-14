import { daysBetween, dueStatus } from "@/lib/dates";
import type { Priority, TodoWithSubtasks } from "@/lib/types";

export type NodeStatus = "open" | "done" | "overdue" | "today";
export type SizeBy = "priority" | "urgency" | "workload";

export type GraphNode = {
  id: string;
  kind: "task" | "subtask" | "tag";
  label: string;
  status: NodeStatus;
  href: string;
  /** Parent task id (subtasks) – used for hover highlighting. */
  parent?: string;
  priority: Priority;
  subTotal: number;
  subDone: number;
  /** Days until due (negative = overdue), null = no date. */
  dueIn: number | null;
  /** Tag nodes: how many tasks use the tag. */
  count?: number;
};

export type GraphLink = {
  source: string;
  target: string;
  kind: "subtask" | "tag";
  /** Parent task is overdue or due today, so the link animates. */
  urgent?: boolean;
};

function status(due: string | null, done: boolean, today: string): NodeStatus {
  if (done) return "done";
  const s = dueStatus(due, done, today);
  return s === "overdue" ? "overdue" : s === "today" ? "today" : "open";
}

/**
 * How much a task "weighs", 0..1, for the chosen size mode.
 *  - priority: none → high
 *  - urgency:  no date / far away → overdue
 *  - workload: open subtasks (0 → 8+)
 */
export function weightOf(n: GraphNode, by: SizeBy): number {
  if (n.status === "done") return 0;
  if (by === "priority") return n.priority / 3;
  if (by === "workload") return Math.min(1, (n.subTotal - n.subDone) / 8);
  if (n.dueIn === null) return 0;
  if (n.dueIn < 0) return 1;
  return Math.max(0, 1 - n.dueIn / 14) * 0.9;
}

/** Tasks become main nodes, subtasks hang off them, tags connect tasks that share them. */
export function buildGraph(todos: TodoWithSubtasks[], today: string) {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const tagCounts = new Map<string, number>();

  for (const t of todos) {
    const st = status(t.due_date, t.done, today);
    const urgent = st === "overdue" || st === "today";
    nodes.push({
      id: t.id,
      kind: "task",
      label: t.title,
      status: st,
      href: `/todos/${t.id}`,
      priority: t.priority,
      subTotal: t.subtasks.length,
      subDone: t.subtasks.filter((s) => s.done).length,
      dueIn: t.due_date ? daysBetween(today, t.due_date) : null,
    });
    for (const s of t.subtasks) {
      nodes.push({
        id: s.id,
        kind: "subtask",
        label: s.title,
        // A subtask of a finished task counts as finished too.
        status: status(s.due_date, s.done || t.done, today),
        href: `/todos/${t.id}`,
        parent: t.id,
        priority: 0,
        subTotal: 0,
        subDone: 0,
        dueIn: s.due_date ? daysBetween(today, s.due_date) : null,
      });
      links.push({ source: t.id, target: s.id, kind: "subtask", urgent: urgent && !s.done });
    }
    for (const tag of t.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      links.push({ source: `tag:${tag}`, target: t.id, kind: "tag" });
    }
  }
  for (const [tag, count] of tagCounts) {
    nodes.push({
      id: `tag:${tag}`,
      kind: "tag",
      label: `#${tag}`,
      status: "open",
      href: `/todos?tag=${encodeURIComponent(tag)}`,
      priority: 0,
      subTotal: 0,
      subDone: 0,
      dueIn: null,
      count,
    });
  }
  return { nodes, links };
}

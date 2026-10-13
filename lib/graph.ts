import { dueStatus } from "@/lib/dates";
import type { TodoWithSubtasks } from "@/lib/types";

export type NodeStatus = "open" | "done" | "overdue" | "today";

export type GraphNode = {
  id: string;
  kind: "task" | "subtask" | "tag";
  label: string;
  status: NodeStatus;
  href: string;
  size: number;
};

export type GraphLink = { source: string; target: string; kind: "subtask" | "tag" };

function status(due: string | null, done: boolean, today: string): NodeStatus {
  if (done) return "done";
  const s = dueStatus(due, done, today);
  return s === "overdue" ? "overdue" : s === "today" ? "today" : "open";
}

/** Tasks become main nodes, subtasks hang off them, tags connect tasks that share them. */
export function buildGraph(todos: TodoWithSubtasks[], today: string) {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const tagCounts = new Map<string, number>();

  for (const t of todos) {
    nodes.push({
      id: t.id,
      kind: "task",
      label: t.title,
      status: status(t.due_date, t.done, today),
      href: `/todos/${t.id}`,
      size: 5 + Math.min(6, Math.sqrt(t.subtasks.length) * 2) + t.priority * 0.8,
    });
    for (const s of t.subtasks) {
      nodes.push({
        id: s.id,
        kind: "subtask",
        label: s.title,
        // A subtask of a finished task counts as finished too.
        status: status(s.due_date, s.done || t.done, today),
        href: `/todos/${t.id}`,
        size: 2.6,
      });
      links.push({ source: t.id, target: s.id, kind: "subtask" });
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
      size: 3 + Math.min(4, count),
    });
  }
  return { nodes, links };
}

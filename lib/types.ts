export type Priority = 0 | 1 | 2 | 3; // none, low, medium, high

export type Todo = {
  id: string;
  title: string;
  done: boolean;
  created_at: string;
  completed_at: string | null;
  due_date: string | null; // YYYY-MM-DD
  priority: Priority;
  tags: string[];
};

export type Subtask = {
  id: string;
  todo_id: string;
  title: string;
  done: boolean;
  note: string | null;
  due_date: string | null;
  position: number;
  created_at: string;
  completed_at: string | null;
};

export type SubtaskSummary = Pick<Subtask, "id" | "title" | "done" | "due_date" | "completed_at">;

export type TodoWithSubtasks = Todo & { subtasks: SubtaskSummary[] };

export type Filter = "all" | "open" | "done";
export type DueFilter = "any" | "overdue" | "today" | "week" | "none";
export type SortKey = "smart" | "due" | "priority" | "newest";

export const PRIORITY_LABELS: Record<Priority, string> = {
  0: "None",
  1: "Low",
  2: "Medium",
  3: "High",
};

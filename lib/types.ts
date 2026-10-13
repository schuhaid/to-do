export type Todo = {
  id: string;
  title: string;
  done: boolean;
  created_at: string;
};

export type Filter = "all" | "open" | "done";

"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { listHref, type ListQuery } from "@/lib/list-query";
import type { DueFilter, SortKey } from "@/lib/types";
import Icon from "./Icon";

const DUE_OPTIONS: { value: DueFilter; label: string }[] = [
  { value: "any", label: "Any due date" },
  { value: "overdue", label: "Overdue" },
  { value: "today", label: "Due today" },
  { value: "week", label: "Due within 7 days" },
  { value: "none", label: "No due date" },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "smart", label: "Sort: Smart" },
  { value: "due", label: "Sort: Due date" },
  { value: "priority", label: "Sort: Priority" },
  { value: "newest", label: "Sort: Newest" },
];

export default function ListControls({ query }: { query: ListQuery }) {
  const router = useRouter();
  const [q, setQ] = useState(query.q);
  const [, startTransition] = useTransition();

  // Search updates the URL 250 ms after typing stops.
  useEffect(() => {
    if (q.trim() === query.q) return;
    const t = setTimeout(() => {
      startTransition(() => router.replace(listHref(query, { q: q.trim() }), { scroll: false }));
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const go = (changes: Partial<ListQuery>) =>
    startTransition(() => router.replace(listHref(query, changes), { scroll: false }));

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="relative min-w-0 flex-1 basis-full sm:basis-48">
        <span className="sr-only">Search tasks</span>
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint">
          <Icon name="search" className="size-[18px]" />
        </span>
        <input
          id="search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && (e.target as HTMLInputElement).blur()}
          placeholder="Search tasks, subtasks, #tags"
          className="field min-h-11 py-2 pl-10 text-sm"
        />
      </label>
      <div className="flex w-full gap-2 sm:w-auto">
      <select
        aria-label="Filter by due date"
        value={query.due}
        onChange={(e) => go({ due: e.target.value as DueFilter })}
        className="field min-h-11 min-w-0 flex-1 py-2 pr-8 text-sm sm:w-auto sm:flex-none"
      >
        {DUE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <select
        aria-label="Sort tasks"
        value={query.sort}
        onChange={(e) => go({ sort: e.target.value as SortKey })}
        className="field min-h-11 min-w-0 flex-1 py-2 pr-8 text-sm sm:w-auto sm:flex-none"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      </div>
      {query.tag && (
        <Link
          href={listHref(query, { tag: "" })}
          className="inline-flex min-h-9 items-center gap-1 rounded-full bg-accent-soft px-3 text-sm font-semibold text-accent hover:bg-accent hover:text-accent-ink"
          aria-label={`Remove tag filter #${query.tag}`}
        >
          #{query.tag}
          <Icon name="x" className="size-3.5" strokeWidth={2.4} />
        </Link>
      )}
    </div>
  );
}

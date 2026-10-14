"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { listHref, type ListQuery } from "@/lib/list-query";
import type { DueFilter, SortKey } from "@/lib/types";
import Icon from "./Icon";

const DUE_OPTIONS: { value: DueFilter; label: string }[] = [
  { value: "any", label: "Any date" },
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
    <div className="flex flex-wrap items-center gap-1">
      <label className="relative min-w-0 flex-1 basis-full sm:mr-1 sm:w-56 sm:flex-none sm:basis-auto">
        <span className="sr-only">Search tasks</span>
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-faint">
          <Icon name="search" className="size-3.5" />
        </span>
        <input
          id="search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && (e.target as HTMLInputElement).blur()}
          placeholder="Search"
          className="field-sm pl-8"
        />
      </label>
      <select
        aria-label="Filter by due date"
        value={query.due}
        onChange={(e) => go({ due: e.target.value as DueFilter })}
        className="select-quiet"
      >
        {DUE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <select
        aria-label="Sort tasks"
        value={query.sort}
        onChange={(e) => go({ sort: e.target.value as SortKey })}
        className="select-quiet"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {query.tag && (
        <Link
          href={listHref(query, { tag: "" })}
          className="press inline-flex h-9 items-center gap-1 rounded-md px-2 text-[0.8125rem] font-medium text-ink hover:bg-hover"
          aria-label={`Remove tag filter #${query.tag}`}
        >
          #{query.tag}
          <Icon name="x" className="size-3.5 text-muted" />
        </Link>
      )}
    </div>
  );
}

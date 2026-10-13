import Link from "next/link";
import { listHref, type ListQuery } from "@/lib/list-query";
import type { Filter } from "@/lib/types";

const tabs: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "done", label: "Done" },
];

export default function FilterTabs({
  query,
  counts,
}: {
  query: ListQuery;
  counts: Record<Filter, number>;
}) {
  return (
    <nav aria-label="Filter tasks" className="inline-flex rounded-xl bg-hover p-1">
      {tabs.map(({ value, label }) => {
        const active = value === query.filter;
        return (
          <Link
            key={value}
            href={listHref(query, { filter: value })}
            scroll={false}
            aria-current={active ? "page" : undefined}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
              active ? "bg-panel text-ink shadow-sm" : "text-muted hover:text-ink"
            }`}
          >
            {label}
            <span className="ml-1.5 tabular-nums text-faint">{counts[value]}</span>
          </Link>
        );
      })}
    </nav>
  );
}

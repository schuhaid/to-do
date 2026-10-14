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
    <nav aria-label="Filter tasks" className="segmented self-start">
      {tabs.map(({ value, label }) => {
        const active = value === query.filter;
        return (
          <Link
            key={value}
            href={listHref(query, { filter: value })}
            scroll={false}
            aria-current={active ? "page" : undefined}
            className={`segment px-3.5 ${active ? "segment-on" : ""}`}
          >
            {label}
            <span
              className={`rounded-full px-1.5 text-xs font-semibold tabular-nums ${
                active ? "bg-accent-soft text-accent" : "text-faint"
              }`}
            >
              {counts[value]}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

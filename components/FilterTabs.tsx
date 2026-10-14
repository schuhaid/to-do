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
    <nav aria-label="Filter tasks" className="tabs">
      {tabs.map(({ value, label }) => {
        const active = value === query.filter;
        return (
          <Link
            key={value}
            href={listHref(query, { filter: value })}
            scroll={false}
            aria-current={active ? "page" : undefined}
            className={`tab ${active ? "tab-on" : ""}`}
          >
            {label}
            <span className="tabular-nums text-faint">{counts[value]}</span>
          </Link>
        );
      })}
    </nav>
  );
}

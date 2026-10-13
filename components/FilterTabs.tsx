import Link from "next/link";
import type { Filter } from "@/lib/types";

const tabs: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "done", label: "Done" },
];

export default function FilterTabs({
  current,
  counts,
}: {
  current: Filter;
  counts: Record<Filter, number>;
}) {
  return (
    <nav aria-label="Filter tasks" className="inline-flex rounded-xl bg-hover p-1">
      {tabs.map(({ value, label }) => {
        const active = value === current;
        return (
          <Link
            key={value}
            href={value === "all" ? "/todos" : `/todos?filter=${value}`}
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

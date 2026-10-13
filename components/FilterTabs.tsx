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
    <nav aria-label="Filter tasks" className="flex gap-1">
      {tabs.map(({ value, label }) => {
        const active = value === current;
        return (
          <Link
            key={value}
            href={value === "all" ? "/todos" : `/todos?filter=${value}`}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-3.5 py-1.5 text-sm font-bold transition-colors ${
              active ? "bg-ink text-paper" : "text-muted hover:bg-hover hover:text-ink"
            }`}
          >
            {label} <span className={active ? "opacity-70" : "opacity-60"}>{counts[value]}</span>
          </Link>
        );
      })}
    </nav>
  );
}

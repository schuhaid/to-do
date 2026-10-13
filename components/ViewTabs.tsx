"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const VIEWS = [
  { href: "/todos", label: "List", key: "1" },
  { href: "/dashboard", label: "Dashboard", key: "2" },
  { href: "/graph", label: "Graph", key: "3" },
] as const;

export default function ViewTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Views" className="flex rounded-xl bg-panel p-1 shadow-sm ring-1 ring-line sm:inline-flex">
      {VIEWS.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex-1 rounded-lg px-4 py-1.5 text-center text-sm font-medium transition-colors sm:flex-none ${
              active ? "bg-accent text-accent-ink" : "text-muted hover:text-ink"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

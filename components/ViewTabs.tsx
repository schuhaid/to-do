"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon, { type IconName } from "./Icon";

export const VIEWS: readonly { href: string; label: string; key: string; icon: IconName }[] = [
  { href: "/todos", label: "Tasks", key: "1", icon: "list" },
  { href: "/dashboard", label: "Dashboard", key: "2", icon: "dashboard" },
  { href: "/graph", label: "Graph", key: "3", icon: "graph" },
];

function useActive() {
  const pathname = usePathname();
  return (href: string) => pathname === href || pathname.startsWith(`${href}/`);
}

/** Vertical navigation for the desktop sidebar. */
export function SideNav() {
  const isActive = useActive();
  return (
    <nav aria-label="Views" className="space-y-1">
      {VIEWS.map(({ href, label, key, icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`group flex min-h-11 items-center gap-3 rounded-[10px] px-3 text-[15px] font-semibold transition-colors duration-150 ${
              active ? "bg-accent-soft text-accent" : "text-muted hover:bg-hover hover:text-ink"
            }`}
          >
            <Icon name={icon} className="size-5" strokeWidth={active ? 2.1 : 1.8} />
            <span className="flex-1">{label}</span>
            <kbd
              className={`rounded-md border px-1.5 font-sans text-[11px] font-semibold ${
                active ? "border-accent/30 text-accent" : "border-line text-faint group-hover:text-muted"
              }`}
            >
              {key}
            </kbd>
          </Link>
        );
      })}
    </nav>
  );
}

/** Bottom tab bar for phones and tablets. */
export function BottomNav() {
  const isActive = useActive();
  return (
    <nav
      aria-label="Views"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-panel/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <div className="mx-auto flex max-w-md">
        {VIEWS.map(({ href, label, icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-semibold transition-colors duration-150 ${
                active ? "text-accent" : "text-muted hover:text-ink"
              }`}
            >
              <span
                className={`grid h-7 w-12 place-items-center rounded-full transition-colors duration-150 ${
                  active ? "bg-accent-soft" : ""
                }`}
              >
                <Icon name={icon} className="size-5" strokeWidth={active ? 2.1 : 1.8} />
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

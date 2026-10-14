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
    <nav aria-label="Views" className="space-y-0.5">
      {VIEWS.map(({ href, label, key, icon }) => {
        const active = isActive(href);
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined} className="nav-item group">
            <Icon name={icon} className={active ? "size-4 text-ink" : "size-4"} />
            <span className="flex-1">{label}</span>
            <kbd className="kbd opacity-0 transition-opacity duration-150 group-hover:opacity-100">{key}</kbd>
          </Link>
        );
      })}
    </nav>
  );
}

/** Bottom tab bar for phones and tablets: solid, one hairline on top. */
export function BottomNav() {
  const isActive = useActive();
  return (
    <nav
      aria-label="Views"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <div className="mx-auto flex max-w-md">
        {VIEWS.map(({ href, label, icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`press flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-[0.6875rem] font-medium ${
                active ? "text-ink" : "text-faint hover:text-muted"
              }`}
            >
              <Icon name={icon} className="size-5" strokeWidth={active ? 2 : 1.75} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

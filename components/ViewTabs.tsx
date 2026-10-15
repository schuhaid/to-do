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
          <Link key={href} href={href} aria-current={active ? "page" : undefined} className="side-item">
            <Icon name={icon} className="size-5" strokeWidth={active ? 2.1 : 1.8} />
            <span className="flex-1">{label}</span>
            <kbd className="side-kbd">{key}</kbd>
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
      className="material fixed inset-x-0 bottom-0 z-30 pb-[env(safe-area-inset-bottom)] shadow-[0_-0.5px_0_var(--material-line),inset_0_0.5px_0_var(--material-edge)] lg:hidden"
    >
      <div className="mx-auto flex max-w-md">
        {VIEWS.map(({ href, label, icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`press flex min-h-[3.25rem] flex-1 flex-col items-center justify-center gap-0.5 pt-1 text-[0.6875rem] font-semibold tracking-[0.01em] ${
                active ? "text-accent" : "text-muted hover:text-ink"
              }`}
            >
              <Icon name={icon} className="size-[26px]" strokeWidth={active ? 2.2 : 1.7} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

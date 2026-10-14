"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { VIEWS } from "./ViewTabs";
import Icon from "./Icon";

const SHORTCUTS = [
  ["n", "New task"],
  ["/", "Search"],
  ["1", "Tasks"],
  ["2", "Dashboard"],
  ["3", "Graph"],
  ["?", "Show shortcuts"],
] as const;

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  return !!el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));
}

export default function KeyboardShortcuts() {
  const router = useRouter();
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pendingFocus = useRef<string | null>(null);

  // After navigating to the list for "n" or "/", focus the field once it exists.
  useEffect(() => {
    if (!pendingFocus.current || pathname !== "/todos") return;
    const el = document.getElementById(pendingFocus.current);
    if (el) {
      el.focus();
      pendingFocus.current = null;
    }
  }, [pathname]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;

      const view = VIEWS.find((v) => v.key === e.key);
      if (view) {
        router.push(view.href);
        return;
      }
      if (e.key === "n" || e.key === "/") {
        e.preventDefault();
        const id = e.key === "n" ? "new-todo" : "search";
        const el = document.getElementById(id);
        if (el) el.focus();
        else {
          pendingFocus.current = id;
          router.push("/todos");
        }
        return;
      }
      if (e.key === "?") {
        const d = dialogRef.current;
        if (d?.open) d.close();
        else d?.showModal();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="press flex min-h-11 w-full items-center gap-3 rounded-[10px] px-3 text-[0.9375rem] font-semibold text-muted hover:bg-hover hover:text-ink active:bg-sunken"
        title="Keyboard shortcuts (?)"
      >
        <Icon name="keyboard" className="size-5" />
        <span className="flex-1 text-left">Shortcuts</span>
        <kbd className="rounded-md border border-line px-1.5 font-sans text-[11px] font-semibold text-faint">?</kbd>
      </button>
      <dialog
        ref={dialogRef}
        onClick={(e) => e.target === dialogRef.current && dialogRef.current?.close()}
        aria-labelledby="shortcuts-title"
        className="sheet max-w-sm origin-bottom-left"
      >
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="shortcuts-title" className="text-lg font-bold tracking-tight">Keyboard shortcuts</h2>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="press grid size-9 place-items-center rounded-full bg-sunken text-muted hover:text-ink"
              aria-label="Close"
            >
              <Icon name="x" className="size-[18px]" />
            </button>
          </div>
          <dl className="divide-y divide-line rounded-[10px] border border-line text-sm">
            {SHORTCUTS.map(([key, label]) => (
              <div key={key} className="flex items-center justify-between px-4 py-2.5">
                <dt className="text-muted">{label}</dt>
                <dd>
                  <kbd className="inline-grid min-w-7 place-items-center rounded-md border border-line-strong bg-sunken px-2 py-0.5 font-sans text-xs font-semibold">{key}</kbd>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </dialog>
    </>
  );
}

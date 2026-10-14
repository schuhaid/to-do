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
        className="nav-item"
        title="Keyboard shortcuts (?)"
      >
        <Icon name="keyboard" />
        <span className="flex-1 text-left">Shortcuts</span>
        <kbd className="kbd">?</kbd>
      </button>
      <dialog
        ref={dialogRef}
        onClick={(e) => e.target === dialogRef.current && dialogRef.current?.close()}
        aria-labelledby="shortcuts-title"
        className="sheet max-w-sm"
      >
        <div className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="shortcuts-title" className="section-title">Keyboard shortcuts</h2>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="press -mr-2 grid size-9 place-items-center rounded-md text-muted hover:bg-hover hover:text-ink"
              aria-label="Close"
            >
              <Icon name="x" />
            </button>
          </div>
          <dl className="text-[0.8125rem]">
            {SHORTCUTS.map(([key, label]) => (
              <div key={key} className="flex items-center justify-between py-1.5">
                <dt className="text-muted">{label}</dt>
                <dd>
                  <kbd className="kbd text-muted">{key}</kbd>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </dialog>
    </>
  );
}

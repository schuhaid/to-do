"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { VIEWS } from "./ViewTabs";

const SHORTCUTS = [
  ["n", "New task"],
  ["/", "Search"],
  ["1", "List"],
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
        className="btn-quiet hidden sm:block"
        aria-label="Keyboard shortcuts"
        title="Keyboard shortcuts (?)"
      >
        <kbd className="font-sans">?</kbd>
      </button>
      <dialog
        ref={dialogRef}
        onClick={(e) => e.target === dialogRef.current && dialogRef.current?.close()}
        className="panel m-auto w-full max-w-xs p-0 text-ink backdrop:bg-black/30"
      >
        <div className="p-5">
          <h2 className="mb-3 font-semibold">Keyboard shortcuts</h2>
          <dl className="space-y-2 text-sm">
            {SHORTCUTS.map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <dt className="text-muted">{label}</dt>
                <dd>
                  <kbd className="rounded-md border border-line bg-hover px-2 py-0.5 font-sans text-xs">{key}</kbd>
                </dd>
              </div>
            ))}
          </dl>
          <button type="button" onClick={() => dialogRef.current?.close()} className="btn mt-5 w-full py-2">
            Close
          </button>
        </div>
      </dialog>
    </>
  );
}

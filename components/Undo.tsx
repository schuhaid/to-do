"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import Icon from "./Icon";

// Forgiveness instead of confirmation dialogs: deleting hides the item at
// once and shows "Undo" for a few seconds. The real delete runs only when
// that window closes (or the page is hidden, or another delete starts).

const WINDOW_MS = 5000;

type Pending = { key: string; label: string; commit: () => unknown; timer: number };

type UndoApi = {
  hidden: ReadonlySet<string>;
  remove: (key: string, label: string, commit: () => unknown) => void;
};

const UndoContext = createContext<UndoApi>({ hidden: new Set(), remove: (_k, _l, commit) => void commit() });

export function useUndo() {
  return useContext(UndoContext);
}

export function UndoProvider({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState<ReadonlySet<string>>(() => new Set());
  const [toast, setToast] = useState<{ key: string; label: string } | null>(null);
  const [visible, setVisible] = useState(false);
  const pending = useRef<Pending | null>(null);

  const unhide = useCallback((key: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const hideToast = useCallback(() => setVisible(false), []);

  const commitPending = useCallback(() => {
    const p = pending.current;
    if (!p) return;
    pending.current = null;
    window.clearTimeout(p.timer);
    hideToast();
    // Keep it hidden until the server has removed it and the page re-rendered.
    Promise.resolve(p.commit())
      .catch(() => {})
      .finally(() => unhide(p.key));
  }, [hideToast, unhide]);

  const remove = useCallback<UndoApi["remove"]>(
    (key, label, commit) => {
      commitPending();
      setHidden((prev) => new Set(prev).add(key));
      const timer = window.setTimeout(commitPending, WINDOW_MS);
      pending.current = { key, label, commit, timer };
      setToast({ key, label });
      setVisible(true);
    },
    [commitPending],
  );

  const undo = useCallback(() => {
    const p = pending.current;
    if (!p) return;
    pending.current = null;
    window.clearTimeout(p.timer);
    unhide(p.key);
    hideToast();
  }, [hideToast, unhide]);

  // Leaving the page or switching apps counts as "didn't undo".
  useEffect(() => {
    const onHide = () => document.visibilityState === "hidden" && commitPending();
    document.addEventListener("visibilitychange", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      commitPending();
    };
  }, [commitPending]);

  // ⌘Z / Ctrl+Z undoes while the toast is up.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = !!el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));
      if (!typing && pending.current && e.key.toLowerCase() === "z" && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo]);

  const api = useMemo(() => ({ hidden, remove }), [hidden, remove]);

  return (
    <UndoContext.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 z-50 flex justify-center px-4 bottom-[calc(env(safe-area-inset-bottom)+5rem)] lg:bottom-6"
        aria-live="polite"
        role="status"
      >
        {toast && (
          <div
            onTransitionEnd={() => !visible && setToast(null)}
            className={`material flex min-h-12 w-full max-w-sm items-center gap-3 rounded-[16px] border border-[var(--material-line)] py-1.5 pl-4 pr-1.5 text-sm shadow-[var(--shadow-float)] transition-[opacity,transform,filter] duration-300 ease-[cubic-bezier(0.2,0.9,0.25,1)] motion-reduce:transition-opacity ${
              visible
                ? "pointer-events-auto translate-y-0 scale-100 opacity-100 blur-0"
                : "translate-y-4 scale-95 opacity-0 blur-[2px] motion-reduce:translate-y-0 motion-reduce:scale-100 motion-reduce:blur-0"
            }`}
          >
            <Icon name="trash" className="size-4 shrink-0 text-muted" />
            <span className="min-w-0 flex-1 truncate font-medium">{toast.label}</span>
            <button
              type="button"
              onClick={undo}
              tabIndex={visible ? 0 : -1}
              className="press min-h-10 shrink-0 rounded-[11px] px-3.5 font-semibold text-accent hover:bg-accent-soft"
            >
              Undo
            </button>
          </div>
        )}
      </div>
    </UndoContext.Provider>
  );
}

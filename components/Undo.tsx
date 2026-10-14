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
        className="pointer-events-none fixed inset-x-0 z-50 flex justify-center px-4 bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] lg:bottom-6"
        aria-live="polite"
        role="status"
      >
        {toast && (
          <div
            onTransitionEnd={() => !visible && setToast(null)}
            className={`flex min-h-11 w-full max-w-sm items-center gap-3 border border-line bg-paper py-1 pl-3.5 pr-1 text-[0.8125rem] shadow-[var(--shadow-overlay)] transition-[opacity,transform] duration-150 ease-out ${
              visible ? "pointer-events-auto translate-y-0 opacity-100" : "translate-y-1 opacity-0"
            }`}
            style={{ borderRadius: "var(--radius-overlay)" }}
          >
            <Icon name="trash" className="size-3.5 shrink-0 text-muted" />
            <span className="min-w-0 flex-1 truncate font-medium">{toast.label}</span>
            <button
              type="button"
              onClick={undo}
              tabIndex={visible ? 0 : -1}
              className="btn-quiet h-9 shrink-0 font-semibold text-accent hover:text-accent"
            >
              Undo
            </button>
          </div>
        )}
      </div>
    </UndoContext.Provider>
  );
}

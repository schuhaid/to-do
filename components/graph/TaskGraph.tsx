"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import type { GraphLink, GraphNode } from "@/lib/graph";
import Icon from "@/components/Icon";

// The canvas library touches `window`, so it only loads in the browser.
const GraphCanvas = dynamic(() => import("./GraphCanvas"), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center text-sm text-muted">Loading graph…</div>,
});

export default function TaskGraph({ nodes, links }: { nodes: GraphNode[]; links: GraphLink[] }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [showSubtasks, setShowSubtasks] = useState(true);
  const [showTags, setShowTags] = useState(true);
  const [hideDone, setHideDone] = useState(false);
  const [fitSignal, setFitSignal] = useState(0);

  // Keep the canvas sized to its box; on small screens start simpler (no subtasks).
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    if (el.clientWidth < 640) setShowSubtasks(false);
    const ro = new ResizeObserver(([entry]) =>
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height }),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const data = useMemo(() => {
    const keep = new Set(
      nodes
        .filter((n) => (n.kind !== "subtask" || showSubtasks) && (n.kind !== "tag" || showTags))
        .filter((n) => !hideDone || n.status !== "done")
        .map((n) => n.id),
    );
    // Copies, because the library mutates nodes with positions.
    return {
      nodes: nodes.filter((n) => keep.has(n.id)).map((n) => ({ ...n })),
      links: links.filter((l) => keep.has(l.source) && keep.has(l.target)).map((l) => ({ ...l })),
    };
  }, [nodes, links, showSubtasks, showTags, hideDone]);

  return (
    <section className="panel overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2.5 text-sm sm:px-4">
        <Toggle checked={showSubtasks} onChange={setShowSubtasks} label="Subtasks" />
        <Toggle checked={showTags} onChange={setShowTags} label="Tags" />
        <Toggle checked={hideDone} onChange={setHideDone} label="Hide done" />
        <button type="button" onClick={() => setFitSignal((n) => n + 1)} className="btn-outline btn-sm ml-auto">
          <Icon name="expand" className="size-4" />
          Fit to screen
        </button>
      </div>
      <div ref={boxRef} className="relative h-[60vh] min-h-[360px] w-full bg-sunken sm:h-[66vh]">
        {size.width > 0 && (
          <GraphCanvas data={data} width={size.width} height={size.height} fitSignal={fitSignal} />
        )}
      </div>
      <div className="border-t border-line px-4 py-2.5 sm:px-5">
        <Legend />
      </div>
    </section>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label
      className={`inline-flex min-h-9 items-center gap-2 rounded-full border px-3 font-semibold transition-colors duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent ${
        checked ? "border-accent/40 bg-accent-soft text-accent" : "border-line text-muted hover:border-line-strong hover:text-ink"
      }`}
    >
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
      <Icon name={checked ? "check" : "plus"} className="size-3.5" strokeWidth={2.6} />
      {label}
    </label>
  );
}

function Legend() {
  const items = [
    { label: "Open", cls: "bg-open" },
    { label: "Due today", cls: "bg-warn" },
    { label: "Overdue", cls: "bg-danger" },
    { label: "Done", cls: "bg-faint" },
  ];
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
      {items.map((i) => (
        <span key={i.label} className="inline-flex items-center gap-1.5">
          <span className={`size-2.5 rounded-full ${i.cls}`} aria-hidden="true" />
          {i.label}
        </span>
      ))}
      <span className="inline-flex items-center gap-1.5">
        <span className="size-2.5 rounded-full border-[1.5px] border-accent" aria-hidden="true" />
        Tag
      </span>
    </div>
  );
}

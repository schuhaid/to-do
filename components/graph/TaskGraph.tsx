"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import type { GraphLink, GraphNode, SizeBy } from "@/lib/graph";
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
  const [sizeBy, setSizeBy] = useState<SizeBy>("priority");

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
    <section>
      <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        <SizeControl value={sizeBy} onChange={setSizeBy} />
        <div className="flex items-center gap-4">
          <Toggle checked={showSubtasks} onChange={setShowSubtasks} label="Subtasks" />
          <Toggle checked={showTags} onChange={setShowTags} label="Tags" />
          <Toggle checked={hideDone} onChange={setHideDone} label="Hide done" />
        </div>
        <button type="button" onClick={() => setFitSignal((n) => n + 1)} className="btn-quiet sm:ml-auto">
          <Icon name="expand" />
          Fit to screen
        </button>
      </div>
      <div
        ref={boxRef}
        className="relative h-[60vh] min-h-[360px] w-full overflow-hidden border border-line bg-side sm:h-[66vh]"
        style={{ borderRadius: "var(--radius)" }}
      >
        {size.width > 0 && (
          <GraphCanvas data={data} width={size.width} height={size.height} fitSignal={fitSignal} sizeBy={sizeBy} />
        )}
      </div>
      <Legend sizeBy={sizeBy} />
    </section>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="inline-flex min-h-8 items-center gap-2 text-[0.8125rem] text-muted hover:text-ink has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
      <span className={`check size-3.5! rounded-[4px]! border-[1.5px] ${checked ? "check-on" : ""}`} aria-hidden="true">
        <svg viewBox="0 0 12 12" className="size-2.5!">
          <path d="M2.4 6.5l2.5 2.6 4.9-6.2" />
        </svg>
      </span>
      {label}
    </label>
  );
}

const SIZE_OPTIONS: { value: SizeBy; label: string; hint: string }[] = [
  { value: "priority", label: "Priority", hint: "Bigger means higher priority" },
  { value: "urgency", label: "Urgency", hint: "Bigger means due sooner; overdue is biggest" },
  { value: "workload", label: "Workload", hint: "Bigger means more open subtasks" },
];

/** Chooses what a task's size stands for. */
function SizeControl({ value, onChange }: { value: SizeBy; onChange: (v: SizeBy) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="meta">Size by</span>
      <div role="radiogroup" aria-label="Size nodes by" className="segmented">
        {SIZE_OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            title={o.hint}
            onClick={() => onChange(o.value)}
            className={`segment ${value === o.value ? "segment-on" : ""}`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Legend({ sizeBy }: { sizeBy: SizeBy }) {
  const items = [
    { label: "Open", color: "var(--muted)" },
    { label: "Due today", color: "var(--accent)" },
    { label: "Overdue", color: "var(--danger)" },
    { label: "Done", color: "var(--faint)" },
  ];
  const hint = SIZE_OPTIONS.find((o) => o.value === sizeBy)!.hint;
  return (
    <div className="meta mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5">
      {items.map((i) => (
        <span key={i.label} className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ background: i.color }} aria-hidden="true" />
          {i.label}
        </span>
      ))}
      <span className="inline-flex items-center gap-1.5">
        <svg viewBox="0 0 14 14" className="size-3.5" aria-hidden="true">
          <circle cx="7" cy="7" r="5.5" fill="none" stroke="var(--line-strong)" strokeWidth="1.5" />
          <path d="M7 1.5 A5.5 5.5 0 0 1 12.5 7" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Ring shows subtasks done
      </span>
      <span>{hint}</span>
    </div>
  );
}

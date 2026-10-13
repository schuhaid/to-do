"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ForceGraph2D, { type ForceGraphMethods, type NodeObject } from "react-force-graph-2d";
import type { GraphLink, GraphNode } from "@/lib/graph";

type N = NodeObject<GraphNode>;

function readColors() {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string) => css.getPropertyValue(name).trim();
  return {
    open: v("--open"),
    done: v("--faint"),
    overdue: v("--danger"),
    today: v("--warn"),
    tag: v("--accent"),
    panel: v("--panel"),
    ink: v("--ink"),
    muted: v("--muted"),
    line: v("--line"),
  };
}

export default function GraphCanvas({
  data,
  width,
  height,
  fitSignal,
}: {
  data: { nodes: GraphNode[]; links: GraphLink[] };
  width: number;
  height: number;
  fitSignal: number;
}) {
  const router = useRouter();
  const fgRef = useRef<ForceGraphMethods<N> | undefined>(undefined);
  const [colors, setColors] = useState(readColors);
  const [hover, setHover] = useState<string | null>(null);
  const firstFit = useRef(true);

  // Follow light/dark mode changes.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setColors(readColors());
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => () => void (document.body.style.cursor = ""), []);

  // Spread nodes out a little more than the default.
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    fg.d3Force("charge")?.strength(-70);
    fg.d3Force("link")?.distance((l: { kind?: string }) => (l.kind === "tag" ? 70 : 34));
  }, [data]);

  useEffect(() => {
    if (fitSignal > 0) fgRef.current?.zoomToFit(400, 40);
  }, [fitSignal]);

  const fill = (n: N) =>
    n.kind === "tag" ? colors.panel : n.status === "done" ? colors.done : n.status === "overdue" ? colors.overdue : n.status === "today" ? colors.today : colors.open;

  return (
    <ForceGraph2D<GraphNode, GraphLink>
      ref={fgRef}
      graphData={data}
      width={width}
      height={height}
      backgroundColor="rgba(0,0,0,0)"
      cooldownTicks={120}
      onEngineStop={() => {
        if (firstFit.current) {
          fgRef.current?.zoomToFit(400, 40);
          firstFit.current = false;
        }
      }}
      linkColor={(l) => (l.kind === "tag" ? colors.line : colors.muted)}
      linkWidth={(l) => (l.kind === "tag" ? 1 : 1.2)}
      linkLineDash={(l) => (l.kind === "tag" ? [3, 3] : null)}
      nodeRelSize={1}
      nodeVal={(n) => n.size * n.size}
      onNodeHover={(n) => {
        setHover(n ? String(n.id) : null);
        document.body.style.cursor = n ? "pointer" : "";
      }}
      onNodeClick={(n) => router.push(n.href)}
      nodeCanvasObject={(n, ctx, scale) => {
        const r = n.size;
        const x = n.x ?? 0;
        const y = n.y ?? 0;

        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fillStyle = fill(n);
        ctx.fill();
        if (n.kind === "tag") {
          ctx.lineWidth = 1.5 / Math.max(scale, 0.6);
          ctx.strokeStyle = colors.tag;
          ctx.stroke();
        }
        if (hover === n.id) {
          ctx.lineWidth = 2 / scale;
          ctx.strokeStyle = colors.ink;
          ctx.stroke();
        }

        // Labels: tasks and tags once zoomed in a bit, subtasks only up close or on hover.
        const showLabel =
          hover === n.id ||
          (n.kind === "subtask" ? scale > 2.2 : scale > (width < 640 ? 1.3 : 0.45));
        if (!showLabel) return;
        const fontSize = (n.kind === "task" ? 12 : 11) / scale;
        ctx.font = `${n.kind === "task" ? 600 : 500} ${fontSize}px "Hanken Grotesk Variable", system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        const text = n.label.length > 40 ? `${n.label.slice(0, 39)}…` : n.label;
        // A soft halo keeps labels readable over links.
        ctx.lineWidth = 3 / scale;
        ctx.strokeStyle = colors.panel;
        ctx.strokeText(text, x, y + r + 2 / scale);
        ctx.fillStyle = n.status === "done" && n.kind !== "tag" ? colors.muted : colors.ink;
        ctx.fillText(text, x, y + r + 2 / scale);
      }}
      nodePointerAreaPaint={(n, color, ctx) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(n.x ?? 0, n.y ?? 0, n.size + 4, 0, 2 * Math.PI);
        ctx.fill();
      }}
    />
  );
}

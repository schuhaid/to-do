"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ForceGraph2D, { type ForceGraphMethods, type NodeObject } from "react-force-graph-2d";
import { forceCollide, forceX, forceY } from "d3-force";
import { weightOf, type GraphLink, type GraphNode, type SizeBy } from "@/lib/graph";

type N = NodeObject<GraphNode> & { __w?: number; __h?: number };
type Colors = ReturnType<typeof readColors>;

function readColors() {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string) => css.getPropertyValue(name).trim();
  return {
    open: v("--open"),
    done: v("--faint"),
    progress: v("--done"),
    overdue: v("--danger"),
    today: v("--gold"),
    accent: v("--accent"),
    accentSoft: v("--accent-soft"),
    panel: v("--panel"),
    ink: v("--ink"),
    muted: v("--muted"),
    line: v("--line"),
    font: getComputedStyle(document.body).fontFamily || "system-ui, sans-serif",
  };
}

/** "#rrggbb" + alpha → "rgba(...)". Falls back to the input for other formats. */
function alpha(color: string, a: number) {
  const m = /^#([0-9a-f]{6})$/i.exec(color);
  if (!m) return color;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

const idOf = (end: unknown) =>
  typeof end === "object" && end ? String((end as { id: string }).id) : String(end);

/** Radius in graph units. Tasks grow with their weight; done tasks stay small. */
export function radiusOf(n: GraphNode, by: SizeBy) {
  if (n.kind === "subtask") return 2.6;
  if (n.kind === "tag") return 4;
  if (n.status === "done") return 4.5;
  return 5 + weightOf(n, by) * 9;
}

export default function GraphCanvas({
  data,
  width,
  height,
  fitSignal,
  sizeBy,
}: {
  data: { nodes: GraphNode[]; links: GraphLink[] };
  width: number;
  height: number;
  fitSignal: number;
  sizeBy: SizeBy;
}) {
  const router = useRouter();
  const fgRef = useRef<ForceGraphMethods<N> | undefined>(undefined);
  const [colors, setColors] = useState<Colors>(readColors);
  const [hover, setHover] = useState<string | null>(null);
  const firstFit = useRef(true);
  const compact = width < 640;

  // Who is connected to whom, for Obsidian-style hover highlighting.
  const neighbors = useMemo(() => {
    const map = new Map<string, Set<string>>();
    const add = (a: string, b: string) => {
      if (!map.has(a)) map.set(a, new Set());
      map.get(a)!.add(b);
    };
    for (const l of data.links) {
      const s = idOf(l.source);
      const t = idOf(l.target);
      add(s, t);
      add(t, s);
    }
    return map;
  }, [data]);

  const nodeById = useMemo(() => new Map(data.nodes.map((n) => [n.id, n])), [data]);

  const focused = (id: string) => !hover || id === hover || !!neighbors.get(hover)?.has(id);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setColors(readColors());
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => () => void (document.body.style.cursor = ""), []);

  // Forces: spread out, keep links short, and never let big nodes overlap.
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    fg.d3Force("charge")?.strength(-80);
    fg.d3Force("link")?.distance((l: GraphLink) => (l.kind === "tag" ? 60 : 26));
    fg.d3Force("collide", forceCollide<N>((n) => radiusOf(n, sizeBy) + (n.kind === "tag" ? 14 : 5)));
    // Gentle pull to the middle so unconnected tasks don't drift off-screen.
    fg.d3Force("x", forceX<N>(0).strength(0.07));
    fg.d3Force("y", forceY<N>(0).strength(0.07));
    fg.d3ReheatSimulation();
    // Frame the graph early, and again once it has settled.
    const t = setTimeout(() => fg.zoomToFit(400, 50), 900);
    return () => clearTimeout(t);
  }, [data, sizeBy]);

  useEffect(() => {
    if (fitSignal > 0) fgRef.current?.zoomToFit(400, 50);
  }, [fitSignal]);

  const statusColor = (n: GraphNode) =>
    n.status === "done"
      ? colors.done
      : n.status === "overdue"
        ? colors.overdue
        : n.status === "today"
          ? colors.today
          : colors.open;

  function drawLabel(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    scale: number,
    strong: boolean,
    dim: boolean,
  ) {
    const fontSize = (strong ? 12.5 : 11) / scale;
    ctx.font = `${strong ? 600 : 500} ${fontSize}px ${colors.font}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const t = text.length > 42 ? `${text.slice(0, 41)}…` : text;
    ctx.lineJoin = "round";
    ctx.lineWidth = 4 / scale;
    ctx.strokeStyle = colors.panel;
    ctx.strokeText(t, x, y);
    ctx.fillStyle = dim ? colors.muted : colors.ink;
    ctx.fillText(t, x, y);
  }

  return (
    <ForceGraph2D<GraphNode, GraphLink>
      ref={fgRef}
      graphData={data}
      width={width}
      height={height}
      backgroundColor="rgba(0,0,0,0)"
      cooldownTicks={140}
      d3VelocityDecay={0.32}
      onEngineStop={() => {
        if (firstFit.current) {
          fgRef.current?.zoomToFit(500, 50);
          firstFit.current = false;
        }
      }}
      // Links: soft curves tinted by the task's status; urgent ones carry moving dots.
      linkCurvature={(l) => (l.kind === "tag" ? 0.08 : 0.22)}
      linkColor={(l) => {
        const lit = !hover || idOf(l.source) === hover || idOf(l.target) === hover;
        if (l.kind === "tag") return alpha(colors.accent, lit ? (hover ? 0.6 : 0.3) : 0.06);
        const parent = nodeById.get(idOf(l.source));
        const base = parent ? statusColor(parent) : colors.muted;
        return alpha(base, lit ? (hover ? 0.85 : 0.5) : 0.07);
      }}
      linkWidth={(l) => (l.kind === "tag" ? 1 : 1.6)}
      linkLineDash={(l) => (l.kind === "tag" ? [2, 3] : null)}
      linkDirectionalParticles={(l) => (l.urgent ? 2 : 0)}
      linkDirectionalParticleWidth={2.2}
      linkDirectionalParticleSpeed={0.006}
      linkDirectionalParticleColor={(l) => {
        const parent = nodeById.get(idOf(l.source));
        return parent?.status === "today" ? colors.today : colors.overdue;
      }}
      nodeRelSize={1}
      nodeVal={(n) => radiusOf(n, sizeBy) ** 2}
      onNodeHover={(n) => {
        setHover(n ? String(n.id) : null);
        document.body.style.cursor = n ? "pointer" : "";
      }}
      onNodeClick={(n) => router.push(n.href)}
      onNodeDragEnd={(n) => {
        // Let dragged nodes settle back into the layout, like Obsidian.
        n.fx = undefined;
        n.fy = undefined;
      }}
      nodeCanvasObject={(node, ctx, scale) => {
        const n = node as N;
        const x = n.x ?? 0;
        const y = n.y ?? 0;
        const on = focused(String(n.id));
        ctx.globalAlpha = on ? 1 : 0.14;

        if (n.kind === "tag") {
          // Tags are small labeled pills.
          const showText = scale > (compact ? 1 : 0.55) || hover === n.id;
          if (!showText) {
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fillStyle = colors.accent;
            ctx.fill();
            n.__w = 6;
            n.__h = 6;
          } else {
            const fs = 10.5 / scale;
            ctx.font = `600 ${fs}px ${colors.font}`;
            const w = ctx.measureText(n.label).width + 12 / scale;
            const h = fs + 8 / scale;
            n.__w = w;
            n.__h = h;
            ctx.beginPath();
            ctx.roundRect(x - w / 2, y - h / 2, w, h, h / 2);
            ctx.fillStyle = colors.accentSoft;
            ctx.fill();
            ctx.lineWidth = 1 / scale;
            ctx.strokeStyle = alpha(colors.accent, 0.6);
            ctx.stroke();
            ctx.fillStyle = colors.accent;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(n.label, x, y + 0.5 / scale);
          }
          ctx.globalAlpha = 1;
          return;
        }

        const r = radiusOf(n, sizeBy);
        const color = statusColor(n);

        if (n.kind === "subtask") {
          ctx.beginPath();
          ctx.arc(x, y, r, 0, 2 * Math.PI);
          if (n.status === "done") {
            ctx.fillStyle = colors.panel;
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.strokeStyle = colors.done;
            ctx.stroke();
          } else {
            ctx.fillStyle = color;
            ctx.fill();
          }
          if (hover === n.id || (hover !== null && hover === n.parent) || scale > 2.4) {
            drawLabel(ctx, n.label, x, y + r + 2 / scale, scale, false, n.status === "done");
          }
          ctx.globalAlpha = 1;
          return;
        }

        // ---- Task node ----
        const w = weightOf(n, sizeBy);

        // Glow for the heaviest tasks.
        if (w >= 0.6 && n.status !== "done") {
          const g = ctx.createRadialGradient(x, y, r * 0.6, x, y, r * 2.6);
          g.addColorStop(0, alpha(color, 0.38));
          g.addColorStop(1, alpha(color, 0));
          ctx.beginPath();
          ctx.arc(x, y, r * 2.6, 0, 2 * Math.PI);
          ctx.fillStyle = g;
          ctx.fill();
        }

        // Body with a soft highlight for depth.
        const body = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
        body.addColorStop(0, alpha(color, 0.7));
        body.addColorStop(1, color);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fillStyle = body;
        ctx.fill();

        // Progress ring: how many subtasks are done.
        if (n.subTotal > 0) {
          const ringR = r + 2.4;
          ctx.lineWidth = 1.8;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.arc(x, y, ringR, 0, 2 * Math.PI);
          ctx.strokeStyle = alpha(colors.muted, 0.25);
          ctx.stroke();
          if (n.subDone > 0) {
            const start = -Math.PI / 2;
            ctx.beginPath();
            ctx.arc(x, y, ringR, start, start + (2 * Math.PI * n.subDone) / n.subTotal);
            ctx.strokeStyle = colors.progress;
            ctx.stroke();
          }
          ctx.lineCap = "butt";
        }

        // Done tasks get a small tick.
        if (n.status === "done") {
          ctx.beginPath();
          ctx.moveTo(x - r * 0.42, y + r * 0.02);
          ctx.lineTo(x - r * 0.1, y + r * 0.34);
          ctx.lineTo(x + r * 0.45, y - r * 0.3);
          ctx.lineWidth = Math.max(1, r * 0.22);
          ctx.strokeStyle = colors.panel;
          ctx.stroke();
        }

        if (hover === n.id) {
          ctx.beginPath();
          ctx.arc(x, y, r + (n.subTotal ? 4.8 : 2.6), 0, 2 * Math.PI);
          ctx.lineWidth = 1.2;
          ctx.strokeStyle = colors.ink;
          ctx.stroke();
        }

        const showLabel = hover === n.id || (hover !== null && on) || scale > (compact ? 1.3 : 0.45);
        if (showLabel) {
          drawLabel(ctx, n.label, x, y + r + (n.subTotal ? 5 : 3), scale, true, n.status === "done");
        }
        ctx.globalAlpha = 1;
      }}
      nodePointerAreaPaint={(node, color, ctx) => {
        const n = node as N;
        ctx.fillStyle = color;
        ctx.beginPath();
        if (n.kind === "tag" && n.__w && n.__h) {
          ctx.rect((n.x ?? 0) - n.__w / 2, (n.y ?? 0) - n.__h / 2, n.__w, n.__h);
        } else {
          ctx.arc(n.x ?? 0, n.y ?? 0, radiusOf(n, sizeBy) + 4, 0, 2 * Math.PI);
        }
        ctx.fill();
      }}
    />
  );
}

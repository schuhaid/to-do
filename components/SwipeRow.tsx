"use client";

import { useRef } from "react";
import Icon, { type IconName } from "./Icon";
import {
  VelocityTracker,
  haptic,
  prefersReducedMotion,
  project,
  rubberband,
  spring,
  type SpringHandle,
} from "@/lib/spring";

type Action = { label: string; icon: IconName; tone: "accent" | "danger" };

const TONES = {
  accent: "bg-accent text-accent-ink",
  danger: "bg-danger text-white dark:text-[#1c0806]",
} as const;

const SLOP = 10; // px before a drag picks a direction (hysteresis)

/**
 * A list row you can swipe on touch screens, Mail-style.
 * Swipe right → `right` action (e.g. complete), left → `left` action (e.g. delete).
 * The row tracks the finger 1:1, hands its release velocity to a spring, uses
 * the projected landing point to decide, resists past its range, and can be
 * grabbed again mid-flight. Mouse users keep the regular buttons.
 */
export default function SwipeRow({
  right,
  left,
  onRight,
  onLeft,
  className = "",
  style,
  children,
}: {
  right: Action;
  left: Action;
  onRight: () => void;
  /** Called after the row has slid out and collapsed. */
  onLeft: () => void;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const wrapRef = useRef<HTMLLIElement>(null);
  const fgRef = useRef<HTMLDivElement>(null);
  const rightPane = useRef<HTMLDivElement>(null);
  const leftPane = useRef<HTMLDivElement>(null);

  const g = useRef({
    x: 0, // presentation value: what's on screen right now
    startX: 0,
    startY: 0,
    originX: 0,
    pointerId: -1,
    mode: "idle" as "idle" | "pending" | "drag" | "scroll",
    armed: 0 as -1 | 0 | 1,
    dragged: false,
    anim: null as SpringHandle | null,
    tracker: new VelocityTracker(),
  });

  const width = () => fgRef.current?.offsetWidth ?? 360;
  const threshold = () => Math.min(110, width() * 0.3);

  // Write one frame: row position plus the action pane hinting toward the finger.
  function apply(x: number) {
    const s = g.current;
    s.x = x;
    const fg = fgRef.current;
    if (!fg) return;
    fg.style.transform = x === 0 ? "" : `translate3d(${x}px,0,0)`;
    const t = threshold();
    const progress = Math.min(1, Math.abs(x) / t);
    const show = (pane: HTMLDivElement | null, on: boolean) => {
      if (!pane) return;
      pane.style.opacity = on ? "1" : "0";
      const icon = pane.firstElementChild as HTMLElement | null;
      if (icon) icon.style.transform = `scale(${0.6 + 0.4 * progress})`;
    };
    show(rightPane.current, x > 0);
    show(leftPane.current, x < 0);

    const armed = x >= t ? 1 : x <= -t ? -1 : 0;
    if (armed !== s.armed) {
      s.armed = armed;
      if (armed !== 0) haptic(8); // causality: fires on the frame the action arms
      for (const pane of [rightPane.current, leftPane.current]) {
        pane?.classList.toggle("armed", armed !== 0);
      }
    }
  }

  function animateTo(target: number, velocity: number, damping: number, done?: () => void) {
    const s = g.current;
    s.anim?.stop();
    if (prefersReducedMotion()) {
      apply(target);
      done?.();
      return;
    }
    s.anim = spring(s.x, target, {
      damping,
      response: 0.35,
      velocity,
      onUpdate: (v) => apply(v),
      onComplete: () => {
        s.anim = null;
        done?.();
      },
    });
  }

  function collapseThen(fn: () => void) {
    const el = wrapRef.current;
    if (!el || prefersReducedMotion()) return fn();
    el.style.height = `${el.offsetHeight}px`;
    el.style.overflow = "hidden";
    void el.offsetHeight; // commit the start height
    el.style.transition = "height 240ms cubic-bezier(0.2,0.9,0.25,1), opacity 200ms ease";
    el.style.height = "0px";
    el.style.opacity = "0";
    window.setTimeout(fn, 240);
  }

  function onPointerDown(e: React.PointerEvent) {
    if (e.pointerType === "mouse") return;
    // Text fields keep their own touch behaviour (selection, caret).
    if ((e.target as HTMLElement).closest("input, textarea, select, [contenteditable]")) return;
    const s = g.current;
    s.pointerId = e.pointerId;
    s.startX = e.clientX;
    s.startY = e.clientY;
    s.dragged = false;
    s.tracker.reset();
    // Interrupt: grab a moving row from where it is, not where it was going.
    if (s.anim) {
      s.anim.stop();
      s.anim = null;
      s.originX = s.x;
      s.mode = "drag";
      s.dragged = true;
      fgRef.current?.setPointerCapture(e.pointerId);
    } else {
      s.originX = s.x;
      s.mode = "pending";
    }
    s.tracker.push(s.x);
  }

  function onPointerMove(e: React.PointerEvent) {
    const s = g.current;
    if (e.pointerId !== s.pointerId || s.mode === "idle" || s.mode === "scroll") return;
    const dx = e.clientX - s.startX;
    const dy = e.clientY - s.startY;

    if (s.mode === "pending") {
      if (Math.abs(dy) > SLOP && Math.abs(dy) > Math.abs(dx)) {
        s.mode = "scroll"; // vertical intent: let the page scroll
        return;
      }
      if (Math.abs(dx) <= SLOP) return;
      s.mode = "drag";
      s.dragged = true;
      // Start from here so crossing the slop doesn't make the row jump.
      s.startX = e.clientX;
      fgRef.current?.setPointerCapture(e.pointerId);
      return;
    }

    // 1:1 within range, rubber-band beyond it.
    const raw = s.originX + (e.clientX - s.startX);
    const limit = width() * 0.75;
    const x = Math.abs(raw) <= limit ? raw : Math.sign(raw) * (limit + rubberband(Math.abs(raw) - limit, width()));
    s.tracker.push(x);
    apply(x);
  }

  function onPointerUp(e: React.PointerEvent) {
    const s = g.current;
    if (e.pointerId !== s.pointerId) return;
    const wasDrag = s.mode === "drag";
    s.mode = "idle";
    if (!wasDrag) return;

    const v = s.tracker.velocity();
    const landing = s.x + project(v, 0.99);
    const t = threshold();
    // Decide by where the gesture is going, and never against its direction.
    const goRight = landing >= t && s.x > 0 && v > -200;
    const goLeft = landing <= -t && s.x < 0 && v < 200;

    if (goRight) {
      onRight();
      animateTo(0, v, 0.8); // momentum carried it here: a little bounce home
    } else if (goLeft) {
      animateTo(-width() * 1.1, Math.min(v, -800), 1, () => collapseThen(onLeft));
    } else {
      animateTo(0, v, 1);
    }
  }

  function onPointerCancel(e: React.PointerEvent) {
    const s = g.current;
    if (e.pointerId !== s.pointerId) return;
    const wasDrag = s.mode === "drag";
    s.mode = "idle";
    if (wasDrag) animateTo(0, s.tracker.velocity(), 1);
  }

  return (
    <li ref={wrapRef} style={style} className={`relative overflow-hidden ${className}`}>
      <div aria-hidden="true" className="absolute inset-0">
        <div
          ref={rightPane}
          style={{ opacity: 0 }}
          className={`swipe-pane absolute inset-0 flex items-center justify-start pl-6 ${TONES[right.tone]}`}
        >
          <span className="flex flex-col items-center gap-0.5 text-xs font-semibold">
            <Icon name={right.icon} className="size-6" strokeWidth={2.2} />
            {right.label}
          </span>
        </div>
        <div
          ref={leftPane}
          style={{ opacity: 0 }}
          className={`swipe-pane absolute inset-0 flex items-center justify-end pr-6 ${TONES[left.tone]}`}
        >
          <span className="flex flex-col items-center gap-0.5 text-xs font-semibold">
            <Icon name={left.icon} className="size-6" strokeWidth={2.2} />
            {left.label}
          </span>
        </div>
      </div>
      <div
        ref={fgRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onClickCapture={(e) => {
          // A swipe is not a tap: don't open the task after dragging it.
          if (g.current.dragged) {
            e.preventDefault();
            e.stopPropagation();
            g.current.dragged = false;
          }
        }}
        className="relative touch-pan-y bg-panel will-change-transform"
      >
        {children}
      </div>
    </li>
  );
}

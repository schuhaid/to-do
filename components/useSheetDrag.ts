"use client";

import { useRef } from "react";
import { VelocityTracker, prefersReducedMotion, project, rubberband, spring, type SpringHandle } from "@/lib/spring";

/**
 * Drag a bottom sheet (a <dialog class="sheet">) down to dismiss it.
 * Only active where the sheet is a bottom sheet (phones). It follows the
 * finger 1:1, resists upward with a rubber band, and on release decides by
 * the projected landing point, handing its velocity to a spring.
 */
export function useSheetDrag(ref: React.RefObject<HTMLDialogElement | null>) {
  const s = useRef({
    active: false,
    pointerId: -1,
    startY: 0,
    y: 0,
    anim: null as SpringHandle | null,
    tracker: new VelocityTracker(),
  });

  const set = (y: number) => {
    s.current.y = y;
    const el = ref.current;
    if (el) el.style.transform = `translateY(${y}px)`;
  };

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "";
    el.style.transition = "";
    s.current.y = 0;
  };

  function onPointerDown(e: React.PointerEvent) {
    const el = ref.current;
    if (!el || !window.matchMedia("(max-width: 639px)").matches) return;
    const st = s.current;
    st.anim?.stop(); // grab it mid-flight from where it is
    st.anim = null;
    st.active = true;
    st.pointerId = e.pointerId;
    st.startY = e.clientY - st.y;
    st.tracker.reset();
    st.tracker.push(st.y);
    el.style.transition = "none";
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    const st = s.current;
    if (!st.active || e.pointerId !== st.pointerId) return;
    const dy = e.clientY - st.startY;
    const h = ref.current?.offsetHeight ?? 500;
    const y = dy >= 0 ? dy : -rubberband(-dy, h);
    st.tracker.push(y);
    set(y);
  }

  function onPointerUp(e: React.PointerEvent) {
    const st = s.current;
    if (!st.active || e.pointerId !== st.pointerId) return;
    st.active = false;
    const el = ref.current;
    if (!el) return;
    const h = el.offsetHeight;
    const v = st.tracker.velocity();
    const landing = st.y + project(v, 0.99);
    const dismiss = landing > h * 0.4 && v > -150;

    if (prefersReducedMotion()) {
      if (dismiss) {
        reset();
        el.close();
      } else reset();
      return;
    }
    st.anim = spring(st.y, dismiss ? h : 0, {
      damping: dismiss ? 1 : 0.85,
      response: 0.3,
      velocity: v,
      onUpdate: set,
      onComplete: () => {
        st.anim = null;
        if (dismiss) {
          el.close();
          // Closed sheets sit at translateY(100%) anyway, so this doesn't jump.
          requestAnimationFrame(reset);
        } else reset();
      },
    });
  }

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp };
}

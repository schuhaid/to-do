// Small physics toolkit for gesture-driven motion, after Apple's
// "Designing Fluid Interfaces" (WWDC 2018).
//
// Springs are described the way Apple does it: a damping ratio (1 = no
// overshoot, < 1 = bounce) and a response in seconds (how quickly the value
// reaches the target; not a fixed duration). They start from the current
// value and the current velocity, so they can be interrupted at any frame.

export type SpringOptions = {
  /** 1 = critically damped (default). ~0.8 only after a gesture with momentum. */
  damping?: number;
  /** Seconds. Lower is snappier. */
  response?: number;
  /** Initial velocity in units per second, e.g. the finger's release speed. */
  velocity?: number;
  onUpdate: (value: number, velocity: number) => void;
  onComplete?: () => void;
};

export type SpringHandle = {
  /** Stops where it is. The last onUpdate value is the presentation value. */
  stop: () => void;
};

const STEP = 1 / 240; // fixed physics step, independent of display rate

export function spring(from: number, to: number, opts: SpringOptions): SpringHandle {
  const { damping = 1, response = 0.4, onUpdate, onComplete } = opts;
  const omega = (2 * Math.PI) / response;
  const k = omega * omega;
  const c = 2 * damping * omega;

  let x = from;
  let v = opts.velocity ?? 0;
  let last = performance.now();
  let raf = 0;
  let stopped = false;

  const frame = (now: number) => {
    if (stopped) return;
    let dt = Math.min((now - last) / 1000, 1 / 20); // clamp after tab switches
    last = now;
    while (dt > 0) {
      const h = Math.min(STEP, dt);
      v += (-k * (x - to) - c * v) * h; // semi-implicit Euler
      x += v * h;
      dt -= h;
    }
    if (Math.abs(x - to) < 0.25 && Math.abs(v) < 6) {
      onUpdate(to, 0);
      onComplete?.();
      return;
    }
    onUpdate(x, v);
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  return {
    stop() {
      stopped = true;
      cancelAnimationFrame(raf);
    },
  };
}

/** Where a flick would come to rest, like scroll deceleration (Apple's projection). */
export function project(velocity: number, decelerationRate = 0.998): number {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/** Progressive resistance past a boundary instead of a hard stop. */
export function rubberband(overshoot: number, dimension: number, constant = 0.55): number {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

/** Release velocity from the last ~100 ms of pointer samples (units per second). */
export class VelocityTracker {
  private samples: { t: number; x: number }[] = [];

  reset() {
    this.samples = [];
  }

  push(x: number, t = performance.now()) {
    this.samples.push({ t, x });
    while (this.samples.length > 2 && t - this.samples[0].t > 100) this.samples.shift();
  }

  velocity(): number {
    const s = this.samples;
    if (s.length < 2) return 0;
    const a = s[0];
    const b = s[s.length - 1];
    const dt = (b.t - a.t) / 1000;
    return dt > 0 ? (b.x - a.x) / dt : 0;
  }
}

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** A short, meaningful tap of haptics where the platform supports it. */
export function haptic(ms = 8) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(ms);
}

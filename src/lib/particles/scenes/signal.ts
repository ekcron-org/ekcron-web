import type { Frame, Scene, SceneFactory } from "../types";
import { clamp, lerp, mix, rand, rgba } from "../palette";

interface Bar {
  phase: number;
  speed: number;
  phase2: number;
  speed2: number;
}

const GAP = 7;
const SWEEP_MS = 7000;

const smooth = (t: number) => t * t * (3 - 2 * t);

/** The shape the signal settles into: a slow swell that rises toward the right. */
const envelope = (u: number) => 0.22 + 0.5 * Math.pow(Math.sin(u * Math.PI * 0.55 + 0.35), 1.6);

/**
 * Left to right, noise becomes a signal. Every bar is jittering at the start
 * and locked to a smooth envelope by the end; a slow sweep marks the frontier.
 */
export const signal: SceneFactory = (density): Scene => {
  const bars: Bar[] = [];
  let time = 0;

  const ensure = (count: number) => {
    while (bars.length < count) {
      bars.push({
        phase: rand(0, Math.PI * 2),
        speed: rand(0.0016, 0.0036),
        phase2: rand(0, Math.PI * 2),
        speed2: rand(0.005, 0.011),
      });
    }
  };

  return {
    step(dt) {
      time += dt;
    },

    render({ ctx, w, h, palette }: Frame) {
      const gap = GAP / clamp(density, 0.5, 2);
      const count = Math.max(24, Math.floor(w / gap));
      ensure(count);

      const cy = h * 0.5;
      const amp = h * 0.42;
      const sweep = (time % SWEEP_MS) / SWEEP_MS;

      for (let i = 0; i < count; i++) {
        const b = bars[i];
        const u = i / (count - 1);
        const order = smooth(clamp((u - 0.12) / 0.7, 0, 1));

        const jitter =
          0.5 +
          0.32 * Math.sin(time * b.speed + b.phase) +
          0.18 * Math.sin(time * b.speed2 + b.phase2);
        const settled = envelope(u) * (1 + 0.025 * Math.sin(time * 0.0009 + u * 9));
        const height = lerp(jitter, settled, order) * amp;

        const near = 1 - clamp(Math.abs(u - sweep) / 0.06, 0, 1);
        const colour = mix(mix(palette.muted, palette.source, order), palette.spark, near * 0.6);
        const alpha = lerp(0.28, 0.9, order) + near * 0.25;

        const x = gap * 0.5 + u * (w - gap);
        ctx.strokeStyle = rgba(colour, clamp(alpha, 0, 1));
        ctx.lineWidth = lerp(1, 1.6, order);
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x, cy - height);
        ctx.lineTo(x, cy + height);
        ctx.stroke();
      }

      ctx.strokeStyle = rgba(palette.axis, 0.08);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(w, cy);
      ctx.stroke();
    },
  };
};

import type { Frame, Rgb, Scene, SceneFactory } from "../types";
import { MONO, bell, clamp, easeOut, rand, rgba } from "../palette";

const ARRIVE_MS = 48;
const HOLD_MS = 1500;

interface Sample {
  jitter: number;
  score: number;
  t: number;
}

interface Lane {
  centre: number;
  mean: number;
  spread: number;
  shown: number;
  samples: Sample[];
}

/** Deliberately overlapping distributions: the point is comparison, not a guaranteed win. */
const LANES: { centre: number; mean: number; spread: number }[] = [
  { centre: 0.34, mean: 0.47, spread: 0.4 },
  { centre: 0.68, mean: 0.64, spread: 0.36 },
];

function draw(lane: { mean: number; spread: number }): Sample {
  return {
    jitter: rand(-1, 1) * Math.pow(Math.random(), 0.55),
    score: clamp(lane.mean + (bell() - 0.5) * lane.spread, 0.05, 0.96),
    t: 0,
  };
}

export const evaluate: SceneFactory = (density): Scene => {
  const count = Math.max(20, Math.round(52 * density));

  const lanes: Lane[] = LANES.map((l) => ({
    ...l,
    shown: 0,
    samples: Array.from({ length: count }, () => draw(l)),
  }));

  let cursor = 0;
  let acc = 0;
  let hold = 0;

  return {
    step(dt) {
      for (const lane of lanes) {
        for (let i = 0; i < lane.shown; i++) {
          const s = lane.samples[i];
          if (s.t < 1) s.t = Math.min(1, s.t + dt * 0.0026);
        }
      }

      if (cursor >= count) {
        hold += dt;
        if (hold < HOLD_MS) return;
        hold = 0;
        cursor = 0;
        for (const lane of lanes) {
          lane.shown = 0;
          lane.samples = Array.from({ length: count }, () => draw(lane));
        }
        return;
      }

      acc += dt;
      while (acc >= ARRIVE_MS && cursor < count) {
        acc -= ARRIVE_MS;
        cursor++;
        for (const lane of lanes) lane.shown = cursor;
      }
    },

    render({ ctx, w, h, palette }: Frame) {
      const padTop = Math.max(26, h * 0.16);
      const padBottom = Math.max(30, h * 0.16);
      const plotH = h - padTop - padBottom;
      const halfWidth = Math.min(w * 0.14, Math.min(w, h) * 0.17);
      const yOf = (score: number) => padTop + (1 - score) * plotH;

      ctx.strokeStyle = rgba(palette.axis, 0.07);
      ctx.lineWidth = 1;
      for (let g = 0; g <= 4; g++) {
        const y = Math.round(padTop + (plotH * g) / 4) + 0.5;
        ctx.beginPath();
        ctx.moveTo(w * 0.08, y);
        ctx.lineTo(w * 0.92, y);
        ctx.stroke();
      }

      const colours: Rgb[] = [palette.source, palette.target];

      lanes.forEach((lane, li) => {
        const cx = w * lane.centre;
        const colour = colours[li];
        let sum = 0;
        let landed = 0;

        ctx.fillStyle = rgba(colour, 1);
        for (let i = 0; i < lane.shown; i++) {
          const s = lane.samples[i];
          const e = easeOut(s.t);
          const y = yOf(-0.12 + (s.score + 0.12) * e);
          ctx.globalAlpha = 0.16 + 0.42 * s.t;
          ctx.beginPath();
          ctx.arc(cx + s.jitter * halfWidth, y, 2.1, 0, Math.PI * 2);
          ctx.fill();
          if (s.t > 0.6) {
            sum += s.score;
            landed++;
          }
        }
        ctx.globalAlpha = 1;

        if (landed < 3) return;

        const meanY = yOf(sum / landed);
        ctx.strokeStyle = rgba(colour, 0.85);
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(cx - halfWidth - 6, meanY);
        ctx.lineTo(cx + halfWidth + 6, meanY);
        ctx.stroke();

        ctx.font = MONO;
        ctx.textAlign = "center";
        ctx.fillStyle = rgba(colour, 0.9);
        ctx.fillText(((sum / landed) * 100).toFixed(0), cx, meanY - 8);
        ctx.textAlign = "left";
      });

      ctx.font = MONO;
      ctx.fillStyle = rgba(palette.muted, 0.8);
      ctx.fillText(`held out  ${String(cursor).padStart(2, "0")}/${count}`, w * 0.08, padTop - 12);
    },
  };
};

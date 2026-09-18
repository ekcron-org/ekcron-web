import type { Frame, Scene, SceneFactory } from "../types";
import { MONO, bell, clamp, easeOut, rand, rgba } from "../palette";

const ARRIVE_MS = 120;
const HOLD_MS = 2600;

interface Pair {
  base: number;
  tuned: number;
  t: number;
}

/**
 * Same held-out item, both models. Tuned usually wins, sometimes loses, and
 * the losses are drawn as plainly as the wins.
 */
function drawPair(): Pair {
  const base = clamp(0.4 + (bell() - 0.5) * 0.8, 0.06, 0.82);
  const delta = 0.19 + (bell() - 0.5) * 0.5 + rand(-0.03, 0.03);
  return { base, tuned: clamp(base + delta, 0.05, 0.97), t: 1 };
}

export const evaluate: SceneFactory = (density): Scene => {
  const count = Math.max(14, Math.round(26 * density));
  let pairs: Pair[] = Array.from({ length: count }, drawPair);
  let cursor = count;
  let acc = 0;
  let hold = 0;

  return {
    step(dt) {
      for (let i = 0; i < cursor; i++) {
        const p = pairs[i];
        if (p.t < 1) p.t = Math.min(1, p.t + dt * 0.0022);
      }

      if (cursor >= count) {
        hold += dt;
        if (hold < HOLD_MS) return;
        hold = 0;
        cursor = 0;
        pairs = Array.from({ length: count }, () => ({ ...drawPair(), t: 0 }));
        return;
      }

      acc += dt;
      while (acc >= ARRIVE_MS && cursor < count) {
        acc -= ARRIVE_MS;
        cursor++;
      }
    },

    render({ ctx, w, h, palette }: Frame) {
      const padX = Math.max(18, w * 0.08);
      const padTop = Math.max(30, h * 0.18);
      const padBottom = Math.max(26, h * 0.14);
      const plotW = w - padX * 2;
      const plotH = h - padTop - padBottom;
      if (plotW <= 0 || plotH <= 0) return;

      const xOf = (i: number) => padX + (i / (count - 1)) * plotW;
      const yOf = (score: number) => padTop + (1 - score) * plotH;

      ctx.strokeStyle = rgba(palette.axis, 0.07);
      ctx.lineWidth = 1;
      for (let g = 0; g <= 4; g++) {
        const y = Math.round(padTop + (plotH * g) / 4) + 0.5;
        ctx.beginPath();
        ctx.moveTo(padX, y);
        ctx.lineTo(padX + plotW, y);
        ctx.stroke();
      }

      let baseSum = 0;
      let tunedSum = 0;
      let landed = 0;
      let ahead = 0;
      let behind = 0;

      for (let i = 0; i < cursor; i++) {
        const p = pairs[i];
        const e = easeOut(p.t);
        const x = xOf(i);
        const yBase = yOf(p.base);
        const yTuned = yBase + (yOf(p.tuned) - yBase) * e;
        const wins = p.tuned >= p.base;
        const colour = wins ? palette.target : palette.muted;

        ctx.strokeStyle = rgba(colour, 0.35 + 0.3 * e);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x, yBase);
        ctx.lineTo(x, yTuned);
        ctx.stroke();

        ctx.fillStyle = rgba(palette.source, 0.9);
        ctx.beginPath();
        ctx.arc(x, yBase, 2.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = rgba(colour, 0.35 + 0.6 * e);
        ctx.beginPath();
        ctx.arc(x, yTuned, 2.4, 0, Math.PI * 2);
        ctx.fill();

        if (p.t > 0.7) {
          landed++;
          baseSum += p.base;
          tunedSum += p.tuned;
          wins ? ahead++ : behind++;
        }
      }

      ctx.font = MONO;
      ctx.textBaseline = "alphabetic";

      if (landed >= 3) {
        const baseMean = baseSum / landed;
        const tunedMean = tunedSum / landed;
        const lines: [number, typeof palette.source, string][] = [
          [baseMean, palette.source, `base ${(baseMean * 100).toFixed(0)}`],
          [tunedMean, palette.target, `tuned ${(tunedMean * 100).toFixed(0)}`],
        ];
        ctx.setLineDash([3, 4]);
        ctx.lineWidth = 1;
        for (const [mean, colour, label] of lines) {
          const y = Math.round(yOf(mean)) + 0.5;
          ctx.strokeStyle = rgba(colour, 0.45);
          ctx.beginPath();
          ctx.moveTo(padX, y);
          ctx.lineTo(padX + plotW, y);
          ctx.stroke();
          ctx.fillStyle = rgba(colour, 0.95);
          ctx.textAlign = "right";
          ctx.fillText(label, padX + plotW, y - 5);
        }
        ctx.setLineDash([]);
        ctx.textAlign = "left";
      }

      ctx.fillStyle = rgba(palette.muted, 0.8);
      ctx.fillText(`held out  ${String(cursor).padStart(2, "0")}/${count}`, padX, padTop - 12);
      if (landed >= 3) {
        ctx.textAlign = "right";
        ctx.fillText(`ahead ${ahead}  ·  behind ${behind}`, padX + plotW, padTop - 12);
        ctx.textAlign = "left";
      }
    },
  };
};

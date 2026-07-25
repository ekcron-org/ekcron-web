import type { Frame, Scene, SceneFactory } from "../types";
import { MONO, clamp, rand, rgba } from "../palette";

const WINDOW = 96;
const TICK_MS = 95;
const RUN_LENGTH = 150;
const EVAL_EVERY = 14;
const LOSS_MAX = 2;
const LOSS_MIN = 0.05;

interface Point {
  value: number;
  run: number;
}

interface EvalPoint extends Point {
  step: number;
}

/** Exponential decay plus noise that thins out as the run settles. */
function lossAt(step: number) {
  const decay = 1.78 * Math.exp(-step / 44) + 0.17;
  const jitter = 1 + 1.6 * Math.exp(-step / 26);
  return clamp(decay + rand(-0.045, 0.045) * jitter, LOSS_MIN, LOSS_MAX);
}

export const train: SceneFactory = (): Scene => {
  let runStep = 0;
  let totalStep = 0;
  let run = 0;
  let acc = 0;
  let viewLo = LOSS_MIN;
  let viewHi = LOSS_MAX;

  const series: Point[] = [];
  let evals: EvalPoint[] = [];

  const record = () => {
    series.push({ value: lossAt(runStep), run });
    if (series.length > WINDOW) series.shift();
    if (runStep % EVAL_EVERY === 0) {
      evals.push({ step: totalStep, value: lossAt(runStep) + rand(0.04, 0.13), run });
    }
    evals = evals.filter((e) => totalStep - e.step < WINDOW);
  };

  for (let i = 0; i < WINDOW; i++) {
    record();
    runStep++;
    totalStep++;
  }

  return {
    step(dt) {
      acc += dt;
      while (acc >= TICK_MS) {
        acc -= TICK_MS;
        if (runStep >= RUN_LENGTH) {
          runStep = 0;
          run++;
        } else {
          runStep++;
        }
        totalStep++;
        record();
      }

      // Track the visible window rather than the whole loss range, so the curve
      // fills the panel. Eased so the axis glides instead of snapping.
      let lo = Infinity;
      let hi = -Infinity;
      for (const p of series) {
        if (p.value < lo) lo = p.value;
        if (p.value > hi) hi = p.value;
      }
      for (const e of evals) if (e.value > hi) hi = e.value;

      const margin = Math.max(0.08, (hi - lo) * 0.18);
      const k = Math.min(1, dt * 0.0022);
      viewLo += (Math.max(LOSS_MIN, lo - margin) - viewLo) * k;
      viewHi += (Math.min(LOSS_MAX, hi + margin) - viewHi) * k;
    },

    render({ ctx, w, h, palette }: Frame) {
      const padX = Math.max(14, w * 0.05);
      const padTop = Math.max(20, h * 0.14);
      const padBottom = Math.max(18, h * 0.12);
      const plotW = w - padX * 2;
      const plotH = h - padTop - padBottom;
      if (plotW <= 0 || plotH <= 0) return;

      const frac = acc / TICK_MS;
      const xOf = (i: number) => padX + ((i - frac) / (WINDOW - 1)) * plotW;
      const span = Math.max(0.05, viewHi - viewLo);
      const yOf = (v: number) =>
        padTop + (1 - (clamp(v, viewLo, viewHi) - viewLo) / span) * plotH;

      ctx.strokeStyle = rgba(palette.axis, 0.07);
      ctx.lineWidth = 1;
      for (let g = 0; g <= 4; g++) {
        const y = Math.round(padTop + (plotH * g) / 4) + 0.5;
        ctx.beginPath();
        ctx.moveTo(padX, y);
        ctx.lineTo(padX + plotW, y);
        ctx.stroke();
      }

      // A new run restarts at a high loss, so each run is drawn as its own
      // segment. Joining them would put a vertical jump across the panel.
      const runs: { i: number; p: Point }[][] = [];
      series.forEach((p, i) => {
        const last = runs[runs.length - 1];
        if (!last || last[0].p.run !== p.run) runs.push([{ i, p }]);
        else last.push({ i, p });
      });

      ctx.save();
      ctx.beginPath();
      ctx.rect(padX, padTop - 6, plotW, plotH + 12);
      ctx.clip();

      const area = ctx.createLinearGradient(0, padTop, 0, padTop + plotH);
      area.addColorStop(0, rgba(palette.source, 0.16));
      area.addColorStop(1, rgba(palette.source, 0));
      ctx.fillStyle = area;
      for (const segment of runs) {
        if (segment.length < 2) continue;
        ctx.beginPath();
        ctx.moveTo(xOf(segment[0].i), padTop + plotH);
        for (const { i, p } of segment) ctx.lineTo(xOf(i), yOf(p.value));
        ctx.lineTo(xOf(segment[segment.length - 1].i), padTop + plotH);
        ctx.closePath();
        ctx.fill();
      }

      const stroke = ctx.createLinearGradient(padX, 0, padX + plotW, 0);
      stroke.addColorStop(0, rgba(palette.source, 0.55));
      stroke.addColorStop(1, rgba(palette.target, 0.95));
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1.6;
      ctx.lineJoin = "round";
      for (const segment of runs) {
        ctx.beginPath();
        segment.forEach(({ i, p }, k) => {
          const x = xOf(i);
          const y = yOf(p.value);
          k === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.stroke();
      }

      const evalX = (e: EvalPoint) => xOf(WINDOW - 1 - (totalStep - e.step));

      ctx.strokeStyle = rgba(palette.target, 0.42);
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      let prev: EvalPoint | null = null;
      ctx.beginPath();
      for (const e of evals) {
        const x = evalX(e);
        const y = yOf(e.value);
        !prev || prev.run !== e.run ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        prev = e;
      }
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = rgba(palette.target, 0.75);
      for (const e of evals) {
        ctx.beginPath();
        ctx.arc(evalX(e), yOf(e.value), 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      const head = series[series.length - 1];
      const lastX = xOf(series.length - 1);
      const lastY = yOf(head.value);
      ctx.fillStyle = rgba(palette.target, 0.14);
      ctx.beginPath();
      ctx.arc(lastX, lastY, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = rgba(palette.spark, 0.95);
      ctx.beginPath();
      ctx.arc(lastX, lastY, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = MONO;
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = rgba(palette.muted, 0.85);
      ctx.fillText(`loss ${head.value.toFixed(3)}`, padX, padTop - 8);
      ctx.textAlign = "right";
      ctx.fillText(`step ${String(runStep).padStart(4, "0")}`, padX + plotW, padTop - 8);
      ctx.textAlign = "left";
    },
  };
};

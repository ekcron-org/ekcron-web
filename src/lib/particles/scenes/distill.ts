import type { Frame, Rgb, Scene, SceneFactory } from "../types";
import { mix, rand, rgba } from "../palette";

interface Node {
  x: number;
  y: number;
  z: number;
  rf: number;
}

interface Traveler {
  from: number;
  to: number;
  t: number;
  speed: number;
  arc: number;
}

const MIN_DEPTH = 1 / 1.42;
const DEPTH_SPAN = 1 / 0.58 - MIN_DEPTH;
const BUCKETS = 6;

function shellNode(inner: number, curve: number): Node {
  const u = Math.random() * 2 - 1;
  const theta = Math.random() * Math.PI * 2;
  const ring = Math.sqrt(1 - u * u);
  return {
    x: ring * Math.cos(theta),
    y: u,
    z: ring * Math.sin(theta),
    rf: inner + (1 - inner) * Math.pow(Math.random(), curve),
  };
}

function newTraveler(sourceCount: number, targetCount: number, seeded: boolean): Traveler {
  return {
    from: (Math.random() * sourceCount) | 0,
    to: (Math.random() * targetCount) | 0,
    t: seeded ? Math.random() : -rand(0, 0.6),
    speed: rand(0.00034, 0.0007),
    arc: rand(0.09, 0.26) * (Math.random() < 0.5 ? -1 : 1),
  };
}

function project(
  nodes: Node[],
  angle: number,
  cx: number,
  cy: number,
  radius: number,
  out: Float32Array,
) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    const x = n.x * cos + n.z * sin;
    const z = n.z * cos - n.x * sin;
    const depth = 1 / (1 + 0.42 * z);
    const scale = n.rf * radius * depth;
    out[i * 3] = cx + x * scale;
    out[i * 3 + 1] = cy + n.y * scale;
    out[i * 3 + 2] = depth;
  }
}

/** Batches points into depth bands so a thousand of them cost six fills, not a thousand. */
function drawBanded(ctx: CanvasRenderingContext2D, proj: Float32Array, colour: Rgb) {
  ctx.fillStyle = rgba(colour, 1);
  for (let b = 0; b < BUCKETS; b++) {
    const mid = (b + 0.5) / BUCKETS;
    ctx.globalAlpha = 0.09 + 0.5 * mid;
    const r = 0.5 + 1.15 * mid;
    ctx.beginPath();
    for (let i = 0; i < proj.length; i += 3) {
      const d = (proj[i + 2] - MIN_DEPTH) / DEPTH_SPAN;
      if (((d * BUCKETS) | 0) !== b) continue;
      ctx.moveTo(proj[i] + r, proj[i + 1]);
      ctx.arc(proj[i], proj[i + 1], r, 0, Math.PI * 2);
    }
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export const distill: SceneFactory = (density): Scene => {
  const sourceCount = Math.max(180, Math.round(720 * density));
  const targetCount = Math.max(90, Math.round(280 * density));
  const travelerCount = Math.max(14, Math.round(52 * density));

  const source = Array.from({ length: sourceCount }, () => shellNode(0.6, 0.7));
  const target = Array.from({ length: targetCount }, () => shellNode(0.34, 0.55));
  const charge = new Float32Array(targetCount);
  const travelers = Array.from({ length: travelerCount }, () =>
    newTraveler(sourceCount, targetCount, true),
  );
  const projSource = new Float32Array(sourceCount * 3);
  const projTarget = new Float32Array(targetCount * 3);

  let angleSource = 0;
  let angleTarget = Math.PI * 0.4;

  return {
    step(dt) {
      angleSource += dt * 0.00016;
      angleTarget -= dt * 0.00025;

      for (let i = 0; i < charge.length; i++) {
        const next = charge[i] - dt * 0.00024;
        charge[i] = next > 0 ? next : 0;
      }

      for (const tr of travelers) {
        tr.t += tr.speed * dt;
        if (tr.t < 1) continue;
        charge[tr.to] = 1;
        Object.assign(tr, newTraveler(sourceCount, targetCount, false));
      }
    },

    render({ ctx, w, h, palette, time }: Frame) {
      const s = Math.min(w, h);
      project(source, angleSource, w * 0.28, h * 0.5, s * 0.25, projSource);
      project(target, angleTarget, w * 0.75, h * 0.5, s * 0.13, projTarget);

      drawBanded(ctx, projSource, palette.source);

      ctx.fillStyle = rgba(palette.target, 1);
      for (let i = 0; i < targetCount; i++) {
        const d = (projTarget[i * 3 + 2] - MIN_DEPTH) / DEPTH_SPAN;
        ctx.globalAlpha = (0.12 + 0.46 * d) * (0.42 + 0.58 * charge[i]);
        ctx.beginPath();
        ctx.arc(
          projTarget[i * 3],
          projTarget[i * 3 + 1],
          0.55 + 1.2 * d + charge[i] * 0.5,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      for (const tr of travelers) {
        if (tr.t <= 0) continue;
        const f = tr.from * 3;
        const g = tr.to * 3;
        const x0 = projSource[f];
        const y0 = projSource[f + 1];
        const x1 = projTarget[g];
        const y1 = projTarget[g + 1];
        const dx = x1 - x0;
        const dy = y1 - y0;
        const len = Math.hypot(dx, dy) || 1;
        const cx = (x0 + x1) / 2 - (dy / len) * tr.arc * len;
        const cy = (y0 + y1) / 2 + (dx / len) * tr.arc * len;
        const fade = Math.min(1, Math.min(tr.t, 1 - tr.t) * 5);
        const colour = mix(palette.source, palette.target, tr.t);

        for (let k = 3; k >= 0; k--) {
          const t = tr.t - k * 0.05;
          if (t <= 0) continue;
          const u = 1 - t;
          const x = u * u * x0 + 2 * u * t * cx + t * t * x1;
          const y = u * u * y0 + 2 * u * t * cy + t * t * y1;
          const trail = 1 - k / 4.6;

          if (k === 0) {
            ctx.fillStyle = rgba(colour, 0.1 * fade);
            ctx.beginPath();
            ctx.arc(x, y, 3.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = rgba(palette.spark, 0.85 * fade);
          } else {
            ctx.fillStyle = rgba(colour, 0.5 * trail * fade);
          }

          ctx.beginPath();
          ctx.arc(x, y, 1.5 * trail, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const scanY = ((time * 0.00006) % 1) * h;
      const band = ctx.createLinearGradient(0, scanY - 26, 0, scanY);
      band.addColorStop(0, rgba(palette.scan, 0));
      band.addColorStop(1, rgba(palette.scan, 0.07));
      ctx.fillStyle = band;
      ctx.fillRect(0, scanY - 26, w, 26);

      const line = ctx.createLinearGradient(0, 0, w, 0);
      line.addColorStop(0, rgba(palette.scan, 0));
      line.addColorStop(0.5, rgba(palette.scan, 0.42));
      line.addColorStop(1, rgba(palette.scan, 0));
      ctx.fillStyle = line;
      ctx.fillRect(0, scanY, w, 1);
    },
  };
};

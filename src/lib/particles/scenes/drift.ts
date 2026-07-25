import type { Frame, Scene, SceneFactory } from "../types";
import { rand, rgba } from "../palette";

interface Mote {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
}

export const drift: SceneFactory = (density): Scene => {
  const motes: Mote[] = Array.from({ length: Math.max(28, Math.round(88 * density)) }, () => ({
    x: Math.random(),
    y: Math.random(),
    z: Math.random(),
    vx: rand(-0.012, 0.012),
    vy: rand(-0.026, -0.006),
  }));

  return {
    step(dt) {
      const k = dt * 0.001;
      for (const m of motes) {
        m.x += m.vx * k;
        m.y += m.vy * k;
        if (m.x < -0.05) m.x = 1.05;
        else if (m.x > 1.05) m.x = -0.05;
        if (m.y < -0.05) m.y = 1.05;
        else if (m.y > 1.05) m.y = -0.05;
      }
    },

    render({ ctx, w, h, palette }: Frame) {
      const reach = Math.min(w, h) * 0.22;

      ctx.lineWidth = 1;
      for (let i = 0; i < motes.length; i++) {
        const ax = motes[i].x * w;
        const ay = motes[i].y * h;
        for (let j = i + 1; j < motes.length; j++) {
          const bx = motes[j].x * w;
          const by = motes[j].y * h;
          const dist = Math.hypot(ax - bx, ay - by);
          if (dist > reach) continue;
          ctx.strokeStyle = rgba(palette.source, 0.1 * (1 - dist / reach));
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.stroke();
        }
      }

      for (const m of motes) {
        ctx.fillStyle = rgba(m.z > 0.6 ? palette.target : palette.source, 0.2 + m.z * 0.45);
        ctx.beginPath();
        ctx.arc(m.x * w, m.y * h, 0.7 + m.z * 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    },
  };
};

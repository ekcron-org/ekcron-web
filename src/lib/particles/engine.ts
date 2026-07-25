import type { Palette, Scene } from "./types";
import { readPalette } from "./palette";
import { SCENES } from "./scenes";

interface Field {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  scene: Scene;
  w: number;
  h: number;
  time: number;
  last: number;
  visible: boolean;
}

const MAX_DPR = 2;
const MAX_STEP_MS = 48;

/**
 * Every canvas on the page shares one animation loop; a field only advances
 * while it is on screen, the tab is visible, and motion is not reduced.
 */
export function mountFields(selector: string) {
  const canvases = document.querySelectorAll<HTMLCanvasElement>(selector);
  if (canvases.length === 0) return;

  const fields: Field[] = [];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  let palette: Palette = readPalette();
  let running = false;

  const resize = (field: Field) => {
    const rect = field.canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    field.w = rect.width;
    field.h = rect.height;
    field.canvas.width = Math.round(rect.width * dpr);
    field.canvas.height = Math.round(rect.height * dpr);
    field.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const paint = (field: Field) => {
    field.ctx.clearRect(0, 0, field.w, field.h);
    field.scene.render({
      ctx: field.ctx,
      w: field.w,
      h: field.h,
      palette,
      time: field.time,
    });
  };

  const frame = (now: number) => {
    running = false;
    let wants = false;

    for (const field of fields) {
      if (!field.visible) continue;
      const dt = Math.min(now - (field.last || now), MAX_STEP_MS);
      field.last = now;
      field.time += dt;
      field.scene.step(dt);
      paint(field);
      wants = true;
    }

    if (wants && !document.hidden && !reduced.matches) {
      running = true;
      requestAnimationFrame(frame);
    }
  };

  const pump = () => {
    if (running || reduced.matches || document.hidden) return;
    if (!fields.some((f) => f.visible)) return;
    running = true;
    for (const field of fields) field.last = 0;
    requestAnimationFrame(frame);
  };

  const inView = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const field = fields.find((f) => f.canvas === entry.target);
        if (field) field.visible = entry.isIntersecting;
      }
      pump();
    },
    { rootMargin: "120px" },
  );

  const sizes = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const field = fields.find((f) => f.canvas === entry.target);
      if (!field) continue;
      resize(field);
      paint(field);
    }
  });

  for (const canvas of canvases) {
    const ctx = canvas.getContext("2d");
    const factory = SCENES[canvas.dataset.scene ?? ""];
    if (!ctx || !factory) continue;

    const field: Field = {
      canvas,
      ctx,
      scene: factory(Number(canvas.dataset.density) || 1),
      w: 0,
      h: 0,
      time: 0,
      last: 0,
      visible: false,
    };

    fields.push(field);
    resize(field);
    paint(field);
    inView.observe(canvas);
    sizes.observe(canvas);
  }

  new MutationObserver(() => {
    palette = readPalette();
    for (const field of fields) paint(field);
  }).observe(document.documentElement, { attributeFilter: ["class"] });

  document.addEventListener("visibilitychange", pump);
  reduced.addEventListener("change", () => {
    for (const field of fields) paint(field);
    pump();
  });

  pump();
}

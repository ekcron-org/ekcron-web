import type { Palette, Rgb } from "./types";

/** Derived from the brand gradient; the light set is darkened to stay legible on white. */
const DARK: Palette = {
  source: [36, 229, 223],
  target: [178, 82, 255],
  spark: [240, 248, 255],
  scan: [36, 229, 223],
  axis: [255, 255, 255],
  muted: [161, 161, 170],
};

const LIGHT: Palette = {
  source: [11, 145, 141],
  target: [122, 0, 205],
  spark: [28, 8, 54],
  scan: [122, 0, 205],
  axis: [24, 24, 27],
  muted: [113, 113, 122],
};

export const readPalette = (): Palette =>
  document.documentElement.classList.contains("dark") ? DARK : LIGHT;

export const rgba = (c: Rgb, a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const mix = (a: Rgb, b: Rgb, t: number): Rgb => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];

export const rand = (min: number, max: number) => min + Math.random() * (max - min);

export const clamp = (v: number, min: number, max: number) =>
  v < min ? min : v > max ? max : v;

/** Mean of three uniforms: a cheap bell curve centred on 0.5. */
export const bell = () => (Math.random() + Math.random() + Math.random()) / 3;

export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export const MONO = '10px "JetBrains Mono Variable", ui-monospace, monospace';

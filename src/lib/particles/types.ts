export type Rgb = [number, number, number];

export interface Palette {
  source: Rgb;
  target: Rgb;
  spark: Rgb;
  scan: Rgb;
  axis: Rgb;
  muted: Rgb;
}

export interface Frame {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  palette: Palette;
  time: number;
}

export interface Scene {
  step(dt: number): void;
  render(frame: Frame): void;
}

export type SceneFactory = (density: number) => Scene;

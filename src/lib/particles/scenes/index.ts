import type { SceneFactory } from "../types";
import { distill } from "./distill";
import { drift } from "./drift";
import { evaluate } from "./evaluate";
import { train } from "./train";

/** Add a scene here and it becomes available as `<ParticleField scene="..." />`. */
export const SCENES: Record<string, SceneFactory> = {
  distill,
  drift,
  evaluate,
  train,
};

export type SceneName = keyof typeof SCENES;

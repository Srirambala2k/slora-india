import { smooth } from "./phases";

export type Vec3 = readonly [number, number, number];

export interface CameraPose {
  position: Vec3;
  target: Vec3;
  fov: number;
}

/**
 * The 3D camera's path, as a few key poses over q (0 → 1). Between keys it eases in and
 * out, so the camera settles for a moment on each view.
 *
 *   0    macro: right up against the grass (matches the end of the footage)
 *   0.42 pulls out to a three-quarter view of the whole cut-away block
 *   1    straight-on cross-section, block shifted left to leave room for the labels
 */
const KEYS: ReadonlyArray<{ q: number } & CameraPose> = [
  { q: 0, position: [0.2, 0.4, 1.95], target: [-0.1, 0.32, 0], fov: 28 },
  { q: 0.42, position: [3.4, 1.15, 5.6], target: [0.2, -0.45, 0], fov: 32 },
  { q: 1, position: [1.6, -0.6, 11], target: [1.6, -0.6, 0], fov: 30 },
];

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
const lerp3 = (a: Vec3, b: Vec3, t: number): Vec3 => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];

export function cameraPose(q: number): CameraPose {
  const clamped = Math.min(1, Math.max(0, q));
  for (let i = 0; i < KEYS.length - 1; i++) {
    const from = KEYS[i];
    const to = KEYS[i + 1];
    if (clamped <= to.q) {
      const t = smooth((clamped - from.q) / (to.q - from.q));
      return {
        position: lerp3(from.position, to.position, t),
        target: lerp3(from.target, to.target, t),
        fov: lerp(from.fov, to.fov, t),
      };
    }
  }
  const last = KEYS[KEYS.length - 1];
  return { position: last.position, target: last.target, fov: last.fov };
}

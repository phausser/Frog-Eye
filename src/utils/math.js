export const lerp  = (a, b, t) => a + (b - a) * t;
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// Smooth arc: sin curve over t∈[0,1], peak at 0.5
export const arc = (t) => Math.sin(t * Math.PI);

// Shortest-path angle lerp — handles ±π wrap-around
export function lerpAngle(a, b, t) {
  const d = ((b - a) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
  return a + d * t;
}

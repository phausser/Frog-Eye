import { getFrogPos } from '../frog/frog.js';
import { isRiver } from '../world/grid.js';

const FROG_HIT_HW      = 0.55; // vehicle collision half-width
const PLATFORM_MARGIN  = 0.25; // frog must be this far from platform edge

// ── Road ──────────────────────────────────────────────────────────────────────

export function checkFrogVehicle(frog, vehicles) {
  const { x } = getFrogPos(frog);
  return vehicles.some(
    (v) => v.row === frog.row && Math.abs(x - v.x) < FROG_HIT_HW + v.halfW
  );
}

// ── River ─────────────────────────────────────────────────────────────────────

// Returns the platform carrying the frog, or null.
// Lethal platforms (croc) and submerged turtles are excluded.
export function findPlatformUnderFrog(frog, platforms) {
  return platforms.find((p) =>
    p.row === frog.row &&
    !p.lethal &&
    p.sinkPhase !== 'underwater' &&
    Math.abs(frog.worldX - p.x) < p.halfLen - PLATFORM_MARGIN
  ) ?? null;
}

// Returns true if frog should die from a lethal platform (croc) contact.
export function checkFrogCroc(frog, platforms) {
  return platforms.some((p) =>
    p.row === frog.row &&
    p.lethal &&
    Math.abs(frog.worldX - p.x) < p.halfLen + FROG_HIT_HW
  );
}

// True when frog is idle on a river row with no safe platform underneath.
export function isFrogDrowning(frog, platforms) {
  if (!isRiver(frog.row) || frog.state !== 'idle') return false;
  return !findPlatformUnderFrog(frog, platforms);
}

import { getFrogPos } from '../frog/frog.js';

// Frog's collision half-width in world-X — slightly smaller than a half-cell
const FROG_HIT_HW = 0.55;

// Returns true if the frog overlaps any vehicle on its current logical row.
// Uses the frog's animated X so collision is accurate during jumps.
export function checkFrogVehicle(frog, vehicles) {
  const { x } = getFrogPos(frog);
  return vehicles.some(
    (v) => v.row === frog.row && Math.abs(x - v.x) < FROG_HIT_HW + v.halfW
  );
}

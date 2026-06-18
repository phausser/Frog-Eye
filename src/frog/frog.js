import { GRID_COLS, ROWS, JUMP_DURATION, JUMP_HEIGHT, CELL_SIZE } from '../utils/constants.js';
import { colToX, rowToZ } from '../world/grid.js';
import { lerp, arc, clamp } from '../utils/math.js';

const START_COL   = Math.floor(GRID_COLS / 2); // col 6 = center
const INITIAL_DIR = { dRow: 1, dCol: 0 };
const MAX_WORLD_X = (GRID_COLS / 2) * CELL_SIZE; // = 13 units

export function createFrog() {
  const startX = colToX(START_COL);
  return {
    row:          ROWS.START,
    col:          START_COL,
    worldX:       startX,       // continuous world-X; drifts on platforms
    fromWorldX:   startX,
    toWorldX:     startX,
    state:        'idle',
    jumpProgress: 0,
    fromRow:      ROWS.START,
    toRow:        ROWS.START,
    facingDir:    { ...INITIAL_DIR },
    facingAngle:  0,
  };
}

export function rotateFrog(frog, dir) {
  if (frog.state !== 'idle') return;
  const { dRow, dCol } = frog.facingDir;
  frog.facingDir = dir === 1
    ? { dRow: -dCol || 0, dCol:  dRow || 0 }
    : { dRow:  dCol || 0, dCol: -dRow || 0 };
  frog.facingAngle = Math.atan2(frog.facingDir.dCol, frog.facingDir.dRow);
}

export function tryJump(frog) {
  if (frog.state !== 'idle') return false;
  const { dRow, dCol } = frog.facingDir;
  const toRow    = frog.row + dRow;
  const toWorldX = frog.worldX + dCol * CELL_SIZE;

  if (toRow < 0 || toRow >= ROWS.TOTAL)  return false;
  if (Math.abs(toWorldX) > MAX_WORLD_X) return false;

  frog.fromRow    = frog.row;
  frog.fromWorldX = frog.worldX;
  frog.toRow      = toRow;
  frog.toWorldX   = toWorldX;
  // keep col in sync for tests / HUD
  frog.col        = Math.round(toWorldX / CELL_SIZE) + START_COL;

  frog.facingAngle  = Math.atan2(dCol, dRow);
  frog.state        = 'jumping';
  frog.jumpProgress = 0;
  return true;
}

export function updateFrog(frog, delta) {
  if (frog.state !== 'jumping') return;
  frog.jumpProgress += delta / JUMP_DURATION;
  if (frog.jumpProgress >= 1) {
    frog.jumpProgress = 1;
    frog.row    = frog.toRow;
    frog.worldX = frog.toWorldX;
    frog.state  = 'idle';
  }
}

// Carry the frog horizontally (while riding a platform).
// Also clamps so the frog drowns when carried off-screen.
export function carryFrog(frog, dx) {
  frog.worldX = clamp(frog.worldX + dx, -MAX_WORLD_X - 2, MAX_WORLD_X + 2);
}

export function getFrogPos(frog) {
  if (frog.state === 'idle') {
    return { x: frog.worldX, y: 0, z: rowToZ(frog.row) };
  }
  const t = frog.jumpProgress;
  return {
    x: lerp(frog.fromWorldX, frog.toWorldX, t),
    y: arc(t) * JUMP_HEIGHT,
    z: lerp(rowToZ(frog.fromRow), rowToZ(frog.toRow), t),
  };
}

export function resetFrog(frog) {
  Object.assign(frog, createFrog());
}

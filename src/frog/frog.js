import { GRID_COLS, ROWS, JUMP_DURATION, JUMP_HEIGHT } from '../utils/constants.js';
import { gridToWorld } from '../world/grid.js';
import { lerp, arc } from '../utils/math.js';

const START_COL = Math.floor(GRID_COLS / 2); // col 6 = center

// Initial facing: toward goal (+row direction), angle = 0
const INITIAL_DIR = { dRow: 1, dCol: 0 };

export function createFrog() {
  return {
    row:          ROWS.START,
    col:          START_COL,
    state:        'idle',       // 'idle' | 'jumping'
    jumpProgress: 0,
    fromRow:      ROWS.START,
    fromCol:      START_COL,
    toRow:        ROWS.START,
    toCol:        START_COL,
    facingDir:    { ...INITIAL_DIR },
    facingAngle:  0,            // radians; derived from facingDir
  };
}

// Turn in place: dir = -1 (left / CCW), +1 (right / CW)
export function rotateFrog(frog, dir) {
  if (frog.state !== 'idle') return;
  const { dRow, dCol } = frog.facingDir;
  // || 0 normalises -0 → 0 for integer components (-1, 0, 1)
  frog.facingDir = dir === 1
    ? { dRow: -dCol || 0, dCol:  dRow || 0 }   // CW
    : { dRow:  dCol || 0, dCol: -dRow || 0 };  // CCW
  frog.facingAngle = Math.atan2(frog.facingDir.dCol, frog.facingDir.dRow);
}

// Jump one cell in the current facing direction
export function tryJump(frog) {
  if (frog.state !== 'idle') return false;
  const { dRow, dCol } = frog.facingDir;
  const toRow = frog.row + dRow;
  const toCol = frog.col + dCol;
  if (toRow < 0 || toRow >= ROWS.TOTAL) return false;
  if (toCol < 0 || toCol >= GRID_COLS)  return false;

  frog.fromRow      = frog.row;
  frog.fromCol      = frog.col;
  frog.toRow        = toRow;
  frog.toCol        = toCol;
  frog.state        = 'jumping';
  frog.jumpProgress = 0;
  return true;
}

export function updateFrog(frog, delta) {
  if (frog.state !== 'jumping') return;
  frog.jumpProgress += delta / JUMP_DURATION;
  if (frog.jumpProgress >= 1) {
    frog.jumpProgress = 1;
    frog.row   = frog.toRow;
    frog.col   = frog.toCol;
    frog.state = 'idle';
  }
}

export function getFrogPos(frog) {
  if (frog.state === 'idle') {
    const p = gridToWorld(frog.row, frog.col);
    return { x: p.x, y: 0, z: p.z };
  }
  const t    = frog.jumpProgress;
  const from = gridToWorld(frog.fromRow, frog.fromCol);
  const to   = gridToWorld(frog.toRow,   frog.toCol);
  return {
    x: lerp(from.x, to.x, t),
    y: arc(t) * JUMP_HEIGHT,
    z: lerp(from.z, to.z, t),
  };
}

export function resetFrog(frog) {
  Object.assign(frog, createFrog());
}

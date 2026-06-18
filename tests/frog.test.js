import { describe, it, expect } from 'vitest';
import { createFrog, tryJump, updateFrog, rotateFrog, getFrogPos } from '../src/frog/frog.js';
import { ROWS, GRID_COLS } from '../src/utils/constants.js';

describe('createFrog', () => {
  it('starts idle at row 0, center column', () => {
    const frog = createFrog();
    expect(frog.row).toBe(ROWS.START);
    expect(frog.col).toBe(Math.floor(GRID_COLS / 2));
    expect(frog.state).toBe('idle');
  });

  it('faces forward initially (dRow=1, dCol=0)', () => {
    const frog = createFrog();
    expect(frog.facingDir).toEqual({ dRow: 1, dCol: 0 });
    expect(frog.facingAngle).toBeCloseTo(0);
  });
});

describe('tryJump', () => {
  it('starts a jump toward the goal', () => {
    const frog = createFrog();
    expect(tryJump(frog)).toBe(true);
    expect(frog.state).toBe('jumping');
    expect(frog.toRow).toBe(ROWS.START + 1);
  });

  it('blocks a second jump while airborne', () => {
    const frog = createFrog();
    tryJump(frog);
    expect(tryJump(frog)).toBe(false);
  });

  it('blocks a jump beyond the top boundary', () => {
    const frog = createFrog();
    frog.row = ROWS.TOTAL - 1; // top row
    expect(tryJump(frog)).toBe(false);
  });

  it('blocks a jump beyond the bottom boundary', () => {
    const frog = createFrog();
    // Turn to face backward, already at row 0
    rotateFrog(frog, 1);
    rotateFrog(frog, 1); // now facing dRow=-1
    expect(tryJump(frog)).toBe(false);
  });

  it('blocks a jump beyond the left boundary', () => {
    const frog = createFrog();
    frog.col = 0;
    rotateFrog(frog, -1); // face left (dCol=-1)
    expect(tryJump(frog)).toBe(false);
  });

  it('blocks a jump beyond the right boundary', () => {
    const frog = createFrog();
    frog.col = GRID_COLS - 1;
    rotateFrog(frog, 1); // face right (dCol=+1)
    expect(tryJump(frog)).toBe(false);
  });
});

describe('updateFrog', () => {
  it('completes the jump after enough time passes', () => {
    const frog = createFrog();
    tryJump(frog);
    updateFrog(frog, 10); // well beyond JUMP_DURATION
    expect(frog.state).toBe('idle');
    expect(frog.row).toBe(ROWS.START + 1);
  });

  it('does not advance if already idle', () => {
    const frog = createFrog();
    updateFrog(frog, 1);
    expect(frog.row).toBe(ROWS.START);
    expect(frog.state).toBe('idle');
  });
});

describe('rotateFrog', () => {
  it('turns right: forward → right', () => {
    const frog = createFrog();
    rotateFrog(frog, 1);
    expect(frog.facingDir).toEqual({ dRow: 0, dCol: 1 });
  });

  it('turns left: forward → left', () => {
    const frog = createFrog();
    rotateFrog(frog, -1);
    expect(frog.facingDir).toEqual({ dRow: 0, dCol: -1 });
  });

  it('four right turns return to original direction', () => {
    const frog = createFrog();
    const original = { ...frog.facingDir };
    for (let i = 0; i < 4; i++) rotateFrog(frog, 1);
    expect(frog.facingDir).toEqual(original);
  });

  it('updates facingAngle in sync with facingDir', () => {
    const frog = createFrog(); // facing forward, angle = 0
    rotateFrog(frog, 1);       // facing right, angle = π/2
    expect(frog.facingAngle).toBeCloseTo(Math.PI / 2);
  });

  it('does not rotate while jumping', () => {
    const frog = createFrog();
    tryJump(frog);
    rotateFrog(frog, 1);
    expect(frog.facingDir).toEqual({ dRow: 1, dCol: 0 });
  });
});

describe('getFrogPos', () => {
  it('returns grid-aligned position when idle', () => {
    const frog = createFrog();
    const pos = getFrogPos(frog);
    expect(pos.y).toBe(0);
    expect(typeof pos.x).toBe('number');
    expect(typeof pos.z).toBe('number');
  });

  it('has positive y (arc) at mid-jump', () => {
    const frog = createFrog();
    tryJump(frog);
    frog.jumpProgress = 0.5;
    const pos = getFrogPos(frog);
    expect(pos.y).toBeGreaterThan(0);
  });
});

import { describe, it, expect } from 'vitest';
import { rowToZ, colToX, gridToWorld, isRoad, isRiver, isGoal, isGrass } from '../src/world/grid.js';
import { CELL_SIZE, ROWS } from '../src/utils/constants.js';

describe('rowToZ', () => {
  it('places row 0 at negative Z (in front of camera origin)', () => {
    expect(rowToZ(0)).toBeCloseTo(-0.5 * CELL_SIZE);
  });
  it('each row moves further in -Z', () => {
    expect(rowToZ(1)).toBeLessThan(rowToZ(0));
  });
  it('rows are exactly CELL_SIZE apart', () => {
    // row 0 is closer to camera (less negative Z) than row 1
    expect(rowToZ(0) - rowToZ(1)).toBeCloseTo(CELL_SIZE);
  });
});

describe('colToX', () => {
  it('maps center column 6 to X=0', () => {
    expect(colToX(6)).toBe(0);
  });
  it('columns are CELL_SIZE apart', () => {
    expect(colToX(7) - colToX(6)).toBeCloseTo(CELL_SIZE);
  });
  it('is symmetric around center', () => {
    expect(colToX(5)).toBeCloseTo(-colToX(7));
  });
});

describe('gridToWorld', () => {
  it('returns x and z for center start position', () => {
    const { x, z } = gridToWorld(ROWS.START, 6);
    expect(x).toBe(0);
    expect(z).toBeCloseTo(-0.5 * CELL_SIZE);
  });
});

describe('row type predicates', () => {
  it('classifies start row as grass', () => {
    expect(isGrass(ROWS.START)).toBe(true);
    expect(isRoad(ROWS.START)).toBe(false);
  });
  it('classifies road rows correctly', () => {
    expect(isRoad(ROWS.ROAD_START)).toBe(true);
    expect(isRoad(ROWS.ROAD_END)).toBe(true);
    expect(isRoad(ROWS.MID_GRASS)).toBe(false);
  });
  it('classifies river rows correctly', () => {
    expect(isRiver(ROWS.RIVER_START)).toBe(true);
    expect(isRiver(ROWS.RIVER_END)).toBe(true);
    expect(isRiver(ROWS.ROAD_END)).toBe(false);
  });
  it('classifies goal row', () => {
    expect(isGoal(ROWS.GOAL)).toBe(true);
    expect(isGoal(ROWS.RIVER_END)).toBe(false);
  });
  it('no row is classified as two types', () => {
    for (let r = 0; r < ROWS.TOTAL; r++) {
      const types = [isRoad(r), isRiver(r), isGoal(r), isGrass(r)];
      expect(types.filter(Boolean).length).toBe(1);
    }
  });
});

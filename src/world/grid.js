import { CELL_SIZE, GRID_COLS, ROWS, ROW_CONFIG } from '../utils/constants.js';

const COL_OFFSET = Math.floor(GRID_COLS / 2); // col 6 → x = 0

export const rowToZ  = (row) => -(row + 0.5) * CELL_SIZE;
export const colToX  = (col) => (col - COL_OFFSET) * CELL_SIZE;
export const gridToWorld = (row, col) => ({ x: colToX(col), z: rowToZ(row) });

export const getRowType  = (row) => ROW_CONFIG[row]?.type ?? 'grass';
export const getRowConf  = (row) => ROW_CONFIG[row] ?? { type: 'grass' };

export const isRoad  = (row) => row >= ROWS.ROAD_START  && row <= ROWS.ROAD_END;
export const isRiver = (row) => row >= ROWS.RIVER_START && row <= ROWS.RIVER_END;
export const isGoal  = (row) => row === ROWS.GOAL;
export const isGrass = (row) => !isRoad(row) && !isRiver(row) && !isGoal(row);

export const worldWidth = () => GRID_COLS * CELL_SIZE;
export const worldDepth = () => ROWS.TOTAL * CELL_SIZE;

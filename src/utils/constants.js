export const CELL_SIZE = 2; // world units per grid cell

export const GRID_COLS = 13;

export const ROWS = {
  START:          0,
  ROAD_START:     1,
  ROAD_END:       5,
  MID_GRASS:      6,
  RIVER_START:    7,
  RIVER_END:      12,
  GOAL:           13,
  TOP_GRASS:      14,
  TOTAL:          15, // rows 0–14
};

// X-column indices of the 5 goal lily-pad slots
export const GOAL_COLS = [1, 3, 6, 9, 11];

export const FROG_EYE_HEIGHT = 0.15;

export const COLORS = {
  GRASS:        0x3a7d44,
  GRASS_TOP:    0x2d6a2d,
  ROAD:         0x2c2c2c,
  ROAD_STRIPE:  0xddddbb,
  CURB:         0x888877,
  RIVER:        0x1a5f7a,
  RIVER_DARK:   0x134a60,
  LILYPAD:      0x2d6a4f,
  LILYPAD_RIM:  0x1b4332,
  SKY:          0x7ab8d4,
};

// Per-row configuration (type drives geometry + later spawning)
export const ROW_CONFIG = [
  { type: 'grass' },                       // 0  start
  { type: 'road',  dir:  1, speed: 1.0 }, // 1
  { type: 'road',  dir: -1, speed: 1.3 }, // 2
  { type: 'road',  dir:  1, speed: 0.8 }, // 3
  { type: 'road',  dir: -1, speed: 1.6 }, // 4
  { type: 'road',  dir:  1, speed: 1.1 }, // 5
  { type: 'grass' },                       // 6  mid
  { type: 'river', dir:  1, speed: 0.7 }, // 7
  { type: 'river', dir: -1, speed: 0.9 }, // 8
  { type: 'river', dir:  1, speed: 0.6 }, // 9
  { type: 'river', dir: -1, speed: 1.2 }, // 10
  { type: 'river', dir:  1, speed: 0.8 }, // 11
  { type: 'river', dir: -1, speed: 0.7 }, // 12
  { type: 'goal'  },                       // 13
  { type: 'grass' },                       // 14 top bank
];

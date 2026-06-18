export const CELL_SIZE = 2; // world units per grid cell

export const GRID_COLS = 13;

export const ROWS = {
  START: 0,
  ROAD_START: 1,
  ROAD_END: 5,
  MID_GRASS: 6,
  RIVER_START: 7,
  RIVER_END: 12,
  GOAL: 13,
  TOP_GRASS: 14,
  TOTAL: 15, // rows 0–14
};

// X-column indices of the 5 goal lily-pad slots
export const GOAL_COLS = [1, 3, 6, 9, 11];

export const FROG_EYE_HEIGHT    = 0.15;
export const VEHICLE_SPEED_BASE  = 3;   // world units/second base multiplier
export const PLATFORM_SPEED_BASE = 1.5; // platforms are slower than traffic

// Dual-eye vision — biologically accurate frog parameters
//
// Real frog: optical axis ~75° outward, ~170° horizontal FOV per eye,
// ~20° binocular overlap in front, ~320° total field.
//
// Without fisheye shader (M7): perspective camera tops out at ~135° hFOV.
// At EYE_OFFSET=75° + EYE_FOV=140° we get ~270° coverage with a
// ~15° nose dead-zone (covered by the nose strip) — closest approximation
// to real frog anatomy achievable with standard projection.
// M7 fisheye will map 135° → 170° per eye, reaching the full ~320°.
export const EYE_FOV    = 140;                // vertical FOV per eye, degrees
export const EYE_OFFSET = 75 * Math.PI / 180; // 75° — biological eye axis angle
export const JUMP_DURATION  = 0.15; // seconds per hop
export const JUMP_HEIGHT    = 0.35; // world units at arc peak
export const LOOK_AHEAD     = 5;    // units ahead camera targets

export const COLORS = {
  GRASS: 0x6acf77,
  GRASS_TOP: 0x55aa55,
  ROAD: 0x787878,
  ROAD_STRIPE: 0xeeeecc,
  CURB: 0xbbbbaa,
  RIVER: 0x33aadd,
  RIVER_DARK: 0x2288bb,
  LILYPAD: 0x66bb88,
  LILYPAD_RIM: 0x3a8860,
  SKY: 0x7ab8d4,
};

// Per-row configuration (type drives geometry + later spawning)
export const ROW_CONFIG = [
  { type: 'grass' },                       // 0  start
  { type: 'road', dir: 1, speed: 1 }, // 1
  { type: 'road', dir: -1, speed: 1.3 }, // 2
  { type: 'road', dir: 1, speed: 0.8 }, // 3
  { type: 'road', dir: -1, speed: 1.6 }, // 4
  { type: 'road', dir: 1, speed: 1.1 }, // 5
  { type: 'grass' },                       // 6  mid
  { type: 'river', dir: 1, speed: 0.7 }, // 7
  { type: 'river', dir: -1, speed: 0.9 }, // 8
  { type: 'river', dir: 1, speed: 0.6 }, // 9
  { type: 'river', dir: -1, speed: 1.2 }, // 10
  { type: 'river', dir: 1, speed: 0.8 }, // 11
  { type: 'river', dir: -1, speed: 0.7 }, // 12
  { type: 'goal' },                       // 13
  { type: 'grass' },                       // 14 top bank
];

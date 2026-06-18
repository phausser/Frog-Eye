import * as THREE from 'three';
import { CELL_SIZE, GRID_COLS, ROWS, COLORS, VEHICLE_SPEED_BASE, ROW_CONFIG } from '../utils/constants.js';
import { rowToZ } from './grid.js';
import { createPool } from '../utils/pool.js';
import { createVehicleMesh, VEHICLE_HIT_HW } from './vehicle.js';

const W = GRID_COLS * CELL_SIZE;
const ROAD_ROWS = ROWS.ROAD_END - ROWS.ROAD_START + 1;
const ROAD_DEPTH = ROAD_ROWS * CELL_SIZE;
const ROAD_CENTER_Z = rowToZ(ROWS.ROAD_START) - (ROAD_DEPTH / 2 - CELL_SIZE / 2);

function makeMat(color) {
  return new THREE.MeshPhongMaterial({ color, flatShading: true });
}

function buildSurface(group) {
  const geo  = new THREE.PlaneGeometry(W, ROAD_DEPTH);
  const mesh = new THREE.Mesh(geo, makeMat(COLORS.ROAD));
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(0, 0, ROAD_CENTER_Z);
  mesh.receiveShadow = true;
  group.add(mesh);
}

function buildCurbs(group) {
  const curbGeo  = new THREE.BoxGeometry(W, 0.12, 0.2);
  const curbMat  = makeMat(COLORS.CURB);
  const topZ     = rowToZ(ROWS.ROAD_START) - CELL_SIZE / 2;
  const botZ     = rowToZ(ROWS.ROAD_END)   + CELL_SIZE / 2;

  [topZ, botZ].forEach((z) => {
    const curb = new THREE.Mesh(curbGeo, curbMat);
    curb.position.set(0, 0.06, z);
    curb.castShadow = true;
    group.add(curb);
  });
}

function buildStripes(group) {
  const dashW   = 0.08;
  const dashLen = 0.6;
  const gap     = 0.5;
  const mat     = makeMat(COLORS.ROAD_STRIPE);
  const step    = dashLen + gap;
  const count   = Math.ceil(W / step) + 1;
  const startX  = -(W / 2);

  for (let row = ROWS.ROAD_START; row < ROWS.ROAD_END; row++) {
    const z = rowToZ(row) - CELL_SIZE / 2; // between rows
    for (let i = 0; i < count; i++) {
      const x    = startX + i * step + dashLen / 2;
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(dashLen, dashW), mat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(x, 0.005, z);
      group.add(dash);
    }
  }
}

export function buildRoad(scene) {
  const group = new THREE.Group();
  group.name = 'road';
  buildSurface(group);
  buildCurbs(group);
  buildStripes(group);
  scene.add(group);
}

// ── Traffic ──────────────────────────────────────────────────────────────────

// [type, initial x offset from world centre] per road row
const LANE_LAYOUT = {
  1: [['car',   -8], ['car',    3]],
  2: [['truck', -5], ['car',    6]],
  3: [['car',  -10], ['car',    0], ['car',   8]],
  4: [['truck', -2], ['car',    7]],
  5: [['car',   -8], ['truck',  4]],
};

// Vehicles wrap just outside the visible road width
const WRAP_X = (GRID_COLS / 2 + 3) * CELL_SIZE; // ≈ 19 units

const pools = {
  car:   createPool(() => createVehicleMesh('car')),
  truck: createPool(() => createVehicleMesh('truck')),
};

export function spawnTraffic(scene) {
  const vehicles = [];
  for (const [rowStr, specs] of Object.entries(LANE_LAYOUT)) {
    const row  = Number(rowStr);
    const conf = ROW_CONFIG[row];
    const speed = conf.speed * VEHICLE_SPEED_BASE;

    for (const [type, startX] of specs) {
      const mesh = pools[type].acquire();
      mesh.position.set(startX, 0, rowToZ(row));
      mesh.rotation.y = conf.dir === -1 ? Math.PI : 0;
      scene.add(mesh);
      vehicles.push({ type, row, x: startX, dir: conf.dir, speed, halfW: VEHICLE_HIT_HW[type], mesh });
    }
  }
  return vehicles;
}

export function updateTraffic(vehicles, delta) {
  for (const v of vehicles) {
    v.x += v.dir * v.speed * delta;
    if (v.x >  WRAP_X) v.x -= WRAP_X * 2;
    if (v.x < -WRAP_X) v.x += WRAP_X * 2;
    v.mesh.position.x = v.x;
  }
}

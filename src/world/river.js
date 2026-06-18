import * as THREE from 'three';
import { CELL_SIZE, GRID_COLS, ROWS, COLORS, PLATFORM_SPEED_BASE, ROW_CONFIG } from '../utils/constants.js';
import { rowToZ } from './grid.js';
import { createPool } from '../utils/pool.js';
import { createPlatformMesh, buildPlatform, updatePlatform } from './platform.js';
import { setLayer, LAYER_STATIC, LAYER_MOVING } from '../vision/motionMask.js';

const W = GRID_COLS * CELL_SIZE;
const RIVER_ROWS  = ROWS.RIVER_END - ROWS.RIVER_START + 1;
const RIVER_DEPTH = RIVER_ROWS * CELL_SIZE;
const RIVER_CENTER_Z = rowToZ(ROWS.RIVER_START) - (RIVER_DEPTH / 2 - CELL_SIZE / 2);

let waterPositions = null;
let waterMesh      = null;

function buildSurface(group) {
  // Higher segment count for smoother waves
  const geo = new THREE.PlaneGeometry(W, RIVER_DEPTH, 40, 40);
  geo.rotateX(-Math.PI / 2);
  waterPositions = geo.attributes.position;

  const mat = new THREE.MeshPhongMaterial({
    color:       COLORS.RIVER,
    flatShading: true,
    shininess:   120,
    specular:    new THREE.Color(0xaaddff),
  });

  waterMesh = new THREE.Mesh(geo, mat);
  waterMesh.position.set(0, 0, RIVER_CENTER_Z);
  waterMesh.receiveShadow = true;
  group.add(waterMesh);
}

function buildBanks(group) {
  const bankGeo = new THREE.BoxGeometry(W, 0.15, 0.3);
  const bankMat = new THREE.MeshPhongMaterial({ color: COLORS.GRASS, flatShading: true });
  const topZ    = rowToZ(ROWS.RIVER_START) - CELL_SIZE / 2;
  const botZ    = rowToZ(ROWS.RIVER_END)   + CELL_SIZE / 2;

  [topZ, botZ].forEach((z) => {
    const bank = new THREE.Mesh(bankGeo, bankMat);
    bank.position.set(0, 0.075, z);
    bank.castShadow = true;
    group.add(bank);
  });
}

export function buildRiver(scene) {
  const group = new THREE.Group();
  group.name = 'river';
  buildSurface(group);
  buildBanks(group);
  setLayer(group, LAYER_STATIC);
  scene.add(group);
}

// ── Platforms ─────────────────────────────────────────────────────────────────

// [type, initial x] per river row
const RIVER_SPAWN = {
  7:  [['log',    -9], ['log',    2]],
  8:  [['turtle', -7], ['turtle', 1], ['log',  8]],
  9:  [['log',   -10], ['croc',  -1], ['log',  7]],
  10: [['log',    -8], ['log',    4]],
  11: [['turtle', -9], ['log',   0], ['turtle', 9]],
  12: [['log',    -7], ['log',   4]],
};

const WRAP_X = (GRID_COLS / 2 + 3) * CELL_SIZE; // ≈ 19 units

const pools = {
  log:    createPool(() => createPlatformMesh('log')),
  turtle: createPool(() => createPlatformMesh('turtle')),
  croc:   createPool(() => createPlatformMesh('croc')),
};

export function spawnPlatforms(scene) {
  const platforms = [];
  for (const [rowStr, specs] of Object.entries(RIVER_SPAWN)) {
    const row   = Number(rowStr);
    const conf  = ROW_CONFIG[row];
    const speed = conf.speed * PLATFORM_SPEED_BASE;
    for (const [type, startX] of specs) {
      const p = buildPlatform(type, row, startX, conf.dir, speed, scene, pools[type]);
      p.baseSpeed = speed;
      setLayer(p.mesh, LAYER_MOVING);
      platforms.push(p);
    }
  }
  return platforms;
}

export function updatePlatforms(platforms, delta) {
  for (const p of platforms) {
    p.x += p.dir * p.speed * delta;
    if (p.x >  WRAP_X) p.x -= WRAP_X * 2;
    if (p.x < -WRAP_X) p.x += WRAP_X * 2;
    p.mesh.position.x = p.x;
    updatePlatform(p, delta);
  }
}

// ── Water animation ───────────────────────────────────────────────────────────

export function updateRiver(time) {
  if (!waterPositions) return;
  const count = waterPositions.count;
  for (let i = 0; i < count; i++) {
    const x = waterPositions.getX(i);
    const z = waterPositions.getZ(i);
    // Three overlapping wave frequencies for a natural look
    const y = Math.sin(x * 0.55 + time * 1.3)  * 0.055
            + Math.cos(z * 0.40 + time * 0.9)  * 0.040
            + Math.sin(x * 0.20 - z * 0.15 + time * 0.6) * 0.025;
    waterPositions.setY(i, y);
  }
  waterPositions.needsUpdate = true;
  // Recompute normals so flat-shading catches the wave peaks correctly
  waterMesh.geometry.computeVertexNormals();
}

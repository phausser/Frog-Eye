import * as THREE from 'three';
import { CELL_SIZE } from '../utils/constants.js';
import { rowToZ } from './grid.js';

const FLAT = { flatShading: true };

const DEF = {
  log: {
    len: 2.5 * CELL_SIZE, h: 0.35, d: 1.4,
    color: 0xcc9966, lethal: false,
  },
  turtle: {
    len: 1.5 * CELL_SIZE, h: 0.26, d: 1.1,
    color: 0x66bb88, lethal: false,
  },
  croc: {
    len: 2.0 * CELL_SIZE, h: 0.35, d: 1.4,
    color: 0x6aaa33, lethal: true,
  },
};

export const PLATFORM_HALF_LEN = Object.fromEntries(
  Object.entries(DEF).map(([k, v]) => [k, v.len / 2])
);

const SINK_PHASES     = ['surface', 'sinking', 'underwater', 'rising'];
const SINK_DURATIONS  = [3.0, 1.5, 2.0, 1.5]; // seconds per phase
const SINK_DEPTH      = -0.4;

// ── Mesh factories ────────────────────────────────────────────────────────────

function logMesh(def) {
  const group = new THREE.Group();
  const body  = new THREE.Mesh(
    new THREE.BoxGeometry(def.len, def.h, def.d),
    new THREE.MeshPhongMaterial({ color: def.color, ...FLAT })
  );
  body.position.y = def.h / 2;
  body.castShadow = true;
  group.add(body);
  return group;
}

function turtleMesh(def) {
  const group = new THREE.Group();
  // Shell
  const shell = new THREE.Mesh(
    new THREE.CylinderGeometry(0.48, 0.52, def.h, 6),
    new THREE.MeshPhongMaterial({ color: def.color, ...FLAT })
  );
  shell.position.y = def.h / 2;
  shell.castShadow = true;
  group.add(shell);
  // Head (sticks out front in Z)
  const head = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.16, 0.22),
    new THREE.MeshPhongMaterial({ color: 0x3a9966, ...FLAT })
  );
  head.position.set(0, def.h * 0.7, 0.52);
  group.add(head);
  return group;
}

function crocMesh(def) {
  const group = new THREE.Group();
  const body  = new THREE.Mesh(
    new THREE.BoxGeometry(def.len, def.h, def.d),
    new THREE.MeshPhongMaterial({ color: def.color, ...FLAT })
  );
  body.position.y = def.h / 2;
  body.castShadow = true;
  group.add(body);
  // Eyes — two small lumps near one end
  const eyeMat = new THREE.MeshPhongMaterial({ color: 0xffcc00, ...FLAT });
  [-0.3, 0.3].forEach((ox) => {
    const eye = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.12), eyeMat);
    eye.position.set(def.len / 2 - 0.3, def.h + 0.06, ox);
    group.add(eye);
  });
  return group;
}

export function createPlatformMesh(type) {
  const def = DEF[type];
  if (type === 'turtle') return turtleMesh(def);
  if (type === 'croc')   return crocMesh(def);
  return logMesh(def);
}

// ── Entity builder ────────────────────────────────────────────────────────────

export function buildPlatform(type, row, startX, dir, speed, scene, pool) {
  const mesh = pool ? pool.acquire() : createPlatformMesh(type);
  mesh.position.set(startX, 0, rowToZ(row));
  // Orient coc eyes toward movement direction
  if (type === 'croc') mesh.rotation.y = dir === 1 ? 0 : Math.PI;
  scene.add(mesh);

  // Stagger turtle sink phase by initial X so they don't all sync
  const phaseIdx = type === 'turtle' ? Math.abs(Math.round(startX)) % 4 : 0;
  return {
    type,
    row,
    x:        startX,
    dir,
    speed,
    halfLen:  PLATFORM_HALF_LEN[type],
    lethal:   DEF[type].lethal,
    mesh,
    sinkPhaseIdx: phaseIdx,
    sinkPhase:    SINK_PHASES[phaseIdx],
    sinkTimer:    SINK_DURATIONS[phaseIdx],
  };
}

// ── Per-frame update ──────────────────────────────────────────────────────────

export function updatePlatform(platform, delta) {
  if (platform.type !== 'turtle') return;
  platform.sinkTimer -= delta;
  if (platform.sinkTimer <= 0) {
    platform.sinkPhaseIdx = (platform.sinkPhaseIdx + 1) % 4;
    platform.sinkPhase    = SINK_PHASES[platform.sinkPhaseIdx];
    platform.sinkTimer    = SINK_DURATIONS[platform.sinkPhaseIdx];
  }
  // Lerp mesh Y toward target — gives smooth sink/rise animation
  const targetY = (platform.sinkPhase === 'sinking' || platform.sinkPhase === 'underwater')
    ? SINK_DEPTH : 0;
  platform.mesh.position.y += (targetY - platform.mesh.position.y) * Math.min(delta * 1.5, 1);
}

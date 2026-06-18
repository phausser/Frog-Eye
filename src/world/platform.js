import * as THREE from 'three';
import { CELL_SIZE } from '../utils/constants.js';
import { rowToZ } from './grid.js';

const FLAT = { flatShading: true };

const DEF = {
  log: {
    len: 2.5 * CELL_SIZE, h: 0.35, d: 1.4,
    color: 0xb8743a, lethal: false,
  },
  turtle: {
    len: 1.5 * CELL_SIZE, h: 0.26, d: 1.1,
    color: 0x55aa77, lethal: false,
  },
  croc: {
    len: 2.0 * CELL_SIZE, h: 0.32, d: 1.3,
    color: 0x5a9a2a, lethal: true,
  },
};

export const PLATFORM_HALF_LEN = Object.fromEntries(
  Object.entries(DEF).map(([k, v]) => [k, v.len / 2])
);

const SINK_PHASES     = ['surface', 'sinking', 'underwater', 'rising'];
const SINK_DURATIONS  = [3.0, 1.5, 2.0, 1.5];
const SINK_DEPTH      = -0.4;

// ── Mesh factories ────────────────────────────────────────────────────────────

function logMesh(def) {
  const group = new THREE.Group();

  // Main log cylinder lying along X axis
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(def.h / 2, def.h / 2 + 0.04, def.len, 10),
    new THREE.MeshPhongMaterial({ color: def.color, ...FLAT })
  );
  body.rotation.z = Math.PI / 2;
  body.position.y = def.h / 2;
  body.castShadow = true;
  group.add(body);

  // End caps (darker rings to show wood grain)
  const capMat = new THREE.MeshPhongMaterial({ color: 0x8b5e2a, ...FLAT });
  const capGeo = new THREE.CylinderGeometry(def.h / 2 - 0.02, def.h / 2 - 0.02, 0.06, 10);
  for (const side of [1, -1]) {
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.rotation.z = Math.PI / 2;
    cap.position.set(side * (def.len / 2 - 0.01), def.h / 2, 0);
    group.add(cap);
  }

  // A knot bump on top
  const knot = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 5, 4),
    new THREE.MeshPhongMaterial({ color: 0x9b6030, ...FLAT })
  );
  knot.position.set(def.len * 0.15, def.h, 0.1);
  group.add(knot);

  return group;
}

function turtleMesh(def) {
  const group = new THREE.Group();

  // Body underside (flat ellipse)
  const belly = new THREE.Mesh(
    new THREE.CylinderGeometry(0.50, 0.50, 0.08, 8),
    new THREE.MeshPhongMaterial({ color: 0x3a7755, ...FLAT })
  );
  belly.position.y = 0.04;
  group.add(belly);

  // Domed shell (half-sphere)
  const shell = new THREE.Mesh(
    new THREE.SphereGeometry(0.50, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshPhongMaterial({ color: def.color, ...FLAT })
  );
  shell.position.y = 0.08;
  shell.castShadow = true;
  group.add(shell);

  // Shell ridge lines (raised center strip)
  const ridge = new THREE.Mesh(
    new THREE.BoxGeometry(0.10, 0.08, 0.78),
    new THREE.MeshPhongMaterial({ color: 0x44995e, ...FLAT })
  );
  ridge.position.set(0, 0.40, 0);
  group.add(ridge);

  // Head with neck
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.11, 0.22, 6),
    new THREE.MeshPhongMaterial({ color: 0x3a7755, ...FLAT })
  );
  neck.position.set(0, 0.18, 0.54);
  neck.rotation.x = Math.PI / 8;
  group.add(neck);

  const head = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.18, 0.22),
    new THREE.MeshPhongMaterial({ color: 0x3a7755, ...FLAT })
  );
  head.position.set(0, 0.22, 0.68);
  group.add(head);

  // Eyes on head
  const eyeMat = new THREE.MeshPhongMaterial({ color: 0x111100, ...FLAT });
  for (const ox of [-0.07, 0.07]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 4, 3), eyeMat);
    eye.position.set(ox, 0.31, 0.74);
    group.add(eye);
  }

  // Four flippers
  const flipMat = new THREE.MeshPhongMaterial({ color: 0x3a7755, ...FLAT });
  const flipGeo = new THREE.BoxGeometry(0.28, 0.06, 0.18);
  const flipPositions = [
    { x:  0.54, z:  0.25, ry:  0.3 },
    { x: -0.54, z:  0.25, ry: -0.3 },
    { x:  0.50, z: -0.30, ry: -0.3 },
    { x: -0.50, z: -0.30, ry:  0.3 },
  ];
  for (const fp of flipPositions) {
    const flip = new THREE.Mesh(flipGeo, flipMat);
    flip.position.set(fp.x, 0.06, fp.z);
    flip.rotation.y = fp.ry;
    group.add(flip);
  }

  return group;
}

function crocMesh(def) {
  const group = new THREE.Group();
  const bodyColor = def.color;
  const darkColor = 0x4a7a1e;
  const eyeColor  = 0xddcc00;

  // Main body
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(def.len * 0.65, def.h, def.d),
    new THREE.MeshPhongMaterial({ color: bodyColor, ...FLAT })
  );
  body.position.set(-def.len * 0.08, def.h / 2, 0);
  body.castShadow = true;
  group.add(body);

  // Tail (tapers toward back)
  const tail = new THREE.Mesh(
    new THREE.BoxGeometry(def.len * 0.30, def.h * 0.55, def.d * 0.65),
    new THREE.MeshPhongMaterial({ color: bodyColor, ...FLAT })
  );
  tail.position.set(-def.len * 0.38, def.h * 0.28, 0);
  group.add(tail);

  // Snout (lower and forward from body front)
  const snout = new THREE.Mesh(
    new THREE.BoxGeometry(def.len * 0.26, def.h * 0.55, def.d * 0.55),
    new THREE.MeshPhongMaterial({ color: bodyColor, ...FLAT })
  );
  snout.position.set(def.len * 0.33, def.h * 0.28, 0);
  group.add(snout);

  // Jaw (lower jaw, slightly lighter)
  const jaw = new THREE.Mesh(
    new THREE.BoxGeometry(def.len * 0.26, def.h * 0.15, def.d * 0.45),
    new THREE.MeshPhongMaterial({ color: 0x6aaf35, ...FLAT })
  );
  jaw.position.set(def.len * 0.33, def.h * 0.06, 0);
  group.add(jaw);

  // Back ridges / spines
  const ridgeMat = new THREE.MeshPhongMaterial({ color: darkColor, ...FLAT });
  const ridgeGeo = new THREE.BoxGeometry(0.12, def.h * 0.45, 0.12);
  const ridgeXs = [-0.3, -0.1, 0.1, 0.3].map(t => t * def.len * 0.5);
  for (const rx of ridgeXs) {
    if (rx > def.len * 0.2) continue; // no ridges on snout
    const ridge = new THREE.Mesh(ridgeGeo, ridgeMat);
    ridge.position.set(rx, def.h + def.h * 0.22, 0);
    group.add(ridge);
  }

  // Eyes on top of snout, slightly raised
  const eyeMat = new THREE.MeshPhongMaterial({ color: eyeColor, ...FLAT });
  const pupilMat = new THREE.MeshPhongMaterial({ color: 0x111100, ...FLAT });
  for (const oz of [-def.d * 0.22, def.d * 0.22]) {
    const eyeball = new THREE.Mesh(new THREE.SphereGeometry(0.085, 6, 5), eyeMat);
    eyeball.position.set(def.len * 0.28, def.h + 0.05, oz);
    group.add(eyeball);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.04, 4, 3), pupilMat);
    pupil.position.set(def.len * 0.30, def.h + 0.10, oz);
    group.add(pupil);
  }

  // Nostrils
  const nostrilMat = new THREE.MeshPhongMaterial({ color: 0x2a5a10, ...FLAT });
  for (const oz of [-0.12, 0.12]) {
    const nostril = new THREE.Mesh(new THREE.SphereGeometry(0.035, 4, 3), nostrilMat);
    nostril.position.set(def.len * 0.44, def.h * 0.58, oz);
    group.add(nostril);
  }

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
  if (type === 'croc') mesh.rotation.y = dir === 1 ? 0 : Math.PI;
  scene.add(mesh);

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
  const targetY = (platform.sinkPhase === 'sinking' || platform.sinkPhase === 'underwater')
    ? SINK_DEPTH : 0;
  platform.mesh.position.y += (targetY - platform.mesh.position.y) * Math.min(delta * 1.5, 1);
}

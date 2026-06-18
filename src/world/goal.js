import * as THREE from 'three';
import { CELL_SIZE, GRID_COLS, ROWS, GOAL_COLS, COLORS } from '../utils/constants.js';
import { rowToZ, colToX } from './grid.js';

const W        = GRID_COLS * CELL_SIZE;
const GOAL_Z   = rowToZ(ROWS.GOAL);
const TOP_Z    = rowToZ(ROWS.TOP_GRASS);

const slotMeshes = []; // indexed by GOAL_COLS order

function makeMat(color) {
  return new THREE.MeshPhongMaterial({ color, flatShading: true });
}

function buildTopBank(group) {
  const depth = CELL_SIZE;
  const geo   = new THREE.PlaneGeometry(W, depth);
  const mesh  = new THREE.Mesh(geo, makeMat(COLORS.GRASS_TOP));
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(0, 0.01, TOP_Z);
  mesh.receiveShadow = true;
  group.add(mesh);
}

function buildGoalWater(group) {
  const geo  = new THREE.PlaneGeometry(W, CELL_SIZE);
  const mesh = new THREE.Mesh(geo, makeMat(COLORS.RIVER));
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(0, 0, GOAL_Z);
  mesh.receiveShadow = true;
  group.add(mesh);
}

function buildLilyPad(group, col) {
  const x = colToX(col);

  // Pad base
  const pad = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 0.8, 0.06, 8),
    makeMat(COLORS.LILYPAD)
  );
  pad.position.set(x, 0.05, GOAL_Z);
  pad.castShadow = true;
  group.add(pad);

  // Rim ring (slightly darker, raised edge)
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.75, 0.06, 4, 8),
    makeMat(COLORS.LILYPAD_RIM)
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.set(x, 0.08, GOAL_Z);
  group.add(rim);

  return pad;
}

export function buildGoal(scene) {
  const group = new THREE.Group();
  group.name = 'goal';
  buildGoalWater(group);
  buildTopBank(group);

  GOAL_COLS.forEach((col) => {
    const mesh = buildLilyPad(group, col);
    slotMeshes.push(mesh);
  });

  scene.add(group);
}

// Called in M6 when frog reaches a slot
export function fillSlot(index) {
  if (slotMeshes[index]) {
    slotMeshes[index].material = slotMeshes[index].material.clone();
    slotMeshes[index].material.color.setHex(0x74c69d); // lighter = occupied
  }
}

export function resetSlots() {
  slotMeshes.forEach((mesh) => {
    mesh.material.color.setHex(COLORS.LILYPAD);
  });
}

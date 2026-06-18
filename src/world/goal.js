import * as THREE from 'three';
import { CELL_SIZE, GRID_COLS, ROWS, GOAL_COLS, COLORS } from '../utils/constants.js';
import { rowToZ, colToX } from './grid.js';
import { setLayer, LAYER_STATIC } from '../vision/motionMask.js';

const W      = GRID_COLS * CELL_SIZE;
const GOAL_Z = rowToZ(ROWS.GOAL);
const TOP_Z  = rowToZ(ROWS.TOP_GRASS);

const slotMeshes  = [];                     // Three.js pad meshes, indexed 0–4
const filledSlots = new Array(5).fill(false); // game state

const COLOR_FREE     = COLORS.LILYPAD;
const COLOR_OCCUPIED = 0x74c69d; // bright green = frog arrived

function makeMat(color) {
  return new THREE.MeshPhongMaterial({ color, flatShading: true });
}

function buildTopBank(group) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(W, CELL_SIZE),
    makeMat(COLORS.GRASS_TOP)
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(0, 0.01, TOP_Z);
  mesh.receiveShadow = true;
  group.add(mesh);
}

function buildGoalWater(group) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(W, CELL_SIZE),
    makeMat(COLORS.RIVER)
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(0, 0, GOAL_Z);
  mesh.receiveShadow = true;
  group.add(mesh);
}

function buildLilyPad(group, col) {
  const x = colToX(col);

  const pad = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 0.8, 0.06, 8),
    makeMat(COLOR_FREE)
  );
  pad.position.set(x, 0.05, GOAL_Z);
  pad.castShadow = true;
  group.add(pad);

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
  GOAL_COLS.forEach((col) => slotMeshes.push(buildLilyPad(group, col)));
  setLayer(group, LAYER_STATIC);
  scene.add(group);
}

// ── Slot logic ────────────────────────────────────────────────────────────────

// Returns slot index (0–4) if frog is on the goal row at a free pad, else -1.
// Landing on water or a filled slot both return -1 (→ die).
export function checkGoalReached(frog) {
  if (frog.row !== ROWS.GOAL) return -1;
  const idx = GOAL_COLS.findIndex(
    (col) => Math.abs(frog.worldX - colToX(col)) < CELL_SIZE * 0.7
  );
  if (idx < 0 || filledSlots[idx]) return -1;
  return idx;
}

export function markSlotFilled(index) {
  filledSlots[index] = true;
  const mesh = slotMeshes[index];
  if (!mesh) return;
  mesh.material = mesh.material.clone();
  mesh.material.color.setHex(COLOR_OCCUPIED);
}

export function areAllSlotsFilled() {
  return filledSlots.every(Boolean);
}

export function resetGoalSlots() {
  filledSlots.fill(false);
  slotMeshes.forEach((mesh) => {
    mesh.material = mesh.material.clone();
    mesh.material.color.setHex(COLOR_FREE);
  });
}

export function getFilledSlots() { return filledSlots; }

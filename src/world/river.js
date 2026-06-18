import * as THREE from 'three';
import { CELL_SIZE, GRID_COLS, ROWS, COLORS } from '../utils/constants.js';
import { rowToZ } from './grid.js';

const W = GRID_COLS * CELL_SIZE;
const RIVER_ROWS  = ROWS.RIVER_END - ROWS.RIVER_START + 1;
const RIVER_DEPTH = RIVER_ROWS * CELL_SIZE;
const RIVER_CENTER_Z = rowToZ(ROWS.RIVER_START) - (RIVER_DEPTH / 2 - CELL_SIZE / 2);

let waterPositions = null; // ref to vertex positions for animation

function buildSurface(group) {
  const geo = new THREE.PlaneGeometry(W, RIVER_DEPTH, 28, 28);
  geo.rotateX(-Math.PI / 2);
  waterPositions = geo.attributes.position;

  const mesh = new THREE.Mesh(
    geo,
    new THREE.MeshPhongMaterial({ color: COLORS.RIVER, flatShading: true, shininess: 60 })
  );
  mesh.position.set(0, 0, RIVER_CENTER_Z);
  mesh.receiveShadow = true;
  group.add(mesh);
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
  scene.add(group);
}

export function updateRiver(time) {
  if (!waterPositions) return;
  const count = waterPositions.count;
  for (let i = 0; i < count; i++) {
    const x = waterPositions.getX(i);
    const z = waterPositions.getZ(i);
    const y = Math.sin(x * 0.4 + time * 1.1) * 0.04
            + Math.cos(z * 0.3 + time * 0.8) * 0.03;
    waterPositions.setY(i, y);
  }
  waterPositions.needsUpdate = true;
}

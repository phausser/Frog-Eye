import * as THREE from 'three';
import { CELL_SIZE, GRID_COLS, ROWS, COLORS } from '../utils/constants.js';
import { rowToZ } from './grid.js';

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

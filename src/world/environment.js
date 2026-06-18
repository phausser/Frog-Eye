import * as THREE from 'three';
import { CELL_SIZE, GRID_COLS, ROWS, COLORS } from '../utils/constants.js';
import { rowToZ } from './grid.js';
import { setLayer, LAYER_STATIC } from '../vision/motionMask.js';

const W = GRID_COLS * CELL_SIZE;

function grassMesh(depth, z) {
  const geo  = new THREE.PlaneGeometry(W, depth);
  const mesh = new THREE.Mesh(
    geo,
    new THREE.MeshPhongMaterial({ color: COLORS.GRASS, flatShading: true })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(0, 0, z);
  mesh.receiveShadow = true;
  return mesh;
}

export function buildGrass(scene) {
  const group = new THREE.Group();
  group.name = 'grass';

  // Start zone (row 0)
  group.add(grassMesh(CELL_SIZE, rowToZ(ROWS.START)));

  // Middle grass (row 6)
  group.add(grassMesh(CELL_SIZE, rowToZ(ROWS.MID_GRASS)));

  setLayer(group, LAYER_STATIC);
  scene.add(group);
}

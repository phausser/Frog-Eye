import { createScene, createRenderer, createCamera, setupResize, addLights } from './scene.js';
import { buildRoad } from './world/road.js';
import { buildRiver, updateRiver } from './world/river.js';
import { buildGoal } from './world/goal.js';
import { buildGrass } from './world/environment.js';
import { gridToWorld, rowToZ } from './world/grid.js';
import { ROWS, FROG_EYE_HEIGHT } from './utils/constants.js';

const canvas = document.getElementById('game-canvas');

const scene    = createScene();
const renderer = createRenderer(canvas);
const camera   = createCamera();

setupResize(camera, renderer);
addLights(scene);

buildGrass(scene);
buildRoad(scene);
buildRiver(scene);
buildGoal(scene);

// Frog start position: row 0, col 6 (center) — overridden by frogCamera in M3
const start = gridToWorld(ROWS.START, 6);
camera.position.set(start.x, FROG_EYE_HEIGHT, rowToZ(ROWS.START) + 0.5);
camera.lookAt(start.x, FROG_EYE_HEIGHT, start.z - 8);

let elapsed = 0;

function animate() {
  requestAnimationFrame(animate);
  elapsed += 0.016;
  updateRiver(elapsed);
  renderer.render(scene, camera);
}

animate();

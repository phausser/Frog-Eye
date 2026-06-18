import * as THREE from 'three';
import { createScene, createRenderer, setupResize, addLights } from './scene.js';
import { buildRoad, spawnTraffic, updateTraffic } from './world/road.js';
import { buildRiver, updateRiver, spawnPlatforms, updatePlatforms } from './world/river.js';
import { buildGoal } from './world/goal.js';
import { buildGrass } from './world/environment.js';
import { createFrog, updateFrog, tryJump, rotateFrog, resetFrog, carryFrog } from './frog/frog.js';
import { createFrogCameraSystem } from './frog/frogCamera.js';
import { setupInput } from './input.js';
import { checkFrogVehicle, findPlatformUnderFrog, checkFrogCroc, isFrogDrowning } from './utils/collision.js';
import { GRID_COLS, CELL_SIZE } from './utils/constants.js';

const DROWN_X = (GRID_COLS / 2 + 1) * CELL_SIZE; // carried off-screen → drown

// ── Scene ────────────────────────────────────────────────────────────────────

const canvas   = document.getElementById('game-canvas');
const scene    = createScene();
const renderer = createRenderer(canvas);

setupResize(renderer);
addLights(scene);

buildGrass(scene);
buildRoad(scene);
buildRiver(scene);
buildGoal(scene);

// ── Game state ───────────────────────────────────────────────────────────────

const frog      = createFrog();
const vehicles  = spawnTraffic(scene);
const platforms = spawnPlatforms(scene);
const camSys    = createFrogCameraSystem();

let lives         = 3;
let deathCooldown = 0;

const elLives = document.getElementById('hud-lives');

function updateLivesHUD() {
  elLives.textContent = '♥ '.repeat(lives).trim() || '—';
}

function loseLife() {
  lives = Math.max(0, lives - 1);
  updateLivesHUD();
  if (lives <= 0) { lives = 3; updateLivesHUD(); } // M9 will add proper Game Over
  resetFrog(frog);
  deathCooldown = 0.8;
}

// ── Input ────────────────────────────────────────────────────────────────────

setupInput({
  onJump:      () => tryJump(frog),
  onTurnLeft:  () => rotateFrog(frog, -1),
  onTurnRight: () => rotateFrog(frog,  1),
});

// ── Render helpers ───────────────────────────────────────────────────────────

function renderDualEye() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.clear();
  renderer.setScissorTest(true);
  renderer.setViewport(0, 0, w / 2, h);
  renderer.setScissor(0, 0, w / 2, h);
  renderer.render(scene, camSys.left);
  renderer.setViewport(w / 2, 0, w / 2, h);
  renderer.setScissor(w / 2, 0, w / 2, h);
  renderer.render(scene, camSys.right);
  renderer.setScissorTest(false);
}

// ── Loop ─────────────────────────────────────────────────────────────────────

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  updateFrog(frog, delta);
  camSys.update(frog, delta);
  updateTraffic(vehicles, delta);
  updatePlatforms(platforms, delta);
  updateRiver(clock.elapsedTime);

  if (deathCooldown > 0) {
    deathCooldown -= delta;
    renderDualEye();
    return;
  }

  // Platform carrying — must happen while idle on river
  if (frog.state === 'idle') {
    const raft = findPlatformUnderFrog(frog, platforms);
    if (raft) carryFrog(frog, raft.dir * raft.speed * delta);

    if (
      checkFrogVehicle(frog, vehicles) ||
      checkFrogCroc(frog, platforms)   ||
      isFrogDrowning(frog, platforms)  ||
      Math.abs(frog.worldX) > DROWN_X
    ) {
      loseLife();
    }
  }

  renderDualEye();
}

animate();

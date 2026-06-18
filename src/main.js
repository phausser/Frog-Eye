import * as THREE from 'three';
import { createScene, createRenderer, setupResize, addLights } from './scene.js';
import { buildRoad, spawnTraffic, updateTraffic } from './world/road.js';
import { buildRiver, updateRiver } from './world/river.js';
import { buildGoal } from './world/goal.js';
import { buildGrass } from './world/environment.js';
import { createFrog, updateFrog, tryJump, rotateFrog, resetFrog } from './frog/frog.js';
import { createFrogCameraSystem } from './frog/frogCamera.js';
import { setupInput } from './input.js';
import { checkFrogVehicle } from './utils/collision.js';

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

const frog     = createFrog();
const vehicles = spawnTraffic(scene);
const camSys   = createFrogCameraSystem();

let lives         = 3;
let deathCooldown = 0;

const elLives = document.getElementById('hud-lives');

function updateLivesHUD() {
  elLives.textContent = '♥ '.repeat(lives).trim() || '—';
}

function loseLife() {
  lives = Math.max(0, lives - 1);
  updateLivesHUD();
  if (lives <= 0) {
    lives = 3;
    updateLivesHUD();
  }
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

  // Left eye: looks EYE_OFFSET to the left of facing direction
  renderer.setViewport(0, 0, w / 2, h);
  renderer.setScissor(0, 0, w / 2, h);
  renderer.render(scene, camSys.left);

  // Right eye: looks EYE_OFFSET to the right
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
  updateRiver(clock.elapsedTime);

  if (deathCooldown > 0) {
    deathCooldown -= delta;
  } else if (checkFrogVehicle(frog, vehicles)) {
    loseLife();
  }

  renderDualEye();
}

animate();

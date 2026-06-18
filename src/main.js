import * as THREE from 'three';
import { createScene, createRenderer, setupResize, addLights } from './scene.js';
import { buildRoad, spawnTraffic, updateTraffic } from './world/road.js';
import { buildRiver, updateRiver, spawnPlatforms, updatePlatforms } from './world/river.js';
import { buildGoal, checkGoalReached, markSlotFilled, areAllSlotsFilled, resetGoalSlots, getFilledSlots } from './world/goal.js';
import { buildGrass } from './world/environment.js';
import { createFrog, updateFrog, tryJump, rotateFrog, resetFrog, carryFrog } from './frog/frog.js';
import { createFrogCameraSystem } from './frog/frogCamera.js';
import { setupInput } from './input.js';
import { checkFrogVehicle, findPlatformUnderFrog, checkFrogCroc, isFrogDrowning } from './utils/collision.js';
import { GRID_COLS, CELL_SIZE } from './utils/constants.js';
import { createFrogEyePass } from './vision/frogEyePass.js';
import { createHUD } from './ui/hud.js';
import { createMinimap } from './ui/minimap.js';

const DROWN_X          = (GRID_COLS / 2 + 1) * CELL_SIZE;
const LEVEL_SPEED_MULT = 1.25;

// ── Scene ────────────────────────────────────────────────────────────────────

const canvas   = document.getElementById('game-canvas');
const scene    = createScene();
const renderer = createRenderer(canvas);

setupResize(renderer);
addLights(scene);

const eyePass = createFrogEyePass(renderer);
window.addEventListener('resize', () => eyePass.resize());

buildGrass(scene);
buildRoad(scene);
buildRiver(scene);
buildGoal(scene);

// ── Game state ───────────────────────────────────────────────────────────────

const frog      = createFrog();
const vehicles  = spawnTraffic(scene);
const platforms = spawnPlatforms(scene);
const camSys    = createFrogCameraSystem();
const hud       = createHUD();
const minimap   = createMinimap();

let lives         = 3;
let score         = 0;
let level         = 1;
let deathCooldown = 0;

hud.setLives(lives);
hud.setScore(score);
hud.setLevel(level);

function loseLife() {
  lives = Math.max(0, lives - 1);
  hud.setLives(lives);
  if (lives <= 0) { lives = 3; hud.setLives(lives); } // proper Game Over in M10
  hud.resetTimer();
  resetFrog(frog);
  deathCooldown = 0.8;
}

function reachGoal(slotIdx) {
  markSlotFilled(slotIdx);
  score += 50;
  hud.setScore(score);
  hud.resetTimer();
  resetFrog(frog);
  deathCooldown = 0.6;

  if (areAllSlotsFilled()) {
    level++;
    hud.setLevel(level);
    vehicles.forEach((v)  => { v.speed  *= LEVEL_SPEED_MULT; });
    platforms.forEach((p) => { p.speed  *= LEVEL_SPEED_MULT; });
    resetGoalSlots();
  }
}

// ── Input ────────────────────────────────────────────────────────────────────

setupInput({
  onJump: () => {
    if (tryJump(frog) && frog.toRow > frog.fromRow) {
      score += 10;
      hud.setScore(score);
    }
  },
  onTurnLeft:  () => rotateFrog(frog, -1),
  onTurnRight: () => rotateFrog(frog,  1),
});

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
  minimap.update(frog, getFilledSlots(), vehicles, platforms);

  if (deathCooldown > 0) {
    deathCooldown -= delta;
    eyePass.render(scene, camSys.left, camSys.right);
    return;
  }

  if (hud.tickTimer(delta)) {
    loseLife();
    eyePass.render(scene, camSys.left, camSys.right);
    return;
  }

  if (frog.state === 'idle') {
    if (frog.row === 13) {
      const slotIdx = checkGoalReached(frog);
      slotIdx >= 0 ? reachGoal(slotIdx) : loseLife();
      eyePass.render(scene, camSys.left, camSys.right);
      return;
    }

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

  eyePass.render(scene, camSys.left, camSys.right);
}

animate();

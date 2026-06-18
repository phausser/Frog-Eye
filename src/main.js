import * as THREE from 'three';
import { createScene, createRenderer, setupResize, addLights } from './scene.js';
import { buildRoad, spawnTraffic, updateTraffic } from './world/road.js';
import { buildRiver, updateRiver, spawnPlatforms, updatePlatforms } from './world/river.js';
import { buildGoal, checkGoalReached, markSlotFilled, areAllSlotsFilled, resetGoalSlots, getFilledSlots } from './world/goal.js';
import { buildGrass } from './world/environment.js';
import { createFrog, updateFrog, tryJump, rotateFrog, resetFrog, carryFrog, getFrogPos } from './frog/frog.js';
import { createFrogCameraSystem } from './frog/frogCamera.js';
import { setupInput } from './input.js';
import { checkFrogVehicle, findPlatformUnderFrog, checkFrogCroc, isFrogDrowning } from './utils/collision.js';
import { GRID_COLS, CELL_SIZE } from './utils/constants.js';
import { createFrogEyePass } from './vision/frogEyePass.js';
import { createHUD } from './ui/hud.js';
import { createMinimap } from './ui/minimap.js';
import { createScreens } from './ui/screens.js';
import { createDustSystem } from './fx/dust.js';
import { playJump, playDeath, playGoal, playLevelUp } from './audio/sound.js';

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

// ── Game objects ─────────────────────────────────────────────────────────────

const frog      = createFrog();
const vehicles  = spawnTraffic(scene);
const platforms = spawnPlatforms(scene);
const camSys    = createFrogCameraSystem();
const hud       = createHUD();
const minimap   = createMinimap();
const screens   = createScreens();
const dust      = createDustSystem(scene);

// ── Game state ───────────────────────────────────────────────────────────────

let gameState     = 'start';
let lives         = 3;
let score         = 0;
let level         = 1;
let deathCooldown = 0;
let prevFrogState = 'idle';

function startGame() {
  screens.hideStart();
  screens.hideGameOver();
  gameState     = 'playing';
  lives         = 3;
  score         = 0;
  level         = 1;
  deathCooldown = 0;
  hud.setLives(lives);
  hud.setScore(score);
  hud.setLevel(level);
  hud.resetTimer();
  resetFrog(frog);
  resetGoalSlots();
  vehicles.forEach(v  => { v.speed = v.baseSpeed; });
  platforms.forEach(p => { p.speed = p.baseSpeed; });
}

function loseLife() {
  playDeath();
  lives = Math.max(0, lives - 1);
  hud.setLives(lives);
  if (lives <= 0) {
    gameState = 'gameOver';
    screens.showGameOver(score, startGame);
    return;
  }
  hud.resetTimer();
  resetFrog(frog);
  deathCooldown = 0.8;
}

function reachGoal(slotIdx) {
  playGoal();
  markSlotFilled(slotIdx);
  score += 50;
  hud.setScore(score);
  hud.resetTimer();
  resetFrog(frog);
  deathCooldown = 0.6;

  if (areAllSlotsFilled()) {
    level++;
    hud.setLevel(level);
    vehicles.forEach(v  => { v.speed *= LEVEL_SPEED_MULT; });
    platforms.forEach(p => { p.speed *= LEVEL_SPEED_MULT; });
    resetGoalSlots();
    playLevelUp();
    screens.showLevelUp(level);
  }
}

// ── Input ────────────────────────────────────────────────────────────────────

setupInput({
  onJump: () => {
    if (gameState !== 'playing') return;
    if (tryJump(frog)) {
      playJump();
      if (frog.toRow > frog.fromRow) {
        score += 10;
        hud.setScore(score);
      }
    }
  },
  onTurnLeft:  () => { if (gameState === 'playing') rotateFrog(frog, -1); },
  onTurnRight: () => { if (gameState === 'playing') rotateFrog(frog,  1); },
});

// ── Loop ─────────────────────────────────────────────────────────────────────

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  // Always animate world (looks alive behind start/gameover screens)
  updateTraffic(vehicles, delta);
  updatePlatforms(platforms, delta);
  updateRiver(clock.elapsedTime);
  dust.update(delta);
  screens.tick(delta);

  if (gameState !== 'playing') {
    eyePass.render(scene, camSys.left, camSys.right);
    return;
  }

  // Detect frog landing for dust effect
  if (prevFrogState === 'jumping' && frog.state === 'idle') {
    const p = getFrogPos(frog);
    dust.spawn(p.x, p.y, p.z);
  }
  prevFrogState = frog.state;

  updateFrog(frog, delta);
  camSys.update(frog, delta);
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

screens.showStart(startGame);
animate();

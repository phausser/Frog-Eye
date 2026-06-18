import * as THREE from 'three';
import { createScene, createRenderer, createCamera, setupResize, addLights } from './scene.js';
import { buildRoad } from './world/road.js';
import { buildRiver, updateRiver } from './world/river.js';
import { buildGoal } from './world/goal.js';
import { buildGrass } from './world/environment.js';
import { createFrog, updateFrog, tryJump, rotateFrog } from './frog/frog.js';
import { updateFrogCamera } from './frog/frogCamera.js';
import { setupInput } from './input.js';

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

const frog = createFrog();

setupInput({
  onJump:      () => tryJump(frog),
  onTurnLeft:  () => rotateFrog(frog, -1),
  onTurnRight: () => rotateFrog(frog,  1),
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  updateFrog(frog, delta);
  updateFrogCamera(camera, frog, delta);
  updateRiver(clock.elapsedTime);
  renderer.render(scene, camera);
}

animate();

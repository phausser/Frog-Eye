import * as THREE from 'three';
import { createScene, createRenderer, createCamera, setupResize, addLights } from './scene.js';

const canvas = document.getElementById('game-canvas');

const scene = createScene();
const renderer = createRenderer(canvas);
const camera = createCamera();

// Placeholder position — overridden by frogCamera in M3
camera.position.set(0, 0.4, 1);
camera.lookAt(0, 0.4, -5);

setupResize(camera, renderer);
addLights(scene);

// Temp geometry: visible reference until world is built in M2
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 40),
  new THREE.MeshPhongMaterial({ color: 0x3a7d44, flatShading: true })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const testBox = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshPhongMaterial({ color: 0x44aa44, flatShading: true })
);
testBox.position.set(0, 0.5, -4);
testBox.castShadow = true;
scene.add(testBox);

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const _delta = clock.getDelta(); // will be used from M2 onwards
  testBox.rotation.y += 0.01;
  renderer.render(scene, camera);
}

animate();

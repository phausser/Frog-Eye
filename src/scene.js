import * as THREE from 'three';

export function createScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x7ab8d4);
  scene.fog = new THREE.Fog(0x7ab8d4, 30, 80);
  return scene;
}

export function createRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.BasicShadowMap;
  return renderer;
}

export function createCamera() {
  const aspect = window.innerWidth / window.innerHeight;
  // Wide FOV — will be replaced by dual-eye fisheye in M7
  const camera = new THREE.PerspectiveCamera(90, aspect, 0.01, 200);
  return camera;
}

export function setupResize(camera, renderer) {
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

export function addLights(scene) {
  const ambient = new THREE.AmbientLight(0x88aacc, 0.8);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight(0xfff5cc, 1.4);
  sun.position.set(8, 15, 5);
  sun.castShadow = true;
  sun.shadow.mapSize.setScalar(1024);
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 80;
  sun.shadow.camera.left = -20;
  sun.shadow.camera.right = 20;
  sun.shadow.camera.top = 20;
  sun.shadow.camera.bottom = -20;
  scene.add(sun);
}

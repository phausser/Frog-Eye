import * as THREE from 'three';
import { LAYER_MOVING, STATIC_FADE } from './motionMask.js';

const BARREL_K = 0.8;
const BLACK    = new THREE.Color(0x000000);

const VERT = /* glsl */`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

// Two-pass composite per eye:
//   uEye    = full scene (static + moving, with background)
//   uMoving = moving objects only (black background)
// Pixels where moving objects are bright → full brightness (fade → 1.0)
// Pixels with only static background   → attenuated (fade → STATIC_FADE)
const FRAG = /* glsl */`
uniform sampler2D uLeftEye;
uniform sampler2D uRightEye;
uniform sampler2D uLeftMoving;
uniform sampler2D uRightMoving;
uniform float uK;
uniform float uStaticFade;

varying vec2 vUv;

vec2 barrelDistort(vec2 uv) {
  vec2 d = uv - 0.5;
  return uv + d * uK * dot(d, d);
}

void main() {
  bool isLeft = vUv.x < 0.5;
  vec2 eyeUV  = isLeft
    ? vec2(vUv.x * 2.0, vUv.y)
    : vec2((vUv.x - 0.5) * 2.0, vUv.y);

  vec2 sampleUV = barrelDistort(eyeUV);

  if (any(lessThan(sampleUV, vec2(0.0))) || any(greaterThan(sampleUV, vec2(1.0)))) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  vec3 eyeCol    = isLeft ? texture2D(uLeftEye,    sampleUV).rgb : texture2D(uRightEye,    sampleUV).rgb;
  vec3 movingCol = isLeft ? texture2D(uLeftMoving, sampleUV).rgb : texture2D(uRightMoving, sampleUV).rgb;

  // Moving object presence measured by luminance of the moving-only render
  float presence = dot(movingCol, vec3(0.299, 0.587, 0.114));
  float mask     = smoothstep(0.03, 0.2, presence);
  float fade     = mix(uStaticFade, 1.3, mask);

  vec3 col = eyeCol * fade;

  // Dichromat: frog retina has no red cone
  col.r *= 0.35;

  gl_FragColor = vec4(col, 1.0);
}
`;

export function createFrogEyePass(renderer) {
  let w = window.innerWidth;
  let h = window.innerHeight;

  function makeTarget() {
    return new THREE.WebGLRenderTarget(Math.floor(w / 2), h);
  }

  const leftEye        = makeTarget();
  const rightEye       = makeTarget();
  const leftMoving     = makeTarget();
  const rightMoving    = makeTarget();

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uLeftEye:    { value: leftEye.texture },
      uRightEye:   { value: rightEye.texture },
      uLeftMoving: { value: leftMoving.texture },
      uRightMoving:{ value: rightMoving.texture },
      uK:          { value: BARREL_K },
      uStaticFade: { value: STATIC_FADE },
    },
    vertexShader:   VERT,
    fragmentShader: FRAG,
    depthTest:  false,
    depthWrite: false,
  });

  const quad       = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  const postScene  = new THREE.Scene();
  const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  postScene.add(quad);

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    const hw = Math.floor(w / 2);
    leftEye.setSize(hw, h);
    rightEye.setSize(hw, h);
    leftMoving.setSize(hw, h);
    rightMoving.setSize(hw, h);
  }

  function renderEye(scene, cam, eyeTarget, movingTarget) {
    // Pass 1: full scene (static + moving objects + background)
    cam.layers.enableAll();
    renderer.setRenderTarget(eyeTarget);
    renderer.clear();
    renderer.render(scene, cam);

    // Pass 2: moving objects only — black background so the shader can detect presence.
    // Layer 0 is kept active so lights (which default to layer 0) still illuminate objects.
    const savedBg  = scene.background;
    const savedFog = scene.fog;
    scene.background = BLACK;
    scene.fog        = null;
    cam.layers.disableAll();
    cam.layers.enable(0);            // lights stay active
    cam.layers.enable(LAYER_MOVING); // only moving objects visible
    renderer.setRenderTarget(movingTarget);
    renderer.clear();
    renderer.render(scene, cam);
    scene.background = savedBg;
    scene.fog        = savedFog;
    cam.layers.enableAll();
  }

  function render(scene, leftCam, rightCam) {
    renderEye(scene, leftCam,  leftEye,  leftMoving);
    renderEye(scene, rightCam, rightEye, rightMoving);

    renderer.setRenderTarget(null);
    renderer.clear();
    renderer.render(postScene, postCamera);
  }

  return { render, resize };
}

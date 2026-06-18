import * as THREE from 'three';

// K ≈ 0.8 maps the ~140° perspective FOV to look like ~170° fisheye per eye.
// Pixels where sampleUV falls outside [0,1] render black, creating the
// characteristic circular frog-eye border.
const BARREL_K = 0.8;

const VERT = /* glsl */`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const FRAG = /* glsl */`
uniform sampler2D uLeft;
uniform sampler2D uRight;
uniform float uK;

varying vec2 vUv;

vec2 barrelDistort(vec2 uv) {
  vec2 d = uv - 0.5;
  return uv + d * uK * dot(d, d);
}

void main() {
  bool isLeft = vUv.x < 0.5;
  vec2 eyeUV = isLeft
    ? vec2(vUv.x * 2.0, vUv.y)
    : vec2((vUv.x - 0.5) * 2.0, vUv.y);

  vec2 sampleUV = barrelDistort(eyeUV);

  if (any(lessThan(sampleUV, vec2(0.0))) || any(greaterThan(sampleUV, vec2(1.0)))) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  vec3 col = isLeft
    ? texture2D(uLeft, sampleUV).rgb
    : texture2D(uRight, sampleUV).rgb;

  // Dichromat: frog retina has no red cone — red channel strongly attenuated
  col.r *= 0.2;

  gl_FragColor = vec4(col, 1.0);
}
`;

export function createFrogEyePass(renderer) {
  let w = window.innerWidth;
  let h = window.innerHeight;

  const leftTarget  = new THREE.WebGLRenderTarget(Math.floor(w / 2), h);
  const rightTarget = new THREE.WebGLRenderTarget(Math.floor(w / 2), h);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uLeft:  { value: leftTarget.texture },
      uRight: { value: rightTarget.texture },
      uK:     { value: BARREL_K },
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
    leftTarget.setSize(Math.floor(w / 2), h);
    rightTarget.setSize(Math.floor(w / 2), h);
  }

  function render(scene, leftCam, rightCam) {
    renderer.setRenderTarget(leftTarget);
    renderer.clear();
    renderer.render(scene, leftCam);

    renderer.setRenderTarget(rightTarget);
    renderer.clear();
    renderer.render(scene, rightCam);

    renderer.setRenderTarget(null);
    renderer.clear();
    renderer.render(postScene, postCamera);
  }

  return { render, resize };
}

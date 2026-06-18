import * as THREE from 'three';
import { FROG_EYE_HEIGHT, LOOK_AHEAD, EYE_FOV, EYE_OFFSET } from '../utils/constants.js';
import { lerpAngle } from '../utils/math.js';
import { getFrogPos } from './frog.js';

const LOOK_DOWN   = 0.25; // units below eye level that lookAt target sits
const ANGLE_SPEED = 20;   // rad/s — smooth facing rotation

function makeEyeCam() {
  // Aspect is updated every frame in update() to match the half-screen viewport
  return new THREE.PerspectiveCamera(EYE_FOV, 1, 0.01, 200);
}

function pointEye(cam, origin, eyeY, angle) {
  cam.position.set(origin.x, eyeY, origin.z);
  cam.lookAt(
    origin.x + Math.sin(angle) * LOOK_AHEAD,
    eyeY - LOOK_DOWN,
    origin.z - Math.cos(angle) * LOOK_AHEAD
  );
}

// Returns { left, right, update(frog, delta) }
// Each eye camera covers ~120° FOV centred 50° to its side.
// Together they see ~214° — cars approaching from both flanks are clearly visible.
// The binocular overlap zone (~14°) is centred on the forward direction.
export function createFrogCameraSystem() {
  const left  = makeEyeCam();
  const right = makeEyeCam();
  let currentAngle = 0;

  function update(frog, delta) {
    // Frame-rate independent smooth rotation
    currentAngle = lerpAngle(
      currentAngle,
      frog.facingAngle,
      1 - Math.exp(-ANGLE_SPEED * delta)
    );

    const pos      = getFrogPos(frog);
    const eyeY     = pos.y + FROG_EYE_HEIGHT;
    const eyeAspect = (window.innerWidth / 2) / window.innerHeight;

    left.aspect  = eyeAspect;
    right.aspect = eyeAspect;
    left.updateProjectionMatrix();
    right.updateProjectionMatrix();

    pointEye(left,  pos, eyeY, currentAngle - EYE_OFFSET);
    pointEye(right, pos, eyeY, currentAngle + EYE_OFFSET);
  }

  return { left, right, update };
}

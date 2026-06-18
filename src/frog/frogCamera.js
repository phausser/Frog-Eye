import { FROG_EYE_HEIGHT, LOOK_AHEAD } from '../utils/constants.js';
import { lerpAngle } from '../utils/math.js';
import { getFrogPos } from './frog.js';

const LOOK_DOWN   = 0.25; // units below eye level the lookAt target sits
const ANGLE_SPEED = 20;   // rad/s — ~92% rotated within one jump duration (0.15s)

let currentAngle = 0; // smoothed facing angle, persists across frames

export function updateFrogCamera(camera, frog, delta) {
  // Exponential decay toward target angle — frame-rate independent
  const t = 1 - Math.exp(-ANGLE_SPEED * delta);
  currentAngle = lerpAngle(currentAngle, frog.facingAngle, t);

  const pos  = getFrogPos(frog);
  const eyeY = pos.y + FROG_EYE_HEIGHT;

  camera.position.set(pos.x, eyeY, pos.z);

  const lookX = pos.x + Math.sin(currentAngle) * LOOK_AHEAD;
  const lookZ = pos.z - Math.cos(currentAngle) * LOOK_AHEAD;
  camera.lookAt(lookX, eyeY - LOOK_DOWN, lookZ);
}

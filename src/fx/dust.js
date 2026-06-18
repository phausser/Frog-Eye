import * as THREE from 'three';
import { LAYER_MOVING } from '../vision/motionMask.js';

const POOL_SIZE = 24;
const LIFETIME  = 0.38;
const SPREAD    = 0.55;
const RISE      = 0.7;

export function createDustSystem(scene) {
  const particles = Array.from({ length: POOL_SIZE }, () => {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 4, 3),
      new THREE.MeshBasicMaterial({ color: 0xddcc88 })
    );
    m.layers.set(LAYER_MOVING);
    m.visible = false;
    scene.add(m);
    return { mesh: m, life: 0, vx: 0, vz: 0 };
  });

  let head = 0;

  return {
    spawn(x, y, z) {
      const n = 6;
      for (let i = 0; i < n; i++) {
        const p     = particles[head % POOL_SIZE];
        head        = (head + 1) % POOL_SIZE;
        const angle = (i / n) * Math.PI * 2 + Math.random() * 0.5;
        const r     = 0.7 + Math.random() * 0.6;
        p.vx        = Math.cos(angle) * SPREAD * r;
        p.vz        = Math.sin(angle) * SPREAD * r;
        p.mesh.position.set(x, y + 0.05, z);
        p.mesh.scale.setScalar(1);
        p.mesh.visible = true;
        p.life = LIFETIME;
      }
    },
    update(delta) {
      for (const p of particles) {
        if (!p.mesh.visible) continue;
        p.life -= delta;
        if (p.life <= 0) { p.mesh.visible = false; continue; }
        p.mesh.position.x += p.vx * delta;
        p.mesh.position.z += p.vz * delta;
        p.mesh.position.y += RISE * (p.life / LIFETIME) * delta;
        p.mesh.scale.setScalar(p.life / LIFETIME);
      }
    },
  };
}

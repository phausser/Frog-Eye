import * as THREE from 'three';

const FLAT = { flatShading: true };

// Visual + collision definition per type
const DEF = {
  car: {
    bodyW: 1.5, bodyH: 0.50, bodyD: 1.8,
    cabW:  1.0, cabH:  0.32, cabD: 0.85,
    cabOffZ: 0,
    bodyColor: 0xcc3322,
    cabColor:  0x881a12,
    hitHW: 0.75,
  },
  truck: {
    bodyW: 1.5, bodyH: 0.62, bodyD: 3.2,
    cabW:  1.4, cabH:  0.50, cabD: 1.00,
    cabOffZ: 1.0, // cabin offset toward front
    bodyColor: 0x2244aa,
    cabColor:  0x112266,
    hitHW: 0.75,
  },
};

// Half-width of collision zone in world-X (both types identical width)
export const VEHICLE_HIT_HW = { car: DEF.car.hitHW, truck: DEF.truck.hitHW };

function mesh(w, h, d, color) {
  return new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshPhongMaterial({ color, ...FLAT })
  );
}

export function createVehicleMesh(type) {
  const d = DEF[type];
  const group = new THREE.Group();

  const body = mesh(d.bodyW, d.bodyH, d.bodyD, d.bodyColor);
  body.position.y = d.bodyH / 2;
  body.castShadow = true;
  group.add(body);

  const cab = mesh(d.cabW, d.cabH, d.cabD, d.cabColor);
  cab.position.set(0, d.bodyH + d.cabH / 2, d.cabOffZ);
  cab.castShadow = true;
  group.add(cab);

  return group;
}

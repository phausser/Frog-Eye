import * as THREE from 'three';

const FLAT = { flatShading: true };

const DEF = {
  car: {
    bodyW: 1.5, bodyH: 0.50, bodyD: 1.8,
    cabW:  1.0, cabH:  0.32, cabD: 0.85,
    cabOffZ: 0,
    hitHW: 0.75,
  },
  truck: {
    bodyW: 1.5, bodyH: 0.62, bodyD: 3.2,
    cabW:  1.4, cabH:  0.50, cabD: 1.00,
    cabOffZ: 1.0,
    hitHW: 0.75,
  },
};

export const VEHICLE_HIT_HW = { car: DEF.car.hitHW, truck: DEF.truck.hitHW };

// Car palette: gelb, hellblau, rot, weiß, silbern
export const CAR_COLORS = [
  { body: 0xddcc22, cab: 0x998811 }, // gelb
  { body: 0x66bbdd, cab: 0x3388aa }, // hellblau
  { body: 0xcc3322, cab: 0x881a12 }, // rot
  { body: 0xeeeeee, cab: 0x999999 }, // weiß
  { body: 0xaaaaaa, cab: 0x666666 }, // silbern
];

export const TRUCK_COLORS = [
  { body: 0x2244aa, cab: 0x112266 }, // blau
  { body: 0x336633, cab: 0x1a4420 }, // dunkelgrün
  { body: 0xaa5522, cab: 0x663311 }, // orange-braun
];

function boxMesh(w, h, d, color) {
  return new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshPhongMaterial({ color, ...FLAT })
  );
}

export function createVehicleMesh(type) {
  const d = DEF[type];
  const group = new THREE.Group();

  // Use placeholder colors; applyVehicleColors() sets the real ones at spawn
  const body = boxMesh(d.bodyW, d.bodyH, d.bodyD, 0xffffff);
  body.position.y = d.bodyH / 2;
  body.castShadow = true;
  group.add(body);

  const cab = boxMesh(d.cabW, d.cabH, d.cabD, 0xffffff);
  cab.position.set(0, d.bodyH + d.cabH / 2, d.cabOffZ);
  cab.castShadow = true;
  group.add(cab);

  return group;
}

// Apply a { body, cab } color pair to a vehicle group's children.
// Clones materials so pool-reused meshes don't share colour state.
export function applyVehicleColors(group, colors) {
  const [bodyMesh, cabMesh] = group.children;
  bodyMesh.material = bodyMesh.material.clone();
  bodyMesh.material.color.setHex(colors.body);
  cabMesh.material  = cabMesh.material.clone();
  cabMesh.material.color.setHex(colors.cab);
}

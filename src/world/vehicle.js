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
  { body: 0xeedd33, cab: 0xaaaa11 }, // gelb
  { body: 0x88ddff, cab: 0x44aacc }, // hellblau
  { body: 0xdd4433, cab: 0xaa2211 }, // rot (erscheint dunkel durch Dichromat — Absicht)
  { body: 0xffffff, cab: 0xcccccc }, // weiß
  { body: 0xcccccc, cab: 0x999999 }, // silbern
];

export const TRUCK_COLORS = [
  { body: 0x5599ff, cab: 0x2255cc }, // blau
  { body: 0x66cc66, cab: 0x338833 }, // grün
  { body: 0xddaa44, cab: 0xaa7722 }, // orange-gelb
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

import * as THREE from 'three';

const FLAT = { flatShading: true };

const DEF = {
  car: {
    bodyW: 1.5, bodyH: 0.38, bodyD: 1.8,
    cabW:  1.1, cabH:  0.30, cabD: 0.90,
    cabOffZ: 0.05,
    wheelR: 0.22, wheelT: 0.16,
    hitHW: 0.75,
  },
  truck: {
    bodyW: 1.5, bodyH: 0.50, bodyD: 3.2,
    cabW:  1.4, cabH:  0.44, cabD: 0.95,
    cabOffZ: 1.05,
    wheelR: 0.24, wheelT: 0.18,
    hitHW: 0.75,
  },
};

export const VEHICLE_HIT_HW = { car: DEF.car.hitHW, truck: DEF.truck.hitHW };

export const CAR_COLORS = [
  { body: 0xeedd33, cab: 0xaaaa11 },
  { body: 0x88ddff, cab: 0x44aacc },
  { body: 0xdd4433, cab: 0xaa2211 },
  { body: 0xffffff, cab: 0xcccccc },
  { body: 0xcccccc, cab: 0x999999 },
];

export const TRUCK_COLORS = [
  { body: 0x5599ff, cab: 0x2255cc },
  { body: 0x66cc66, cab: 0x338833 },
  { body: 0xddaa44, cab: 0xaa7722 },
];

function mat(color) {
  return new THREE.MeshPhongMaterial({ color, ...FLAT });
}

function boxMesh(w, h, d, color) {
  return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
}

function addWheels(group, d) {
  const wheelMat = mat(0x222222);
  const rimMat   = mat(0xbbbbbb);
  const geo      = new THREE.CylinderGeometry(d.wheelR, d.wheelR, d.wheelT, 8);
  const rimGeo   = new THREE.CylinderGeometry(d.wheelR * 0.5, d.wheelR * 0.5, d.wheelT + 0.01, 8);

  const sideX    = d.bodyW / 2 + d.wheelT / 2;
  const y        = d.wheelR;

  const zPositions = (d === DEF.car)
    ? [d.bodyD * 0.3, -d.bodyD * 0.3]
    : [-d.bodyD * 0.1, -d.bodyD * 0.38, d.bodyD * 0.28]; // rear dual axle + front

  for (const zOff of zPositions) {
    for (const sx of [sideX, -sideX]) {
      const wheel = new THREE.Mesh(geo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(sx, y, zOff);
      group.add(wheel);

      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.rotation.z = Math.PI / 2;
      rim.position.set(sx, y, zOff);
      group.add(rim);
    }
  }
}


function addExhaust(group, d) {
  // Small exhaust pipe on truck cab roof
  const pipe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 0.35, 6),
    mat(0x555555)
  );
  pipe.position.set(d.cabW * 0.38, d.bodyH + d.cabH + 0.15, d.cabOffZ - 0.2);
  group.add(pipe);
}

export function createVehicleMesh(type) {
  const d = DEF[type];
  const group = new THREE.Group();

  // Body
  const body = boxMesh(d.bodyW, d.bodyH, d.bodyD, 0xffffff);
  body.position.y = d.bodyH / 2;
  body.castShadow = true;
  group.add(body);

  // Cab
  const cab = boxMesh(d.cabW, d.cabH, d.cabD, 0xffffff);
  cab.position.set(0, d.bodyH + d.cabH / 2, d.cabOffZ);
  cab.castShadow = true;
  group.add(cab);

  addWheels(group, d);
  if (type === 'truck') addExhaust(group, d);

  return group;
}

export function createTrailMesh(type, bodyColor, idx) {
  const d      = DEF[type];
  const bright = idx === 0 ? 0.45 : 0.18;
  const col    = new THREE.Color(bodyColor).multiplyScalar(bright);
  const mesh   = new THREE.Mesh(
    new THREE.BoxGeometry(d.bodyW, 0.12, d.bodyD * (0.85 - idx * 0.25)),
    new THREE.MeshPhongMaterial({ color: col, flatShading: true })
  );
  mesh.position.y = 0.06;
  return mesh;
}

export function applyVehicleColors(group, colors) {
  const [bodyMesh, cabMesh] = group.children;
  bodyMesh.material = bodyMesh.material.clone();
  bodyMesh.material.color.setHex(colors.body);
  cabMesh.material = cabMesh.material.clone();
  cabMesh.material.color.setHex(colors.cab);
}

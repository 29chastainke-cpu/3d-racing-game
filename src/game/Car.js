import * as THREE from 'three';

export function createCar({ bodyColor = '#22d3ee', accentColor = '#f8fafc', wheelColor = '#111827', glow = '#7dd3fc' } = {}) {
  const group = new THREE.Group();

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: bodyColor,
    metalness: 0.8,
    roughness: 0.24,
  });

  const accentMaterial = new THREE.MeshStandardMaterial({
    color: accentColor,
    metalness: 0.75,
    roughness: 0.22,
  });

  const wheelMaterial = new THREE.MeshStandardMaterial({
    color: wheelColor,
    metalness: 0.18,
    roughness: 0.82,
  });

  const glowMaterial = new THREE.MeshStandardMaterial({
    color: glow,
    emissive: glow,
    emissiveIntensity: 0.7,
    metalness: 0.2,
    roughness: 0.25,
  });

  const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.68, 3.4), bodyMaterial);
  chassis.position.y = 0.8;
  chassis.castShadow = true;
  chassis.receiveShadow = true;
  group.add(chassis);

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.58, 1.7), accentMaterial);
  cabin.position.set(0, 1.25, 0.15);
  cabin.castShadow = true;
  group.add(cabin);

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.72, 0.85, 5), accentMaterial);
  nose.rotation.x = -Math.PI / 2;
  nose.position.set(0, 0.82, 1.92);
  nose.castShadow = true;
  group.add(nose);

  const rearWing = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.12, 0.5), accentMaterial);
  rearWing.position.set(0, 1.42, -1.5);
  rearWing.castShadow = true;
  group.add(rearWing);

  const glowHalo = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.08, 16, 42), glowMaterial);
  glowHalo.rotation.x = Math.PI / 2;
  glowHalo.position.set(0, 0.73, -1.72);
  group.add(glowHalo);

  const wheelPositions = [
    [-0.9, 0.36, 1.15],
    [0.9, 0.36, 1.15],
    [-0.9, 0.36, -1.15],
    [0.9, 0.36, -1.15],
  ];

  wheelPositions.forEach(([x, y, z]) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.36, 18), wheelMaterial);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, y, z);
    wheel.castShadow = true;
    wheel.receiveShadow = true;
    group.add(wheel);
  });

  group.userData = {
    bodyMaterial,
    accentMaterial,
    wheelMaterial,
    glowMaterial,
    bodyColor,
    accentColor,
    wheelColor,
    glow,
  };

  return group;
}

export function setCarAppearance(car, { bodyColor, accentColor, wheelColor, glow }) {
  if (!car || !car.userData) return;

  if (bodyColor) car.userData.bodyMaterial.color.set(bodyColor);
  if (accentColor) car.userData.accentMaterial.color.set(accentColor);
  if (wheelColor) car.userData.wheelMaterial.color.set(wheelColor);

  if (glow) {
    car.userData.glowMaterial.color.set(glow);
    car.userData.glowMaterial.emissive.set(glow);
  }
}

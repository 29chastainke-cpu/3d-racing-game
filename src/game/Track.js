import * as THREE from 'three';

export function createTrack() {
  const turns = 3.4;
  const radius = 18;
  const points = [];

  for (let index = 0; index <= 260; index += 1) {
    const progress = index / 260;
    const angle = progress * Math.PI * 2 * turns;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = 11 - progress * 42;
    points.push(new THREE.Vector3(x, y, z));
  }

  const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.22);
  const group = new THREE.Group();

  const roadMaterial = new THREE.MeshStandardMaterial({
    color: 0x1f2937,
    metalness: 0.45,
    roughness: 0.72,
  });

  const trackRoad = new THREE.Mesh(new THREE.TubeGeometry(curve, 540, 2.2, 24, false), roadMaterial);
  group.add(trackRoad);

  const glowMaterial = new THREE.MeshStandardMaterial({
    color: 0x34d399,
    emissive: 0x0f766e,
    emissiveIntensity: 0.4,
    metalness: 0.6,
    roughness: 0.2,
  });

  const centerGlow = new THREE.Mesh(new THREE.TubeGeometry(curve, 540, 0.7, 16, false), glowMaterial);
  centerGlow.position.y = 0.22;
  group.add(centerGlow);

  const railMaterial = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    emissive: 0x0ea5e9,
    emissiveIntensity: 0.2,
    metalness: 0.8,
    roughness: 0.22,
  });

  const outerRail = new THREE.Mesh(new THREE.TubeGeometry(curve, 420, 0.18, 8, false), railMaterial);
  outerRail.position.set(0, 0.7, 0);
  group.add(outerRail);

  const innerRail = new THREE.Mesh(new THREE.TubeGeometry(curve, 420, 0.18, 8, false), railMaterial);
  innerRail.position.set(0, -0.6, 0);
  group.add(innerRail);

  for (let index = 0; index <= 28; index += 1) {
    const progress = index / 28;
    const point = curve.getPointAt(progress);
    const tangent = curve.getTangentAt(progress).normalize();
    const normal = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();

    const marker = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.2, 0.8),
      new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.35,
      }),
    );

    marker.position.copy(point.clone().add(normal.clone().multiplyScalar(1.9)));
    marker.lookAt(point.clone().add(tangent));
    group.add(marker);
  }

  const core = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.7, radius * 0.82, 48, 32, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      emissive: 0x111827,
      emissiveIntensity: 0.15,
      side: THREE.DoubleSide,
      metalness: 0.7,
      roughness: 0.8,
    }),
  );
  core.position.y = -10;
  group.add(core);

  const baseRing = new THREE.Mesh(
    new THREE.TorusGeometry(radius + 4.2, 1.2, 12, 160),
    new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      emissive: 0x0f766e,
      emissiveIntensity: 0.4,
      metalness: 0.9,
      roughness: 0.25,
    }),
  );
  baseRing.rotation.x = Math.PI / 2;
  baseRing.position.y = -28;
  group.add(baseRing);

  for (let index = 0; index < 20; index += 1) {
    const angle = (index / 20) * Math.PI * 2;
    const tower = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 7 + (index % 3) * 2.4, 2.2),
      new THREE.MeshStandardMaterial({
        color: index % 2 === 0 ? 0x1e293b : 0x334155,
        emissive: 0x0ea5e9,
        emissiveIntensity: 0.08,
      }),
    );
    tower.position.set(Math.cos(angle) * (radius + 10), -10 + (index % 4) * 1.2, Math.sin(angle) * (radius + 10));
    tower.castShadow = true;
    tower.receiveShadow = true;
    group.add(tower);
  }

  return {
    group,
    path: curve,
    totalLength: curve.getLength(),
  };
}

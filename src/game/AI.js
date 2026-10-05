import * as THREE from 'three';
import { createCar } from './Car.js';

export function createAIDriver({ bodyColor, accentColor, wheelColor, glow, lane, progress, speed }) {
  const car = createCar({ bodyColor, accentColor, wheelColor, glow });
  car.userData.aiState = {
    lane,
    progress,
    speed,
    distance: progress * 1000,
  };
  return car;
}

export function updateAIDrivers(drivers, track, delta) {
  drivers.forEach((car, index) => {
    const state = car.userData.aiState;
    state.speed += (14 + index * 1.4 - state.speed) * delta * 0.5;
    state.distance += state.speed * delta * 4;
    state.progress = (state.distance / track.totalLength) % 1;

    const point = track.path.getPointAt(state.progress);
    const tangent = track.path.getTangentAt(state.progress).normalize();
    const normal = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();
    const lateralOffset = normal.clone().multiplyScalar(state.lane);
    const worldPosition = point.clone().add(lateralOffset);

    car.position.copy(worldPosition);
    car.lookAt(worldPosition.clone().add(tangent));
    car.rotation.z = 0;
  });
}

import './style.css';
import * as THREE from 'three';
import { createTrack } from './game/Track.js';
import { createCar, setCarAppearance } from './game/Car.js';
import { createAIDriver, updateAIDrivers } from './game/AI.js';
import { createHud, updateHud } from './game/Hud.js';

const app = document.getElementById('app');

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x030712);
scene.fog = new THREE.Fog(0x030712, 14, 90);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 220);
scene.add(camera);

const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x050816, 1.7);
scene.add(hemiLight);

const sun = new THREE.DirectionalLight(0xffffff, 1.8);
sun.position.set(18, 24, 14);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 0.1;
sun.shadow.camera.far = 100;
scene.add(sun);

const fillLight = new THREE.DirectionalLight(0x67e8f9, 0.8);
fillLight.position.set(-10, 14, -18);
scene.add(fillLight);

const track = createTrack();
scene.add(track.group);

const playerCar = createCar({
  bodyColor: '#22d3ee',
  accentColor: '#f8fafc',
  wheelColor: '#111827',
  glow: '#7dd3fc',
});
scene.add(playerCar);

const settings = {
  bodyColor: '#22d3ee',
  accentColor: '#f8fafc',
  wheelColor: '#111827',
  glow: '#7dd3fc',
};

const bodySelect = document.getElementById('bodyColor');
const accentSelect = document.getElementById('accentColor');
const wheelSelect = document.getElementById('wheelColor');

bodySelect.addEventListener('change', (event) => {
  settings.bodyColor = event.target.value;
  setCarAppearance(playerCar, settings);
});

accentSelect.addEventListener('change', (event) => {
  settings.accentColor = event.target.value;
  setCarAppearance(playerCar, settings);
});

wheelSelect.addEventListener('change', (event) => {
  settings.wheelColor = event.target.value;
  setCarAppearance(playerCar, settings);
});

const aiDrivers = [];
const aiColors = ['#f87171', '#a78bfa', '#fbbf24', '#34d399', '#fca5a5'];

for (let index = 0; index < 5; index += 1) {
  const driver = createAIDriver({
    bodyColor: aiColors[index],
    accentColor: '#f8fafc',
    wheelColor: '#111827',
    glow: '#fef3c7',
    lane: (index % 3) * 1.4 - 1.4,
    progress: 0.14 + index * 0.11,
    speed: 12 + index * 1.6,
  });
  aiDrivers.push(driver);
  scene.add(driver);
}

const hud = createHud();

const controls = {
  accelerate: false,
  brake: false,
  left: false,
  right: false,
};

window.addEventListener('keydown', (event) => {
  if (event.key === 'w' || event.key === 'ArrowUp') controls.accelerate = true;
  if (event.key === 's' || event.key === 'ArrowDown') controls.brake = true;
  if (event.key === 'a' || event.key === 'ArrowLeft') controls.left = true;
  if (event.key === 'd' || event.key === 'ArrowRight') controls.right = true;
});

window.addEventListener('keyup', (event) => {
  if (event.key === 'w' || event.key === 'ArrowUp') controls.accelerate = false;
  if (event.key === 's' || event.key === 'ArrowDown') controls.brake = false;
  if (event.key === 'a' || event.key === 'ArrowLeft') controls.left = false;
  if (event.key === 'd' || event.key === 'ArrowRight') controls.right = false;
});

const state = {
  progress: 0.1,
  distance: 120,
  lap: 1,
  speed: 0,
  targetLane: 0,
  laneOffset: 0,
  maxSpeed: 28,
  acceleration: 20,
  braking: 26,
  steering: 2.6,
};

const clock = new THREE.Clock();

function updatePlayer(delta) {
  if (controls.accelerate) {
    state.speed += state.acceleration * delta;
  } else {
    state.speed -= 8 * delta;
  }

  if (controls.brake) {
    state.speed -= state.braking * delta;
  }

  state.speed = THREE.MathUtils.clamp(state.speed, 0, state.maxSpeed);

  if (controls.left) state.targetLane -= state.steering * delta;
  if (controls.right) state.targetLane += state.steering * delta;
  state.targetLane = THREE.MathUtils.clamp(state.targetLane, -2.6, 2.6);
  state.laneOffset += (state.targetLane - state.laneOffset) * Math.min(1, delta * 5);

  state.distance += state.speed * delta * 4.25;
  state.progress = (state.distance / track.totalLength) % 1;

  if (state.distance > track.totalLength * state.lap) {
    state.lap += 1;
  }

  const point = track.path.getPointAt(state.progress);
  const tangent = track.path.getTangentAt(state.progress).normalize();
  const normal = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();
  const lateralOffset = normal.clone().multiplyScalar(state.laneOffset);
  const worldPosition = point.clone().add(lateralOffset);

  playerCar.position.copy(worldPosition);
  playerCar.lookAt(worldPosition.clone().add(tangent));
  playerCar.rotation.z = 0;

  const chaseOffset = tangent.clone().multiplyScalar(-9).add(new THREE.Vector3(0, 3.8, 0));
  const desiredCameraPosition = worldPosition.clone().add(chaseOffset);
  camera.position.lerp(desiredCameraPosition, 0.08);
  camera.lookAt(worldPosition.clone().add(new THREE.Vector3(0, 1.4, 0)));
}

function updateHudData() {
  const allCars = [
    { progress: state.progress, name: 'player' },
    ...aiDrivers.map((driver) => ({
      progress: driver.userData.aiState.progress,
      name: `ai-${driver.uuid ?? 'driver'}`,
    })),
  ];

  const sorted = allCars.sort((a, b) => b.progress - a.progress);
  const position = sorted.findIndex((entry) => entry.name === 'player') + 1;

  updateHud(hud, {
    speed: Math.round(state.speed * 8.5),
    lap: state.lap,
    position,
    total: 6,
  });
}

function animate() {
  const delta = Math.min(clock.getDelta(), 0.033);
  updatePlayer(delta);
  updateAIDrivers(aiDrivers, track, delta);
  updateHudData();
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

setCarAppearance(playerCar, settings);

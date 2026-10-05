export function createHud() {
  return {
    speed: document.getElementById('speed'),
    lap: document.getElementById('lap'),
    rank: document.getElementById('rank'),
  };
}

export function updateHud(hud, { speed, lap, position, total }) {
  if (hud.speed) hud.speed.textContent = `${speed} km/h`;
  if (hud.lap) hud.lap.textContent = `${lap}`;
  if (hud.rank) hud.rank.textContent = `P${position}/${total}`;
}

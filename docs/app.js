'use strict';

// Standard atlas: 8 × 11. Extra animation atlas: 6 × 4. Cells: 192 × 208.
const states = [
  ['idle', 'Idle', 'Taking a breather', 'A quiet blink. Ready when you are.'],
  ['running-right', 'Run right', 'Off to a good idea', 'A little momentum goes a long way.'],
  ['running-left', 'Run left', 'Right by your side', 'Your loyal little partner, coming back.'],
  ['waving', 'Wave', 'A friendly hello', 'Big ears. Bigger welcome.'],
  ['jumping', 'Hop', 'A tiny celebration', 'Every small win deserves a little joy.'],
  ['failed', 'Oops', 'Let’s try again', 'A little setback. Still a very good dog.'],
  ['waiting', 'Waiting', 'Over to you', 'All ears for your next idea.'],
  ['running', 'Working', 'Pencil in motion', 'Making a little something together.'],
  ['review', 'Review', 'One last look', 'A careful eye for the finishing touches.'],
  ['skateboard', 'Skateboard', 'Keep rolling', 'A little momentum. A lot of personality.'],
  ['sunglasses', 'Sunglasses', 'Looking cool', 'Confidence looks good on a very good dog.'],
  ['hearts', 'Love', 'Love this', 'For the ideas and people that make your day.'],
  ['football', 'Football', 'A little airtime', 'Toss it up. Catch a little joy.'],
];
const timing = [
  [280, 110, 110, 140, 140, 320],
  [120, 120, 120, 120, 120, 120, 120, 220],
  [120, 120, 120, 120, 120, 120, 120, 220],
  [140, 140, 140, 280],
  [140, 140, 140, 140, 280],
  [140, 140, 140, 140, 140, 140, 140, 240],
  [150, 150, 150, 150, 150, 260],
  [120, 120, 120, 120, 120, 220],
  [150, 150, 150, 150, 150, 280],
  [220, 140, 140, 140, 180, 220],
  [300, 180, 240, 200, 240, 260],
  [220, 180, 220, 260, 220, 220],
  [420, 140, 130, 200, 140, 280],
];
const media = matchMedia('(prefers-reduced-motion: reduce)');
const pets = [...document.querySelectorAll('.pet')];
const byId = (id) => document.getElementById(id);
const totalTimes = timing.map((frames) => frames.reduce((a, b) => a + b, 0));
let paused = media.matches;
let motionTime = 0;
let lastTick = performance.now();

function frame(el, column, row, extra = false) {
  el.dataset.sheet = extra ? 'extras' : 'standard';
  el.style.backgroundPosition = `${column / (extra ? 5 : 7) * 100}% ${row / (extra ? 3 : 10) * 100}%`;
}

function renderPets() {
  const columns = timing.map((durations, row) => {
    let offset = motionTime % totalTimes[row];
    let column = 0;
    while (column < durations.length - 1 && offset >= durations[column]) {
      offset -= durations[column++];
    }
    return column;
  });
  for (const pet of pets) {
    const row = states.findIndex((s) => s[0] === pet.dataset.state);
    if (row >= 0) frame(pet, columns[row], row < 9 ? row : row - 9, row >= 9);
  }
}

function animate(now) {
  if (!paused) {
    motionTime += Math.min(100, now - lastTick);
    renderPets();
  }
  lastTick = now;
  requestAnimationFrame(animate);
}
renderPets();
requestAnimationFrame(animate);

function toggleActive(buttons, predicate) {
  buttons.forEach((button) => {
    const active = predicate(button);
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

const grid = byId('animation-grid');
grid.innerHTML = states.map(([id, label], index) =>
  `${index === 9 ? '<span class="bonus-label">A LITTLE EXTRA</span>' : ''}<button class="animation-option${index >= 9 ? ' bonus' : ''}" data-state="${id}" aria-pressed="false">${label}</button>`
).join('');

function selectState(id) {
  const state = states.find((s) => s[0] === id);
  if (!state) return;
  byId('main-pet').dataset.state = id;
  byId('main-pet').setAttribute('aria-label', `Archie III ${state[1].toLowerCase()}`);
  byId('state-name').textContent = state[2];
  byId('state-description').textContent = state[3];
  toggleActive(grid.querySelectorAll('button'), (b) => b.dataset.state === id);
  motionTime = 0;
  renderPets();
}
selectState('waving');
grid.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (button) selectState(button.dataset.state);
});

const slider = byId('pet-size');
function setSize(value) {
  const size = Math.max(32, Math.min(240, Math.round(Number(value) / 8) * 8));
  slider.value = size;
  byId('main-pet').style.setProperty('--pet-size', `${size}px`);
  byId('size-output').textContent = `${size} px`;
  toggleActive(document.querySelectorAll('[data-size]'), (b) => Number(b.dataset.size) === size);
}
slider.addEventListener('input', () => setSize(slider.value));
document.querySelectorAll('[data-size]').forEach((b) => b.addEventListener('click', () => setSize(b.dataset.size)));
setSize(192);

document.querySelectorAll('button[data-surface]').forEach((button) => {
  button.addEventListener('click', () => {
    byId('main-stage').dataset.surface = button.dataset.surface;
    toggleActive(document.querySelectorAll('button[data-surface]'), (b) => b === button);
  });
});

function updatePlay() {
  byId('play-icon').textContent = paused ? '▶' : 'Ⅱ';
  byId('play-toggle').setAttribute('aria-label', paused ? 'Play animations' : 'Pause animations');
  byId('play-toggle').setAttribute('aria-pressed', String(paused));
}
byId('play-toggle').addEventListener('click', () => { paused = !paused; updatePlay(); });
media.addEventListener('change', (event) => {
  paused = event.matches;
  if (paused) { motionTime = 0; renderPets(); }
  updatePlay();
});
updatePlay();

document.querySelectorAll('[data-inline-size]').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelector('.inline-pet').style.setProperty('--pet-size', `${button.dataset.inlineSize}px`);
    toggleActive(document.querySelectorAll('[data-inline-size]'), (b) => b === button);
  });
});

const statusMap = {
  working: ['running', 'Thinking it through…', 'Good ideas start with a little scribble.'],
  waiting: ['waiting', 'A little help?', 'Archie III is all ears for your next move.'],
  done: ['jumping', 'Looking good!', 'That deserves a tiny celebration.'],
};
document.querySelectorAll('[data-status]').forEach((button) => {
  button.addEventListener('click', () => {
    const [state, title, note] = statusMap[button.dataset.status];
    byId('status-pet').dataset.state = state;
    byId('status-pet').setAttribute('aria-label', `Archie III ${button.dataset.status}`);
    byId('status-title').textContent = title;
    byId('status-note').textContent = note;
    toggleActive(document.querySelectorAll('[data-status]'), (b) => b === button);
    renderPets();
  });
});

const drag = byId('drag-pet');
const desktop = byId('desktop-demo');
const deskPet = drag.querySelector('.pet');
let dragStart = null;
let dragReset;
let didDrag = false;
function movePet(x, y) {
  drag.style.right = 'auto';
  drag.style.bottom = 'auto';
  drag.style.left = `${Math.max(0, Math.min(desktop.clientWidth - drag.offsetWidth, x))}px`;
  drag.style.top = `${Math.max(31, Math.min(desktop.clientHeight - drag.offsetHeight, y))}px`;
}
drag.addEventListener('pointerdown', (event) => {
  if (event.button !== 0) return;
  drag.focus();
  event.preventDefault();
  drag.setPointerCapture(event.pointerId);
  dragStart = { x: event.clientX, y: event.clientY, left: drag.offsetLeft, top: drag.offsetTop };
  didDrag = false;
  clearTimeout(dragReset);
});
drag.addEventListener('pointermove', (event) => {
  if (!dragStart) return;
  const dx = event.clientX - dragStart.x;
  const dy = event.clientY - dragStart.y;
  if (Math.hypot(dx, dy) > 3) didDrag = true;
  movePet(dragStart.left + dx, dragStart.top + dy);
  deskPet.dataset.state = dx < 0 ? 'running-left' : 'running-right';
  renderPets();
});
function stopDrag() {
  if (!dragStart) return;
  dragStart = null;
  deskPet.dataset.state = 'idle';
  renderPets();
}
['pointerup', 'pointercancel', 'lostpointercapture'].forEach((type) => drag.addEventListener(type, stopDrag));
drag.addEventListener('keydown', (event) => {
  const movement = { ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, -12], ArrowDown: [0, 12] }[event.key];
  if (movement) {
    event.preventDefault();
    movePet(drag.offsetLeft + movement[0], drag.offsetTop + movement[1]);
  }
});
drag.addEventListener('click', (event) => {
  if (didDrag && event.detail !== 0) return;
  deskPet.dataset.state = 'waving';
  renderPets();
  clearTimeout(dragReset);
  dragReset = setTimeout(() => { deskPet.dataset.state = 'idle'; renderPets(); }, 1300);
});
window.addEventListener('resize', () => {
  if (drag.style.left) movePet(drag.offsetLeft, drag.offsetTop);
});

const gaze = byId('gaze-pad');
const gazePet = byId('gaze-pet');
const target = byId('gaze-target');
const directionNames = ['Up', 'Up-right', 'Up-right', 'Up-right', 'Right', 'Down-right', 'Down-right', 'Down-right', 'Down', 'Down-left', 'Down-left', 'Down-left', 'Left', 'Up-left', 'Up-left', 'Up-left'];
function resetGaze() {
  gazePet.dataset.state = 'idle';
  target.style.display = 'none';
  byId('gaze-label').textContent = 'RESTING';
  gazePet.setAttribute('aria-label', 'Archie III resting');
  renderPets();
}
function lookAt(x, y) {
  const dx = x - gaze.clientWidth / 2;
  const dy = y - gaze.clientHeight / 2;
  if (Math.hypot(dx, dy) < 25) { resetGaze(); return; }
  const index = Math.round(((Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360) / 22.5) % 16;
  delete gazePet.dataset.state;
  frame(gazePet, index % 8, 9 + Math.floor(index / 8));
  target.style.display = 'block';
  target.style.left = `${Math.max(5, Math.min(gaze.clientWidth - 5, x)) - 5}px`;
  target.style.top = `${Math.max(5, Math.min(gaze.clientHeight - 5, y)) - 5}px`;
  gazePet.setAttribute('aria-label', `Archie III looking ${directionNames[index].toLowerCase()}`);
  byId('gaze-label').textContent = `${directionNames[index].toUpperCase()} / ${index * 22.5}°`;
}
function gazePointer(event) {
  const bounds = gaze.getBoundingClientRect();
  lookAt(event.clientX - bounds.left, event.clientY - bounds.top);
}
gaze.addEventListener('pointermove', gazePointer);
gaze.addEventListener('pointerdown', gazePointer);
gaze.addEventListener('pointerleave', (event) => { if (event.pointerType !== 'touch') resetGaze(); });
gaze.addEventListener('keydown', (event) => {
  const direction = { ArrowUp: [.5, .1], ArrowRight: [.9, .5], ArrowDown: [.5, .9], ArrowLeft: [.1, .5] }[event.key];
  if (direction) {
    event.preventDefault();
    lookAt(gaze.clientWidth * direction[0], gaze.clientHeight * direction[1]);
  } else if (event.key === 'Escape') {
    event.preventDefault();
    resetGaze();
  }
});

byId('copy-code').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(byId('embed-code').textContent);
    byId('copy-result').textContent = 'Copied. A little wave, ready to paste.';
    byId('copy-code').textContent = 'Copied ✓';
  } catch {
    byId('copy-result').textContent = 'Select the snippet above and copy it to your clipboard.';
  }
});

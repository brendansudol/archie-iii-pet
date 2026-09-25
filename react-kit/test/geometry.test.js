import test from 'node:test';
import assert from 'node:assert/strict';
import { ANIMATIONS, SHEETS, frameAt, backgroundPosition, directionFromPoint, clampPosition } from '../src/archie/animations.js';

test('frame timing respects unequal holds, boundaries, and looping', () => {
  const durations = ANIMATIONS.football.durations;
  assert.equal(frameAt(419, durations), 0);
  assert.equal(frameAt(420, durations), 1);
  assert.equal(frameAt(560, durations), 2);
  const period = durations.reduce((a, b) => a + b, 0);
  assert.equal(frameAt(period - 1, durations), 5);
  assert.equal(frameAt(period, durations), 0);
  assert.equal(frameAt(period + 420, durations), 1);
});

test('all loops fit their sheet and have positive frame durations', () => {
  assert.equal(Object.keys(ANIMATIONS).length, 13);
  for (const animation of Object.values(ANIMATIONS)) {
    const sheet = SHEETS[animation.sheet];
    assert.ok(animation.row >= 0 && animation.row < sheet.rows);
    assert.ok(animation.durations.length <= sheet.columns);
    assert.ok(animation.durations.every((duration) => duration > 0));
  }
  assert.equal(backgroundPosition(5, 3, SHEETS.extras), '100% 100%');
  assert.equal(backgroundPosition(7, 10, SHEETS.core), '100% 100%');
});

test('gaze maps all sixteen sectors, wraparound, and neutral dead zone', () => {
  for (let index = 0; index < 16; index += 1) {
    const radians = index * Math.PI / 8;
    assert.equal(directionFromPoint(Math.sin(radians) * 100, -Math.cos(radians) * 100), index);
  }
  assert.equal(directionFromPoint(0, 0), null);
  assert.equal(directionFromPoint(10, 10), null);
  assert.equal(directionFromPoint(-1, -100), 0);
});

test('dragging clamps all boundaries, including a stage smaller than Archie', () => {
  const bounds = { width: 300, height: 200 };
  const sprite = { width: 96, height: 104 };
  assert.deepEqual(clampPosition({ x: -50, y: 1000 }, bounds, sprite), { x: 0, y: 96 });
  assert.deepEqual(clampPosition({ x: 1000, y: -50 }, bounds, sprite), { x: 204, y: 0 });
  assert.deepEqual(clampPosition({ x: 30, y: 40 }, { width: 10, height: 10 }, sprite), { x: 0, y: 0 });
});

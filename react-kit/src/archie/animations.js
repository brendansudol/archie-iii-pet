export const CELL = { width: 192, height: 208 };

export const SHEETS = {
  core: { file: 'archie-iii.webp', columns: 8, rows: 11 },
  extras: { file: 'archie-iii-extras.webp', columns: 6, rows: 4 },
};

export const ANIMATIONS = {
  idle: { label: 'Idle', sheet: 'core', row: 0, durations: [280, 110, 110, 140, 140, 320] },
  'running-right': { label: 'Run right', sheet: 'core', row: 1, durations: [120, 120, 120, 120, 120, 120, 120, 220] },
  'running-left': { label: 'Run left', sheet: 'core', row: 2, durations: [120, 120, 120, 120, 120, 120, 120, 220] },
  waving: { label: 'Wave', sheet: 'core', row: 3, durations: [140, 140, 140, 280] },
  jumping: { label: 'Hop', sheet: 'core', row: 4, durations: [140, 140, 140, 140, 280] },
  failed: { label: 'Oops', sheet: 'core', row: 5, durations: [140, 140, 140, 140, 140, 140, 140, 240] },
  waiting: { label: 'Waiting', sheet: 'core', row: 6, durations: [150, 150, 150, 150, 150, 260] },
  running: { label: 'Working', sheet: 'core', row: 7, durations: [120, 120, 120, 120, 120, 220] },
  review: { label: 'Review', sheet: 'core', row: 8, durations: [150, 150, 150, 150, 150, 280] },
  skateboard: { label: 'Skateboard', sheet: 'extras', row: 0, durations: [220, 140, 140, 140, 180, 220] },
  sunglasses: { label: 'Sunglasses', sheet: 'extras', row: 1, durations: [300, 180, 240, 200, 240, 260] },
  hearts: { label: 'Love', sheet: 'extras', row: 2, durations: [220, 180, 220, 260, 220, 220] },
  football: { label: 'Football', sheet: 'extras', row: 3, durations: [420, 140, 130, 200, 140, 280] },
};

export function frameAt(elapsed, durations) {
  let time = Math.max(0, elapsed) % durations.reduce((sum, value) => sum + value, 0);
  for (let column = 0; column < durations.length; column += 1) {
    if (time < durations[column]) return column;
    time -= durations[column];
  }
  return 0;
}

export function backgroundPosition(column, row, sheet) {
  return `${(column / (sheet.columns - 1)) * 100}% ${(row / (sheet.rows - 1)) * 100}%`;
}

// Clockwise: 0 = up, 4 = right, 8 = down, 12 = left. null = neutral.
export function directionFromPoint(dx, dy, deadZone = 24) {
  if (Math.hypot(dx, dy) < deadZone) return null;
  const degrees = (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360;
  return Math.round(degrees / 22.5) % 16;
}

export function clampPosition(position, bounds, sprite) {
  return {
    x: Math.max(0, Math.min(position.x, Math.max(0, bounds.width - sprite.width))),
    y: Math.max(0, Math.min(position.y, Math.max(0, bounds.height - sprite.height))),
  };
}

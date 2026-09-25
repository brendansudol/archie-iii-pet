'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ANIMATIONS, CELL, SHEETS, backgroundPosition, frameAt } from './animations.js';
import './archie.css';

export { ANIMATIONS } from './animations.js';

export function useReducedMotion() {
  // A static initial render also works during server rendering.
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}

export function Archie({
  animation = 'idle',
  size = 96,
  direction = null,
  paused = false,
  assetBase = '/archie',
  label = 'Archie III',
  className = '',
}) {
  const element = useRef(null);
  const timeline = useRef({ key: '', elapsed: 0 });
  const reducedMotion = useReducedMotion();
  const selected = Object.prototype.hasOwnProperty.call(ANIMATIONS, animation)
    ? ANIMATIONS[animation]
    : ANIMATIONS.idle;
  const gaze = Number.isInteger(direction) && direction >= 0 && direction < 16 ? direction : null;
  const sheet = SHEETS[gaze === null ? selected.sheet : 'core'];
  const row = gaze === null ? selected.row : 9 + Math.floor(gaze / 8);
  const firstColumn = gaze === null ? 0 : gaze % 8;
  const key = `${animation}:${gaze}`;

  useEffect(() => {
    const node = element.current;
    if (timeline.current.key !== key) timeline.current = { key, elapsed: 0 };
    let previousTime = null;
    let previousColumn = -1;
    let requestId;

    function paint(column) {
      if (column === previousColumn) return;
      node.style.backgroundPosition = backgroundPosition(column, row, sheet);
      previousColumn = column;
    }

    paint(gaze !== null ? firstColumn : reducedMotion ? 0 : frameAt(timeline.current.elapsed, selected.durations));
    if (paused || reducedMotion || gaze !== null) return;

    function tick(now) {
      if (previousTime !== null) {
        // Avoid jumping through a loop when a background tab becomes visible.
        timeline.current.elapsed += Math.min(100, now - previousTime);
      }
      previousTime = now;
      paint(frameAt(timeline.current.elapsed, selected.durations));
      requestId = window.requestAnimationFrame(tick);
    }
    requestId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(requestId);
  }, [key, gaze, row, sheet, selected, firstColumn, paused, reducedMotion]);

  return (
    <span
      ref={element}
      className={`archie-sprite ${className}`}
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      data-animation={animation}
      data-direction={gaze ?? 'neutral'}
      style={{
        width: size,
        height: size * CELL.height / CELL.width,
        backgroundImage: `url("${assetBase.replace(/\/$/, '')}/${sheet.file}")`,
        backgroundSize: `${sheet.columns * 100}% ${sheet.rows * 100}%`,
        backgroundPosition: backgroundPosition(firstColumn, row, sheet),
      }}
    />
  );
}

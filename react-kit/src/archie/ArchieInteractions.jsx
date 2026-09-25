'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Archie } from './Archie.jsx';
import { clampPosition, directionFromPoint } from './animations.js';

export function CursorArchie({ enabled = true, ...spriteProps }) {
  const anchor = useRef(null);
  const [direction, setDirection] = useState(null);

  useEffect(() => {
    if (!enabled) return;
    function follow(event) {
      if (event.pointerType === 'touch') return;
      const box = anchor.current.getBoundingClientRect();
      setDirection(directionFromPoint(
        event.clientX - (box.left + box.width / 2),
        event.clientY - (box.top + box.height / 2),
      ));
    }
    const reset = () => setDirection(null);
    const leave = (event) => { if (!event.relatedTarget) reset(); };
    window.addEventListener('pointermove', follow);
    window.addEventListener('pointerout', leave);
    window.addEventListener('blur', reset);
    window.addEventListener('scroll', reset, true);
    window.addEventListener('resize', reset);
    return () => {
      window.removeEventListener('pointermove', follow);
      window.removeEventListener('pointerout', leave);
      window.removeEventListener('blur', reset);
      window.removeEventListener('scroll', reset, true);
      window.removeEventListener('resize', reset);
    };
  }, [enabled]);

  return (
    <span
      ref={anchor}
      className="archie-cursor"
      tabIndex={0}
      role="group"
      aria-label="Archie follows your cursor. Arrow keys change his gaze; Escape resets it."
      onKeyDown={(event) => {
        const directions = { ArrowUp: 0, ArrowRight: 4, ArrowDown: 8, ArrowLeft: 12 };
        if (event.key in directions) {
          event.preventDefault();
          setDirection(directions[event.key]);
        } else if (event.key === 'Escape') setDirection(null);
      }}
    >
      <Archie {...spriteProps} direction={enabled ? direction : null} />
    </span>
  );
}

export function DraggableArchie({ size = 96, floating = false, className = '', ...spriteProps }) {
  const stage = useRef(null);
  const button = useRef(null);
  const drag = useRef(null);
  const waveTimer = useRef(null);
  const suppressClick = useRef(false);
  const [position, setPosition] = useState({ x: 24, y: 24 });
  const [animation, setAnimation] = useState('idle');
  const [dragging, setDragging] = useState(false);

  function keepInside(next) {
    return clampPosition(next,
      { width: stage.current.clientWidth, height: stage.current.clientHeight },
      { width: button.current.offsetWidth, height: button.current.offsetHeight },
    );
  }

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      setPosition((current) => keepInside(current));
    });
    observer.observe(stage.current);
    observer.observe(button.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => () => window.clearTimeout(waveTimer.current), []);

  function finish(event, cancelled = false) {
    if (!drag.current || drag.current.id !== event.pointerId) return;
    suppressClick.current = cancelled || drag.current.moved;
    drag.current = null;
    setDragging(false);
    setAnimation('idle');
    if (button.current.hasPointerCapture(event.pointerId)) {
      button.current.releasePointerCapture(event.pointerId);
    }
  }

  return (
    <div ref={stage} className={`archie-stage ${floating ? 'archie-stage--floating' : ''} ${className}`}>
      <button
        ref={button}
        type="button"
        className={`archie-drag ${dragging ? 'archie-drag--active' : ''}`}
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
        aria-label="Move Archie with the arrow keys, or drag him. Click or press Enter to wave."
        onPointerDown={(event) => {
          if (!event.isPrimary || event.button !== 0) return;
          window.clearTimeout(waveTimer.current);
          event.currentTarget.focus({ preventScroll: true });
          event.currentTarget.setPointerCapture(event.pointerId);
          suppressClick.current = false;
          drag.current = {
            id: event.pointerId, startX: event.clientX, startY: event.clientY,
            lastX: event.clientX, origin: position, moved: false,
          };
          setDragging(true);
        }}
        onPointerMove={(event) => {
          const current = drag.current;
          if (!current || current.id !== event.pointerId) return;
          const dx = event.clientX - current.startX;
          const dy = event.clientY - current.startY;
          if (Math.hypot(dx, dy) > 4) current.moved = true;
          if (!current.moved) return;
          setPosition(keepInside({ x: current.origin.x + dx, y: current.origin.y + dy }));
          if (event.clientX !== current.lastX) {
            setAnimation(event.clientX < current.lastX ? 'running-left' : 'running-right');
          }
          current.lastX = event.clientX;
        }}
        onPointerUp={(event) => finish(event)}
        onPointerCancel={(event) => finish(event, true)}
        onLostPointerCapture={(event) => finish(event, true)}
        onClick={(event) => {
          if (suppressClick.current && event.detail !== 0) {
            suppressClick.current = false;
            return;
          }
          window.clearTimeout(waveTimer.current);
          setAnimation('waving');
          waveTimer.current = window.setTimeout(() => setAnimation('idle'), 1400);
        }}
        onKeyDown={(event) => {
          const offsets = { ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, -12], ArrowDown: [0, 12] };
          const offset = offsets[event.key];
          if (!offset) return;
          event.preventDefault();
          setPosition((current) => keepInside({ x: current.x + offset[0], y: current.y + offset[1] }));
        }}
      >
        <Archie {...spriteProps} size={size} animation={animation} label={null} />
      </button>
    </div>
  );
}

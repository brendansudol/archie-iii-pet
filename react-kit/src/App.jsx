import React, { useEffect, useState } from 'react';
import { Archie, ANIMATIONS, useReducedMotion } from './archie/Archie.jsx';
import { CursorArchie, DraggableArchie } from './archie/ArchieInteractions.jsx';

const animationNames = Object.keys(ANIMATIONS);
const assetBase = `${import.meta.env.BASE_URL}archie`;
const taskStates = {
  ready: { animation: 'idle', text: 'Ready when you are.' },
  working: { animation: 'running', text: 'Making something good…' },
  waiting: { animation: 'waiting', text: 'Waiting for your next idea.' },
  done: { animation: 'jumping', text: 'All done. Nice teamwork!' },
  error: { animation: 'failed', text: 'Something went wrong. Let’s try again.' },
};

export default function App() {
  const [animation, setAnimation] = useState('waving');
  const [cycling, setCycling] = useState(false);
  const [paused, setPaused] = useState(false);
  const [task, setTask] = useState('ready');
  const reducedMotion = useReducedMotion();
  const motionStopped = paused || reducedMotion;

  useEffect(() => {
    if (!cycling || motionStopped) return;
    const timer = window.setInterval(() => {
      setAnimation((current) => animationNames[(animationNames.indexOf(current) + 1) % animationNames.length]);
    }, 2600);
    return () => window.clearInterval(timer);
  }, [cycling, motionStopped]);

  const spriteProps = { assetBase, paused };
  return (
    <main>
      <header className="page-header">
        <a className="brand" href="https://brendansudol.github.io/archie-iii-pet/">ARCHIE III <span>/ REACT KIT</span></a>
        <button className="quiet" onClick={() => setPaused((value) => !value)} aria-pressed={paused}>
          {paused ? 'Resume animations' : 'Pause animations'}
        </button>
      </header>

      <section className="intro">
        <div>
          <p className="eyebrow">A LITTLE PERSONALITY. A FEW LINES OF REACT.</p>
          <h1>Your app.<br />His next adventure.</h1>
          <p className="lede">Meet your new creative sidekick. Pick a mood, give him a job, or let him wander around your interface.</p>
          <div className="chips"><span>13 animations</span><span>16 look directions</span><span>No animation library</span></div>
          <div className="kit-links">
            <a className="kit-download" href="https://brendansudol.github.io/archie-iii-pet/assets/archie-react-kit.zip" download>Download React kit ↓</a>
            <a href="https://github.com/brendansudol/archie-iii-pet/tree/main/react-kit#readme">Integration guide ↗</a>
          </div>
        </div>
        <div className="intro-pet"><Archie {...spriteProps} animation="sunglasses" size={192} /><span>HELLO, DEVELOPER.</span></div>
      </section>

      {reducedMotion && <p className="motion-note">Your reduced-motion preference is on. Archie shows still poses; dragging and gaze controls remain available.</p>}

      <div className="examples">
        <section className="card" aria-labelledby="moods-title">
          <div className="card-heading"><span className="number">01</span><div><h2 id="moods-title">Set the mood</h2><p>One prop. Thirteen little personalities.</p></div></div>
          <div className="pet-display mood-display"><Archie {...spriteProps} size={144} animation={animation} /></div>
          <div className="controls">
            <label className="select-label">Animation
              <select value={animation} onChange={(event) => { setAnimation(event.target.value); setCycling(false); }}>
                {animationNames.map((name) => <option key={name} value={name}>{ANIMATIONS[name].label}</option>)}
              </select>
            </label>
            <button onClick={() => setCycling((value) => !value)} aria-pressed={cycling} disabled={reducedMotion}>
              {cycling ? 'Stop cycling' : 'Cycle all moods'}
            </button>
          </div>
          <pre><code>{`<Archie animation="${animation}" size={144} />`}</code></pre>
        </section>

        <section className="card" aria-labelledby="task-title">
          <div className="card-heading"><span className="number">02</span><div><h2 id="task-title">Give him a job</h2><p>Turn ordinary app states into a friendly moment.</p></div></div>
          <div className="pet-display task-display">
            <Archie {...spriteProps} size={112} animation={taskStates[task].animation} label={null} />
            <p role="status">{taskStates[task].text}</p>
          </div>
          <div className="state-buttons" aria-label="Example task state">
            {Object.keys(taskStates).map((name) => <button key={name} aria-pressed={task === name} onClick={() => setTask(name)}>{name}</button>)}
          </div>
          <pre><code>{`<Archie animation="${taskStates[task].animation}" />`}</code></pre>
        </section>

        <section className="card" aria-labelledby="cursor-title">
          <div className="card-heading"><span className="number">03</span><div><h2 id="cursor-title">Catch his eye</h2><p>Move your cursor. Archie looks in its direction.</p></div></div>
          <div className="pet-display gaze-display"><CursorArchie {...spriteProps} size={144} /></div>
          <p className="hint">Keyboard: focus Archie, then use the arrow keys. Escape resets his gaze.</p>
          <pre><code>{'<CursorArchie size={144} />'}</code></pre>
        </section>

        <section className="card" aria-labelledby="drag-title">
          <div className="card-heading"><span className="number">04</span><div><h2 id="drag-title">Make room for play</h2><p>Drag him around. Give him a click for a wave.</p></div></div>
          <DraggableArchie {...spriteProps} size={96} />
          <p className="hint">Mouse, touch, or arrow keys. Archie stays inside the dotted area.</p>
          <pre><code>{'<DraggableArchie size={96} />'}</code></pre>
        </section>
      </div>

      <section className="inline-example">
        <Archie {...spriteProps} animation="hearts" size={48} label={null} />
        <p>Small moments work, too. Add Archie beside a saved item, a success message, or a favorite.</p>
        <code>{'<Archie animation="hearts" size={48} />'}</code>
      </section>
      <footer>Same Archie. Your interface. <a href="https://github.com/brendansudol/archie-iii-pet/tree/main/react-kit">React source on GitHub ↗</a></footer>
    </main>
  );
}

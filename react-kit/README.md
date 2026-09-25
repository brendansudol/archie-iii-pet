# Archie III in React

**[Live React playground](https://brendansudol.github.io/archie-iii-pet/react/)** · [Download the complete React kit](https://brendansudol.github.io/archie-iii-pet/assets/archie-react-kit.zip) · [Original Archie III website](https://brendansudol.github.io/archie-iii-pet/)

Archie is rendered from two transparent sprite sheets. A React component shows one 192 × 208 cell at a time and advances through an animation's frames. Your application chooses his mood, size, position, and gaze through props.

This kit contains the existing, approved Archie III artwork, reusable React components, and a runnable example page. There is no animation-library dependency. The demo uses React 19.3 and Vite; you can copy the components into an existing React application without adopting Vite.

## 1. Try the example page

Download and unzip the kit, or clone the repository and enter `react-kit`. From this folder:

```sh
npm install
npm run dev
```

Open the localhost URL printed by Vite. The page demonstrates all 13 moods, automatic cycling, task states, cursor-following gaze, dragging, and click-to-wave. A page-level pause button freezes the loops. Reduced-motion preferences are respected automatically.

Other commands: `npm run build` creates a production build; `npm test` checks animation timing, atlas boundaries, gaze direction, and drag bounds.

## 2. Copy the assets and components into your app

Copy these directories into the matching places in your React project:

```text
public/
  archie/
    archie-iii.webp
    archie-iii-extras.webp
src/
  archie/
    Archie.jsx
    ArchieInteractions.jsx
    animations.js
    archie.css
```

If your project keeps components under `src/components`, you can place the `archie` folder there instead and adjust the imports below. You do not need this demo's `App.jsx`, `demo.css`, or `package.json` in your existing app.

The two image URLs should resolve at `/archie/archie-iii.webp` and `/archie/archie-iii-extras.webp`. Files in a typical React project's `public` folder are served directly, so the URL does not contain `/public`.

For an app hosted under a path such as `/my-app/`, pass `assetBase="/my-app/archie"` to each component. For a Vite app you can use `assetBase={import.meta.env.BASE_URL + 'archie'}`. Asset filenames must stay unchanged. Hosting the files with your application avoids depending on the original website for every visit.

## 3. Render Archie anywhere

```jsx
import { Archie } from './archie/Archie.jsx';

export default function Welcome() {
  return (
    <div>
      <Archie animation="waving" size={96} />
      <h1>Let's make something.</h1>
    </div>
  );
}
```

`size` is the sprite cell's width in CSS pixels. Height follows its 192:208 aspect ratio. Archie has some transparent space inside the cell. Sizes 48, 96, and 192 align especially cleanly with the pixel artwork.

| Prop | Default | Meaning |
| --- | --- | --- |
| `animation` | `"idle"` | Which loop to play; unknown names fall back to idle |
| `size` | `96` | Width in CSS pixels |
| `paused` | `false` | Freeze the current frame; resume from there |
| `direction` | `null` | Optional static gaze, 0–15; overrides the loop |
| `assetBase` | `"/archie"` | Folder URL containing the two sheets |
| `label` | `"Archie III"` | Accessible image label; use `null` when decorative |
| `className` | `""` | Additional CSS class |

All animation names are:

```js
'idle', 'running-right', 'running-left', 'waving', 'jumping',
'failed', 'waiting', 'running', 'review',
'skateboard', 'sunglasses', 'hearts', 'football'
```

`running` is the original atlas name for **working with the pencil**. Use `running-left` or `running-right` for physical running.

## 4. Change moods with React state

```jsx
import { useState } from 'react';
import { Archie, ANIMATIONS } from './archie/Archie.jsx';

export default function MoodPicker() {
  const [animation, setAnimation] = useState('skateboard');

  return (
    <div>
      <Archie animation={animation} size={144} />
      <select
        aria-label="Archie's animation"
        value={animation}
        onChange={(event) => setAnimation(event.target.value)}
      >
        {Object.entries(ANIMATIONS).map(([name, info]) => (
          <option key={name} value={name}>{info.label}</option>
        ))}
      </select>
    </div>
  );
}
```

Selecting a different animation restarts that animation from its first frame. Each mood loops until you change the prop. The renderer switches sprite sheets automatically for skateboard, sunglasses, hearts, and football.

## 5. Cycle through animations automatically

```jsx
import { useEffect, useState } from 'react';
import { Archie, useReducedMotion } from './archie/Archie.jsx';

const playlist = ['waving', 'skateboard', 'sunglasses', 'hearts', 'football'];

export default function CyclingArchie() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (paused || reducedMotion) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % playlist.length);
    }, 2600);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion]);

  return (
    <div>
      <Archie animation={playlist[index]} paused={paused} size={144} />
      <button onClick={() => setPaused((value) => !value)}>
        {paused ? 'Resume' : 'Pause'}
      </button>
    </div>
  );
}
```

There are two independent clocks: this timer changes the selected mood every 2.6 seconds, while `Archie` advances the frames within that mood using the artwork's original per-frame durations. The timer can switch partway through a loop; it is a simple slideshow. For one complete loop per mood, use the sum of that mood's `durations` as a timeout and advance after it expires.

Keep the interval in an effect with cleanup so rerenders and unmounts do not leave extra timers running. The component's animation loop also cleans itself up. See [React's effect lifecycle](https://react.dev/reference/react/useEffect).

## 6. Follow the cursor with his gaze

```jsx
import { CursorArchie } from './archie/ArchieInteractions.jsx';

export default function FriendlyCorner() {
  return <CursorArchie size={144} />;
}
```

This matches the original example page: Archie stays where you place him and looks toward the pointer anywhere in the window. The wrapper measures the center of his element, finds the angle to the pointer, rounds it to one of 16 directions, and chooses the matching pose. A small neutral zone prevents twitching when the pointer is over his center.

It uses viewport-relative coordinates for both the pointer and the element, so scrolling does not introduce an offset. Leaving the window, scrolling, or resizing resets the gaze until the next pointer movement. Touch pointers are ignored for gaze. Keyboard users can focus him, use arrow keys, and press Escape to reset.

`CursorArchie` accepts the normal sprite props plus `enabled={false}` to turn gaze tracking off. You can also control gaze directly:

```jsx
<Archie direction={4} /> // right
<Archie direction={12} /> // left
<Archie direction={null} animation="idle" /> // neutral animation
```

Direction indices run clockwise: 0 is up, 4 right, 8 down, and 12 left. Directions occupy the last two rows of the core sheet.

## 7. Drag him around

```jsx
import { DraggableArchie } from './archie/ArchieInteractions.jsx';

export default function DeskBuddy() {
  return <DraggableArchie size={96} />;
}
```

This renders a bounded, 320px-high play area. Drag with a mouse or touch; Archie runs in the direction you move him and returns to idle when released. Click or press Enter for a wave. Arrow keys move him in 12px steps.

The wrapper stores the pointer's starting location and Archie's starting position. On movement, it adds the pointer delta and clamps the result to the available width and height. It applies the position with a CSS transform.

Pointer capture keeps the drag active when the pointer leaves Archie or the play area. `touch-action: none` on the mascot allows touch dragging without scrolling the page under him. Pointer cancel and lost-capture events end the drag; a resize observer keeps him within the resized area. See [MDN's pointer capture explanation](https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture).

To customize the play area's height, pass a class and override it in your app's CSS:

```jsx
<DraggableArchie className="my-play-area" size={96} />
```

```css
.archie-stage.my-play-area { height: 450px; }
```

For a mascot that can be dragged around the whole viewport:

```jsx
<DraggableArchie floating size={96} />
```

Mount the floating version near your application root, outside transformed or clipped containers. Its overlay lets clicks pass through everywhere except Archie. His position is local component state: it resets when he unmounts. Dragging owns the `animation` prop, so use `Archie` directly when your app needs to choose the animation itself.

## 8. Connect him to real application state

```jsx
import { Archie } from './archie/Archie.jsx';

const poses = {
  idle: 'idle',
  loading: 'running',
  waiting: 'waiting',
  success: 'jumping',
  error: 'failed',
};

export default function TaskStatus({ status, message }) {
  return (
    <div>
      <Archie animation={poses[status] ?? 'idle'} size={64} label={null} />
      <span role="status">{message}</span>
    </div>
  );
}
```

Pass your actual request or task state into `status`. Keep a readable message beside the mascot so the animation is not the only way users know what is happening. A favorite/save action could similarly use `animation={isFavorite ? 'hearts' : 'idle'}`.

## How the renderer works

The core sheet is 8 columns × 11 rows. The extra sheet is 6 columns × 4 rows. Every cell is 192 × 208 pixels, and `animations.js` records each loop's row and frame durations. Only the listed frames play; unused cells at the ends of rows are skipped.

The CSS scales the entire background image to `800% 1100%` for the core sheet or `600% 400%` for extras. To show a particular cell:

```js
const x = column / (columns - 1) * 100;
const y = row / (rows - 1) * 100;
element.style.backgroundPosition = `${x}% ${y}%`;
```

`requestAnimationFrame` tracks elapsed time. The renderer changes the background position only when the frame changes, without triggering a React render every browser frame. A ref holds its clock and DOM element; React state controls interaction choices. See [React's useRef reference](https://react.dev/reference/react/useRef).

`image-rendering: pixelated` preserves the pixel-art appearance. Avoid CSS transitions on the sprite's background position: those would slide across neighboring cells instead of switching frames.

## Integration notes

- The reusable files use standard React hooks and include a `use client` directive for Next.js App Router. If your surrounding page uses state/effects, make that page or its interactive wrapper a client component as well. In older Next.js Pages Router setups, move the global `archie.css` import to `_app` if your build requires global CSS there.
- The demo's Vite build may report that `use client` is omitted from the browser bundle. That directive is intended for server-component frameworks; the source files retain it when copied into an app.
- Reduced motion shows the first frame of each loop and disables automatic mood cycling in the examples. Explicit dragging and gaze controls still work. `paused` freezes loop playback, while pointer interactions remain active.
- The renderer is intended for a handful of mascots. For a large grid of animated mascots, share a single animation clock or render only those in view.
- The demo's fonts and page styling are separate from the reusable components. The components themselves need only React, their CSS, and the two local sprite sheets.

Artwork and animation metadata come from the [Archie III project](https://github.com/brendansudol/archie-iii-pet). This kit reuses the published assets.

## Publishing updates to this playground

The repository publishes `docs` on the `main` branch to GitHub Pages. From the repository root, run:

```sh
npm ci --prefix react-kit
node scripts/build-react-site.mjs
```

The script runs tests, builds with the `/archie-iii-pet/react/` asset base, replaces `docs/react` with the generated site, and packages the source and artwork into `docs/assets/archie-react-kit.zip`. Commit the source and generated files, then push to `main` to deploy. The original homepage remains at the site root, and the React playground is at `/react/`.

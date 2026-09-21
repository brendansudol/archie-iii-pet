# Archie III

Big ears. Bigger ideas. A cheerful red robot dog and your little creative partner.

**[Meet Archie III](https://brendansudol.github.io/archie-iii-pet/)** · [Download the Codex pet](https://brendansudol.github.io/archie-iii-pet/assets/archie-iii-pet.zip)

An interactive mascot playground with thirteen animations, adjustable size and backgrounds, inline examples, task states, a draggable desk buddy, and sixteen cursor-following look directions. Supports keyboard controls and reduced motion.

## Local preview

```sh
python3 -m http.server 8000 --directory docs
```

Open http://localhost:8000. Plain HTML, CSS, and JavaScript; no dependencies or build step.

## Publishing

GitHub Pages serves `/docs` from the `main` branch. Push to `main` to update the website.

## Assets and installation

`docs/assets/archie-iii.webp` is the Codex v2 atlas: 1536 × 2288 pixels, with 192 × 208 pixel cells. The GIF and icon are extracted from this same approved atlas. `archie-iii-pet.zip` includes the manifest, atlas, and installation instructions. Unzip it into `~/.codex/pets/`, then select **Archie III** in the pet picker.

The website’s layout and interactions are adapted from [Archie](https://github.com/brendansudol/archie-pet). Archie III uses a new set of mascot artwork and animations inspired by the supplied red robot dog reference.

## Extra animations

Four new six-frame loops are available in the playground and as transparent GIF downloads:

- **Skateboard:** a push, a glide, and a little balance.
- **Sunglasses:** a playful glasses adjustment and confident nod.
- **Love:** a warm smile and floating pixel hearts.
- **Football:** toss a brown American football into the air, follow it, and catch it.

[Download all four](https://brendansudol.github.io/archie-iii-pet/assets/archie-iii-extra-animations.zip).

`docs/assets/archie-iii-extras.webp` is a 6-column × 4-row atlas with 192 × 208 pixel cells. `archie-iii-extras.json` records the row order and per-frame durations. These supplemental web animations leave the standard Codex v2 pet package unchanged.

Artwork was generated with the built-in imagegen tool, grounded in Archie III’s approved character art. See [the animation prompts](art/extra-animation-prompts.md). Frame extraction, transparency cleanup, assembly, and GIF export are deterministic.

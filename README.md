# Creative Digital Lab

An interactive particle-network playground built with React, TypeScript and Vite. The experience renders a live canvas animation and lets visitors experiment with visual parameters such as particle density, connection distance, speed, palette and playback state.

## Features

- Animated HTML Canvas particle field.
- Pointer interaction that influences nearby particles.
- Adjustable visual settings and colour palettes.
- Pause / resume and reset controls.
- Responsive React interface with typed component props.
- Lightweight client-side implementation without a graphics framework dependency.

## Technology

- React 19
- TypeScript 6
- Vite 8
- HTML Canvas 2D API
- lucide-react icons
- ESLint

## Getting started

Requirements: Node.js and npm.

```bash
npm install
npm run dev
```

Vite prints the local development URL in the terminal.

## Quality checks

```bash
npm run lint
npm run build
npm run preview
```

## Implementation notes

The particle renderer uses a requestAnimationFrame loop and resizes the canvas for the device pixel ratio. The animation is intentionally implemented in a React effect; when extending it, keep event listeners and animation frames cleaned up on unmount, and avoid creating unnecessary animation loops when settings change.

## Roadmap

See [Engineering roadmap](docs/ENGINEERING_ROADMAP.md) for accessibility, performance, testing and deployment improvements.

# Engineering Roadmap

## P0 — Animation lifecycle and performance

- [ ] Confirm every animation frame is cancelled when the component unmounts.
- [ ] Confirm pointer and resize listeners are removed on cleanup.
- [ ] Pause or reduce particle work when the canvas is off-screen or the document is hidden.
- [ ] Respect `prefers-reduced-motion` and provide a clear pause control.
- [ ] Cap particle density on small screens and profile the nested particle-connection loop.

## P1 — Accessibility and responsive behaviour

- [ ] Ensure every slider, toggle and palette control has an accessible name and keyboard support.
- [ ] Preserve visible focus styles.
- [ ] Provide a static fallback when Canvas 2D is unavailable.
- [ ] Test narrow screens, touch input and high-DPI displays.

## P1 — Quality automation

- [ ] Add component tests for controls and settings state.
- [ ] Add a lightweight browser smoke test for the main experience.
- [ ] Add CI for TypeScript build, ESLint and tests.
- [ ] Add dependency update automation.

## P2 — Portfolio presentation

- [ ] Add screenshots or a short demo recording.
- [ ] Add a concise architecture note explaining the Canvas render loop.
- [ ] Add a live demo link only after deployment is verified.

## Acceptance criteria

- No animation loops or event listeners remain after unmount.
- Reduced-motion users can use a non-animated experience.
- Build and lint pass in CI.

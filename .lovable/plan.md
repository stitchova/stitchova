# Premium Stitchova Logo Redesign

## Concept
A custom-drawn **"S" monogram formed by a needle pulling thread**. The S curve is the thread; a slim needle crosses it on the upper-right, with a tiny eye and a soft highlight. Rendered in the brand gold gradient on a dark rounded-square plaque (or transparent when used over imagery).

## Deliverable
- New scalable React SVG component `src/components/Logo.tsx` (replaces the current `<img>`-based Logo).
- Uses theme tokens (`hsl(var(--primary))`, `hsl(var(--accent))`) so it adapts to both dark and light themes.
- Props preserved: `size`, `className`, `showWordmark`, `wordmarkClassName` — no caller changes needed.
- Optional `variant`: `"plaque"` (default, rounded-square background) and `"mark"` (transparent, icon only).
- Optional `animated` prop: on mount, the thread draws itself in (stroke-dashoffset) and a subtle gold shimmer sweeps across the gradient. Respects `prefers-reduced-motion`.

## Wordmark
Custom letter-spacing + a tiny stitch dot replacing the dot pattern. Uses Inter 700 with `tracking-[0.18em]` and `uppercase` for an editorial, premium feel. A hairline gold underline appears under the wordmark on the splash/auth surfaces (`showWordmark`).

## Where it appears (no API changes — drop-in)
`Logo` is already imported by:
- `Lockscreen.tsx`, `Onboarding.tsx`, `Auth.tsx`, `SetPasscode.tsx`, splash/loading surfaces, and headers.

All existing call sites continue working.

## Favicon + meta
- Export a static optimized SVG to `public/stitchova-mark.svg`.
- Update `index.html` `<link rel="icon">` to the new SVG and add a PNG fallback (`public/stitchova-mark.png`, 512×512) generated once from the same mark for social/share previews.
- Update `<meta property="og:image">` to the new PNG.

## Cleanup
- Remove `src/assets/stitchova-logo.png` import; keep the file for one release in case of external references, then delete.

## Animation details (technical)
- Thread path: `stroke-dasharray` = path length, animate `stroke-dashoffset` from full → 0 over 900ms `cubic-bezier(.2,.7,.2,1)`.
- Needle: fades + slides in 200ms after thread starts.
- Shimmer: animated `<linearGradient>` with `<animate>` on `x1/x2`, 3s loop, paused when `prefers-reduced-motion: reduce`.
- Plaque: subtle inner highlight + soft gold glow via `filter: drop-shadow(0 6px 18px hsl(var(--primary)/0.35))`.

## Out of scope
- No changes to other components, routes, or business logic.
- No new dependencies.

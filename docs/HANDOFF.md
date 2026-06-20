# Handoff — Studio Cabinet Configurator

## Current branch
`premium-ui-pass`

## What changed in this pass
- Created a safer working branch instead of editing `main` directly.
- Reworked the global design tokens toward a richer editorial/luxury palette: obsidian, warm white, porcelain, champagne, brass, walnut, deep green, plaster, and oak.
- Rebuilt the landing page around a dark premium hero with an in-CSS configurator mock so the page no longer depends on missing imagery to feel high-end.
- Carried the premium theme into the entry flow and wizard shell.
- Improved the Pieces step with stronger cards, better selected-piece hierarchy, honest width-over-wall warning, and a fix for negative wall-slide bounds.
- Upgraded the Quote step language from fake checkout/reservation to an honest initial estimate and local review request.
- Added material role metadata and role-filtered finish pickers so internal back material is not offered as a visible customer finish.
- Improved 3D scene separation: warmer plaster walls, darker oak floor, trim contrast, readable glass, stronger lighting, brass selected outline, door detail lines, and simple brass pulls.

## Still not done
- I could not run `npm run build` from here. Basem needs to pull this branch locally and run the build.
- Photo upload still needs a real backend vision endpoint before it can truly analyze a room. The frontend must remain honest when the endpoint is unavailable.
- Cut-list grouping and multi-unit labor pricing are still correctness priorities.
- Top-down minimap is still not implemented.
- AI assistant/action schema is not implemented yet.
- Real photographic assets still need to be generated and placed in `public/images/`.

## Next high-impact tasks
1. Pull branch locally and run `npm run build`; fix any TypeScript/build errors.
2. Add top-down mini-map for wall numbers and placement clarity.
3. Fix cut-list aggregation so identical parts across different units group correctly.
4. Refactor pricing so labor scales by unit count/type while sheets still aggregate across the whole project.
5. Add real backend contract for `/api/analyze-room` or `VITE_ROOM_ANALYSIS_ENDPOINT`.
6. Generate and add the image assets listed in `docs/ASSET-LIST.md`.

## Design direction to preserve
The site should feel like a refined interior-design studio crossed with an Apple-level product experience: dark architectural hero, restrained typography, warm ivory/editorial panels, walnut/brass/deep-green accents, large whitespace, and visual clarity in the 3D scene. Avoid orange/clay, generic SaaS gradients, playful/bubbly controls, or beige surfaces that make cabinets blend into walls.

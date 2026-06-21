# Handoff — House of Nook Planner

## Current branch
`premium-ui-pass`

## Current product direction
The business has pivoted from broad custom cabinetry / full kitchens to **House of Nook**: warm, premium, shippable modular built-ins for real family homes.

Primary product lane:
- Mudroom Nook / entry bench / hall tree
- Coffee Nook / compact hutch
- Laundry Nook / utility storage
- Playroom or Montessori storage
- Reading bench / book nook
- Simple low kids storage bed

The north star is **garage-buildable, crateable, shippable modules**, not giant full kitchens, massive walk-in pantries, or mansion-scale built-ins. Bunk beds are future-only until safety/compliance review.

## Latest pass — GPT House of Nook pivot + planner color/UX cleanup
- Renamed visible brand language from Studio to **House of Nook** across landing, entry, planner shell, maker shell, quote screen, and AI panel.
- Rewrote the landing page around shippable nook systems instead of full cabinetry categories.
- Replaced landing image slots with product-scale filenames: `hero-mudroom-nook.jpg`, `product-coffee-nook.jpg`, `product-playroom-storage.jpg`, `product-reading-nook.jpg`, `product-laundry-nook.jpg`, `product-kids-bed-storage.jpg`.
- Updated `docs/ASSET-LIST.md`, `docs/DESIGN-SYSTEM.md`, and `AGENTS.md` so Claude/new chats inherit the House of Nook pivot.
- Warmed the post-landing planner shell so it follows the landing page palette: ivory/parchment background, walnut CTAs, brass/champagne selected states, minimal black.
- Restored planner view controls for Perspective / Front / Top and wired `Scene` to `cameraPreset` via store.
- Updated 3D room colors and readability: warm plaster walls, warmer oak floor, stronger plank lines, base shadow strips, subtle wall side tint, and corner markers so wall divisions are easier to read.
- Reworked `RoomStep` into a clearer wall/room planning mode with start blank/sample controls.
- Reworked `OpeningsStep` with clearer copy, no-room fallback, safer wall handling, and explicit floor/sill language.
- Reworked `PiecesStep` from generic cabinet quick-adds into shippable starter systems and single modules: Mudroom Nook, Coffee Nook, Playroom Nook, Laundry Nook, bench/base modules, locker towers, uppers, and shelves.
- Reframed the Quote step as a **planning estimate** for modular nook systems before measurement, crate, and shipping review.
- Updated the Netlify assistant system prompt so AI-generated actions respect the House of Nook product strategy and avoid unshippable full-room designs.

## Previous Claude pass — AI backend: photo analysis + design assistant
- Photo upload posts to `/api/analyze-room` via `src/services/roomAnalysis.ts` and `netlify/functions/analyze-room.ts`.
- The backend uses a server-side Anthropic key and returns a starting `RoomAnalysisResult` draft when configured.
- Honest fallback remains: no key or missing function returns unavailable/not connected, then the user continues manually.
- AI planner is action-based: `DesignAssistantPanel` → `designAssistant.ts` → `/api/assistant` → `DesignAction[]` → `assistant/actions.ts` applies real store changes.
- AI backend requires `ANTHROPIC_API_KEY` in Netlify env and a Netlify deploy / `netlify dev`.

## Operational status
- `npm run build` was previously reported passing after Claude's AI backend pass.
- GPT could not run a local build from this connector after the House of Nook pivot; Basem or Claude must run `npm run build` locally and fix any TypeScript/runtime issues.
- Photo upload is operational only when the Netlify function is deployed and `ANTHROPIC_API_KEY` is set. Otherwise it falls back honestly.
- AI planner is operational only when the Netlify assistant function is deployed and `ANTHROPIC_API_KEY` is set. Otherwise it falls back honestly.
- Real product images are not yet committed to `public/images/`; the landing is wired for them and placeholders still appear until binary assets are added.

## Known risks / things to test next
1. Run `npm run build` immediately after pulling this branch.
2. Manually test the customer flow: landing → entry → blank wall/room → openings → starter system → finish → estimate.
3. Verify the Perspective / Front / Top camera buttons work as intended on desktop and mobile.
4. Verify 3D wall visibility, corner markers, floor color, and opening placement feel natural rather than floating or muddy.
5. Verify starter systems add modules in useful positions and do not create confusing overlaps.
6. Verify AI assistant actions still work after the product-language shift.
7. Add real product-scale images to `public/images/` using `docs/ASSET-LIST.md`; avoid too-perfect AI images.
8. Cut-list grouping and multi-unit labor pricing remain correctness priorities.

## Design direction to preserve
Warm editorial, family-home scale, shippable modular systems. The planner after the landing page must not become a black SaaS app. Visuals should be practical and attainable: 48–72 inch benches, compact hutches, low storage, laundry alcoves, small wall systems. Avoid giant full kitchens, giant pantries, fantasy kid rooms, or repeated AI-perfect rooms.

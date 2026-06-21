# For AI collaborators — read this first

This project is built collaboratively by multiple AIs (Claude, GPT) plus the owner. **GitHub is the source of truth.** Everything needed to continue from a cold start lives in this repo — start here, then read the docs below.

## Working rules
- **Branch:** work only on `premium-ui-pass` unless told otherwise.
- **Pull before you start:** `git fetch origin && git checkout premium-ui-pass && git pull origin premium-ui-pass`.
- **Source changes only**, then build. Do not hand-edit `dist/`.
- **Before finishing:** run `npm run build`, fix all errors, update the docs you touched, then `git add . && git commit -m "..." && git push origin premium-ui-pass`.
- Do **not** force-push without explicit approval.

## Current product direction
The brand pivoted from a broad custom cabinetry studio to **House of Nook**: warm, premium, shippable modular built-ins for real family homes.

Lead with small, realistic, garage-buildable systems:
- Mudroom Nook / entry bench / hall tree
- Coffee Nook / compact hutch
- Laundry Nook / utility storage
- Playroom or Montessori storage
- Reading bench / book nook
- Simple low kids storage bed

Do **not** lead with giant full kitchens, full walk-in pantries, mansion-scale built-ins, or anything that looks unshippable from a small shop. Bunk beds are future-only until safety/compliance work is done.

## Read these, in order
1. `docs/HANDOFF.md` — current state, what changed, what is broken, next steps. Read first, update last.
2. `docs/DESIGN-SYSTEM.md` — House of Nook palette, component rules, 3D visual rules.
3. `docs/ASSET-LIST.md` — new image filenames and product-realism direction.
4. `docs/AI-BACKEND.md` — photo-analysis + design-assistant functions and how to enable them.
5. `docs/ARCHITECTURE.md` if present — how the code is organized; model/data flow.
6. `docs/ROADMAP.md` / `docs/UPGRADE-PLAN.md` if present — staged plan and older verdicts. Treat older Studio/custom-kitchen language as historical if it conflicts with this pivot.

## Core invariant
`Room + Unit[] → buildParts/buildProject → Part[] → 3D / pricing / cut list / export`.
Keep `src/model/` pure: no React, no three.js.

## Visual direction
Warm, editorial, approachable, and realistic. The landing page sets the tone: ivory/parchment surfaces, walnut CTAs, champagne/brass hairlines, oak/walnut materials, soft but clear shadows. The planner after the landing page must follow the same palette and must not revert to a black SaaS app shell.

## AI honesty
Photo upload and AI planner must never imply unsupported functionality. If a backend function or key is missing, say so and continue manually.

## Handy commands
- `npm run dev` — local app (no serverless functions).
- `netlify dev` with `ANTHROPIC_API_KEY` — app + `/api/*` functions for AI.
- `npm run build` — typecheck + production build; must pass before committing.
- `npm run bundle` — regenerate `project-bundle.md` if needed.

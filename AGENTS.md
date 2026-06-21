# For AI collaborators (and future me) — read this first

This project is built collaboratively by multiple AIs (Claude, GPT) plus the
owner. **GitHub is the source of truth.** Everything needed to continue from a
cold start lives in this repo — start here, then read the docs below.

## Working rules
- **Branch:** work only on `premium-ui-pass` unless told otherwise.
- **Pull before you start:** `git fetch origin && git checkout premium-ui-pass && git pull origin premium-ui-pass`.
- **Source changes only**, then build. Do not hand-edit `dist/`.
- **Before finishing:** run `npm run build`, fix all errors, update the docs you
  touched, then `git add . && git commit -m "..." && git push origin premium-ui-pass`.
- Do **not** force-push without explicit approval.

## Read these, in order
1. `docs/HANDOFF.md` — **current state**: what changed, what's broken, next steps. The
   living status doc — read it first, update it last.
2. `docs/ARCHITECTURE.md` — how the code is organized; the data model and pipeline.
3. `docs/DESIGN-SYSTEM.md` — palette, components, 3D visual rules.
4. `docs/ROADMAP.md` + `docs/UPGRADE-PLAN.md` — the staged plan and per-phase verdicts.
5. `docs/ASSET-LIST.md` — image filenames the landing expects in `public/images/`.
6. `docs/AI-BACKEND.md` — the photo-analysis + design-assistant functions and how to enable them.

## Core invariant (don't break)
`Room + Unit[] → buildParts/buildProject → Part[] → 3D / pricing / cut list / export`.
Keep `src/model/` pure (no React, no three.js).

## Direction
Warm, editorial, elegant, high-end, realistic custom cabinetry — not generic SaaS,
not heavy-black. Keep the customer flow simple; hide maker/advanced details behind a
flag. Keep photo upload and any AI honest: never imply a feature works without its
backend connected.

## Handy
- `npm run dev` — local app (no serverless functions).
- `netlify dev` (with `ANTHROPIC_API_KEY` set) — app + `/api/*` functions for AI.
- `npm run build` — typecheck + production build (must pass before committing).
- `npm run bundle` — regenerate `project-bundle.md` (whole codebase in one file) to hand to another AI.

> Note: Claude Code also keeps a private per-project memory that auto-loads for
> Claude sessions, but it is **not** in this repo and other AIs can't see it. This
> repo + its docs are the canonical, shared record — keep them current.

# House of Nook Planner

A warm, customer-facing planner for **shippable modular built-ins**: mudroom nooks, coffee hutches, laundry utility nooks, Montessori/playroom storage, reading benches, and simple storage beds.

The product strategy is smaller and more scalable than full custom kitchens: start with garage-buildable modules that can be crated, shipped, and installed in real family homes.

## Running the app

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

For AI photo analysis / Ask Nook locally, use Netlify functions:

```bash
npm i -g netlify-cli
ANTHROPIC_API_KEY=sk-ant-... netlify dev
```

## Current customer flow

1. Landing page explains House of Nook and shippable nook systems.
2. Entry screen lets the customer upload a space photo, start with a blank wall/room, or design a single module.
3. Room step defines the wall/space envelope.
4. Openings step adds nearby windows/doors only when they affect the module.
5. Pieces step adds starter systems or individual modules.
6. Quote step shows a planning estimate before measurement, crate, and shipping review.

## Core architecture

The invariant is still:

```
Room + Unit[]  ->  buildParts/buildProject  ->  Part[]  ->  3D / pricing / cut list / export
```

Keep `src/model/` pure. React and three.js should stay outside the model layer.

## Key files

| File | Purpose |
| --- | --- |
| `src/screens/Welcome.tsx` | House of Nook landing page. |
| `src/screens/EntryChoice.tsx` | Start method: photo, blank room/wall, or single module. |
| `src/Wizard.tsx` | Planner shell and step navigation. |
| `src/steps/RoomStep.tsx` | Wall/room setup. |
| `src/steps/OpeningsStep.tsx` | Windows/doors that affect the nook. |
| `src/steps/PiecesStep.tsx` | Starter systems and module editing. |
| `src/steps/QuoteStep.tsx` | Planning estimate. |
| `src/scene/` | 3D room and module preview. |
| `src/model/` | Unit model, construction, materials, room shapes, part generation. |
| `src/pricing/` | Pricing config and engine. |
| `netlify/functions/` | AI photo analysis and Ask Nook backend. |
| `docs/HANDOFF.md` | Current project status — read first. |
| `docs/DESIGN-SYSTEM.md` | House of Nook visual/product rules. |
| `docs/ASSET-LIST.md` | Image filenames and visual direction. |
| `AGENTS.md` | Instructions for Claude/GPT/future AI collaborators. |

## Important positioning note

Do not lead with giant kitchens, massive pantries, or mansion-scale built-ins. House of Nook should feel premium but attainable: smaller modules, real homes, realistic shipping, warm woods, soft painted finishes, and family-friendly utility.

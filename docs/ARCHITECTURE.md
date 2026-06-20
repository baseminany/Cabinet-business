# Architecture

How the code is organized, so any developer or AI can navigate it cold. Pair with
[`ROADMAP.md`](./ROADMAP.md) (what we're building). Keep this file current when the
structure changes.

## One-paragraph mental model
A **Project** is a `Room` (an editable wall outline) plus a list of **Units**
(cabinets, shelves…). Each Unit is a typed parametric spec. The pure function
**`buildParts(unit)`** turns a Unit into exact physical `Part[]`. The whole project
is turned into parts by **`buildProject(units)`**. Those parts are the single
source of truth that feeds **three outputs that can never disagree**: the 3D
preview, the price, and the cut list / shop exports.

```
Room + Unit[]  ──►  buildParts/buildProject  ──►  Part[]  ──┬─►  3D preview (r3f)
 (what the user                                             ├─►  price (engine + config)
  designs)                                                  └─►  cut list · CSV/JSON · SketchUp
```

## Directory map
```
src/
  model/        DATA + PURE LOGIC (no React, no 3D)
    types.ts        Unit, Part, BuiltUnit, enums
    catalog.ts      product presets (base/upper/tall/shelf…) + construction options
    construction.ts shop construction constants (thicknesses, reveals, hinge rules)
    buildParts.ts   buildParts(unit) + buildProject(units)  ← the heart
    materials.ts    finish look (color/label) for the 3D + labels
    room.ts         Room model (shape, dims, openings) + Placement
    roomShapes.ts   footprint(room) → wall segments (dir/normal/angle)
  pricing/
    pricing.config.ts  THE owner's private numbers (the only file to edit for $)
    engine.ts          priceModel(parts, config) → transparent line items
  cutlist/
    aggregate.ts   group parts into cut-list rows
    exporters.ts   CSV + JSON (SketchUp-ready)
  export/
    sketchup.ts    OpenCutList-friendly Ruby generator
  scene/           3D (react-three-fiber) — reads model, renders parts
    Scene.tsx, CabinetMesh.tsx, Room.tsx
  steps/           guided wizard step panels (one concern each)
  controls/        reusable inputs (fields, swatches, shared icons)
  screens/         full-screen screens (Welcome, entry choice)
  store.ts         Zustand app state (room, units, selection, wizard step, view)
  Wizard.tsx       wizard shell (progress, preview, panel, nav)
  App.tsx          routes: welcome → entry → wizard ; maker mode
```

## Core data model (`src/model/types.ts`)
- **`Unit`** = `{ id, type, label, overall{w,h,d}, sections, shelvesPerSection,
  door, toeKick, materials, construction{carcass,doorStyle,overlay}, mountHeight,
  placement{wallIndex,offset} }`. `mountHeight` lifts uppers/shelves off the floor.
- **`Part`** = one physical piece: cut dims, grain, banded edges, material, plus
  `position`/`size3d` for the 3D scene and SketchUp.

## Where to add things (common tasks)
- **New product type** → add a preset in `catalog.ts`; if its geometry differs,
  branch in `buildParts.ts` (e.g., floating shelf = a single board). It then
  automatically appears in 3D, pricing, and the cut list.
- **New finish/look** → `materials.ts` (color) + a cost entry in
  `pricing.config.ts` keyed by the same id.
- **Change a price** → `pricing.config.ts` only. Nothing else.
- **Change how it's built** (thickness, reveal, hinge rule) → `construction.ts`.
- **New wizard step** → a component in `steps/`, register it in `Wizard.tsx`.

## Pricing model (multi-unit)
`buildProject(units)` concatenates every unit's parts. `priceModel` sums part area
**per material across the whole project**, divides by usable sheet area (yield),
rounds **up to whole sheets once**, ×sheet cost. So cost-per-unit falls as units
share sheets. Then edge banding, hardware (counted from parts), finish, labor,
overhead, margin → customer price. Every line is shown; nothing is hidden.

## Integration seams (future, keep these clean)
- **Stripe (Phase 6):** the project already serializes to JSON (`projectJSON`).
  A backend endpoint takes that + the computed price → creates a Stripe Checkout
  session. Keep all money math in `pricing/`; the client never sets prices.
- **AI render (Phase 6):** a deterministic export already exists — model JSON +
  a canvas screenshot (`renderer.domElement.toDataURL()`). A backend job composes
  a prompt from the *measured* inputs (dims, finishes, room, layout) + the
  screenshot → image model → returns an image URL. This is owner-side only; never
  surfaced as a user control.
- **Photo → room (Phase 3):** entry already supports a photo upload; a backend
  vision step returns an estimated footprint that seeds `roomShapes`, which the
  user then adjusts with real measurements.

## Conventions
- `model/` stays pure (testable, no React/three) so logic is portable and
  reviewable in isolation.
- Inches everywhere; 1 three.js unit = 1 inch.
- The three outputs must always derive from `Part[]` — never recompute geometry
  separately.

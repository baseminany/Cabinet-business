# Studio — Full Source Bundle (for AI review)

Generated 2026-06-20. One file with the entire codebase so another AI can review it cold.

**READ FIRST:** docs/ARCHITECTURE.md, docs/ROADMAP.md, docs/UPGRADE-PLAN.md (below).

_Note: src/pricing/pricing.config.ts has real material costs — redact before sharing publicly._

====================================================================
FILE: docs/ARCHITECTURE.md
====================================================================
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

====================================================================
FILE: docs/ROADMAP.md
====================================================================
# Product Roadmap & Vision

> The north star: a **made-to-measure custom cabinetry design platform**. A
> homeowner with a non-standard space (e.g., a pantry needing 14"-deep cabinets
> at specific widths) designs their full room — base cabinets, uppers, tall
> pantries, floating shelves, vanities, sinks, countertops — in 3D, gets accurate
> pricing, optionally a photoreal render, and orders. We build to their exact
> dimensions and **ship nationally** (not local hand-install).

This doc is the single source of truth for *what we're building and why*. It is
written to be handed to any AI or developer cold. Pair it with
[`ARCHITECTURE.md`](./ARCHITECTURE.md) (how the code is organized).

---

## Answers to open questions (from the owner)

**"One cabinet is >$1,500 — does it drop as more are added (material efficiency)?"**
Yes, and the engine is built for it. Sheet goods are bought as whole 48×96 sheets.
Pricing sums *all* part areas per material across *every* unit, divides by usable
sheet area (yield), and rounds up to whole sheets **once for the whole project** —
not per cabinet. So two cabinets sharing a material often fit on fewer sheets than
2× one cabinet → lower cost per unit. A single small cabinet looks expensive
because it still "uses" most of a sheet plus fixed labor/overhead/margin. (Future:
true 2D nesting/bin-packing for even tighter yield — see Phase 5.)

**"Are you integrating a plywood cut list as choices are made?"**
Yes. `buildParts()` already turns every unit into exact parts; the cut list and
pricing read the *same* parts, so they update live as the user designs. With
multi-unit, parts aggregate across all units (`buildProject()`).

**"Can we collect payment (Stripe)?"** Architected for, not live yet — needs a
backend. See Phase 6 + `ARCHITECTURE.md` › Integration seams.

**"Headless-browser screenshot → ChatGPT image render, hidden from the user?"**
Architected for. The app can already produce a deterministic spec (model JSON +
a canvas screenshot). The render pipeline is a backend job: capture → build a
prompt from the measured inputs → image model → deliver to customer. See Phase 6.

---

## Construction taxonomy (what "custom cabinetry" actually means)

Encoded so pricing, cut list, and 3D can all respect it.

- **Carcass style:** `frameless` (Euro; full-access, modern) · `face-frame`
  (traditional; a solid-wood frame on the front).
- **Door overlay:** `full-overlay` (doors cover the face, ~1/8" reveals) ·
  `partial-overlay` (doors sit partly over the frame) · `inset` (doors flush
  *inside* the frame — premium, tighter tolerances).
- **Door style:** `slab` (flat) · `shaker` (5-piece frame+panel) · later: raised
  panel, beaded, glass.
- **Unit types:** base, wall/upper, tall/pantry, floating shelf, vanity/sink base,
  open shelving, appliance/filler panels, countertop (reference + priced).
- **Finishes:** prefinished ply (natural), stain-grade veneers (white oak plain/
  rift, walnut), **painted to a custom color** (Sherwin-Williams / Benjamin Moore
  name + code — we match it), laminate.
- **Hardware:** Blum soft-close hinges, undermount slides, pulls, shelf pins.

See `ARCHITECTURE.md` for which of these affect geometry vs. only pricing today.

---

## Phased plan

### ✅ Phase 0 — Single-cabinet foundation (done)
Parametric model → 3D + cut list + transparent pricing; SketchUp/OCL export;
guided wizard; deployed to Netlify.

### ▶ Phase 1 — Multi-unit + usability (THIS PHASE, in progress)
- **Multiple units** in one design: add base / upper / tall / floating shelf from
  a catalog; select, edit, duplicate, delete; each its own size + placement.
- **Start empty** — no pre-placed room or cabinet. Entry choice: *Build your own
  space* or *Upload a photo* (photo stored as a reference now).
- **Project pricing & cut list across all units** (shared-sheet efficiency).
- **Visual clarity overhaul** — distinct, legible materials (walls vs floor vs
  cabinets vs glass), IKEA-planner-style readability.
- **Landing copy** — made-to-measure, ship nationally.

### Phase 2 — Catalog depth & construction options
- Sink base, vanity, countertop (reference geometry + priced), appliance/filler
  panels, open shelving, drawers (Blum drawer-box math already specified).
- Construction options in the UI: frameless/face-frame, overlay type, slab/shaker
  — flowing into geometry, cut list, and price.
- **Custom paint color** picker: brand + color name + code, shown on the unit and
  carried into the quote and shop order.

### Phase 3 — Room input that's intuitive
- **Top-down floor-plan view** so room-shape differences are obvious instantly
  (the current 3-D-only view hides them).
- **Draw-your-own-room**: drag wall corners; type exact wall lengths.
- **Photo upload → room understanding**: a vision step estimates the footprint
  from a photo; user confirms/adjusts walls with real measurements. (Backend +
  vision model; see Integration seams.)

### Phase 4 — Layout intelligence
Snap units to walls and to each other; collision/overlap warnings; counter runs;
auto-fillers/scribes at walls; reveals consistent across a run.

### Phase 5 — Pricing precision
True 2D nesting (bin-packing parts onto sheets) for accurate yield; per-region
material/labor rates; lead time + shipping estimate by dimensions/weight/zip.

### Phase 6 — Commerce & renders (needs backend)
- **Stripe** checkout / deposits.
- **AI render pipeline** (headless screenshot + measured inputs → image model →
  customer), run server-side, invisible to the user.
- Accounts, saved designs, quote history, shop order packets (cut list + SketchUp
  + hardware + render) emailed to the shop.

---

## Aesthetic direction
Reference: IKEA Home Planner / room-planner tools — clean, bright, *legible*
separation between surfaces. Warm, high-end, calm. Clear material distinction so
walls, floor, glass, and cabinetry never blend. Premium serif display + clean
sans; generous whitespace; one confident accent. The look must signal "expensive,
trustworthy, custom."

====================================================================
FILE: docs/UPGRADE-PLAN.md
====================================================================
# Upgrade Plan — assessment + sequencing (from the GPT 16-phase proposal)

This captures the full upgrade direction so it survives context compression. Each
phase: my verdict, priority, and whether it needs a backend. Build top-down.
Core invariant (do NOT break): `Room + Unit[] → buildParts/buildProject → Part[] →
3D / pricing / cut list / export`; `model/` stays pure (no React/three).

## Verdict in one line
The plan is **mostly good and correctly opinionated** (honest photo fallback, action-
based AI not chat-text, hide maker mode, keep model pure, prefer app-state actions over
headless browser). Main risks: it's huge, and Phases 5/11/12-backend are premature until
there's a backend. Sequence by impact × feasibility-without-backend.

## Design direction (agreed)
Premium, restrained, architectural — Apple restraint + luxury interior studio. Dark hero
sections; warm porcelain/ivory panels; deep walnut, obsidian, champagne brass, muted stone.
**Drop the clay/orange feel.** 3D must clearly separate walls / floor / cabinetry / glass /
trim / countertop / selected.

## Phases

| # | Phase | Verdict | Priority | Backend? |
|---|-------|---------|----------|----------|
| 1 | Global visual system (tokens, shadows, radii, CSS utils) | ✅ Do | **P0 foundation** | No |
| 2 | Landing redesign (dark cinematic hero + mock visual card) | ✅ Do | **P0** | No |
| 3 | Entry choice redesign (3 cards, honest photo state) | ✅ Do | **P0** | No |
| 4 | Photo→room flow (adapter + service + review step + honest fallback) | ✅ Do (client adapter now; AI later) | **P0** (fixes "upload broken") | Yes for real AI |
| 5 | AI design assistant (action schema + executor + chat panel) | ✅ Architecture good; ⚠️ defer chat/LLM | P2 | Yes (LLM) |
| 6 | 3D realism (lighting, reveals, pulls, brass selection, materials) | ✅ Do partial (brass select + material/light now; reveals/pulls later) | P1 | No |
| 7 | Top-down minimap (wall numbers, placement) | ✅ Great, low-cost | P1 | No |
| 8 | Materials upgrade (hide ply-back from customers; richer swatches; more finishes; split carcass/door pickers) | ✅ Do (hide ply-back now; richer cards next) | P1 | No |
| 9 | Wizard UX (quick-add cards, presets, progressive disclosure) | ✅ Good | P2 | No |
| 10 | Validation/smart rules (overlap, fits wall, ceiling, etc.) | ✅ Do | P1 | No (`model/validation.ts`, pure) |
| 11 | Auto-layout (snap, runs, under-window, fillers) | ✅ Good; powers AI | P2 | No |
| 12 | Quote + lead form (honest copy, export fallback) | ✅ Do (form + honest fallback now; submit endpoint later) | P1 | Yes for submit |
| 13 | Maker-mode security (hide behind ?maker=1 / localStorage / env) | ✅ Do — important | **P0** | No |
| 14 | Render pipeline seams (exportDesignSnapshot, captureSceneScreenshot, buildRenderPrompt) | ✅ Stubs only | P2 | Yes (image model) |
| 15 | Website polish (loading/empty states, transitions, mobile, copy) | ✅ Ongoing | P1 | No |
| 16 | Build + acceptance | ✅ Always | — | No |

## What I'm building THIS pass (P0 slice)
1, 2, 3, 4 (honest client flow + graceful fallback), 13, plus 8-partial (hide ply-back),
6-partial (brass selection color). Everything else above is staged here, in priority order.

## Backend (when ready) — contracts to implement
- **Photo analysis:** `POST VITE_ROOM_ANALYSIS_ENDPOINT` (default `/api/analyze-room`),
  FormData image → `RoomAnalysisResult` JSON (see `src/model/roomAnalysis.ts`). Never fake
  success; keys server-side. UX language: "We created a *starting* layout — confirm
  measurements before ordering," never "we measured exactly."
- **AI assistant:** client sends `{room, openings, units, selectedId, analysis, warnings,
  message}` → LLM returns strict `{message, actions: DesignAction[], questions?, warnings?}`;
  client runs `executeDesignActions`. Action-based, not free text. Headless browser only for
  render screenshots, never for design commands.
- **Lead submit:** `POST` project JSON + contact → CRM/email. Until then, export JSON + say
  "not connected yet."
- **Render:** server takes room+units+finishes+scene screenshot → photoreal magazine render;
  prompt generated from measured design (customer never edits prompt).

## Honest-product rules (keep)
Never claim exact measurement from a photo. Customer never sees cost breakdown / cut list /
SketchUp (maker-only). No API secrets in frontend. `model/` pure.

====================================================================
FILE: README.md
====================================================================
# Cabinet Configurator — v1

A parametric configurator for custom wood built-ins. One model of a cabinet drives
three outputs at once that always agree:

1. a live **3D preview** (orbit / pan / zoom, to scale),
2. a transparent **customer price**, and
3. a shop **cut list** you can export.

v1 builds one product type: a floor-to-ceiling **frameless (Euro) pantry** with
adjustable shelves and full-overlay slab doors.

---

## Running the app

You need **Node.js** (already installed on this machine at `~/.local/node`).

From this folder (`Cabinet Business`), in your Terminal:

```bash
npm install      # first time only — downloads the libraries
npm run dev      # starts the app, opens http://localhost:5173
```

Leave that running. Edit a file, save, and the browser updates automatically.
Press `Ctrl+C` in the Terminal to stop it.

> If your Terminal can't find `node` or `npm`, open a **new** Terminal window
> (the installer added Node to your shell startup), or run:
> `export PATH="$HOME/.local/node/bin:$PATH"`

To make a production build: `npm run build`, then `npm run preview`.

---

## Using it

- **Left panel** — type sizes and choose options (sections, shelves, doors, toe
  kick, materials). Everything updates instantly.
- **Middle** — the 3D model. Left-drag orbits, right-drag pans, scroll zooms.
- **Right panel** — two tabs:
  - **Price** — the full cost breakdown, line by line.
  - **Cut List** — every part with dimensions, grain, and edge banding.
    Buttons export **CSV** (for the shop) and **JSON** (structured for a future
    SketchUp importer).

---

## How it's built (the important part)

Everything flows from one place:

```
CabinetModel  ──►  buildParts(model)  ──►  Part[]  ──┬──►  3D preview
(what you type)    (construction rules)              ├──►  cut list + exports
                                                     └──►  price breakdown
```

`buildParts()` is the single source of truth. The picture, the price, and the cut
list all read the same parts, so they can never disagree.

Key files:

| File | What it is |
| --- | --- |
| `src/model/types.ts` | The data shapes: `CabinetModel` and `Part`. |
| `src/model/construction.ts` | **How your shop builds** — thicknesses, reveals, hinge rules. Edit to change methods. |
| `src/model/buildParts.ts` | Turns the model into real parts (the heart of it). |
| `src/model/materials.ts` | The *look* of each material (color/label) for the 3D view. |
| `src/pricing/pricing.config.ts` | **Your private prices.** The only file to edit for money. |
| `src/pricing/engine.ts` | Pure arithmetic — turns parts + prices into a breakdown. |

---

## ⚠️ Numbers to fill in (pricing)

The pricing engine works, but only **one** number is real so far: your carcass
sheet (UV pre-finished ply, **$120 / 48×96**). Everything else is a clearly
flagged placeholder. Open **`src/pricing/pricing.config.ts`** and replace each
value marked `⚠️ PLACEHOLDER`. The app shows an amber ⚠️ on every price line that
still uses a placeholder, and the warning banner disappears as you clear them.

Checklist (also kept in the config file):

- [ ] Door material sheet cost (currently a `painted-white` placeholder)
- [ ] Back material sheet cost (`ply-back` placeholder)
- [ ] Specialty veneer sheet costs (white oak, walnut)
- [ ] Edge banding cost per linear foot
- [ ] Hinge / shelf pin / pull unit costs
- [ ] Finishing method + rate (or confirm parts are pre-finished)
- [ ] Labor shop rate + hours per unit
- [ ] CNC / machine rate per sheet (if any)
- [ ] Overhead: fixed dollars + percent
- [ ] Target margin / markup percent

---

## Not in v1 (planned, but architected around)

Room scanning (camera/LiDAR), user accounts, payments, a multi-product catalog,
and AR preview. The model / parts / pricing separation leaves clean seams to add
these later without a rewrite.

====================================================================
FILE: package.json
====================================================================
{
  "name": "cabinet-configurator",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "bundle": "bash scripts/bundle.sh"
  },
  "dependencies": {
    "@react-three/drei": "^9.114.0",
    "@react-three/fiber": "^8.17.10",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "three": "^0.169.0",
    "zustand": "^4.5.5"
  },
  "devDependencies": {
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.0",
    "@types/three": "^0.169.0",
    "@vitejs/plugin-react": "^4.3.2",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.13",
    "typescript": "^5.6.2",
    "vite": "^5.4.8"
  }
}

====================================================================
FILE: vite.config.ts
====================================================================
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite is the dev server + bundler. `npm run dev` starts a local web server
// (default http://localhost:5173) that live-reloads when you save a file.
export default defineConfig({
  plugins: [react()],
  server: { open: true },
  // Relative asset paths so the built site works from any host or subfolder
  // (Netlify, Vercel, GitHub Pages, a drag-and-drop deploy, etc.).
  base: './',
});

====================================================================
FILE: tailwind.config.js
====================================================================
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Inter for clean UI text, Fraunces (a warm serif) for headings & price.
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      colors: {
        // Luxury system: deep walnut/espresso primary (replaces the old orange clay).
        // Existing `clay-*` usages now read as refined walnut — de-oranges the whole app.
        clay: {
          50: '#f3ece2',
          100: '#e7d8c6',
          200: '#cdb495',
          300: '#a98a66',
          400: '#7e5a3c',
          500: '#5a3b27',
          600: '#41291b',
          700: '#2e1c12',
          800: '#21140d',
          900: '#150c07',
        },
        // Named luxury tokens (use these in new components).
        obsidian: '#0b0b0a',
        charcoal: '#171412',
        espresso: '#211813',
        walnut: '#4b2e20',
        walnutSoft: '#6e4a36',
        porcelain: '#fafafa',
        warmWhite: '#ffffff',
        parchment: '#f0efec',
        champagne: '#d9c6a3',
        brass: '#b88a44',
        deepGreen: '#173b33',
        sageStone: '#73806f',
        blueStone: '#718493',
        // Warm near-black for headings + body (replaces washed-out grays).
        ink: {
          DEFAULT: '#241c15',
          soft: '#4a4038',
          muted: '#736658',
        },
        // Clean near-white surfaces (de-beiged — editorial white look).
        ivory: {
          DEFAULT: '#fafafa',
          50: '#ffffff',
          100: '#f6f6f5',
          200: '#eaeae8',
        },
        ink: {
          DEFAULT: '#14110e',
          soft: '#45403a',
          muted: '#8a847c',
        },
        // Champagne/antique-brass accent (rules, eyebrows, selected outlines).
        gold: {
          300: '#e2cfa6',
          400: '#d2b67e',
          500: '#b88a44',
          600: '#9a7338',
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(20,14,8,0.05), 0 10px 28px rgba(20,14,8,0.07)',
        card: '0 2px 6px rgba(20,14,8,0.07), 0 18px 44px rgba(20,14,8,0.12)',
        lift: '0 12px 28px rgba(20,14,8,0.18)',
        premiumCard: '0 1px 0 rgba(255,253,248,0.6) inset, 0 4px 12px rgba(20,14,8,0.06), 0 30px 60px -20px rgba(20,14,8,0.22)',
        premiumGlow: '0 0 0 1px rgba(217,198,163,0.25), 0 20px 60px -15px rgba(184,138,68,0.25)',
        darkPanel: '0 30px 80px -30px rgba(0,0,0,0.65)',
      },
      borderRadius: {
        control: '14px',
        card: '24px',
        panel: '32px',
      },
    },
  },
  plugins: [],
};

====================================================================
FILE: src/App.tsx
====================================================================
import { useStore, makerEnabled } from './store';
import Welcome from './screens/Welcome';
import EntryChoice from './screens/EntryChoice';
import PhotoRoomReviewStep from './steps/PhotoRoomReviewStep';
import Wizard from './Wizard';
import Scene from './scene/Scene';
import RightPanel from './RightPanel';

export default function App() {
  const view = useStore((s) => s.view);
  const step = useStore((s) => s.step);
  const setView = useStore((s) => s.setView);

  // Maker mode: shop tools (cut list, pricing, exports) — owner only, gated.
  if (view === 'maker' && makerEnabled()) {
    return (
      <div className="flex h-full min-h-0 flex-col bg-ivory text-ink">
        <header className="flex items-center justify-between border-b border-ivory-200 bg-white px-5 py-3">
          <span className="font-display text-lg font-semibold text-ink">Studio · Maker</span>
          <button onClick={() => setView('design')} className="rounded-full px-4 py-2 text-sm font-semibold text-ink-soft transition hover:bg-ivory-100">
            ← Back to design
          </button>
        </header>
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <main className="relative h-[40vh] min-w-0 flex-1 md:h-auto" style={{ background: 'radial-gradient(120% 90% at 50% 12%, #fbf7f0 0%, #efe3d2 60%, #e4d3b8 100%)' }}>
            <Scene />
          </main>
          <RightPanel />
        </div>
      </div>
    );
  }

  if (step === 'welcome') {
    return (
      <div className="flex h-full min-h-0 flex-col">
        <Welcome />
      </div>
    );
  }

  if (step === 'entry') {
    return (
      <div className="flex h-full min-h-0 flex-col">
        <EntryChoice />
      </div>
    );
  }

  if (step === 'photoReview') {
    return (
      <div className="flex h-full min-h-0 flex-col">
        <PhotoRoomReviewStep />
      </div>
    );
  }

  return <Wizard />;
}

====================================================================
FILE: src/components/Img.tsx
====================================================================
import { useState } from 'react';

// Image slot. Loads /images/<name> (drop real photos into public/images/). Until
// the file exists it shows a clean, intentional placeholder — never beige.
export default function Img({ name, alt, className = '', label }: { name: string; alt: string; className?: string; label?: string }) {
  const [failed, setFailed] = useState(false);
  const src = `${import.meta.env.BASE_URL}images/${name}`;
  if (failed) {
    return (
      <div className={`flex items-center justify-center bg-neutral-100 ${className}`}>
        <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-neutral-400">{label ?? 'Image'}</span>
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`object-cover ${className}`} />;
}

====================================================================
FILE: src/controls/ControlsPanel.tsx
====================================================================
// Replaced by the guided wizard step components in src/steps/. Kept as a stub to
// avoid breaking imports; safe to delete.
export default function ControlsPanel() {
  return null;
}

====================================================================
FILE: src/controls/fields.tsx
====================================================================
// Friendly, consumer-grade form controls. Warm palette, generous touch targets.
import type { ReactNode } from 'react';

export function Section({ title, subtitle, children }: { title?: string; subtitle?: string; children: ReactNode }) {
  return (
    <section>
      {title && (
        <div className="mb-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">{title}</h3>
          {subtitle && <p className="mt-1 text-xs text-ink-muted">{subtitle}</p>}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function DimensionSlider({
  label,
  value,
  min,
  max,
  step = 0.25,
  unit = 'in',
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (n: number) => void;
}) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-sm font-medium text-ink-soft">{label}</span>
        <span className="flex items-baseline gap-1">
          <input
            type="number"
            inputMode="decimal"
            value={Number.isFinite(value) ? value : ''}
            min={min}
            max={max}
            step={step}
            onChange={(e) => {
              const n = parseFloat(e.target.value);
              if (!Number.isNaN(n)) onChange(clamp(n));
            }}
            className="w-16 rounded-lg border border-ivory-200 bg-ivory-50 px-2 py-1.5 text-right text-sm font-semibold text-ink outline-none focus:border-clay-400 focus:ring-2 focus:ring-clay-100"
          />
          <span className="text-xs text-ink-muted">{unit}</span>
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={Number.isFinite(value) ? value : min} onChange={(e) => onChange(clamp(parseFloat(e.target.value)))} className="w-full" />
    </div>
  );
}

export function Stepper({ label, value, min = 0, max = 99, onChange }: { label: string; value: number; min?: number; max?: number; onChange: (n: number) => void }) {
  const set = (n: number) => onChange(Math.min(max, Math.max(min, n)));
  const btn =
    'flex h-11 w-11 items-center justify-center rounded-xl border border-ivory-200 bg-white text-xl font-medium text-ink-soft transition hover:border-clay-300 hover:text-clay-600 active:scale-95 disabled:opacity-40';
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-ink-soft">{label}</span>
      <div className="flex items-center gap-2.5">
        <button type="button" className={btn} onClick={() => set(value - 1)} disabled={value <= min}>−</button>
        <span className="w-7 text-center text-base font-semibold tabular-nums text-ink">{value}</span>
        <button type="button" className={btn} onClick={() => set(value + 1)} disabled={value >= max}>+</button>
      </div>
    </div>
  );
}

export interface CardOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

export function OptionCards<T extends string>({ value, options, onChange, columns = 3 }: { value: T; options: CardOption<T>[]; onChange: (v: T) => void; columns?: number }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={
              'flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3.5 transition active:scale-[0.98] ' +
              (active ? 'border-clay-500 bg-clay-50 shadow-soft' : 'border-ivory-200 bg-white hover:border-clay-200')
            }
          >
            {o.icon && <span className={active ? 'text-clay-600' : 'text-ink-muted'}>{o.icon}</span>}
            <span className={'text-xs font-semibold ' + (active ? 'text-clay-700' : 'text-ink-soft')}>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex w-full items-center justify-between">
      <span className="text-sm font-medium text-ink-soft">{label}</span>
      <span className={'relative inline-flex h-7 w-12 items-center rounded-full transition ' + (checked ? 'bg-clay-600' : 'bg-ivory-200')}>
        <span className={'inline-block h-6 w-6 transform rounded-full bg-white shadow transition ' + (checked ? 'translate-x-5' : 'translate-x-0.5')} />
      </span>
    </button>
  );
}

====================================================================
FILE: src/controls/MaterialSwatches.tsx
====================================================================
// A visual material picker: rounded swatches a customer can actually see, with
// the selected one ringed and named. Replaces the old dropdown.
import { MATERIALS, type MaterialDef } from '../model/materials';
import type { MaterialId } from '../model/types';

/** Darken a #rrggbb hex by an amount (0..1) for a subtle grain gradient. */
function shade(hex: string, amount: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const f = (c: number) => Math.max(0, Math.round(c * (1 - amount)));
  return `rgb(${f(r)}, ${f(g)}, ${f(b)})`;
}

/** A CSS background that hints at the material — soft grain for wood, sheen for paint. */
export function swatchBackground(m: MaterialDef): string {
  if (m.kind === 'wood') {
    return `repeating-linear-gradient(115deg, ${m.color} 0 4px, ${shade(
      m.color,
      0.12
    )} 4px 7px), linear-gradient(160deg, ${shade(m.color, -0.0)} , ${shade(m.color, 0.18)})`;
  }
  // painted / laminate: smooth with a soft top highlight
  return `linear-gradient(155deg, ${shade(m.color, -0.04)} 0%, ${m.color} 45%, ${shade(
    m.color,
    0.1
  )} 100%)`;
}

export default function MaterialSwatches({
  label,
  value,
  onChange,
}: {
  label: string;
  value: MaterialId;
  onChange: (id: MaterialId) => void;
}) {
  const selected = MATERIALS.find((m) => m.id === value);
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-sm font-medium text-ink-soft">{label}</span>
        <span className="text-xs text-ink-muted">{selected?.label}</span>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {MATERIALS.filter((m) => m.customerFacing !== false).map((m) => {
          const active = m.id === value;
          return (
            <button
              key={m.id}
              type="button"
              title={m.label}
              onClick={() => onChange(m.id)}
              className={
                'h-11 w-11 rounded-full ring-offset-2 ring-offset-white transition ' +
                (active ? 'ring-2 ring-clay-600 scale-105 shadow-soft' : 'ring-1 ring-ivory-200 hover:scale-105')
              }
              style={{ background: swatchBackground(m) }}
            />
          );
        })}
      </div>
    </div>
  );
}

====================================================================
FILE: src/controls/shared.tsx
====================================================================
// Shared control bits used across the guided steps.
import type { DoorConfig } from '../model/types';
import type { RoomShape } from '../model/room';
import { SHAPE_LABELS } from '../model/roomShapes';
import type { CardOption } from './fields';

export function DoorIcon({ kind }: { kind: DoorConfig }) {
  return (
    <svg width="34" height="30" viewBox="0 0 34 30" fill="none" className="stroke-current" strokeWidth="1.6">
      <rect x="3" y="2" width="28" height="26" rx="2" />
      {kind === 'single' && <line x1="24" y1="2" x2="24" y2="28" />}
      {kind === 'double' && <line x1="17" y1="2" x2="17" y2="28" />}
      {kind === 'none' && (
        <>
          <line x1="3" y1="10" x2="31" y2="10" strokeDasharray="2 2" />
          <line x1="3" y1="19" x2="31" y2="19" strokeDasharray="2 2" />
        </>
      )}
    </svg>
  );
}

export const doorOptions: CardOption<DoorConfig>[] = [
  { value: 'none', label: 'Open', icon: <DoorIcon kind="none" /> },
  { value: 'single', label: 'Single', icon: <DoorIcon kind="single" /> },
  { value: 'double', label: 'Double', icon: <DoorIcon kind="double" /> },
];

export function ShapeIcon({ shape }: { shape: RoomShape }) {
  const c = 'fill-current opacity-90';
  switch (shape) {
    case 'rect':
      return <svg width="30" height="24" viewBox="0 0 30 24"><rect x="3" y="3" width="24" height="18" className={c} /></svg>;
    case 'l':
      return <svg width="30" height="24" viewBox="0 0 30 24"><path d="M3 3h24v11H15v7H3z" className={c} /></svg>;
    case 'u':
      return <svg width="30" height="24" viewBox="0 0 30 24"><path d="M3 3h24v18h-7v-9h-10v9H3z" className={c} /></svg>;
    case 'alcove':
      return <svg width="30" height="24" viewBox="0 0 30 24"><path d="M3 7h7V3h10v4h7v14H3z" className={c} /></svg>;
    case 'corner':
      return <svg width="30" height="24" viewBox="0 0 30 24"><path d="M3 3h17l7 7v11H3z" className={c} /></svg>;
  }
}

export const shapeOptions: CardOption<RoomShape>[] = (['rect', 'l', 'u', 'alcove', 'corner'] as RoomShape[]).map((s) => ({
  value: s,
  label: SHAPE_LABELS[s],
  icon: <ShapeIcon shape={s} />,
}));

/** Compact wall chooser (Wall 1..N). */
export function WallPicker({ count, value, onChange }: { count: number; value: number; onChange: (i: number) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className={
            'h-8 min-w-8 rounded-lg px-2.5 text-xs font-semibold transition ' +
            (value === i ? 'bg-clay-600 text-white shadow-soft' : 'bg-white text-ink-soft ring-1 ring-ivory-200 hover:ring-clay-300')
          }
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
}

====================================================================
FILE: src/cutlist/aggregate.ts
====================================================================
// =============================================================================
// CUT LIST AGGREGATION
// =============================================================================
// buildParts() emits one Part per physical piece. For a shop cut list we want
// identical pieces grouped into a single row with a quantity. This groups parts
// that share the same name, material, dimensions, grain, and banding.
// =============================================================================

import type { EdgeId, Grain, Part } from '../model/types';
import { getMaterial } from '../model/materials';

export interface CutListRow {
  name: string;
  materialId: string;
  materialLabel: string;
  qty: number;
  length: number;
  width: number;
  thickness: number;
  grain: Grain;
  bandedEdges: EdgeId[];
  notes?: string;
}

/** Round to 1/16" so tiny float noise doesn't split otherwise-identical rows. */
function r16(n: number): number {
  return Math.round(n * 16) / 16;
}

export function aggregateParts(parts: Part[]): CutListRow[] {
  const map = new Map<string, CutListRow>();

  for (const p of parts) {
    const length = r16(p.length);
    const width = r16(p.width);
    const thickness = r16(p.thickness);
    const banded = [...p.bandedEdges].sort().join('');
    const key = [p.name, p.material, length, width, thickness, p.grain, banded].join('|');

    const existing = map.get(key);
    if (existing) {
      existing.qty += 1;
    } else {
      map.set(key, {
        name: p.name,
        materialId: p.material,
        materialLabel: getMaterial(p.material).label,
        qty: 1,
        length,
        width,
        thickness,
        grain: p.grain,
        bandedEdges: p.bandedEdges,
        notes: p.notes,
      });
    }
  }

  // Stable, shop-friendly ordering: by material, then largest parts first.
  return [...map.values()].sort(
    (a, b) =>
      a.materialLabel.localeCompare(b.materialLabel) ||
      b.length * b.width - a.length * a.width
  );
}

/** Human label for which edges are banded, e.g. "Front" for a single L1 edge. */
export function bandedLabel(edges: EdgeId[]): string {
  if (edges.length === 0) return '—';
  if (edges.length === 4) return 'All 4';
  const names: Record<EdgeId, string> = {
    L1: 'Front',
    L2: 'Back',
    W1: 'Top',
    W2: 'Bottom',
  };
  return edges.map((e) => names[e]).join(', ');
}

/** Format inches as a decimal, trimming trailing zeros (e.g. 22.5, 0.75). */
export function inches(n: number): string {
  return parseFloat(n.toFixed(3)).toString();
}

====================================================================
FILE: src/cutlist/CutList.tsx
====================================================================
// =============================================================================
// CUT LIST TABLE + export buttons (Maker view)
// =============================================================================
import { useMemo } from 'react';
import { useStore } from '../store';
import { buildProject } from '../model/buildParts';
import { aggregateParts, bandedLabel, inches } from './aggregate';
import { cutListCSV, downloadText, projectJSON } from './exporters';
import { cabinetRubyScript } from '../export/sketchup';

export default function CutList() {
  const units = useStore((s) => s.units);
  const unit = useMemo(() => buildProject(units), [units]);
  const rows = useMemo(() => aggregateParts(unit.parts), [unit]);
  const totalPieces = rows.reduce((n, r) => n + r.qty, 0);

  const exportBtn =
    'rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 transition hover:border-clay-300 hover:text-clay-700';

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-stone-200 px-3 py-2.5">
        <span className="text-xs text-stone-500">
          {rows.length} part types · {totalPieces} pieces
        </span>
        <div className="flex gap-2">
          <button className={exportBtn} onClick={() => downloadText('cut-list.csv', cutListCSV(unit), 'text/csv')}>
            Export CSV
          </button>
          <button
            className={exportBtn}
            onClick={() => downloadText('cabinet.json', projectJSON(units, unit), 'application/json')}
          >
            Export JSON
          </button>
          <button
            className={exportBtn}
            onClick={() => downloadText('cabinet-sketchup.rb', cabinetRubyScript(units, unit), 'text/x-ruby')}
          >
            SketchUp (.rb)
          </button>
        </div>
      </div>

      <div className="nice-scroll min-h-0 flex-1 overflow-auto">
        <table className="w-full border-collapse text-xs">
          <thead className="sticky top-0 bg-stone-50 text-stone-500">
            <tr className="text-left">
              <th className="px-2 py-2 font-semibold">Part</th>
              <th className="px-2 py-2 font-semibold">Material</th>
              <th className="px-2 py-2 text-right font-semibold">Qty</th>
              <th className="px-2 py-2 text-right font-semibold">Length</th>
              <th className="px-2 py-2 text-right font-semibold">Width</th>
              <th className="px-2 py-2 text-right font-semibold">Thick</th>
              <th className="px-2 py-2 font-semibold">Grain</th>
              <th className="px-2 py-2 font-semibold">Banded</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-stone-100 text-stone-700">
                <td className="px-2 py-1.5 font-medium text-stone-800">{r.name}</td>
                <td className="px-2 py-1.5 text-stone-500">{r.materialLabel}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{r.qty}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{inches(r.length)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{inches(r.width)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{inches(r.thickness)}</td>
                <td className="px-2 py-1.5 text-stone-500">{r.grain}</td>
                <td className="px-2 py-1.5 text-stone-500">{bandedLabel(r.bandedEdges)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

====================================================================
FILE: src/cutlist/exporters.ts
====================================================================
// =============================================================================
// EXPORTERS — CSV (for the shop) and JSON (for a future SketchUp importer)
// =============================================================================

import type { BuiltUnit, Unit } from '../model/types';
import { aggregateParts, bandedLabel, inches } from './aggregate';

/** Trigger a browser download of a text file. */
export function downloadText(filename: string, text: string, mime: string) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function csvCell(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** The aggregated cut list as CSV. */
export function cutListCSV(unit: BuiltUnit): string {
  const rows = aggregateParts(unit.parts);
  const header = [
    'Part',
    'Material',
    'Qty',
    'Length (in)',
    'Width (in)',
    'Thickness (in)',
    'Grain',
    'Banded Edges',
    'Notes',
  ];
  const lines = [header.map(csvCell).join(',')];
  for (const r of rows) {
    lines.push(
      [
        r.name,
        r.materialLabel,
        r.qty,
        inches(r.length),
        inches(r.width),
        inches(r.thickness),
        r.grain,
        bandedLabel(r.bandedEdges),
        r.notes ?? '',
      ]
        .map(csvCell)
        .join(',')
    );
  }
  return lines.join('\n');
}

/**
 * Full structured JSON. Shaped so a later SketchUp importer can rebuild the
 * model: every part carries `position` (center, inches) and `size3d` (w/h/d).
 * Also includes the aggregated cut list and hardware counts for convenience.
 */
export function projectJSON(units: Unit[], built: BuiltUnit): string {
  const payload = {
    meta: {
      app: 'cabinet-configurator',
      schema: 'cabinet-project.v2',
      units: 'in',
      generatedAt: new Date().toISOString(),
    },
    design: units, // the editable design (all units)
    parts: built.parts, // per-instance, with position + size3d for 3D rebuild
    hardware: built.hardware,
    cutList: aggregateParts(built.parts),
  };
  return JSON.stringify(payload, null, 2);
}

====================================================================
FILE: src/export/sketchup.ts
====================================================================
// =============================================================================
// SKETCHUP RUBY EXPORT (OpenCutList-friendly)
// =============================================================================
// Generates a .rb script you can paste into SketchUp's Ruby Console (or save as
// a file and load). It rebuilds the cabinet as named component instances with
// tags + materials, ready for OpenCutList, and prints a validation report —
// following the shop conventions in the master prompt.
//
// Coordinate mapping (this app → SketchUp):
//   app x (left→right)  → SU x (red)
//   app z (back→front)  → SU y (green)
//   app y (floor→up)    → SU z (blue, up)
// Dimensions are emitted in inches via `.inch`.
// =============================================================================

import type { BuiltUnit, Part, Unit } from '../model/types';
import { getMaterial } from '../model/materials';
import { pricing } from '../pricing/pricing.config';

const MODULE = 'StudioCabinet_V1';
const MASTER = 'STUDIO_Cabinet_A';

/** Tag (SketchUp layer) for each part role, per the naming conventions. */
function tagFor(role: Part['role']): string {
  switch (role) {
    case 'door':
      return 'Doors_Fronts';
    case 'back':
      return 'Backs';
    case 'shelf':
      return 'Shelves';
    case 'toekick':
      return 'Trim_ToeKick';
    case 'divider':
    case 'side':
    case 'top':
    case 'bottom':
    default:
      return 'Carcasses';
  }
}

/** OCL instance name, e.g. CAB_A_SideL, CAB_A_Shelf_3. */
// Instance name from the (unit-namespaced) part name, e.g. "Base 1 · Side (Left)"
// → "Base_1_Side_Left". Keeps each unit's parts distinct in the model tree.
function instanceName(part: Part): string {
  return part.name.replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(',');
}

function r3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

interface RubyPart {
  defKey: string;
  defName: string;
  instName: string;
  tag: string;
  matKey: string;
  // SketchUp dimensions + center (inches)
  sx: number;
  sy: number;
  sz: number;
  cx: number;
  cy: number;
  cz: number;
}

export function cabinetRubyScript(units: Unit[], built: BuiltUnit): string {
  const rubyParts: RubyPart[] = [];
  const matKeys = new Set<string>();

  for (const part of built.parts) {
    const sx = r3(part.size3d.w);
    const sy = r3(part.size3d.d);
    const sz = r3(part.size3d.h);
    const cx = r3(part.position.x);
    const cy = r3(part.position.z);
    const cz = r3(part.position.y);
    const tag = tagFor(part.role);
    // Definition is reused across identical parts → OCL counts quantity.
    const defKey = `${part.name}|${part.material}|${sx}x${sy}x${sz}|${tag}`;
    const defName = `${part.name} ${part.length}x${part.width}x${part.thickness}`.replace(/"/g, 'in');
    matKeys.add(part.material);
    rubyParts.push({
      defKey,
      defName,
      instName: instanceName(part),
      tag,
      matKey: part.material,
      sx,
      sy,
      sz,
      cx,
      cy,
      cz,
    });
  }

  // Material table: id → [display name, "r,g,b"]
  const materialRows = [...matKeys].map((id) => {
    const m = getMaterial(id);
    const note = pricing.materials[id]?.note ?? m.label;
    return `    "${id}" => ["${note.replace(/"/g, "'")}", [${hexToRgb(m.color)}]],`;
  });

  const tagSet = [...new Set(rubyParts.map((p) => p.tag))];
  // Plus the tags we reserve for future/site/reference parts.
  const allTags = [...new Set([...tagSet, 'Trim', 'Environment', 'Site', 'Reference'])];

  const partRows = rubyParts.map(
    (p) =>
      `    {def: "${p.defKey}", dname: "${p.defName}", name: "${p.instName}", tag: "${p.tag}", mat: "${p.matKey}", ` +
      `w: ${p.sx}, d: ${p.sy}, h: ${p.sz}, cx: ${p.cx}, cy: ${p.cy}, cz: ${p.cz}},`
  );

  // ---- Validation report (computed here, printed by the script) ----
  const doors = built.parts.filter((d) => d.role === 'door');
  const reportLines: string[] = [];
  reportLines.push(`Project: ${units.length} unit(s)`);
  units.forEach((u) => reportLines.push(`  ${u.label} [${u.type}]: ${u.overall.width} W x ${u.overall.height} H x ${u.overall.depth} D in`));
  reportLines.push(`Totals: ${doors.length} doors, ${built.parts.filter((p) => p.role === 'shelf').length} shelves`);
  reportLines.push(`Hardware: ${built.hardware.hinges} hinges, ${built.hardware.pulls} pulls, ${built.hardware.shelfPins} shelf pins`);
  const painted = (id: string) => id.startsWith('painted');
  doors.forEach((d, i) => {
    const rec = d.length >= 50 ? 4 : d.length >= 40 ? 3 : 2;
    let msg = `Door ${i + 1}: ${r3(d.length)}" tall -> ${rec} hinges`;
    if (d.length >= 50 && painted(d.material)) msg += '  [WARN: tall painted slab — balance finish, store flat, watch for bow]';
    if (d.width >= 24 && painted(d.material)) msg += '  [WARN: wide painted slab — warp risk]';
    reportLines.push(msg);
  });
  reportLines.push('Backs are 1/4" for squareness (cut later for plumbing if needed).');
  reportLines.push('TBD/site parts not yet in model: wall fillers, scribes, toe-kick levelers, crown/scribe-to-ceiling, reference countertop.');

  const reportPuts = reportLines.map((l) => `  puts "  ${l.replace(/"/g, "'")}"`).join('\n');

  // ---------------------------------------------------------------------------
  // The generated Ruby script. (Ruby uses #{} for interpolation — no clash with
  // this file's ${} template literals.)
  // ---------------------------------------------------------------------------
  return `# =============================================================================
# ${MASTER} — generated by Studio (cabinet configurator)
# Paste into SketchUp's Ruby Console, or save as a .rb and use Plugins > load.
# Idempotent: re-running removes the previous "${MASTER}" group and rebuilds.
# OpenCutList: parts are component instances with tags + materials.
# =============================================================================
module ${MODULE}
  MASTER_NAME = "${MASTER}"

  MATERIALS = {
${materialRows.join('\n')}
  }

  TAGS = [${allTags.map((t) => `"${t}"`).join(', ')}]

  PARTS = [
${partRows.join('\n')}
  ]

  def self.ensure_material(model, id)
    name, rgb = MATERIALS[id]
    name ||= id
    m = model.materials[name] || model.materials.add(name)
    m.color = Sketchup::Color.new(rgb[0], rgb[1], rgb[2]) if rgb
    m
  end

  def self.get_def(model, cache, key, dname, w, d, h)
    return cache[key] if cache[key]
    defn = model.definitions.add(dname)
    ents = defn.entities
    f = ents.add_face([0, 0, 0], [w.inch, 0, 0], [w.inch, d.inch, 0], [0, d.inch, 0])
    f.pushpull(h.inch)
    cache[key] = defn
    defn
  end

  def self.build
    model = Sketchup.active_model
    model.start_operation("Build #{MASTER_NAME}", true)
    begin
      # Idempotent: erase a previous build with the same name.
      model.active_entities.grep(Sketchup::Group).each do |g|
        g.erase! if g.name == MASTER_NAME
      end

      TAGS.each { |t| model.layers.add(t) }

      master = model.active_entities.add_group
      master.name = MASTER_NAME

      cache = {}
      PARTS.each do |p|
        defn = get_def(model, cache, p[:def], p[:dname], p[:w], p[:d], p[:h])
        corner = Geom::Point3d.new((p[:cx] - p[:w] / 2.0).inch,
                                   (p[:cy] - p[:d] / 2.0).inch,
                                   (p[:cz] - p[:h] / 2.0).inch)
        t = Geom::Transformation.translation(corner - defn.bounds.min)
        inst = master.entities.add_instance(defn, t)
        inst.name = p[:name]
        inst.layer = p[:tag]
        inst.material = ensure_material(model, p[:mat])
      end

      model.definitions.purge_unused
      model.commit_operation

      puts "================ ${MASTER} — VALIDATION ================"
${reportPuts}
      puts "  Parts placed: #{PARTS.length}"
      puts "======================================================="
    rescue => e
      model.abort_operation
      puts "BUILD FAILED: #{e.message}"
      puts e.backtrace.join("\\n")
      raise
    end
  end
end

${MODULE}.build
`;
}

====================================================================
FILE: src/index.css
====================================================================
@tailwind base;
@tailwind components;
@tailwind utilities;

html,
body,
#root {
  height: 100%;
  margin: 0;
}

body {
  font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
  color: #14110e;
  background: #ffffff;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

#root {
  display: flex;
  flex-direction: column;
}

.font-display {
  font-family: 'Fraunces', Georgia, serif;
}

/* Friendly, on-brand range sliders. */
input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  border-radius: 9999px;
  background: #e3d4bf;
  outline: none;
}
input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 22px;
  height: 22px;
  border-radius: 9999px;
  background: #ffffff;
  border: 2px solid #8f4824;
  box-shadow: 0 1px 4px rgba(40, 28, 16, 0.3);
  cursor: pointer;
  transition: transform 0.08s ease;
}
input[type='range']::-webkit-slider-thumb:active {
  transform: scale(1.12);
}
input[type='range']::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 9999px;
  background: #ffffff;
  border: 2px solid #8f4824;
  cursor: pointer;
}

.nice-scroll::-webkit-scrollbar {
  width: 10px;
}
.nice-scroll::-webkit-scrollbar-thumb {
  background: #d3c2a8;
  border-radius: 9999px;
  border: 3px solid transparent;
  background-clip: content-box;
}
.nice-scroll::-webkit-scrollbar-thumb:hover {
  background: #bda988;
  background-clip: content-box;
}

/* Gentle entrance for step content. */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.fade-up { animation: fadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
.fade-up-2 { animation: fadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.08s both; }
.fade-up-3 { animation: fadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.16s both; }

/* ---- Luxury utility classes ---- */
.eyebrow {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.32em;
  text-transform: uppercase;
}
.premium-card {
  background: #f7f3ea;
  border-radius: 24px;
  box-shadow: 0 1px 0 rgba(255, 253, 248, 0.6) inset, 0 4px 12px rgba(20, 14, 8, 0.06),
    0 30px 60px -20px rgba(20, 14, 8, 0.2);
  border: 1px solid rgba(217, 198, 163, 0.28);
}
.glass-panel {
  background: rgba(23, 20, 18, 0.55);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(217, 198, 163, 0.18);
  border-radius: 24px;
}
.premium-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: #211813;
  color: #f7f3ea;
  font-weight: 600;
  box-shadow: 0 10px 24px -10px rgba(0, 0, 0, 0.6);
  transition: transform 0.12s ease, background 0.2s ease, box-shadow 0.2s ease;
}
.premium-button:hover { background: #0b0b0a; box-shadow: 0 14px 30px -10px rgba(0, 0, 0, 0.7); }
.premium-button:active { transform: scale(0.98); }
.premium-button-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: transparent;
  color: #f0e9da;
  font-weight: 600;
  border: 1px solid rgba(217, 198, 163, 0.4);
  transition: border-color 0.2s ease, background 0.2s ease;
}
.premium-button-secondary:hover { border-color: rgba(217, 198, 163, 0.85); background: rgba(217, 198, 163, 0.08); }
.soft-divider { height: 1px; background: rgba(217, 198, 163, 0.28); }
.scene-vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  box-shadow: inset 0 0 120px 40px rgba(20, 14, 8, 0.12);
}

====================================================================
FILE: src/main.tsx
====================================================================
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

====================================================================
FILE: src/model/buildParts.ts
====================================================================
// =============================================================================
// buildParts(model) — THE source of truth
// =============================================================================
// Pure function: same model in → same parts out, no side effects. It applies the
// frameless construction rules from construction.ts to the user's design and
// produces one Part per physical piece of wood, plus a hardware tally.
//
// Coordinate system (inches), matching types.ts:
//   x: left(-) → right(+)   width
//   y: floor(0) → up        height
//   z: back(-) → front(+)   depth
// Each Part's `position` is the CENTER of its box.
// =============================================================================

import { CONSTRUCTION as C } from './construction';
import type { BuiltUnit, EdgeId, Part, Unit } from './types';

export function buildParts(unit: Unit): BuiltUnit {
  // Floating shelf = a single solid board (its own simple geometry).
  if (unit.type === 'shelf') return buildShelf(unit);

  const parts: Part[] = [];
  let n = 0;
  const id = (role: string) => `${role}-${n++}`;

  const T = C.carcassThickness;
  const TB = C.backThickness;

  const W = unit.overall.width;
  const H = unit.overall.height;
  const D = unit.overall.depth;

  const tk = unit.toeKick.enabled ? unit.toeKick.height : 0;

  // The carcass box sits on top of the toe kick (if any).
  const carcassBottomY = tk;
  const Hc = H - tk; // carcass height
  const carcassCenterY = carcassBottomY + Hc / 2;

  const mat = unit.materials;

  // Interior opening (between the two side panels).
  const interiorWidth = W - 2 * T;
  const interiorHeight = Hc - 2 * T;
  const bottomInsideY = carcassBottomY + T;

  // Front/back z extents.
  const frontZ = D / 2;
  const backInsideZ = -D / 2 + TB; // front face of the back panel

  // ---------------------------------------------------------------------------
  // CARCASS: 2 sides, top, bottom, back
  // ---------------------------------------------------------------------------

  // Sides — full height, full depth, captured nothing (they capture top/bottom).
  for (const side of [-1, 1] as const) {
    parts.push({
      id: id('side'),
      name: side < 0 ? 'Side (Left)' : 'Side (Right)',
      role: 'side',
      material: mat.carcass,
      length: Hc, // grain runs vertically
      width: D,
      thickness: T,
      grain: 'length',
      bandedEdges: ['L1'], // front vertical edge shows → banded
      position: { x: side * (W / 2 - T / 2), y: carcassCenterY, z: 0 },
      size3d: { w: T, h: Hc, d: D },
    });
  }

  // Top & Bottom — captured between the sides (so width = interior width).
  const tbBanded: EdgeId[] = ['L1']; // front edge
  parts.push({
    id: id('bottom'),
    name: 'Bottom',
    role: 'bottom',
    material: mat.carcass,
    length: interiorWidth,
    width: D,
    thickness: T,
    grain: 'length',
    bandedEdges: tbBanded,
    position: { x: 0, y: bottomInsideY - T / 2, z: 0 },
    size3d: { w: interiorWidth, h: T, d: D },
  });
  parts.push({
    id: id('top'),
    name: 'Top',
    role: 'top',
    material: mat.carcass,
    length: interiorWidth,
    width: D,
    thickness: T,
    grain: 'length',
    bandedEdges: tbBanded,
    position: { x: 0, y: carcassBottomY + Hc - T / 2, z: 0 },
    size3d: { w: interiorWidth, h: T, d: D },
  });

  // Back — 1/4" panel inset against the rear, no banding (edges are hidden).
  parts.push({
    id: id('back'),
    name: 'Back Panel',
    role: 'back',
    material: mat.back,
    length: interiorHeight, // grain vertical
    width: interiorWidth,
    thickness: TB,
    grain: 'length',
    bandedEdges: [],
    position: { x: 0, y: carcassCenterY, z: backInsideZ - TB / 2 },
    size3d: { w: interiorWidth, h: interiorHeight, d: TB },
  });

  // ---------------------------------------------------------------------------
  // SECTIONS: vertical dividers + the per-section openings
  // ---------------------------------------------------------------------------
  const S = Math.max(1, Math.floor(unit.sections));

  // Each opening is equal; dividers (S-1 of them) eat T of width each.
  const openingWidth = (interiorWidth - (S - 1) * T) / S;

  // Depth of dividers/shelves: from the back panel face to just behind the front.
  const dividerDepth = D - TB; // dividers run nearly full depth
  const dividerCenterZ = (frontZ + backInsideZ) / 2;

  const shelfDepth = D - TB - C.shelfFrontSetback;
  const shelfCenterZ = (frontZ - C.shelfFrontSetback + backInsideZ) / 2;

  // Left inside edge of the interior.
  const interiorLeftX = -W / 2 + T;

  // Walk across the sections, placing dividers between them and shelves within.
  const sectionCenters: number[] = [];
  let cursorX = interiorLeftX; // left edge of the current opening
  for (let s = 0; s < S; s++) {
    const openingCenterX = cursorX + openingWidth / 2;
    sectionCenters.push(openingCenterX);

    // Adjustable shelves, evenly spaced in the interior height.
    const nShelves = Math.max(0, Math.floor(unit.shelvesPerSection));
    for (let k = 1; k <= nShelves; k++) {
      const y = bottomInsideY + (k * interiorHeight) / (nShelves + 1);
      parts.push({
        id: id('shelf'),
        name: 'Adj. Shelf',
        role: 'shelf',
        material: mat.carcass,
        length: openingWidth, // grain runs left-right
        width: shelfDepth,
        thickness: C.shelfThickness,
        grain: 'length',
        bandedEdges: ['L1'], // front edge shows → banded
        position: { x: openingCenterX, y, z: shelfCenterZ },
        size3d: { w: openingWidth, h: C.shelfThickness, d: shelfDepth },
      });
    }

    // Advance cursor past this opening; place a divider if more sections follow.
    cursorX += openingWidth;
    if (s < S - 1) {
      const dividerCenterX = cursorX + T / 2;
      parts.push({
        id: id('divider'),
        name: 'Divider',
        role: 'divider',
        material: mat.carcass,
        length: interiorHeight, // grain vertical
        width: dividerDepth,
        thickness: T,
        grain: 'length',
        bandedEdges: ['L1'], // front edge shows → banded
        position: { x: dividerCenterX, y: carcassCenterY, z: dividerCenterZ },
        size3d: { w: T, h: interiorHeight, d: dividerDepth },
      });
      cursorX += T;
    }
  }

  // ---------------------------------------------------------------------------
  // DOORS: full-overlay slabs across the front
  // ---------------------------------------------------------------------------
  // N equal doors span the carcass front with a uniform gap around and between.
  const doorsPerSection = unit.door === 'none' ? 0 : unit.door === 'single' ? 1 : 2;
  const N = doorsPerSection * S;

  if (N > 0) {
    const gap = C.doorGap;
    const doorHeight = Hc - 2 * gap;
    const totalDoorWidth = W - 2 * gap - (N - 1) * gap;
    const doorWidth = totalDoorWidth / N;
    const doorZ = frontZ + C.doorThickness / 2;
    const leftDoorEdge = -W / 2 + gap;

    for (let i = 0; i < N; i++) {
      const x = leftDoorEdge + doorWidth / 2 + i * (doorWidth + gap);
      parts.push({
        id: id('door'),
        name: 'Door',
        role: 'door',
        material: mat.doors,
        length: doorHeight, // grain vertical
        width: doorWidth,
        thickness: C.doorThickness,
        grain: 'length',
        bandedEdges: ['L1', 'L2', 'W1', 'W2'], // slab doors banded all around
        position: { x, y: carcassCenterY, z: doorZ },
        size3d: { w: doorWidth, h: doorHeight, d: C.doorThickness },
      });
    }
  }

  // ---------------------------------------------------------------------------
  // TOE KICK: a recessed base (front + back rail) under the carcass
  // ---------------------------------------------------------------------------
  if (tk > 0) {
    const railThk = C.toeKickRailThickness;
    const railLen = interiorWidth; // tucks between where the sides land
    const frontRailZ = frontZ - C.toeKickRecess - railThk / 2;
    const backRailZ = -D / 2 + railThk / 2;
    for (const [label, z] of [
      ['Toe Kick (Front)', frontRailZ],
      ['Toe Kick (Back)', backRailZ],
    ] as const) {
      parts.push({
        id: id('toekick'),
        name: label,
        role: 'toekick',
        material: mat.carcass,
        length: railLen, // grain horizontal
        width: tk,
        thickness: railThk,
        grain: 'length',
        bandedEdges: [], // hidden
        position: { x: 0, y: tk / 2, z },
        size3d: { w: railLen, h: tk, d: railThk },
      });
    }
  }

  // ---------------------------------------------------------------------------
  // HARDWARE TALLY
  // ---------------------------------------------------------------------------
  const doors = parts.filter((p) => p.role === 'door');
  const shelves = parts.filter((p) => p.role === 'shelf');
  const hinges = doors.reduce(
    (sum, d) => sum + C.hingesForDoorHeight(d.length),
    0
  );

  const hardware = {
    hinges,
    shelfPins: shelves.length * C.shelfPinsPerShelf,
    pulls: doors.length * C.pullsPerDoor,
    drawerSlides: 0,
  };

  return { parts, hardware };
}

/** A floating shelf: one solid board, banded on the exposed front + ends. */
function buildShelf(unit: Unit): BuiltUnit {
  const W = unit.overall.width;
  const Th = unit.overall.height; // board thickness
  const D = unit.overall.depth;
  const part: Part = {
    id: 'shelf-0',
    name: 'Floating Shelf',
    role: 'shelf',
    material: unit.materials.carcass,
    length: W,
    width: D,
    thickness: Th,
    grain: 'length',
    bandedEdges: ['L1', 'W1', 'W2'], // front + both ends show
    position: { x: 0, y: Th / 2, z: 0 },
    size3d: { w: W, h: Th, d: D },
    notes: 'Hollow torsion-box build at the shop; shown solid here.',
  };
  return { parts: [part], hardware: { hinges: 0, shelfPins: 0, pulls: 0, drawerSlides: 0 } };
}

/**
 * Build the WHOLE project (all units) into one merged part list for pricing,
 * the cut list, and exports. Parts are laid out in a simple row (units side by
 * side) so an exported model/cut list reads cleanly; the interactive 3D instead
 * positions each unit in the room (see scene/layout.ts). Part ids + names are
 * namespaced by unit so the cut list groups correctly.
 */
export function buildProject(units: Unit[]): BuiltUnit {
  const parts: Part[] = [];
  const hardware = { hinges: 0, shelfPins: 0, pulls: 0, drawerSlides: 0 };
  let cursorX = 0;
  const GAP = 6;

  for (const u of units) {
    const b = buildParts(u);
    for (const p of b.parts) {
      parts.push({
        ...p,
        id: `${u.id}-${p.id}`,
        name: `${u.label} · ${p.name}`,
        position: { x: p.position.x + cursorX, y: p.position.y, z: p.position.z },
      });
    }
    hardware.hinges += b.hardware.hinges;
    hardware.shelfPins += b.hardware.shelfPins;
    hardware.pulls += b.hardware.pulls;
    hardware.drawerSlides += b.hardware.drawerSlides;
    cursorX += u.overall.width + GAP;
  }
  return { parts, hardware };
}

====================================================================
FILE: src/model/catalog.ts
====================================================================
// =============================================================================
// PRODUCT CATALOG — the presets a customer can add to their design
// =============================================================================
// Each entry makes a ready-to-place Unit with sensible default dimensions for
// that product family. Everything stays fully editable after it's added. To add
// a new product type: add a UnitType in types.ts, a preset here, and (only if its
// geometry differs) a branch in buildParts.ts.
// =============================================================================

import type { Unit, UnitType, ConstructionStyle } from './types';

let _seq = 0;
const uid = () => `u${++_seq}`;

const DEFAULT_CONSTRUCTION: ConstructionStyle = {
  carcass: 'frameless',
  doorStyle: 'slab',
  overlay: 'full-overlay',
};

export interface CatalogEntry {
  type: UnitType;
  name: string;
  blurb: string;
}

export const CATALOG: CatalogEntry[] = [
  { type: 'base', name: 'Base cabinet', blurb: 'Floor cabinet — counters, vanities, islands' },
  { type: 'upper', name: 'Wall cabinet', blurb: 'Upper, mounted on the wall' },
  { type: 'tall', name: 'Tall / pantry', blurb: 'Floor-to-near-ceiling storage' },
  { type: 'shelf', name: 'Floating shelf', blurb: 'Open wall shelf' },
];

const NAMES: Record<UnitType, string> = { base: 'Base', upper: 'Upper', tall: 'Pantry', shelf: 'Shelf' };

/** Per-type running counts so labels read "Base 1", "Base 2"… */
const counts: Record<UnitType, number> = { base: 0, upper: 0, tall: 0, shelf: 0 };

export function makeUnit(type: UnitType): Unit {
  counts[type] += 1;
  const base = {
    id: uid(),
    type,
    label: `${NAMES[type]} ${counts[type]}`,
    sections: 1,
    construction: { ...DEFAULT_CONSTRUCTION },
    placement: { wallIndex: 0, offset: 0 },
    materials: { carcass: 'uv-ply-natural', doors: 'painted-white', back: 'ply-back' },
  };

  switch (type) {
    case 'base':
      return { ...base, overall: { width: 24, height: 34.5, depth: 24 }, shelvesPerSection: 1, door: 'double', toeKick: { enabled: true, height: 4.5 }, mountHeight: 0 };
    case 'upper':
      return { ...base, overall: { width: 30, height: 30, depth: 12 }, shelvesPerSection: 2, door: 'double', toeKick: { enabled: false, height: 0 }, mountHeight: 54 };
    case 'tall':
      return { ...base, overall: { width: 24, height: 84, depth: 24 }, shelvesPerSection: 4, door: 'double', toeKick: { enabled: true, height: 4.5 }, mountHeight: 0 };
    case 'shelf':
      return {
        ...base,
        overall: { width: 36, height: 1.5, depth: 10 },
        shelvesPerSection: 0,
        door: 'none',
        toeKick: { enabled: false, height: 0 },
        mountHeight: 48,
        materials: { carcass: 'white-oak', doors: 'white-oak', back: 'white-oak' },
      };
  }
}

====================================================================
FILE: src/model/construction.ts
====================================================================
// =============================================================================
// CONSTRUCTION RULES — how this shop builds a frameless (Euro) cabinet
// =============================================================================
// These constants encode YOUR building method. They are intentionally separate
// from the pricing so you can tune how parts are sized without touching money.
// Change a number here and the cut list + 3D model update accordingly.
//
// v1 method = frameless / Euro:
//   • 3/4" plywood carcass
//   • top & bottom captured BETWEEN the two full-height sides
//   • 1/4" back panel inset against the rear
//   • full-overlay 3/4" slab doors covering the carcass front
//   • optional recessed toe-kick base
// =============================================================================

export const CONSTRUCTION = {
  /** Plywood thickness for sides, top, bottom, shelves, dividers. */
  carcassThickness: 0.75 as number,

  /** Back panel thickness (typ. 1/4" plywood). */
  backThickness: 0.25 as number,

  /** Shelf material thickness (usually same sheet as the carcass). */
  shelfThickness: 0.75 as number,

  /** How far a shelf is held back from the front face (so doors clear). */
  shelfFrontSetback: 0.75 as number,

  /** Door material thickness. */
  doorThickness: 0.75 as number,

  /** Uniform gap/reveal around and between full-overlay doors. */
  doorGap: 0.125 as number,

  /** Default toe-kick height when enabled (editable per-unit in the UI too). */
  toeKickDefaultHeight: 4.0 as number,

  /** How far the toe-kick base is set back from the front face. */
  toeKickRecess: 3.0 as number,

  /** Toe-kick rail thickness. */
  toeKickRailThickness: 0.75 as number,

  // --- Hardware rules ---

  /** Shelf support pins per adjustable shelf (4 = one in each corner). */
  shelfPinsPerShelf: 4,

  /** One pull per door. */
  pullsPerDoor: 1,

  /**
   * Concealed hinges per door, by door height (inches). Standard rule of thumb:
   * taller doors need more hinges to stay flat and carry weight.
   */
  hingesForDoorHeight(heightIn: number): number {
    if (heightIn <= 40) return 2;
    if (heightIn <= 60) return 3;
    if (heightIn <= 80) return 4;
    return 5;
  },
} as const;

====================================================================
FILE: src/model/defaultModel.ts
====================================================================
import type { CabinetModel } from './types';

// A sensible starting cabinet so there's something on screen immediately:
// a 36"-wide, 84"-tall, 24"-deep two-bay pantry with painted doors.
export const defaultModel: CabinetModel = {
  units: 'in',
  overall: { width: 36, height: 84, depth: 24 },
  sections: 2,
  shelvesPerSection: 4,
  door: 'double',
  toeKick: { enabled: true, height: 4 },
  materials: {
    carcass: 'uv-ply-natural',
    doors: 'painted-white',
    back: 'ply-back',
  },
};

====================================================================
FILE: src/model/materials.ts
====================================================================
// =============================================================================
// MATERIAL CATALOG — the LOOK of each material (for the 3D preview + labels)
// =============================================================================
// This file is about appearance only: a name and a color/finish for the 3D
// scene. The COST of each material lives separately and privately in
// `src/pricing/pricing.config.ts`, keyed by the same id. Keeping look and price
// apart means you can share screenshots without exposing your numbers.
// =============================================================================

import type { MaterialId } from './types';

export interface MaterialDef {
  id: MaterialId;
  label: string;
  /** Base color shown in the 3D preview (hex). */
  color: string;
  /** 0 = glossy, 1 = flat. Rough guide for the 3D look. */
  roughness: number;
  /** How the part is finished — informational, also reused by pricing. */
  kind: 'wood' | 'painted' | 'laminate' | 'back';
  /** false = internal/maker-only (e.g. back panel), hidden from customer finish pickers. */
  customerFacing?: boolean;
}

// Customer-facing FINISHES (the look). Each maps to a real substrate + cost in
// pricing.config.ts via the same id. Painted finishes are MDF underneath.
export const MATERIALS: MaterialDef[] = [
  { id: 'uv-ply-natural', label: 'Natural Birch (UV)', color: '#dcc095', roughness: 0.55, kind: 'wood' },
  { id: 'white-oak', label: 'White Oak — Plain', color: '#ceae7a', roughness: 0.5, kind: 'wood' },
  { id: 'white-oak-rift', label: 'White Oak — Rift', color: '#d4b886', roughness: 0.48, kind: 'wood' },
  { id: 'walnut', label: 'Walnut', color: '#574030', roughness: 0.42, kind: 'wood' },
  { id: 'painted-white', label: 'Painted — Alabaster', color: '#efece4', roughness: 0.7, kind: 'painted' },
  { id: 'painted-greige', label: 'Painted — Greige', color: '#c8bca8', roughness: 0.72, kind: 'painted' },
  { id: 'painted-sage', label: 'Painted — Sage', color: '#8a9580', roughness: 0.72, kind: 'painted' },
  { id: 'painted-navy', label: 'Painted — Navy', color: '#33414f', roughness: 0.72, kind: 'painted' },
  { id: 'painted-charcoal', label: 'Painted — Charcoal', color: '#3a3d42', roughness: 0.72, kind: 'painted' },
  { id: 'ply-back', label: '1/4" Back (UV)', color: '#cdb084', roughness: 0.6, kind: 'back', customerFacing: false },
];

/** Finishes a customer can pick (hides internal/back-only materials). */
export const CUSTOMER_FINISHES = MATERIALS.filter((m) => m.customerFacing !== false);

const BY_ID: Record<string, MaterialDef> = Object.fromEntries(
  MATERIALS.map((m) => [m.id, m])
);

/** Look up a material's look; falls back to a neutral gray if unknown. */
export function getMaterial(id: MaterialId): MaterialDef {
  return BY_ID[id] ?? { id, label: id, color: '#9a9a9a', roughness: 0.6, kind: 'wood' };
}

====================================================================
FILE: src/model/room.ts
====================================================================
// =============================================================================
// ROOM MODEL — the customer's measured space (editable wall outline)
// =============================================================================
// A room is a SHAPE preset (rectangle, L, U, alcove, corner-pantry) plus a few
// fine-tune dimensions, which together define a footprint outline = a list of
// wall segments. Windows and doors are added by the customer, each pinned to a
// wall with its own measurements and a position along that wall.
//
// This wall-outline model is the same one a future free editor will use — so
// nothing here is throwaway.
//
// Floor plane is x–z (x right, z toward viewer); y is up. Footprints are
// centered on the origin.
// =============================================================================

export type RoomShape = 'rect' | 'l' | 'u' | 'alcove' | 'corner';

export type OpeningKind = 'window' | 'door';

export interface Opening {
  id: string;
  kind: OpeningKind;
  wallIndex: number; // which wall segment it sits on
  offset: number; // distance from the wall's midpoint, + toward the wall's end
  width: number;
  height: number;
  sill: number; // floor → bottom of a window; doors ignore (start at floor)
}

export interface RoomModel {
  enabled: boolean;
  shape: RoomShape;

  // Overall bounding size.
  width: number; // x
  length: number; // z
  height: number; // ceiling

  // Shape-specific fine-tuning (each shape reads what it needs).
  notchW: number; // L & U: width of the removed corner / slot
  notchL: number; // L & U: depth of the removed corner / slot
  recessW: number; // alcove: width of the niche
  recessD: number; // alcove: how far the niche pushes out
  corner: number; // corner-pantry: size of the 45° chamfer

  openings: Opening[];
}

/** Where the cabinet sits: snapped to a wall, slid along it. */
export interface Placement {
  wallIndex: number;
  offset: number; // along the wall from its midpoint, 0 = centered
}

export const WALL_THICKNESS = 4.5;

let _id = 0;
export function newOpening(kind: OpeningKind, wallIndex: number): Opening {
  _id += 1;
  return kind === 'window'
    ? { id: `op${_id}`, kind, wallIndex, offset: 0, width: 36, height: 48, sill: 36 }
    : { id: `op${_id}`, kind, wallIndex, offset: 0, width: 32, height: 80, sill: 0 };
}

export const defaultRoom: RoomModel = {
  enabled: true,
  shape: 'rect',
  width: 144,
  length: 132,
  height: 96,
  notchW: 60,
  notchL: 54,
  recessW: 48,
  recessD: 14,
  corner: 32,
  openings: [{ id: 'op0', kind: 'window', wallIndex: 0, offset: 40, width: 36, height: 48, sill: 36 }],
};

export const defaultPlacement: Placement = { wallIndex: 0, offset: 0 };

====================================================================
FILE: src/model/roomAnalysis.ts
====================================================================
// =============================================================================
// PHOTO → ROOM ANALYSIS (types)
// =============================================================================
// Shape of what a backend vision service returns for an uploaded room photo.
// Pure types — no React. The result is a STARTING DRAFT the customer confirms;
// we never claim exact measurement from a photo.
// =============================================================================

import type { RoomShape } from './room';

export type RoomScanStatus = 'idle' | 'analyzing' | 'success' | 'error';

export interface RoomAnalysisResult {
  version: '1.0';
  summary: string;
  confidence: number; // 0..1
  assumptions: string[];
  room: {
    shape: RoomShape;
    width?: number;
    length?: number;
    height?: number;
    notchW?: number;
    notchL?: number;
    recessW?: number;
    recessD?: number;
    corner?: number;
  };
  openings: Array<{
    kind: 'window' | 'door';
    wallIndex: number;
    offset: number;
    width: number;
    height: number;
    sill: number;
    confidence: number;
    label?: string;
  }>;
  recommendedCabinetZones: Array<{
    wallIndex: number;
    startOffset: number;
    endOffset: number;
    recommendedDepth: number;
    notes: string;
  }>;
  requiredMeasurements: Array<{
    key: string;
    label: string;
    reason: string;
    unit: 'in';
    value?: number;
  }>;
}

====================================================================
FILE: src/model/roomShapes.ts
====================================================================
// =============================================================================
// ROOM SHAPES — footprint outlines + wall segment geometry
// =============================================================================
// Each shape turns the room's dimensions into a list of corner points (in the
// x–z floor plane). From those we derive wall segments with the direction,
// outward normal, midpoint, length, and Y-rotation each needs to render and to
// snap cabinets / openings onto.
// =============================================================================

import type { RoomModel, RoomShape } from './room';

export type Vec2 = [number, number]; // [x, z]

export interface WallSeg {
  index: number;
  a: Vec2;
  b: Vec2;
  mid: Vec2;
  dir: Vec2; // unit vector a→b
  normal: Vec2; // unit outward normal (points away from the room interior)
  length: number;
  angleY: number; // Y-rotation so a box's local +x aligns with `dir`
  label: string; // friendly name for the wall picker
}

export interface Footprint {
  points: Vec2[];
  walls: WallSeg[];
}

export const SHAPE_LABELS: Record<RoomShape, string> = {
  rect: 'Rectangle',
  l: 'L-shape',
  u: 'U-shape',
  alcove: 'Alcove',
  corner: 'Corner',
};

// --- Footprint corner points per shape (clockwise from back-left) -----------
function points(room: RoomModel): Vec2[] {
  const W = room.width;
  const L = room.length;
  const x = W / 2;
  const z = L / 2;

  switch (room.shape) {
    case 'rect':
      return [
        [-x, -z],
        [x, -z],
        [x, z],
        [-x, z],
      ];

    case 'l': {
      // Notch removed from the front-right corner.
      const nw = Math.min(room.notchW, W - 12);
      const nl = Math.min(room.notchL, L - 12);
      return [
        [-x, -z],
        [x, -z],
        [x, z - nl],
        [x - nw, z - nl],
        [x - nw, z],
        [-x, z],
      ];
    }

    case 'u': {
      // Slot carved from the middle of the front wall.
      const nw = Math.min(room.notchW, W - 24);
      const nl = Math.min(room.notchL, L - 12);
      return [
        [-x, -z],
        [x, -z],
        [x, z],
        [nw / 2, z],
        [nw / 2, z - nl],
        [-nw / 2, z - nl],
        [-nw / 2, z],
        [-x, z],
      ];
    }

    case 'alcove': {
      // Niche pushed OUT of the back wall (great for nesting a built-in).
      const rw = Math.min(room.recessW, W - 24);
      const rd = room.recessD;
      return [
        [-x, -z],
        [-rw / 2, -z],
        [-rw / 2, -z - rd],
        [rw / 2, -z - rd],
        [rw / 2, -z],
        [x, -z],
        [x, z],
        [-x, z],
      ];
    }

    case 'corner': {
      // Back-right corner chamfered at 45° — where a corner pantry sits.
      const c = Math.min(room.corner, W - 12, L - 12);
      return [
        [-x, -z],
        [x - c, -z],
        [x, -z + c],
        [x, z],
        [-x, z],
      ];
    }
  }
}

function sub(a: Vec2, b: Vec2): Vec2 {
  return [a[0] - b[0], a[1] - b[1]];
}
function len(v: Vec2): number {
  return Math.hypot(v[0], v[1]);
}

/** Average of vertices — adequate "inside" reference for our shapes. */
function centroid(pts: Vec2[]): Vec2 {
  const s = pts.reduce<Vec2>((acc, p) => [acc[0] + p[0], acc[1] + p[1]], [0, 0]);
  return [s[0] / pts.length, s[1] / pts.length];
}

export function footprint(room: RoomModel): Footprint {
  const pts = points(room);
  const c = centroid(pts);
  const walls: WallSeg[] = [];

  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const e = sub(b, a);
    const l = len(e);
    if (l < 0.001) continue;
    const dir: Vec2 = [e[0] / l, e[1] / l];
    const mid: Vec2 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

    // Perpendicular, flipped to point away from the interior (centroid).
    let n: Vec2 = [dir[1], -dir[0]];
    const toMid: Vec2 = [mid[0] - c[0], mid[1] - c[1]];
    if (n[0] * toMid[0] + n[1] * toMid[1] < 0) n = [-n[0], -n[1]];

    walls.push({
      index: walls.length,
      a,
      b,
      mid,
      dir,
      normal: n,
      length: l,
      angleY: Math.atan2(-dir[1], dir[0]),
      label: `Wall ${walls.length + 1}`,
    });
  }

  return { points: pts, walls };
}

====================================================================
FILE: src/model/types.ts
====================================================================
// =============================================================================
// THE PARAMETRIC MODEL — the single source of truth
// =============================================================================
// Everything in the app flows from `CabinetModel`. You change a value here
// (via the controls panel), and the 3D preview, the cut list, and the price all
// recompute from it. Two layers:
//
//   CabinetModel  — the high-level design (what you type: sizes, counts, options)
//   Part          — one physical piece of wood produced from the model
//
// `buildParts(model)` turns the first into a list of the second. The 3D scene,
// the cut list, and the pricing engine ALL read that same list, so they can
// never disagree with each other.
// =============================================================================

/** All measurements in this app are inches. This alias just documents intent. */
export type Inches = number;

/**
 * A material id. The human-facing look (color, label) lives in
 * `src/model/materials.ts`; the cost lives privately in
 * `src/pricing/pricing.config.ts`. Both are keyed by this id.
 */
export type MaterialId = string;

/** Door layout for the cabinet front. "full overlay" slab doors. */
export type DoorConfig = 'none' | 'single' | 'double';

/** The design the user edits. These are the only "inputs". */
export interface CabinetModel {
  units: 'in';

  /** Outer envelope of the whole unit, floor to (intended) ceiling. */
  overall: {
    width: Inches;
    height: Inches;
    depth: Inches;
  };

  /** Number of vertical bays, split by interior dividers. (1 = open box.) */
  sections: number;

  /** Adjustable shelves in EACH section. */
  shelvesPerSection: number;

  /** Doors per section. Full overlay slab. */
  door: DoorConfig;

  /** Recessed base. When off, the carcass sits on the floor. */
  toeKick: {
    enabled: boolean;
    height: Inches;
  };

  /** Material assigned to each component group. */
  materials: {
    carcass: MaterialId;
    doors: MaterialId;
    back: MaterialId;
  };
}

// -----------------------------------------------------------------------------
// UNITS — a project is a Room + many Units (cabinets, shelves, …)
// -----------------------------------------------------------------------------

/** Product family. Drives default size, mounting height, and a little geometry. */
export type UnitType = 'base' | 'upper' | 'tall' | 'shelf';

export type CarcassStyle = 'frameless' | 'face-frame';
export type DoorStyle = 'slab' | 'shaker';
export type OverlayStyle = 'full-overlay' | 'partial-overlay' | 'inset';

/** How it's built. Stored on every unit; flows into pricing + cut list (and,
 *  over time, geometry). Defaults to frameless / slab / full-overlay. */
export interface ConstructionStyle {
  carcass: CarcassStyle;
  doorStyle: DoorStyle;
  overlay: OverlayStyle;
}

/** Optional custom paint match (e.g., Sherwin-Williams "Tricorn Black" SW 6258). */
export interface PaintColor {
  brand: string;
  name: string;
  code: string;
  hex: string; // approximate, for the 3D preview
}

/** One piece of furniture in the project. */
export interface Unit {
  id: string;
  type: UnitType;
  label: string; // e.g. "Base 1", "Upper 2"
  overall: { width: Inches; height: Inches; depth: Inches };
  sections: number;
  shelvesPerSection: number;
  door: DoorConfig;
  toeKick: { enabled: boolean; height: Inches };
  materials: { carcass: MaterialId; doors: MaterialId; back: MaterialId };
  construction: ConstructionStyle;
  /** Custom paint, if the doors are painted to a specific color. */
  paint?: PaintColor;
  /** Base elevation off the floor (0 for base/tall; ~54" for uppers/shelves). */
  mountHeight: Inches;
  /** Where it sits in the room: which wall + slide offset along it. */
  placement: { wallIndex: number; offset: Inches };
}

// -----------------------------------------------------------------------------
// PARTS
// -----------------------------------------------------------------------------

/** What kind of piece this is — used for grouping, hardware rules, and colors. */
export type PartRole =
  | 'side'
  | 'top'
  | 'bottom'
  | 'back'
  | 'shelf'
  | 'divider'
  | 'door'
  | 'toekick';

/**
 * Which of a panel's four edges get edge banding (the thin finished strip that
 * hides raw plywood edges). Named relative to the part's cut dimensions:
 *   L1/L2 = the two edges running along the LENGTH
 *   W1/W2 = the two edges running along the WIDTH
 * For a panel whose grain runs vertically, "L1" is the front vertical edge.
 */
export type EdgeId = 'L1' | 'L2' | 'W1' | 'W2';

/** Grain direction relative to the cut dimensions (length vs width), or none. */
export type Grain = 'length' | 'width' | 'none';

/**
 * One physical piece. buildParts() emits exactly ONE Part per real piece of
 * wood (so a cabinet with two sides yields two Part objects). The cut list
 * groups identical parts back together into quantities; the 3D scene draws each
 * one at its own position.
 */
export interface Part {
  id: string;
  name: string; // human label, e.g. "Side", "Adj. Shelf", "Door"
  role: PartRole;
  material: MaterialId;

  // --- Shop cut dimensions (what a person cuts on the saw) ---
  length: Inches; // along the grain when grain = 'length'
  width: Inches;
  thickness: Inches;
  grain: Grain;
  bandedEdges: EdgeId[];
  notes?: string;

  // --- 3D placement (inches). Coordinate system:
  //   x: left(-) → right(+)      (width)
  //   y: floor(0) → up           (height)
  //   z: back(-) → front(+)      (depth)
  // position is the CENTER of the box; size3d is its extent on each axis.
  position: { x: number; y: number; z: number };
  size3d: { w: number; h: number; d: number };
}

/** Hardware tallied from the model (counts, not dimensions). */
export interface HardwareCounts {
  hinges: number;
  shelfPins: number;
  pulls: number;
  drawerSlides: number; // always 0 in v1 (no drawers yet), kept for the future
}

/** The full computed output of the model — parts + hardware. */
export interface BuiltUnit {
  parts: Part[];
  hardware: HardwareCounts;
}

====================================================================
FILE: src/pricing/engine.ts
====================================================================
// =============================================================================
// PRICING ENGINE — transparent, line-item, no black box
// =============================================================================
// priceModel() takes the built unit (the same Part[] the 3D and cut list use)
// plus your pricing.config.ts numbers, and returns every cost line, the
// subtotal, overhead, margin, and the final customer price. It does ONLY
// arithmetic on values from the config — it never invents a number.
//
// Flow:
//   material sheets + edge banding + hardware + finish + labor + machine
//     = SUBTOTAL (cost)
//   + overhead (fixed + percent of subtotal)
//     = TOTAL COST
//   + margin (markup % of total cost)
//     = CUSTOMER PRICE
// =============================================================================

import type { BuiltUnit } from '../model/types';
import { getMaterial } from '../model/materials';
import { pricing, type PricingConfig, type SheetMaterialCost } from './pricing.config';

export interface PriceLine {
  key: string;
  label: string;
  detail: string;
  amount: number;
  /** True if this line relied on a placeholder number. */
  placeholder: boolean;
}

export interface PriceResult {
  lines: PriceLine[];
  subtotal: number; // sum of all cost lines
  overheadAmount: number;
  totalCost: number; // subtotal + overhead
  marginAmount: number;
  customerPrice: number; // totalCost + margin
  usesPlaceholders: boolean;
  sheetsByMaterial: { materialId: string; label: string; sheets: number }[];
}

const SQIN_PER_SQFT = 144;

function partArea(length: number, width: number): number {
  return length * width; // square inches, one face
}

/** Linear inches of banded edge on a single part. */
function bandedInches(edges: string[], length: number, width: number): number {
  let total = 0;
  for (const e of edges) {
    if (e === 'L1' || e === 'L2') total += length;
    else if (e === 'W1' || e === 'W2') total += width;
  }
  return total;
}

export function priceModel(unit: BuiltUnit, config: PricingConfig = pricing): PriceResult {
  const lines: PriceLine[] = [];
  const sheetsByMaterial: PriceResult['sheetsByMaterial'] = [];

  // --- 1) SHEET GOODS, grouped by material id --------------------------------
  const areaByMaterial = new Map<string, number>();
  for (const p of unit.parts) {
    areaByMaterial.set(
      p.material,
      (areaByMaterial.get(p.material) ?? 0) + partArea(p.length, p.width)
    );
  }

  for (const [materialId, areaSqIn] of areaByMaterial) {
    const cost: SheetMaterialCost =
      config.materials[materialId] ?? config.defaultMaterial;
    const usableArea = cost.sheetWidth * cost.sheetHeight * cost.yield;
    const sheets = Math.max(1, Math.ceil(areaSqIn / usableArea));
    const amount = sheets * cost.sheetCost;
    const label = getMaterial(materialId).label;
    const isPlaceholder = !!cost.placeholder || !config.materials[materialId];

    sheetsByMaterial.push({ materialId, label, sheets });
    lines.push({
      key: `mat-${materialId}`,
      label: `Sheet goods — ${label}`,
      detail: `${sheets} sheet${sheets > 1 ? 's' : ''} × $${cost.sheetCost} · ${(
        areaSqIn / SQIN_PER_SQFT
      ).toFixed(1)} sqft used @ ${Math.round(cost.yield * 100)}% yield`,
      amount,
      placeholder: isPlaceholder,
    });
  }

  // --- 2) EDGE BANDING -------------------------------------------------------
  let bandInches = 0;
  for (const p of unit.parts) {
    bandInches += bandedInches(p.bandedEdges, p.length, p.width);
  }
  const bandFeet = bandInches / 12;
  const eb = config.edgeBanding;
  const perFoot = (eb.useFinished ? eb.finishedRollCost : eb.unfinishedRollCost) / eb.rollLengthFt;
  lines.push({
    key: 'edge-banding',
    label: 'Edge banding',
    detail: `${bandFeet.toFixed(1)} lin ft × $${perFoot.toFixed(2)}/ft (${
      eb.useFinished ? 'pre-finished' : 'unfinished'
    })`,
    amount: bandFeet * perFoot,
    placeholder: false,
  });

  // --- 3) HARDWARE -----------------------------------------------------------
  const hw = unit.hardware;
  const h = config.hardware;
  const hardwareAmount =
    hw.hinges * h.hingeEach +
    hw.shelfPins * h.shelfPinEach +
    hw.pulls * h.pullEach +
    hw.drawerSlides * h.drawerSlidePairEach;
  lines.push({
    key: 'hardware',
    label: 'Hardware',
    detail: `${hw.hinges} hinges, ${hw.pulls} pulls, ${hw.shelfPins} shelf pins`,
    amount: hardwareAmount,
    placeholder: !!h.placeholder,
  });

  // --- 4) FINISH -------------------------------------------------------------
  const totalAreaSqFt =
    unit.parts.reduce((sum, p) => sum + partArea(p.length, p.width), 0) / SQIN_PER_SQFT;
  const totalSheets = sheetsByMaterial.reduce((n, s) => n + s.sheets, 0);
  let finishAmount = 0;
  let finishDetail = 'pre-finished — no separate cost';
  if (config.finish.mode === 'perSqft') {
    finishAmount = totalAreaSqFt * config.finish.ratePerSqft;
    finishDetail = `${totalAreaSqFt.toFixed(1)} sqft × $${config.finish.ratePerSqft}/sqft`;
  } else if (config.finish.mode === 'perSheet') {
    finishAmount = totalSheets * config.finish.ratePerSheet;
    finishDetail = `${totalSheets} sheets × $${config.finish.ratePerSheet}/sheet`;
  }
  lines.push({
    key: 'finish',
    label: 'Finishing',
    detail: finishDetail,
    amount: finishAmount,
    placeholder: !!config.finish.placeholder && config.finish.mode !== 'none',
  });

  // --- 5) LABOR --------------------------------------------------------------
  const laborAmount = config.labor.ratePerHour * config.labor.hoursPerUnit;
  lines.push({
    key: 'labor',
    label: 'Labor',
    detail: `${config.labor.hoursPerUnit} hr × $${config.labor.ratePerHour}/hr`,
    amount: laborAmount,
    placeholder: !!config.labor.placeholder,
  });

  // --- 6) MACHINE / CNC (optional) ------------------------------------------
  if (config.machine.ratePerSheet > 0) {
    lines.push({
      key: 'machine',
      label: 'CNC / machine time',
      detail: `${totalSheets} sheets × $${config.machine.ratePerSheet}/sheet`,
      amount: totalSheets * config.machine.ratePerSheet,
      placeholder: !!config.machine.placeholder,
    });
  }

  // --- SUBTOTAL --------------------------------------------------------------
  const subtotal = lines.reduce((sum, l) => sum + l.amount, 0);

  // --- OVERHEAD --------------------------------------------------------------
  const overheadAmount =
    config.overhead.fixed + subtotal * (config.overhead.percent / 100);
  const totalCost = subtotal + overheadAmount;

  // --- MARGIN ----------------------------------------------------------------
  const marginAmount = totalCost * (config.margin.markupPercent / 100);
  const customerPrice = totalCost + marginAmount;

  const usesPlaceholders =
    lines.some((l) => l.placeholder) ||
    !!config.overhead.placeholder ||
    !!config.margin.placeholder;

  return {
    lines,
    subtotal,
    overheadAmount,
    totalCost,
    marginAmount,
    customerPrice,
    usesPlaceholders,
    sheetsByMaterial,
  };
}

/** Format a dollar amount for display. */
export function usd(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

====================================================================
FILE: src/pricing/PriceBreakdown.tsx
====================================================================
// =============================================================================
// PRICE BREAKDOWN (Maker view) — every line, for the business owner
// =============================================================================
import { useMemo } from 'react';
import { useStore } from '../store';
import { buildProject } from '../model/buildParts';
import { priceModel, usd } from './engine';
import { pricing } from './pricing.config';

export default function PriceBreakdown() {
  const units = useStore((s) => s.units);
  const result = useMemo(() => priceModel(buildProject(units)), [units]);

  return (
    <div className="nice-scroll flex h-full flex-col overflow-auto">
      {result.usesPlaceholders && (
        <div className="m-3 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
          ⚠️ Uses placeholder numbers. Edit{' '}
          <code className="rounded bg-amber-100 px-1">src/pricing/pricing.config.ts</code> to set
          your real prices. Flagged lines are marked ⚠️.
        </div>
      )}

      <div className="px-3 pb-3">
        <table className="w-full text-sm">
          <tbody>
            {result.lines.map((l) => (
              <tr key={l.key} className="align-top border-b border-stone-100">
                <td className="py-2 pr-2">
                  <div className="font-medium text-stone-800">
                    {l.label}
                    {l.placeholder && (
                      <span className="ml-1 text-amber-500" title="uses a placeholder number">
                        ⚠️
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-stone-500">{l.detail}</div>
                </td>
                <td className="whitespace-nowrap py-2 text-right tabular-nums text-stone-800">
                  {usd(l.amount)}
                </td>
              </tr>
            ))}

            <Row label="Subtotal (cost)" amount={usd(result.subtotal)} strong />
            <Row label="Overhead" amount={usd(result.overheadAmount)} muted />
            <Row label="Total cost" amount={usd(result.totalCost)} strong />
            <Row label={`Margin (${pricing.margin.markupPercent}% markup)`} amount={usd(result.marginAmount)} muted />
          </tbody>
        </table>

        <div className="mt-3 flex items-center justify-between rounded-xl bg-stone-900 px-4 py-3">
          <span className="text-sm font-semibold text-white">Customer price</span>
          <span className="font-display text-xl font-semibold tabular-nums text-emerald-300">
            {usd(result.customerPrice)}
          </span>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  amount,
  muted,
  strong,
}: {
  label: string;
  amount: string;
  muted?: boolean;
  strong?: boolean;
}) {
  return (
    <tr className="border-b border-stone-100">
      <td className={'py-1.5 ' + (strong ? 'font-semibold text-stone-900' : muted ? 'text-stone-500' : 'text-stone-700')}>
        {label}
      </td>
      <td
        className={
          'py-1.5 text-right tabular-nums ' +
          (strong ? 'font-semibold text-stone-900' : muted ? 'text-stone-500' : 'text-stone-700')
        }
      >
        {amount}
      </td>
    </tr>
  );
}

====================================================================
FILE: src/pricing/PriceCard.tsx
====================================================================
// Replaced by src/steps/QuoteStep.tsx. Stub kept to avoid breaking imports.
export default function PriceCard() {
  return null;
}

====================================================================
FILE: src/pricing/pricing.config.ts
====================================================================
// =============================================================================
//  pricing.config.ts  —  YOUR PRIVATE PRICING NUMBERS
// =============================================================================
//  This is the ONLY file you need to edit to set your prices. Every number the
//  price depends on lives here. The engine (src/pricing/engine.ts) only does
//  arithmetic on these — it invents nothing.
//
//  Values flagged  ⚠️ PLACEHOLDER  are still guesses — replace them and delete
//  `placeholder: true`. Everything NOT flagged is a real number you gave me.
//
//  UNITS: inches for sizes, US dollars for money, feet for linear stock.
// =============================================================================

export interface SheetMaterialCost {
  sheetWidth: number; // inches
  sheetHeight: number; // inches
  sheetCost: number; // $ per full sheet
  yield: number; // usable fraction after cutting waste (0.85 = 85%)
  note?: string; // what this material actually is, for the maker
  placeholder?: boolean;
}

export interface PricingConfig {
  /** Sheet goods, keyed by the material id used in the model. */
  materials: Record<string, SheetMaterialCost>;
  /** Fallback when a material has no entry above. Always flagged. */
  defaultMaterial: SheetMaterialCost;

  /** Solid lumber by the board (poplar etc.) — for fillers, nailers, nosing.
   *  Not consumed by v1 parts yet, but captured so the numbers are ready. */
  lumber: {
    poplar1x2PerBoard: number;
    poplar1x3PerBoard: number;
    boardLengthFt: number;
  };

  /** Edge banding bought by the roll; engine derives the per-foot cost. */
  edgeBanding: {
    rollLengthFt: number;
    finishedRollCost: number;
    unfinishedRollCost: number;
    /** Use pre-finished banding by default (matches UV prefinished ply). */
    useFinished: boolean;
  };

  hardware: {
    hingeEach: number; // Blum soft-close
    drawerSlidePairEach: number; // per pair (no drawers in v1, ready for later)
    shelfPinEach: number;
    pullEach: number;
    /** Flagged because shelf pins + pulls are still estimates. */
    placeholder?: boolean;
  };

  finish: {
    mode: 'perSqft' | 'perSheet' | 'none';
    ratePerSqft: number;
    ratePerSheet: number;
    placeholder?: boolean;
  };

  labor: {
    ratePerHour: number;
    hoursPerUnit: number;
    placeholder?: boolean;
  };

  machine: {
    ratePerSheet: number;
    placeholder?: boolean;
  };

  overhead: {
    fixed: number;
    percent: number;
    placeholder?: boolean;
  };

  margin: {
    markupPercent: number;
    placeholder?: boolean;
  };
}

// -----------------------------------------------------------------------------
// YOUR NUMBERS
// -----------------------------------------------------------------------------
export const pricing: PricingConfig = {
  // All sheets 48 × 96. Costs below are your real per-sheet prices.
  materials: {
    // Finishes the customer can pick (look → real substrate):
    'uv-ply-natural': { sheetWidth: 48, sheetHeight: 96, sheetCost: 130, yield: 0.85, note: '3/4" UV 1-sided prefinished' },
    'ply-back': { sheetWidth: 48, sheetHeight: 96, sheetCost: 100, yield: 0.85, note: '1/4" UV 1-sided prefinished (backs)' },
    'painted-white': { sheetWidth: 48, sheetHeight: 96, sheetCost: 60, yield: 0.85, note: '3/4" MDF (painted slab)' },
    'painted-greige': { sheetWidth: 48, sheetHeight: 96, sheetCost: 60, yield: 0.85, note: '3/4" MDF (painted slab)' },
    'painted-sage': { sheetWidth: 48, sheetHeight: 96, sheetCost: 60, yield: 0.85, note: '3/4" MDF (painted slab)' },
    'painted-navy': { sheetWidth: 48, sheetHeight: 96, sheetCost: 60, yield: 0.85, note: '3/4" MDF (painted slab)' },
    'painted-charcoal': { sheetWidth: 48, sheetHeight: 96, sheetCost: 60, yield: 0.85, note: '3/4" MDF (painted slab)' },
    'white-oak': { sheetWidth: 48, sheetHeight: 96, sheetCost: 220, yield: 0.85, note: 'White oak plain-sliced veneer ply' },
    'white-oak-rift': { sheetWidth: 48, sheetHeight: 96, sheetCost: 240, yield: 0.85, note: 'White oak rift-sliced veneer ply' },
    'walnut': { sheetWidth: 48, sheetHeight: 96, sheetCost: 240, yield: 0.85, note: 'Walnut plain-sliced veneer ply' },

    // Other substrates you stock (used by drawers/interiors later, costs ready):
    'uv-2s-drawer': { sheetWidth: 48, sheetHeight: 96, sheetCost: 120, yield: 0.85, note: '1/2" UV 2-sided (drawer boxes)' },
    'birch-3-4': { sheetWidth: 48, sheetHeight: 96, sheetCost: 120, yield: 0.85, note: '3/4" unfinished birch' },
    'birch-1-2': { sheetWidth: 48, sheetHeight: 96, sheetCost: 100, yield: 0.85, note: '1/2" unfinished birch' },
    'hdf-3-4': { sheetWidth: 48, sheetHeight: 96, sheetCost: 80, yield: 0.85, note: '3/4" HDF' },
    'plycore-hdf-3-4': { sheetWidth: 48, sheetHeight: 96, sheetCost: 130, yield: 0.85, note: '3/4" ply-core HDF' },
    'mdf-3-4': { sheetWidth: 48, sheetHeight: 96, sheetCost: 60, yield: 0.85, note: '3/4" MDF' },
  },

  // ⚠️ PLACEHOLDER — fallback only, if a material id has no entry above.
  defaultMaterial: { sheetWidth: 48, sheetHeight: 96, sheetCost: 100, yield: 0.85, placeholder: true },

  lumber: {
    poplar1x2PerBoard: 9, // per board
    poplar1x3PerBoard: 14,
    boardLengthFt: 8, // assumed stick length — adjust if you buy differently
  },

  // Bought by the 250 ft roll. Engine uses finished by default (matches UV ply).
  edgeBanding: {
    rollLengthFt: 250,
    finishedRollCost: 70, // $70 / 250 ft  = $0.28/ft
    unfinishedRollCost: 60, // $60 / 250 ft = $0.24/ft
    useFinished: true,
  },

  hardware: {
    hingeEach: 8, // Blum soft-close (real)
    drawerSlidePairEach: 38, // per pair (real)
    shelfPinEach: 0.15, // ⚠️ PLACEHOLDER
    pullEach: 4, // ⚠️ PLACEHOLDER
    placeholder: true, // shelf pins + pulls still estimated
  },

  // ⚠️ PLACEHOLDER — finishing. 'none' assumes parts are pre-finished / painted
  // cost folded into labor. Switch to 'perSqft' or 'perSheet' to bill separately.
  finish: { mode: 'none', ratePerSqft: 2, ratePerSheet: 25, placeholder: true },

  // ⚠️ PLACEHOLDER — labor.
  labor: { ratePerHour: 65, hoursPerUnit: 4, placeholder: true },

  // ⚠️ PLACEHOLDER — CNC/machine per sheet (set 0 to disable).
  machine: { ratePerSheet: 0, placeholder: true },

  // ⚠️ PLACEHOLDER — overhead.
  overhead: { fixed: 50, percent: 10, placeholder: true },

  // ⚠️ PLACEHOLDER — target margin (markup on cost).
  margin: { markupPercent: 40, placeholder: true },
};

// -----------------------------------------------------------------------------
// CHECKLIST: numbers still to confirm (the rest are now real).
// -----------------------------------------------------------------------------
export const PLACEHOLDER_NOTES: string[] = [
  'Shelf pin unit cost',
  'Door/drawer pull unit cost (or confirm edge pulls / none)',
  'Finishing: confirm folded into labor, or set a per-sqft / per-sheet rate',
  'Labor shop rate and hours per unit',
  'CNC/machine rate per sheet (if any)',
  'Overhead: fixed dollars + percent',
  'Target margin / markup percent',
];

====================================================================
FILE: src/RightPanel.tsx
====================================================================
// Maker view: the shop-facing panel — full price breakdown and the cut list with
// exports. Light theme to match the rest of the app.
import { useState } from 'react';
import CutList from './cutlist/CutList';
import PriceBreakdown from './pricing/PriceBreakdown';

type Tab = 'price' | 'cutlist';

export default function RightPanel() {
  const [tab, setTab] = useState<Tab>('price');

  return (
    <div className="flex h-full w-[420px] shrink-0 flex-col border-l border-stone-200 bg-white">
      <div className="flex gap-1 border-b border-stone-200 px-3 pt-3">
        <TabButton active={tab === 'price'} onClick={() => setTab('price')}>
          Price breakdown
        </TabButton>
        <TabButton active={tab === 'cutlist'} onClick={() => setTab('cutlist')}>
          Cut list
        </TabButton>
      </div>
      <div className="min-h-0 flex-1">
        {tab === 'price' ? <PriceBreakdown /> : <CutList />}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        'rounded-t-lg px-3 py-2 text-xs font-semibold transition ' +
        (active
          ? 'bg-stone-100 text-stone-900'
          : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700')
      }
    >
      {children}
    </button>
  );
}

====================================================================
FILE: src/scene/CabinetMesh.tsx
====================================================================
import { useMemo } from 'react';
import { Edges } from '@react-three/drei';
import type { Part } from '../model/types';
import { getMaterial } from '../model/materials';
import { useStore } from '../store';

// Draws a unit by rendering each Part as a box at its 3D position. Subtle edge
// lines give crisp definition (IKEA-planner style) so cabinets read clearly
// against walls. Reads the same Part[] as the cut list + pricing.
export default function CabinetMesh({ parts, unitId }: { parts: Part[]; unitId?: string }) {
  const selectedId = useStore((s) => s.selectedId);
  const selected = unitId != null && unitId === selectedId;
  return (
    <group>
      {parts.map((p) => (
        <PartBox key={p.id} part={p} selected={selected} />
      ))}
    </group>
  );
}

function PartBox({ part, selected }: { part: Part; selected: boolean }) {
  const def = useMemo(() => getMaterial(part.material), [part.material]);
  const { w, h, d } = part.size3d;
  const { x, y, z } = part.position;

  return (
    <mesh position={[x, y, z]} castShadow receiveShadow>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial color={def.color} roughness={def.roughness} metalness={0.02} />
      <Edges threshold={20} color={selected ? '#b88a44' : '#4a3c2b'} />
    </mesh>
  );
}

====================================================================
FILE: src/scene/layout.ts
====================================================================
// =============================================================================
// UNIT LAYOUT — where each unit sits in the 3D scene
// =============================================================================
// In a room: each unit snaps to its chosen wall (back to the wall, facing in),
// slid by its offset, lifted to its mount height. In studio mode (no room):
// units line up in a centered row. Returns a transform per unit, in order.
// =============================================================================

import type { RoomModel } from '../model/room';
import type { Unit } from '../model/types';
import { footprint } from '../model/roomShapes';

export interface UnitTransform {
  x: number;
  y: number;
  z: number;
  rotY: number;
}

export function unitTransforms(units: Unit[], room: RoomModel): UnitTransform[] {
  if (!room.enabled) {
    // Studio: centered row along x.
    const GAP = 4;
    const total = units.reduce((s, u) => s + u.overall.width, 0) + GAP * Math.max(0, units.length - 1);
    let cx = -total / 2;
    return units.map((u) => {
      const x = cx + u.overall.width / 2;
      cx += u.overall.width + GAP;
      return { x, y: u.mountHeight, z: 0, rotY: 0 };
    });
  }

  const walls = footprint(room).walls;
  return units.map((u) => {
    const wall = walls[Math.min(Math.max(u.placement.wallIndex, 0), walls.length - 1)];
    if (!wall) return { x: 0, y: u.mountHeight, z: 0, rotY: 0 };
    const inN: [number, number] = [-wall.normal[0], -wall.normal[1]];
    const maxOff = Math.max(0, wall.length / 2 - u.overall.width / 2);
    const off = Math.min(maxOff, Math.max(-maxOff, u.placement.offset));
    const ex = wall.mid[0] + wall.dir[0] * off;
    const ez = wall.mid[1] + wall.dir[1] * off;
    return {
      x: ex + inN[0] * (u.overall.depth / 2),
      y: u.mountHeight,
      z: ez + inN[1] * (u.overall.depth / 2),
      rotY: Math.atan2(inN[0], inN[1]),
    };
  });
}

/** A rough center + size of the whole project, for camera framing. */
export function projectFocus(units: Unit[], transforms: UnitTransform[]) {
  if (units.length === 0) return { cx: 0, cz: 0, topY: 36 };
  let cx = 0;
  let cz = 0;
  let topY = 0;
  transforms.forEach((t, i) => {
    cx += t.x;
    cz += t.z;
    topY = Math.max(topY, t.y + units[i].overall.height);
  });
  return { cx: cx / units.length, cz: cz / units.length, topY };
}

====================================================================
FILE: src/scene/Room.tsx
====================================================================
// =============================================================================
// ROOM 3D — polygon floor + oriented walls + baseboard + openings
// =============================================================================
// Walls are built from the footprint's wall segments (any angle, incl. the 45°
// corner). Each wall "unit" (wall + baseboard + its windows/doors) auto-hides
// when it sits between the camera and the room interior — a dollhouse view so
// you can always see inside as you orbit.
// =============================================================================

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { RoomModel, Opening } from '../model/room';
import { WALL_THICKNESS as WT } from '../model/room';
import type { Vec2, WallSeg } from '../model/roomShapes';

// Distinct, designed tones — walls clearly lighter than the wood floor, crisp
// white trim, readable glazing — so room, floor, and cabinetry never blend.
const WALL_COLOR = '#e6ddcb'; // soft warm plaster (the lightest big surface)
const FLOOR_COLOR = '#b07e4e'; // mid-warm oak floor — grounds the scene
const TRIM_COLOR = '#fbf8f1'; // crisp warm-white baseboard/casing
const GLASS_COLOR = '#aacfdb'; // clearly readable glazing

const BB_H = 5;
const BB_D = 0.6;
const CW = 2.5; // casing width
const CD = 1.4; // casing depth

type Vec3 = [number, number, number];

function Box({
  size,
  position,
  rotationY = 0,
  color,
  roughness = 0.9,
  transparent,
  opacity,
}: {
  size: Vec3;
  position: Vec3;
  rotationY?: number;
  color: string;
  roughness?: number;
  transparent?: boolean;
  opacity?: number;
}) {
  return (
    <mesh position={position} rotation={[0, rotationY, 0]} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={roughness} metalness={0.02} transparent={transparent} opacity={opacity} />
    </mesh>
  );
}

export default function Room({
  room,
  walls,
  points,
}: {
  room: RoomModel;
  walls: WallSeg[];
  points: Vec2[];
}) {
  // Floor as a filled polygon (handles every shape, incl. the chamfer).
  const floorGeo = useMemo(() => {
    const shape = new THREE.Shape();
    points.forEach((p, i) => (i === 0 ? shape.moveTo(p[0], -p[1]) : shape.lineTo(p[0], -p[1])));
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
  }, [points]);

  return (
    <group>
      <mesh geometry={floorGeo} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <meshStandardMaterial color={FLOOR_COLOR} roughness={0.8} side={THREE.DoubleSide} />
      </mesh>

      {walls.map((w) => (
        <WallUnit
          key={w.index}
          wall={w}
          height={room.height}
          openings={room.openings.filter((o) => o.wallIndex === w.index)}
        />
      ))}
    </group>
  );
}

function WallUnit({ wall, height, openings }: { wall: WallSeg; height: number; openings: Opening[] }) {
  const ref = useRef<THREE.Group>(null);

  // Dollhouse: hide this wall when it faces the camera (is between camera + room).
  useFrame((state) => {
    if (!ref.current) return;
    const cam = state.camera.position;
    const toCam = new THREE.Vector3(cam.x - wall.mid[0], 0, cam.z - wall.mid[1]);
    const facing = wall.normal[0] * toCam.x + wall.normal[1] * toCam.z;
    ref.current.visible = facing <= 0.0;
  });

  const [mx, mz] = wall.mid;
  const [nx, nz] = wall.normal;

  return (
    <group ref={ref}>
      {/* Wall (centered just outside the footprint edge). */}
      <Box
        size={[wall.length, height, WT]}
        position={[mx + nx * (WT / 2), height / 2, mz + nz * (WT / 2)]}
        rotationY={wall.angleY}
        color={WALL_COLOR}
        roughness={0.96}
      />
      {/* Baseboard just inside the edge. */}
      <Box
        size={[wall.length, BB_H, BB_D]}
        position={[mx - nx * (BB_D / 2), BB_H / 2, mz - nz * (BB_D / 2)]}
        rotationY={wall.angleY}
        color={TRIM_COLOR}
      />
      {openings.map((o) => (
        <OpeningMesh key={o.id} opening={o} wall={wall} />
      ))}
    </group>
  );
}

function OpeningMesh({ opening, wall }: { opening: Opening; wall: WallSeg }) {
  const { kind, width: w, height: h, sill, offset } = opening;
  const [mx, mz] = wall.mid;
  const [dx, dz] = wall.dir;
  // Anchor point on the wall, slid along it.
  const px = mx + dx * offset;
  const pz = mz + dz * offset;
  const yc = kind === 'window' ? sill + h / 2 : h / 2;

  return (
    <group position={[px, yc, pz]} rotation={[0, wall.angleY, 0]}>
      {kind === 'window' ? (
        <>
          <Box size={[w, h, 0.6]} position={[0, 0, 0]} color={GLASS_COLOR} roughness={0.1} transparent opacity={0.45} />
          <Box size={[CW, h + 2 * CW, CD]} position={[-(w / 2 + CW / 2), 0, 0]} color={TRIM_COLOR} />
          <Box size={[CW, h + 2 * CW, CD]} position={[w / 2 + CW / 2, 0, 0]} color={TRIM_COLOR} />
          <Box size={[w, CW, CD]} position={[0, h / 2 + CW / 2, 0]} color={TRIM_COLOR} />
          <Box size={[w + 2 * CW, CW + 1, CD + 0.8]} position={[0, -(h / 2 + CW / 2), 0]} color={TRIM_COLOR} />
        </>
      ) : (
        <>
          <Box size={[w, h, 1.4]} position={[0, 0, 0]} color={TRIM_COLOR} roughness={0.7} />
          <Box size={[CW, h + CW, CW]} position={[-(w / 2 + CW / 2), 0, 0]} color={TRIM_COLOR} />
          <Box size={[CW, h + CW, CW]} position={[w / 2 + CW / 2, 0, 0]} color={TRIM_COLOR} />
          <Box size={[w + 2 * CW, CW, CW]} position={[0, h / 2 + CW / 2, 0]} color={TRIM_COLOR} />
        </>
      )}
    </group>
  );
}

====================================================================
FILE: src/scene/Scene.tsx
====================================================================
import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store';
import { buildParts } from '../model/buildParts';
import { footprint, type WallSeg } from '../model/roomShapes';
import { unitTransforms, projectFocus } from './layout';
import CabinetMesh from './CabinetMesh';
import Room from './Room';

// Studio / room viewport. 1 three.js unit = 1 inch. Renders every unit at its
// placement. Click a piece to select it; drag a piece to move it (it snaps to
// the nearest wall). Walls auto-hide so you can always see in.
export default function Scene() {
  const units = useStore((s) => s.units);
  const room = useStore((s) => s.room);
  const view = useStore((s) => s.view);
  const draggingId = useStore((s) => s.draggingId);
  const selectUnit = useStore((s) => s.selectUnit);
  const setDragging = useStore((s) => s.setDragging);
  const controls = useRef<any>(null);

  const inRoom = room.enabled;
  const fp = useMemo(() => footprint(room), [room]);
  const built = useMemo(() => units.map((u) => buildParts(u)), [units]);
  const transforms = useMemo(() => unitTransforms(units, room), [units, room]);
  const focus = useMemo(() => projectFocus(units, transforms), [units, transforms]);

  const roomSpan = Math.max(room.width, room.length);
  const sceneSpan = Math.max(roomSpan, focus.topY * 1.5, 60);
  const camDist = inRoom ? Math.max(focus.topY * 2.0, roomSpan * 0.9, 120) : Math.max(focus.topY * 2.2, sceneSpan, 80);

  const target: [number, number, number] = [focus.cx, focus.topY * 0.45, focus.cz];
  const camera = inRoom
    ? { position: [focus.cx + camDist * 0.32, focus.topY * 0.7, focus.cz + camDist] as [number, number, number], fov: 38 }
    : { position: [focus.cx + camDist * 0.45, focus.topY * 0.75, focus.cz + camDist] as [number, number, number], fov: 34 };

  const startDrag = (id: string) => {
    selectUnit(id);
    if (inRoom) {
      setDragging(id);
      if (controls.current) controls.current.enabled = false; // stop orbit immediately
    }
  };

  return (
    <Canvas key={inRoom ? 'room' : 'studio'} shadows dpr={[1, 2]} camera={{ ...camera, near: 1, far: 9000 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={inRoom ? 0.7 : 0.6} />
      <hemisphereLight intensity={0.4} color="#fffaf2" groundColor="#cdbfa9" />
      <directionalLight
        position={[140, 260, 200]}
        intensity={1.5}
        color="#fff6ea"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0004}
        shadow-camera-left={-260}
        shadow-camera-right={260}
        shadow-camera-top={380}
        shadow-camera-bottom={-120}
      />
      <directionalLight position={[-160, 100, -100]} intensity={0.45} color="#eaf0ff" />
      <Environment preset="apartment" />

      {inRoom && <Room room={room} walls={fp.walls} points={fp.points} />}

      {units.map((u, i) => {
        const t = transforms[i];
        return (
          <group
            key={u.id}
            position={[t.x, t.y, t.z]}
            rotation={[0, t.rotY, 0]}
            onPointerDown={(e) => { e.stopPropagation(); startDrag(u.id); }}
            onPointerOver={() => inRoom && (document.body.style.cursor = 'grab')}
            onPointerOut={() => (document.body.style.cursor = 'auto')}
          >
            <CabinetMesh parts={built[i].parts} unitId={u.id} />
          </group>
        );
      })}

      {inRoom && <Dragger walls={fp.walls} controls={controls} />}

      <ContactShadows position={[focus.cx, 0.02, focus.cz]} scale={sceneSpan * 2.4} far={sceneSpan} blur={2.6} opacity={inRoom ? 0.26 : 0.32} color="#3b2e22" resolution={1024} />

      {view === 'maker' && !inRoom && (
        <Grid args={[480, 480]} cellSize={12} cellThickness={0.6} cellColor="#cdbfa9" sectionSize={48} sectionThickness={1} sectionColor="#b6a489" fadeDistance={900} infiniteGrid />
      )}

      <OrbitControls ref={controls} makeDefault enabled={!draggingId} target={target} enableDamping minPolarAngle={0.15} maxPolarAngle={Math.PI / 2 + 0.05} />
    </Canvas>
  );
}

// Handles dragging the active unit: raycasts the pointer onto the floor plane,
// finds the nearest wall, and updates that unit's placement live.
function Dragger({ walls, controls }: { walls: WallSeg[]; controls: React.MutableRefObject<any> }) {
  const { gl, camera } = useThree();
  const setDragging = useStore((s) => s.setDragging);
  const updateUnit = useStore((s) => s.updateUnit);

  // Keep the latest data available inside the long-lived listeners.
  const ref = useRef({ walls, units: useStore.getState().units, dragging: useStore.getState().draggingId });
  useEffect(() => useStore.subscribe((s) => (ref.current = { ...ref.current, units: s.units, dragging: s.draggingId })), []);
  ref.current.walls = walls;

  useEffect(() => {
    const el = gl.domElement;
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const hit = new THREE.Vector3();

    const onMove = (e: PointerEvent) => {
      const { dragging, units, walls } = ref.current;
      if (!dragging || walls.length === 0) return;
      const u = units.find((x) => x.id === dragging);
      if (!u) return;
      const rect = el.getBoundingClientRect();
      ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      ray.setFromCamera(ndc, camera);
      if (!ray.ray.intersectPlane(plane, hit)) return;

      // Nearest wall to the floor point, and the offset along it.
      let best = -1;
      let bestD = Infinity;
      let bestOff = 0;
      for (const w of walls) {
        const t = (hit.x - w.mid[0]) * w.dir[0] + (hit.z - w.mid[1]) * w.dir[1];
        const tc = Math.max(-w.length / 2, Math.min(w.length / 2, t));
        const px = w.mid[0] + w.dir[0] * tc;
        const pz = w.mid[1] + w.dir[1] * tc;
        const d = Math.hypot(hit.x - px, hit.z - pz);
        if (d < bestD) { bestD = d; best = w.index; bestOff = tc; }
      }
      if (best < 0) return;
      const w = walls[best];
      const maxOff = Math.max(0, w.length / 2 - u.overall.width / 2);
      const off = Math.max(-maxOff, Math.min(maxOff, bestOff));
      updateUnit(u.id, { placement: { wallIndex: best, offset: off } });
    };

    const onUp = () => {
      if (ref.current.dragging) {
        setDragging(null);
        if (controls.current) controls.current.enabled = true;
        document.body.style.cursor = 'auto';
      }
    };

    el.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      el.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [gl, camera, setDragging, updateUnit, controls]);

  return null;
}

====================================================================
FILE: src/screens/EntryChoice.tsx
====================================================================
import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';

// How should we map your space? Photo (analysis-ready, honest fallback), manual,
// or skip to a piece. High-end and easy.
export default function EntryChoice() {
  const setStep = useStore((s) => s.setStep);
  const setRoom = useStore((s) => s.setRoom);
  const analyze = useStore((s) => s.analyzeRoomPhoto);
  const applyRes = useStore((s) => s.applyRoomAnalysis);
  const status = useStore((s) => s.roomScanStatus);
  const error = useStore((s) => s.roomScanError);
  const result = useStore((s) => s.roomAnalysisResult);
  const roomPhoto = useStore((s) => s.roomPhoto);
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  // Auto-advance to review when a real analysis succeeds.
  useEffect(() => {
    if (status === 'success' && result) {
      applyRes(result);
      setStep('photoReview');
    }
  }, [status, result, applyRes, setStep]);

  const handleFile = (file?: File | null) => {
    if (file) analyze(file);
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-10" style={{ background: 'radial-gradient(130% 100% at 50% -10%, #fdf9f2 0%, #f3ece0 55%, #ece1cf 100%)' }}>
      <div className="w-full max-w-4xl fade-up text-center">
        <h1 className="font-display text-4xl font-semibold text-ink">How should we map your space?</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-ink-muted">
          Start from a photo, draw the room yourself, or skip straight to a piece. You can adjust everything later.
        </p>

        <div className="mt-9 grid gap-4 text-left md:grid-cols-3">
          {/* Photo */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
            className={'premium-card relative flex flex-col p-6 transition ' + (dragOver ? 'ring-2 ring-gold-400' : '')}
          >
            <span className="absolute right-4 top-4 rounded-full bg-espresso px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-porcelain">Fastest</span>
            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-300/25 text-gold-600 ring-1 ring-gold-300/40">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="11" r="2" /><path d="m4 18 5-4 4 3 3-2 4 3" /></svg>
            </div>
            <h2 className="font-display text-xl font-semibold text-ink">Upload a room photo</h2>
            <p className="mt-1 flex-1 text-sm text-ink-muted">
              Studio creates a room draft, finds visible openings, and asks you to confirm the measurements that matter.
            </p>

            {roomPhoto && status !== 'idle' && (
              <img src={roomPhoto} alt="room" className="mt-3 h-24 w-full rounded-xl object-cover ring-1 ring-ivory-200" />
            )}

            <button
              onClick={() => fileRef.current?.click()}
              disabled={status === 'analyzing'}
              className="premium-button mt-4 px-4 py-2.5 text-sm disabled:opacity-60"
            >
              {status === 'analyzing' ? 'Analyzing…' : 'Analyze my photo'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />

            {status === 'error' && (
              <div className="mt-3 rounded-xl bg-parchment/60 p-3 text-xs text-ink-soft ring-1 ring-gold-300/40">
                {error}
                <button onClick={() => { setRoom({ enabled: true }); setStep('room'); }} className="mt-2 block font-semibold text-gold-600 underline-offset-2 hover:underline">
                  Use this photo as a reference → shape the room
                </button>
              </div>
            )}
          </div>

          {/* Manual */}
          <EntryCard
            icon={<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" /><path d="M9 21v-6h6v6" /></svg>}
            title="Build the room manually"
            body="Choose a room shape and enter your wall lengths."
            cta="Draw my room"
            onClick={() => { setRoom({ enabled: true }); setStep('room'); }}
          />

          {/* Piece only */}
          <EntryCard
            icon={<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="5" y="3" width="14" height="18" rx="1.5" /><line x1="12" y1="3" x2="12" y2="21" /></svg>}
            title="Design a piece only"
            body="Skip the room and create a cabinet, shelf, or pantry by size."
            cta="Start with a piece"
            onClick={() => { setRoom({ enabled: false }); setStep('pieces'); }}
          />
        </div>

        <button onClick={() => useStore.getState().setStep('welcome')} className="mt-7 text-sm font-medium text-ink-muted underline-offset-4 transition hover:text-ink-soft hover:underline">
          ← Back
        </button>
      </div>
    </div>
  );
}

function EntryCard({ icon, title, body, cta, onClick }: { icon: React.ReactNode; title: string; body: string; cta: string; onClick: () => void }) {
  return (
    <div className="premium-card flex flex-col p-6">
      <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-300/25 text-gold-600 ring-1 ring-gold-300/40">{icon}</div>
      <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
      <p className="mt-1 flex-1 text-sm text-ink-muted">{body}</p>
      <button onClick={onClick} className="premium-button-secondary mt-4 px-4 py-2.5 text-sm" style={{ color: '#2e1c12', borderColor: 'rgba(184,138,68,0.5)' }}>{cta}</button>
    </div>
  );
}

====================================================================
FILE: src/screens/Welcome.tsx
====================================================================
import { useStore } from '../store';
import Img from '../components/Img';

// Editorial, white, photography-led landing — mirrors the INNERFORM reference:
// crisp near-black bold sans type, generous whitespace, rich image slots.
// Drop real photos into public/images/ (see MANIFEST.md) and they appear here.
export default function Welcome() {
  const setStep = useStore((s) => s.setStep);
  const go = () => setStep('entry');

  return (
    <div className="nice-scroll min-h-0 flex-1 overflow-y-auto bg-white text-ink">
      {/* Nav */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-neutral-200 bg-white/90 px-6 py-4 backdrop-blur sm:px-12">
        <span className="text-sm font-extrabold uppercase tracking-[0.22em]">Studio</span>
        <nav className="hidden gap-9 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500 md:flex">
          <a href="#work" className="hover:text-ink">Work</a>
          <a href="#spaces" className="hover:text-ink">Spaces</a>
          <a href="#approach" className="hover:text-ink">Approach</a>
        </nav>
        <button onClick={go} className="rounded-full bg-ink px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-black">Let’s design</button>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pt-14 sm:px-12 sm:pt-20">
        <div className="grid items-end gap-8 lg:grid-cols-[1.3fr_1fr]">
          <h1 className="fade-up text-[clamp(3rem,9vw,7rem)] font-extrabold leading-[0.92] tracking-[-0.03em]">Made to fit.</h1>
          <p className="fade-up-2 max-w-sm text-sm leading-relaxed text-neutral-600">
            We design and build custom cabinetry to your exact measurements — kitchens, pantries,
            vanities, and built-ins — then ship them to your door. Start from a photo or shape your
            room, and watch a real estimate take form as you design.
          </p>
        </div>
        <div className="fade-up-2 mt-10 overflow-hidden rounded-[20px] bg-neutral-100">
          <Img name="hero.jpg" alt="Custom kitchen" label="Hero image — hero.jpg" className="h-[clamp(18rem,46vw,34rem)] w-full" />
        </div>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <button onClick={go} className="rounded-full bg-ink px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-black active:scale-[0.99]">Start your design</button>
          <a href="#approach" className="rounded-full border border-neutral-300 px-7 py-3.5 text-sm font-semibold text-ink transition hover:border-ink">See the process</a>
        </div>
      </section>

      {/* Choose your space */}
      <section id="spaces" className="mx-auto max-w-7xl px-6 py-20 sm:px-12">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Choose your space</h2>
          <button onClick={go} className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500 hover:text-ink">Start designing →</button>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[['space-kitchen.jpg', 'Kitchen'], ['space-pantry.jpg', 'Pantry'], ['space-vanity.jpg', 'Vanity'], ['space-mudroom.jpg', 'Mudroom']].map(([file, label]) => (
            <figure key={label} className="group">
              <div className="overflow-hidden rounded-2xl bg-neutral-100">
                <Img name={file} alt={label} label={label} className="aspect-[4/5] w-full transition-transform duration-500 group-hover:scale-[1.04]" />
              </div>
              <figcaption className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">{label}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Purpose + stats */}
      <section className="border-y border-neutral-200 bg-neutral-50 py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 sm:px-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow text-gold-600">Why made-to-measure</p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">We build the pieces standard sizes can’t.</h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-neutral-600">
              Every cabinet is cut to your dimensions and finished by hand — so your space is used
              completely, and the result looks like it was always meant to be there.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-6 self-center">
            {[['12', 'Years building'], ['3k+', 'Pieces shipped'], ['48', 'States served']].map(([n, l]) => (
              <div key={l}>
                <div className="text-4xl font-extrabold tracking-tight text-ink">{n}<span className="text-gold-500">.</span></div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-neutral-500">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent work */}
      <section id="work" className="mx-auto max-w-7xl px-6 py-20 sm:px-12">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Recent work</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Tile file="project-natural.jpg" title="Natural luxury" sub="White oak · Denver" big />
          <div className="grid gap-4">
            <Tile file="project-modern.jpg" title="Modern black" sub="Painted · Austin" />
            <Tile file="project-wood.jpg" title="Wood mode" sub="Walnut · Seattle" />
          </div>
        </div>
      </section>

      {/* Approach */}
      <section id="approach" className="border-t border-neutral-200 py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-12">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">From your room to your door</h2>
          <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {[['Design', 'Shape your room from a photo or by hand, then add pieces to your exact sizes.'], ['Estimate', 'A transparent starting price updates live as you design.'], ['Build', 'We cut, assemble, and hand-finish to your dimensions.'], ['Deliver', 'Crated and shipped to your door, nationwide.']].map(([t, d], i) => (
              <div key={t}>
                <div className="text-3xl font-extrabold text-gold-500">0{i + 1}</div>
                <div className="my-3 h-px bg-neutral-200" />
                <h3 className="text-lg font-bold tracking-tight">{t}</h3>
                <p className="mt-1.5 text-sm text-neutral-600">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink px-6 py-24 text-center text-white">
        <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Design yours today.</h2>
        <p className="mx-auto mt-4 max-w-md text-sm text-white/60">Two minutes to a real starting estimate. No account needed.</p>
        <button onClick={go} className="mt-8 rounded-full bg-white px-9 py-4 text-sm font-semibold text-ink transition hover:bg-neutral-200 active:scale-[0.98]">Begin your design</button>
        <p className="mt-12 text-xs font-semibold uppercase tracking-[0.3em] text-white/40">Studio · Made-to-measure cabinetry</p>
      </section>
    </div>
  );
}

function Tile({ file, title, sub, big }: { file: string; title: string; sub: string; big?: boolean }) {
  return (
    <figure className="group relative overflow-hidden rounded-2xl bg-neutral-100">
      <Img name={file} alt={title} label={title} className={(big ? 'h-full min-h-[20rem] ' : 'aspect-[4/3] ') + 'w-full transition-transform duration-500 group-hover:scale-[1.04]'} />
      <figcaption className="absolute bottom-0 left-0 right-0 flex items-end justify-between bg-gradient-to-t from-black/55 to-transparent p-4 text-white">
        <span className="text-base font-bold">{title}</span>
        <span className="text-[11px] uppercase tracking-[0.14em] text-white/75">{sub}</span>
      </figcaption>
    </figure>
  );
}

====================================================================
FILE: src/services/roomAnalysis.ts
====================================================================
// =============================================================================
// ROOM ANALYSIS SERVICE (client adapter)
// =============================================================================
// Sends a room photo to the backend vision endpoint and validates the response.
// Backend (and any API keys) live server-side. This NEVER fakes a success — if
// the endpoint isn't connected, it throws AnalysisUnavailableError so the UI can
// gracefully fall back to "use this photo as a reference and continue manually."
// =============================================================================

import type { RoomAnalysisResult } from '../model/roomAnalysis';

const ENDPOINT =
  (import.meta.env.VITE_ROOM_ANALYSIS_ENDPOINT as string | undefined) || '/api/analyze-room';

/** Endpoint missing / unreachable — caller should offer the manual fallback. */
export class AnalysisUnavailableError extends Error {}

export async function requestRoomAnalysis(file: File, timeoutMs = 30000): Promise<RoomAnalysisResult> {
  const form = new FormData();
  form.append('image', file);

  let res: Response;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    res = await fetch(ENDPOINT, { method: 'POST', body: form, signal: ctrl.signal });
    clearTimeout(timer);
  } catch {
    throw new AnalysisUnavailableError('The photo-analysis service isn’t reachable.');
  }

  if (res.status === 404 || res.status === 501) {
    throw new AnalysisUnavailableError('Photo analysis isn’t connected yet.');
  }
  if (!res.ok) throw new Error(`Analysis failed (${res.status}).`);

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new Error('Analysis returned an invalid response.');
  }

  const r = json as Partial<RoomAnalysisResult>;
  if (!r || r.version !== '1.0' || !r.room || !Array.isArray(r.openings)) {
    throw new Error('Analysis response was not in the expected format.');
  }
  return r as RoomAnalysisResult;
}

====================================================================
FILE: src/steps/CabinetStep.tsx
====================================================================
// Replaced by src/steps/PiecesStep.tsx. Stub kept to avoid breaking imports.
export default function CabinetStep() {
  return null;
}

====================================================================
FILE: src/steps/FinishStep.tsx
====================================================================
// Finishes are now part of the per-piece editor in PiecesStep.tsx. Stub kept.
export default function FinishStep() {
  return null;
}

====================================================================
FILE: src/steps/OpeningsStep.tsx
====================================================================
import { useMemo } from 'react';
import { useStore } from '../store';
import { footprint } from '../model/roomShapes';
import { DimensionSlider } from '../controls/fields';
import { WallPicker } from '../controls/shared';

export default function OpeningsStep() {
  const room = useStore((s) => s.room);
  const addOpening = useStore((s) => s.addOpening);
  const updateOpening = useStore((s) => s.updateOpening);
  const removeOpening = useStore((s) => s.removeOpening);

  const walls = useMemo(() => footprint(room).walls, [room]);
  const wallCount = walls.length;

  const addBtn = 'rounded-xl bg-white px-3 py-2 text-sm font-semibold text-ink-soft ring-1 ring-ivory-200 transition hover:ring-clay-300 active:scale-95';

  return (
    <div className="space-y-5">
      <p className="text-sm text-ink-muted">Add any windows and doors in your room, with your own measurements. Skip if there are none nearby.</p>

      <div className="flex gap-2">
        <button onClick={() => addOpening('window', 0)} className={addBtn}>+ Add window</button>
        <button onClick={() => addOpening('door', 0)} className={addBtn}>+ Add door</button>
      </div>

      {room.openings.length === 0 && <p className="text-sm text-ink-muted">No windows or doors yet.</p>}

      <div className="space-y-3">
        {room.openings.map((o) => {
          const w = walls[Math.min(o.wallIndex, wallCount - 1)];
          const slide = w ? Math.round(w.length / 2) : 0;
          return (
            <div key={o.id} className="rounded-2xl bg-ivory-50 p-4 ring-1 ring-ivory-200">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold capitalize text-ink">{o.kind}</span>
                <button onClick={() => removeOpening(o.id)} className="text-xs font-medium text-ink-muted hover:text-red-600">Remove</button>
              </div>
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-ink-muted">On wall</p>
              <WallPicker count={wallCount} value={Math.min(o.wallIndex, wallCount - 1)} onChange={(i) => updateOpening(o.id, { wallIndex: i })} />
              <div className="mt-3 space-y-3">
                <DimensionSlider label="Width" value={o.width} min={12} max={120} onChange={(v) => updateOpening(o.id, { width: v })} />
                <DimensionSlider label="Height" value={o.height} min={12} max={Math.min(120, room.height)} onChange={(v) => updateOpening(o.id, { height: v })} />
                {o.kind === 'window' && (
                  <DimensionSlider label="Sill height" value={o.sill} min={0} max={Math.max(12, room.height - o.height)} onChange={(v) => updateOpening(o.id, { sill: v })} />
                )}
                <DimensionSlider label="Position along wall" value={o.offset} min={-slide} max={slide} onChange={(v) => updateOpening(o.id, { offset: v })} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

====================================================================
FILE: src/steps/PhotoRoomReviewStep.tsx
====================================================================
import { useStore } from '../store';

// Shown after a successful photo analysis. The result is already applied to the
// room; here the customer confirms the starting layout + measurements. Honest
// language: a STARTING draft, not an exact measurement.
export default function PhotoRoomReviewStep() {
  const result = useStore((s) => s.roomAnalysisResult);
  const photo = useStore((s) => s.roomPhoto);
  const setStep = useStore((s) => s.setStep);
  const resetScan = useStore((s) => s.resetRoomScan);

  if (!result) {
    // Shouldn't happen, but never strand the user.
    setStep('room');
    return null;
  }

  return (
    <div className="nice-scroll min-h-0 flex-1 overflow-y-auto px-6 py-10" style={{ background: 'radial-gradient(130% 100% at 50% -10%, #fdf9f2 0%, #f3ece0 100%)' }}>
      <div className="mx-auto max-w-3xl fade-up">
        <p className="eyebrow text-gold-600">From your photo</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink">We created a starting layout</h1>
        <p className="mt-2 text-sm text-ink-muted">Confirm these before ordering — we’ll verify exact measurements during shop review.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-[200px_1fr]">
          {photo && <img src={photo} alt="your room" className="h-44 w-full rounded-card object-cover ring-1 ring-ivory-200" />}
          <div className="premium-card p-5">
            <p className="text-sm text-ink-soft">{result.summary}</p>
            <p className="mt-2 text-xs text-ink-muted">Confidence: {Math.round(result.confidence * 100)}%</p>
            {result.assumptions.length > 0 && (
              <ul className="mt-3 list-disc space-y-1 pl-4 text-xs text-ink-muted">
                {result.assumptions.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            )}
          </div>
        </div>

        {result.requiredMeasurements.length > 0 && (
          <div className="premium-card mt-4 p-5">
            <h2 className="font-display text-lg font-semibold text-ink">Confirm these measurements</h2>
            <div className="mt-3 space-y-2">
              {result.requiredMeasurements.map((m) => (
                <div key={m.key} className="flex items-center justify-between text-sm">
                  <span className="text-ink-soft">{m.label}<span className="ml-2 text-xs text-ink-muted">{m.reason}</span></span>
                  <span className="font-semibold text-ink">{m.value ?? '—'} {m.unit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-7 flex flex-wrap gap-3">
          <button onClick={() => setStep('pieces')} className="premium-button px-6 py-3 text-sm">Looks right — continue</button>
          <button onClick={() => setStep('room')} className="premium-button-secondary px-5 py-3 text-sm" style={{ color: '#2e1c12', borderColor: 'rgba(184,138,68,0.5)' }}>Edit room manually</button>
          <button onClick={() => { resetScan(); setStep('entry'); }} className="px-5 py-3 text-sm font-semibold text-ink-muted hover:text-ink-soft">Retake photo</button>
        </div>
      </div>
    </div>
  );
}

====================================================================
FILE: src/steps/PiecesStep.tsx
====================================================================
import { useMemo } from 'react';
import { useStore, useSelectedUnit } from '../store';
import { CATALOG } from '../model/catalog';
import type { DoorConfig } from '../model/types';
import { footprint } from '../model/roomShapes';
import { Section, DimensionSlider, Stepper, OptionCards, Toggle } from '../controls/fields';
import { doorOptions, WallPicker } from '../controls/shared';
import MaterialSwatches from '../controls/MaterialSwatches';

export default function PiecesStep() {
  const units = useStore((s) => s.units);
  const selectedId = useStore((s) => s.selectedId);
  const room = useStore((s) => s.room);
  const addUnit = useStore((s) => s.addUnit);
  const removeUnit = useStore((s) => s.removeUnit);
  const duplicateUnit = useStore((s) => s.duplicateUnit);
  const selectUnit = useStore((s) => s.selectUnit);
  const sel = useSelectedUnit();

  return (
    <div className="space-y-6">
      {/* Catalog */}
      <Section title="Add a piece" subtitle="Build up your space — add as many as you like.">
        <div className="grid grid-cols-2 gap-2">
          {CATALOG.map((c) => (
            <button
              key={c.type}
              onClick={() => addUnit(c.type)}
              className="rounded-2xl border border-ivory-200 bg-white p-3 text-left transition hover:border-clay-300 hover:shadow-soft active:scale-[0.98]"
            >
              <div className="text-sm font-semibold text-ink">{c.name}</div>
              <div className="mt-0.5 text-[11px] leading-snug text-ink-muted">{c.blurb}</div>
            </button>
          ))}
        </div>
      </Section>

      {/* Your pieces */}
      {units.length > 0 && (
        <Section title={`Your pieces (${units.length})`}>
          <div className="flex flex-wrap gap-2">
            {units.map((u) => (
              <button
                key={u.id}
                onClick={() => selectUnit(u.id)}
                className={
                  'rounded-full px-3 py-1.5 text-xs font-semibold transition ' +
                  (u.id === selectedId ? 'bg-clay-600 text-white shadow-soft' : 'bg-white text-ink-soft ring-1 ring-ivory-200 hover:ring-clay-300')
                }
              >
                {u.label}
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* Editor for the selected unit */}
      {sel && <UnitEditor key={sel.id} room={room} onRemove={() => removeUnit(sel.id)} onDuplicate={() => duplicateUnit(sel.id)} />}

      {units.length === 0 && (
        <p className="rounded-xl bg-ivory-50 p-4 text-sm text-ink-muted">Add your first piece above to start designing.</p>
      )}
    </div>
  );
}

function UnitEditor({ room, onRemove, onDuplicate }: { room: ReturnType<typeof useStore.getState>['room']; onRemove: () => void; onDuplicate: () => void }) {
  const sel = useSelectedUnit()!;
  const setSelOverall = useStore((s) => s.setSelOverall);
  const updateSel = useStore((s) => s.updateSel);
  const setSelToeKick = useStore((s) => s.setSelToeKick);
  const setSelMaterials = useStore((s) => s.setSelMaterials);
  const setSelPlacement = useStore((s) => s.setSelPlacement);

  const walls = useMemo(() => (room.enabled ? footprint(room).walls : []), [room]);
  const cabWall = walls[Math.min(sel.placement.wallIndex, walls.length - 1)];
  const cabSlide = cabWall ? Math.round(cabWall.length / 2 - sel.overall.width / 2) : 0;
  const isShelf = sel.type === 'shelf';
  const isUpper = sel.type === 'upper';

  return (
    <div className="rounded-2xl border border-ivory-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-ink">{sel.label}</h3>
        <div className="flex gap-3 text-xs font-medium">
          <button onClick={onDuplicate} className="text-ink-muted hover:text-clay-700">Duplicate</button>
          <button onClick={onRemove} className="text-ink-muted hover:text-red-600">Remove</button>
        </div>
      </div>

      <div className="space-y-6">
        <Section title="Size">
          <DimensionSlider label="Width" value={sel.overall.width} min={6} max={120} onChange={(v) => setSelOverall({ width: v })} />
          <DimensionSlider label={isShelf ? 'Thickness' : 'Height'} value={sel.overall.height} min={isShelf ? 1 : 12} max={isShelf ? 4 : 120} onChange={(v) => setSelOverall({ height: v })} />
          <DimensionSlider label="Depth" value={sel.overall.depth} min={4} max={36} onChange={(v) => setSelOverall({ depth: v })} />
          {(isShelf || isUpper) && (
            <DimensionSlider label="Mount height (floor → bottom)" value={sel.mountHeight} min={0} max={Math.max(12, room.height - sel.overall.height)} onChange={(v) => updateSel({ mountHeight: v })} />
          )}
        </Section>

        {!isShelf && (
          <>
            <Section title="Layout">
              <Stepper label="Compartments" value={sel.sections} min={1} max={8} onChange={(v) => updateSel({ sections: v })} />
              <Stepper label="Shelves in each" value={sel.shelvesPerSection} min={0} max={12} onChange={(v) => updateSel({ shelvesPerSection: v })} />
            </Section>

            <Section title="Doors">
              <OptionCards<DoorConfig> value={sel.door} options={doorOptions} onChange={(v) => updateSel({ door: v })} columns={3} />
            </Section>

            {sel.type !== 'upper' && (
              <Section title="Base">
                <Toggle label="Recessed base (toe kick)" checked={sel.toeKick.enabled} onChange={(v) => setSelToeKick({ enabled: v })} />
                {sel.toeKick.enabled && <DimensionSlider label="Base height" value={sel.toeKick.height} min={2} max={10} onChange={(v) => setSelToeKick({ height: v })} />}
              </Section>
            )}
          </>
        )}

        <Section title="Finishes">
          <MaterialSwatches label={isShelf ? 'Shelf' : 'Cabinet body'} value={sel.materials.carcass} onChange={(v) => setSelMaterials({ carcass: v })} />
          {!isShelf && <MaterialSwatches label="Doors" value={sel.materials.doors} onChange={(v) => setSelMaterials({ doors: v })} />}
        </Section>

        {room.enabled && walls.length > 0 && (
          <Section title="Where it sits" subtitle="Drag the piece in the preview to move it — or pick a wall here.">
            <WallPicker count={walls.length} value={Math.min(sel.placement.wallIndex, walls.length - 1)} onChange={(i) => setSelPlacement({ wallIndex: i, offset: 0 })} />
            <DimensionSlider label="Slide along wall" value={sel.placement.offset} min={-cabSlide} max={cabSlide} onChange={(v) => setSelPlacement({ offset: v })} />
          </Section>
        )}
      </div>
    </div>
  );
}

====================================================================
FILE: src/steps/QuoteStep.tsx
====================================================================
import { useMemo, useState } from 'react';
import { useStore } from '../store';
import { buildProject } from '../model/buildParts';
import { priceModel } from '../pricing/engine';

function money(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

const Check = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" className="mt-0.5 shrink-0 text-clay-600" fill="none">
    <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function QuoteStep() {
  const units = useStore((s) => s.units);
  const result = useMemo(() => priceModel(buildProject(units)), [units]);
  const [requested, setRequested] = useState(false);

  if (units.length === 0) {
    return <p className="rounded-xl bg-ivory-50 p-4 text-sm text-ink-muted">Add at least one piece to see your quote.</p>;
  }

  const counts = units.reduce<Record<string, number>>((m, u) => ((m[u.type] = (m[u.type] || 0) + 1), m), {});
  const summary = Object.entries(counts).map(([t, n]) => `${n} ${t}${n > 1 ? 's' : ''}`).join(' · ');

  const includes = [
    'Furniture-grade plywood, built to your exact measurements',
    'Soft-close concealed hinges where there are doors',
    'Your choice of finish on every piece',
    'Crated and shipped to your door — nationwide',
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-ivory-200">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-clay-600">Your design is ready</p>
        <div className="mt-2 font-display text-5xl font-semibold text-ink">{money(result.customerPrice)}</div>
        <p className="mt-1.5 text-sm text-ink-muted">All-in estimate — materials, hardware, finishing & build. Shipping quoted after a measure.</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-ivory-100 px-3 py-1 text-[11px] font-medium text-ink-soft">{units.length} piece{units.length > 1 ? 's' : ''}</span>
          {summary && <span className="rounded-full bg-ivory-100 px-3 py-1 text-[11px] font-medium text-ink-soft capitalize">{summary}</span>}
        </div>

        {requested ? (
          <div className="mt-5 rounded-2xl bg-clay-50 px-4 py-4 text-center text-sm font-semibold text-clay-700 ring-1 ring-clay-200">
            Thank you — your design is saved. We'll reach out to confirm measurements and shipping.
          </div>
        ) : (
          <div className="mt-5 space-y-2.5">
            <button onClick={() => setRequested(true)} className="w-full rounded-2xl bg-clay-600 px-5 py-4 text-base font-semibold text-white shadow-lift transition hover:bg-clay-700 active:scale-[0.99]">Reserve this design</button>
            <button onClick={() => setRequested(true)} className="w-full rounded-2xl border border-ivory-200 bg-white px-5 py-3 text-sm font-semibold text-ink-soft transition hover:border-clay-300">Request a call about it</button>
          </div>
        )}
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-ivory-200">
        <h3 className="font-display text-lg font-semibold text-ink">What's included</h3>
        <ul className="mt-3 space-y-2.5">
          {includes.map((line) => (
            <li key={line} className="flex gap-2 text-sm text-ink-soft"><Check /><span>{line}</span></li>
          ))}
        </ul>
        <p className="mt-4 border-t border-ivory-100 pt-3 text-xs text-ink-muted">Final quote confirmed after we verify your measurements.</p>
      </div>
    </div>
  );
}

====================================================================
FILE: src/steps/RoomStep.tsx
====================================================================
import { useStore } from '../store';
import type { RoomShape } from '../model/room';
import { Section, DimensionSlider, OptionCards, Toggle } from '../controls/fields';
import { shapeOptions } from '../controls/shared';

export default function RoomStep() {
  const room = useStore((s) => s.room);
  const setRoom = useStore((s) => s.setRoom);

  return (
    <div className="space-y-6">
      <Toggle label="Design within a room" checked={room.enabled} onChange={(v) => setRoom({ enabled: v })} />

      {!room.enabled ? (
        <p className="rounded-xl bg-ivory-50 p-4 text-sm text-ink-muted">
          No problem — we'll show your piece on its own. You can turn this on anytime to see it in
          your space.
        </p>
      ) : (
        <>
          <Section title="Room shape" subtitle="Pick the one closest to your space.">
            <OptionCards<RoomShape> value={room.shape} options={shapeOptions} onChange={(v) => setRoom({ shape: v })} columns={3} />
          </Section>

          <Section title="Measurements">
            <DimensionSlider label="Room width" value={room.width} min={48} max={360} onChange={(v) => setRoom({ width: v })} />
            <DimensionSlider label="Room depth" value={room.length} min={48} max={360} onChange={(v) => setRoom({ length: v })} />
            <DimensionSlider label="Ceiling height" value={room.height} min={84} max={156} onChange={(v) => setRoom({ height: v })} />

            {(room.shape === 'l' || room.shape === 'u') && (
              <>
                <DimensionSlider label="Notch width" value={room.notchW} min={12} max={Math.max(24, room.width - 24)} onChange={(v) => setRoom({ notchW: v })} />
                <DimensionSlider label="Notch depth" value={room.notchL} min={12} max={Math.max(24, room.length - 24)} onChange={(v) => setRoom({ notchL: v })} />
              </>
            )}
            {room.shape === 'alcove' && (
              <>
                <DimensionSlider label="Alcove width" value={room.recessW} min={18} max={Math.max(24, room.width - 24)} onChange={(v) => setRoom({ recessW: v })} />
                <DimensionSlider label="Alcove depth" value={room.recessD} min={6} max={36} onChange={(v) => setRoom({ recessD: v })} />
              </>
            )}
            {room.shape === 'corner' && (
              <DimensionSlider label="Corner cut" value={room.corner} min={12} max={Math.max(18, Math.min(room.width, room.length) - 12)} onChange={(v) => setRoom({ corner: v })} />
            )}
          </Section>
        </>
      )}
    </div>
  );
}

====================================================================
FILE: src/store.ts
====================================================================
// =============================================================================
// APP STATE (Zustand)
// =============================================================================
// The design = a Room + a list of Units. Plus UI state (wizard step, selection,
// view). The 3D scene, pricing, and cut list all read from here.
// =============================================================================

import { create } from 'zustand';
import type { Unit, UnitType } from './model/types';
import { makeUnit } from './model/catalog';
import {
  defaultRoom,
  newOpening,
  type RoomModel,
  type Opening,
  type OpeningKind,
} from './model/room';
import type { RoomScanStatus, RoomAnalysisResult } from './model/roomAnalysis';
import { requestRoomAnalysis, AnalysisUnavailableError } from './services/roomAnalysis';

export type ViewMode = 'design' | 'maker';

/** Wizard steps. welcome + entry + photoReview are full-screen; rest are the wizard. */
export type Step = 'welcome' | 'entry' | 'photoReview' | 'room' | 'openings' | 'pieces' | 'quote';

/** Maker mode is gated — never visible to customers on the public site. */
export function makerEnabled(): boolean {
  try {
    if (new URLSearchParams(location.search).get('maker') === '1') return true;
    if (localStorage.getItem('STUDIO_MAKER_MODE') === 'true') return true;
  } catch { /* ignore */ }
  return import.meta.env.VITE_ENABLE_MAKER_MODE === 'true';
}

type UnitPatch = Partial<Unit>;

interface AppState {
  room: RoomModel;
  units: Unit[];
  selectedId: string | null;
  /** Id of the unit currently being dragged in the 3D view (disables orbit). */
  draggingId: string | null;
  setDragging: (id: string | null) => void;
  /** Optional reference photo of the room + analysis state. */
  roomPhoto: string | null;
  roomScanStatus: RoomScanStatus;
  roomScanError: string | null;
  roomAnalysisResult: RoomAnalysisResult | null;
  analyzeRoomPhoto: (file: File) => Promise<void>;
  applyRoomAnalysis: (r: RoomAnalysisResult) => void;
  resetRoomScan: () => void;

  view: ViewMode;
  setView: (v: ViewMode) => void;
  step: Step;
  setStep: (s: Step) => void;
  setRoomPhoto: (dataUrl: string | null) => void;

  // Units
  addUnit: (type: UnitType) => void;
  removeUnit: (id: string) => void;
  duplicateUnit: (id: string) => void;
  selectUnit: (id: string) => void;
  updateUnit: (id: string, patch: UnitPatch) => void;
  // Selected-unit convenience setters
  updateSel: (patch: UnitPatch) => void;
  setSelOverall: (patch: Partial<Unit['overall']>) => void;
  setSelToeKick: (patch: Partial<Unit['toeKick']>) => void;
  setSelMaterials: (patch: Partial<Unit['materials']>) => void;
  setSelConstruction: (patch: Partial<Unit['construction']>) => void;
  setSelPaint: (paint: Unit['paint']) => void;
  setSelPlacement: (patch: Partial<Unit['placement']>) => void;

  // Room
  setRoom: (patch: Partial<RoomModel>) => void;
  addOpening: (kind: OpeningKind, wallIndex: number) => void;
  updateOpening: (id: string, patch: Partial<Opening>) => void;
  removeOpening: (id: string) => void;
}

export const useStore = create<AppState>((set) => {
  const patchUnit = (s: AppState, id: string | null, patch: UnitPatch): Partial<AppState> => ({
    units: s.units.map((u) => (u.id === id ? { ...u, ...patch } : u)),
  });

  return {
    room: defaultRoom,
    units: [],
    selectedId: null,
    draggingId: null,
    setDragging: (id) => set({ draggingId: id }),
    roomPhoto: null,
    roomScanStatus: 'idle',
    roomScanError: null,
    roomAnalysisResult: null,

    analyzeRoomPhoto: async (file) => {
      // Keep a thumbnail/reference regardless of whether analysis succeeds.
      const dataUrl = await new Promise<string | null>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
      set({ roomPhoto: dataUrl, roomScanStatus: 'analyzing', roomScanError: null, roomAnalysisResult: null });
      try {
        const result = await requestRoomAnalysis(file);
        set({ roomScanStatus: 'success', roomAnalysisResult: result });
      } catch (e) {
        const unavailable = e instanceof AnalysisUnavailableError;
        set({
          roomScanStatus: 'error',
          roomScanError: unavailable
            ? 'Photo analysis isn’t connected yet — you can still use this photo as a reference and shape the room yourself.'
            : (e as Error).message || 'Analysis failed.',
        });
      }
    },

    applyRoomAnalysis: (r) =>
      set((s) => {
        const room: RoomModel = { ...s.room, enabled: true, shape: r.room.shape };
        const keys = ['width', 'length', 'height', 'notchW', 'notchL', 'recessW', 'recessD', 'corner'] as const;
        for (const k of keys) if (typeof r.room[k] === 'number') (room as any)[k] = r.room[k];
        room.openings = r.openings.map((o, i) => ({ id: `op${i}`, kind: o.kind, wallIndex: o.wallIndex, offset: o.offset, width: o.width, height: o.height, sill: o.sill }));
        return { room };
      }),

    resetRoomScan: () => set({ roomScanStatus: 'idle', roomScanError: null, roomAnalysisResult: null, roomPhoto: null }),

    view: 'design',
    setView: (v) => set({ view: v }),
    step: 'welcome',
    setStep: (s) => set({ step: s }),
    setRoomPhoto: (dataUrl) => set({ roomPhoto: dataUrl }),

    addUnit: (type) =>
      set((s) => {
        const u = makeUnit(type);
        // Tile new units to the right of any already on the same wall.
        const used = s.units
          .filter((x) => x.placement.wallIndex === u.placement.wallIndex)
          .reduce((a, x) => a + x.overall.width, 0);
        u.placement = { ...u.placement, offset: used };
        return { units: [...s.units, u], selectedId: u.id };
      }),
    removeUnit: (id) =>
      set((s) => {
        const units = s.units.filter((u) => u.id !== id);
        return { units, selectedId: s.selectedId === id ? (units[0]?.id ?? null) : s.selectedId };
      }),
    duplicateUnit: (id) =>
      set((s) => {
        const src = s.units.find((u) => u.id === id);
        if (!src) return {};
        const copy: Unit = { ...src, id: `u${Date.now()}`, label: `${src.label} copy`, placement: { ...src.placement, offset: src.placement.offset + src.overall.width } };
        return { units: [...s.units, copy], selectedId: copy.id };
      }),
    selectUnit: (id) => set({ selectedId: id }),
    updateUnit: (id, patch) => set((s) => patchUnit(s, id, patch)),

    updateSel: (patch) => set((s) => patchUnit(s, s.selectedId, patch)),
    setSelOverall: (patch) => set((s) => patchUnit(s, s.selectedId, { overall: { ...sel(s)!.overall, ...patch } })),
    setSelToeKick: (patch) => set((s) => patchUnit(s, s.selectedId, { toeKick: { ...sel(s)!.toeKick, ...patch } })),
    setSelMaterials: (patch) => set((s) => patchUnit(s, s.selectedId, { materials: { ...sel(s)!.materials, ...patch } })),
    setSelConstruction: (patch) => set((s) => patchUnit(s, s.selectedId, { construction: { ...sel(s)!.construction, ...patch } })),
    setSelPaint: (paint) => set((s) => patchUnit(s, s.selectedId, { paint })),
    setSelPlacement: (patch) => set((s) => patchUnit(s, s.selectedId, { placement: { ...sel(s)!.placement, ...patch } })),

    setRoom: (patch) => set((s) => ({ room: { ...s.room, ...patch } })),
    addOpening: (kind, wallIndex) => set((s) => ({ room: { ...s.room, openings: [...s.room.openings, newOpening(kind, wallIndex)] } })),
    updateOpening: (id, patch) => set((s) => ({ room: { ...s.room, openings: s.room.openings.map((o) => (o.id === id ? { ...o, ...patch } : o)) } })),
    removeOpening: (id) => set((s) => ({ room: { ...s.room, openings: s.room.openings.filter((o) => o.id !== id) } })),
  };
});

/** The currently selected unit (or undefined). */
export function sel(s: AppState): Unit | undefined {
  return s.units.find((u) => u.id === s.selectedId);
}

/** Hook helper: the selected unit. */
export const useSelectedUnit = () => useStore((s) => s.units.find((u) => u.id === s.selectedId));

====================================================================
FILE: src/Wizard.tsx
====================================================================
import { useStore, makerEnabled, type Step } from './store';
import Scene from './scene/Scene';
import RoomStep from './steps/RoomStep';
import OpeningsStep from './steps/OpeningsStep';
import PiecesStep from './steps/PiecesStep';
import QuoteStep from './steps/QuoteStep';

type WStep = 'room' | 'openings' | 'pieces' | 'quote';

const META: Record<WStep, { title: string; subtitle: string }> = {
  room: { title: 'Your room', subtitle: 'Start with the space your pieces will live in.' },
  openings: { title: 'Windows & doors', subtitle: 'Add anything near your built-ins.' },
  pieces: { title: 'Your pieces', subtitle: 'Add cabinets and shelves, then size each one.' },
  quote: { title: 'Your quote', subtitle: 'Everything that goes into it.' },
};

export default function Wizard() {
  const step = useStore((s) => s.step) as WStep;
  const setStep = useStore((s) => s.setStep);
  const roomEnabled = useStore((s) => s.room.enabled);
  const setView = useStore((s) => s.setView);

  const order: WStep[] = roomEnabled ? ['room', 'openings', 'pieces', 'quote'] : ['pieces', 'quote'];
  const idx = Math.max(0, order.indexOf(step));
  const meta = META[step];

  const goBack = () => (idx === 0 ? setStep('entry' as Step) : setStep(order[idx - 1]));
  const goNext = () => idx < order.length - 1 && setStep(order[idx + 1]);
  const nextLabel = order[idx + 1] === 'quote' ? 'See my quote' : 'Continue';

  return (
    <div className="flex h-full min-h-0 flex-col bg-ivory">
      <header className="flex items-center justify-between gap-4 border-b border-ivory-200 bg-ivory-50/80 px-4 py-3 backdrop-blur sm:px-6">
        <span className="font-display text-lg font-semibold tracking-tight text-ink">Studio</span>
        <div className="flex flex-1 items-center justify-center gap-2">
          <div className="h-1.5 w-full max-w-[220px] overflow-hidden rounded-full bg-ivory-200">
            <div className="h-full rounded-full bg-clay-600 transition-all" style={{ width: `${((idx + 1) / order.length) * 100}%` }} />
          </div>
          <span className="hidden whitespace-nowrap text-xs font-medium text-ink-muted sm:inline">Step {idx + 1} of {order.length}</span>
        </div>
        {makerEnabled() ? (
          <button onClick={() => setView('maker')} className="text-xs font-medium text-ink-muted transition hover:text-clay-700">Maker</button>
        ) : (
          <span className="w-10" />
        )}
      </header>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="relative h-[42vh] w-full shrink-0 md:h-auto md:flex-1" style={{ background: 'radial-gradient(120% 90% at 50% 12%, #fcf8f1 0%, #f0e6d6 60%, #e7d8be 100%)' }}>
          <Scene />
        </div>

        <aside className="nice-scroll flex min-h-0 flex-1 flex-col overflow-y-auto border-t border-ivory-200 bg-ivory-50 md:w-[400px] md:flex-none md:border-l md:border-t-0">
          <div key={step} className="fade-up flex-1 p-5 sm:p-6">
            <h2 className="font-display text-2xl font-semibold text-ink">{meta.title}</h2>
            <p className="mt-1 mb-5 text-sm text-ink-muted">{meta.subtitle}</p>
            {step === 'room' && <RoomStep />}
            {step === 'openings' && <OpeningsStep />}
            {step === 'pieces' && <PiecesStep />}
            {step === 'quote' && <QuoteStep />}
          </div>
        </aside>
      </div>

      <nav className="flex items-center justify-between gap-3 border-t border-ivory-200 bg-white px-4 py-3 sm:px-6">
        <button onClick={goBack} className="rounded-full px-4 py-2.5 text-sm font-semibold text-ink-soft transition hover:bg-ivory-100">← Back</button>
        {step !== 'quote' ? (
          <button onClick={goNext} className="rounded-full bg-clay-600 px-7 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-clay-700 active:scale-95">{nextLabel} →</button>
        ) : (
          <button onClick={() => setStep('welcome')} className="rounded-full px-4 py-2.5 text-sm font-semibold text-ink-muted transition hover:bg-ivory-100">Start over</button>
        )}
      </nav>
    </div>
  );
}

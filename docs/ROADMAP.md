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

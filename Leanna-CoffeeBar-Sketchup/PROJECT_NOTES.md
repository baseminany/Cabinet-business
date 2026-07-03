# Leanna — Coffee / Beverage Bar  (standalone project, NOT House of Nook)

Cross-AI shared notes. Source of truth = the project brief + the room photos.
Build script: `leanna_coffee_bar_v01.rb` (paste into SketchUp Ruby Console; idempotent).

## Orientation (lock this)
Stand at the ENTRY, face the WINDOW:
- RIGHT = half wall + pass-through ("fake window"); banquette/dining on the far side.
- LEFT  = accent wall  → walnut + brass shelves go here.
- Coordinates in script: X 0(accent/left)→79.5(open/right) | Y 0(entry)→depth(window) | Z up.

## Field dimensions (given)
- Window/back wall: 79.5 wide. Window 35 wide; 21.75 left / 22.75 right. Window unit H 46.75.
- Open/right wall: 74.625 total. Pass-through split (facing wall, window on left):
  6" solid (entry/right end) + 48.375 opening + 20.25 solid (window/left corner) = 74.625.
- Accent/left wall: 74.375 (parallel to open wall). Accent-wall jamb (pet bowls) 7.375, full-height,
  at the entry-LEFT — parallel to the half wall (the two frame the entry).
- Room height 108. Floor→entry header 96.
- HALF WALL = the capped pony wall on the RIGHT of the entry (tape measure sits on its cap).
  27.75 wide × 44.25 tall w/ trim (42.125 w/o) × ~6 thick (assumed). It caps the FRONT of the
  right leg; the 35.75 counter runs BEHIND it (counter lower, half wall taller).
- Counter: 21 deep back run (under window). Right leg = peninsula 27.75 deep. Reuse + raise.
- Pass-through ("fake window"): opening 51.75 tall, sill 44.25 = top of half wall, head 96 (= entry header).
- Window sill: 42 off floor (head 88.75).

## Decisions / assumptions (confirm)
- HEIGHTS (confirmed by Leanna): carcass 34.5, counter underside 34.625, finished top 35.75,
  quartz slab 1.125. Fridge (33.875) clears the 34.625 underside by ~3/4". (1/8 buildup between
  carcass top 34.5 and counter underside 34.625.)
- Counter is ONE single-height L (35.75). The 44.25 half wall is a WALL in front of the right
  leg, not a counter.
- CARCASSES: proper 3/4" frameless UV ply per Basem's prompt — 3/4 sides/bottom/shelf, 1/4
  captured back, front stretcher + rear nailer, plastic levelers + clip-on toe (4.5),
  full-overlay fronts, 1/8 reveals.
- Right-leg layout (entry→window): half wall → 2" filler (fridge door clearance) → fridge →
  base cab → CORNER unit at the inside corner. Back run: 3-drawer base (REUSE) + sink base.
- Reused counter = QUARTZ 1-1/8 (confirmed). Confirm fabricator can pull + re-set higher.
- OPEN ITEMS: half-wall thickness/depth (assumed 6) + whether counter laps onto it;
  corner-unit type (blind / lazy-susan / diagonal).
- Pass-through solid-return split assumed 4" at the window end. FIELD VERIFY which end is solid.

## Appliance — Zephyr Presrv PRB24C01CPG (panel-ready), CONFIRMED from spec PDF
- 23-7/8 W × 33-7/8 H (→34-7/8 max w/ legs) × 23-3/4 D (with 3/4 panel).
- Built-in / FRONT-VENT → can be fully enclosed; KEEP the bottom front kick grille clear.
- Field-reversible door, needs 110° swing → hinge AWAY from the 2" wall filler.
- Overlay panel to build: 23-5/8 × 29-7/8 × 5/8–3/4 thick (panel NOT included).
- Placement: half-wall (right) side, against the window wall: wall → 2" filler → fridge.
- Depth: fits the 27.75 peninsula cap, but minus ~5" pony wall ≈ 22.75 cavity → cut ~1–3"
  of studs to seat it. Confirm wall not load-bearing / insulated / plumbed first.

## Open design items (unknowns — color-coded in model)
- Base cabinets: TBD (orange). Drawer base = reuse (green).
- Sink: PROPOSED small undermount bar bowl (16×13), centered on window (teal).
  Plumbing is NEW (none here) — DO NOT CUT until rough-in set. Faucet vs window glass:
  ~1.5" before the sill → low-profile / wall-mount / offset.
- Fridge custom panel: to design (blue).
- Shelves: PRIMARY = accent wall (walnut + brass). OPTIONAL = flank the window.

## Status
- v02 model built (orientation fixed, single-height L, no overlaps, Entry View scene).
- Next: confirm 34.5 cab-vs-finished, counter material/thickness, half-wall return side,
  window sill; then refine cabinet layout + final shelf design with Leanna.

# Linda Laundry Room — field notes & decisions (source of truth)

Standalone SketchUp millwork job. Build script: `linda_laundry_v04.rb` (full model:
room shell + wall-4 run + sink base under the window; v01–v03 superseded).
Follow Basem's living woodworking operating prompt for HOW to build; this file is
the source of truth for THIS job's dims/geometry. Reconcile with the vault if they
ever disagree (newer dated note wins).

## Orientation (locked)
Stand IN THE DOORWAY looking in. Wall 1 is across from you; then turn RIGHT.
- **Wall 1** = BACK wall (far)  → window + wall vent. `+Y` face at `Y = RD`.
- **Wall 2** = RIGHT wall → the **"off wall 2" datum**. `+X` face at `X = RW`.
- **Wall 3** = FRONT wall → the DOOR. The `Y = 0` face (you enter here).
- **Wall 4** = LEFT wall → the `X = 0` face.
- Axes: `+X` = wall4→wall2 (right), `+Y` = door→back wall, `+Z` = up.
- Saved scenes "Entry View" + "Plan (Top)" reproduce this POV (flip catcher).

## Envelope (inches)
| Wall | Length | Notes |
|------|--------|-------|
| Wall 1 (back) | **84.5** | window + vent |
| Wall 2 (right) | **93.25** | measurement datum |
| Wall 3 (front) | **84.875** | door, tight to wall 2 (was given as 84 3/8 first — confirm) |
| Wall 4 (left) | **93.5** | |
| Ceiling height | **96** | measured once — confirm at all corners |

**v02 models the TRUE quadrilateral** — each wall is its exact measured length (v01
wrongly forced a rectangle and showed 84 1/2 for wall 3). With 4 unequal walls and no
diagonals, the room can't be a rectangle; v02 anchors the wall-2 datum corner (W1↔W2)
square and lets the far (wall-4) corner carry the ~1/8–3/8" out-of-square. Computed
corners (in): FR(84.88, 0), BR(84.88, 93.25), BL(0.38, 93.25), FL(0.00, −0.25). Walls 1
& 2 come out axis-aligned; walls 3 & 4 tilt <0.25° (invisible). Wall thickness 4.5" nom.
**Send the two tape diagonals (corner→corner) to lock the exact skew** — lengths are
already exact regardless.

## Window (wall 1)
- Trim-to-trim (outer casing): **28 W × 49 H**. Inside opening (glass): **23 W × 44 H**.
  → uniform **2.5" casing** all around.
- **7 3/16"** from wall 2 to the outer trim edge (right side).
- **34 3/4"** floor → bottom of trim.  Glass sits 2.5" in → glass bottom 37.25", top 81.25".
- Computed glass extents: X **51.8125 → 74.8125**, Z **37.25 → 81.25**.
- Sill (trim bottom) at 34.75" ≈ a 34.5–36" counter → likely a **folding counter under the window**.

## Wall vent (wall 1, low)
- Size **11.5 W × 7.25 H** modeled (landscape ≈ a 6×10 register flange). **CONFIRM W-vs-H
  and supply vs return.**
- Bottom **7 3/8"** off the floor. Near (right) edge **10 1/4"** off wall 2.
- Computed register extents: X **62.75 → 74.25**, Z **7.375 → 14.625** (below the window).
- A base cabinet / toe area here must not block it — flag when we lay out cabinets.

## Door (wall 3)
- Inside jamb (clear opening): **32 1/4 W × 81 H**. Leaf itself **31 7/8"**.
- Casing "similar to the window" → **2.5"** both jambs + head (no casing at the floor).
- Outer trim ≈ **1"** off wall 2 (CONFIRM). Computed clear opening X **48.75 → 81.0**.
- **Swing** (radius = leaf 31.875") swings **into the room, toward wall 2**.
  - Modeled default `DOOR_HINGE = :wall2_side` → hinge at the RIGHT jamb, leaf parks
    flat toward wall 2; the swept quarter-disc is to its LEFT (toward room center).
  - If it actually **sweeps the wall-2 corner** instead, flip to `:room_side` (one edit).
  - Keep-out drawn on `10_Clearance_Check_IGNORE` (floor sector + ghost open leaf).

## Tags (all *_IGNORE — nothing hits OpenCutList yet)
**Per-wall tags for walk-through** (hide one wall to see in): `06_Wall_1_BACK` (carries the
window + vent), `06_Wall_2_RIGHT`, `06_Wall_3_FRONT_DOOR` (carries the door), `06_Wall_4_LEFT`,
plus `06_Floor`, `06B_Ceiling`, and `10_Door_Swing_Clearance` (swing kept separate so it can
stay visible while walking). A wall's openings ride its tag, so they hide with the wall. Each
wall also has a floating text label. All `*_IGNORE`.

## Open questions / DO-NOT-CUT-YET
1. **Confirm the door hinge side** (default hinge on wall-2 side, parks toward wall 2).
2. **Vent orientation** (W vs H) + supply/return.
3. **Diagonals + 3-height wall measures** to confirm out-of-square before sizing runs.
4. Ceiling height at all four corners (floors/ceilings slope).
5. **Cabinet program**: which walls get cabinetry, appliances (washer/dryer — stacked or
   side-by-side? pedestals?), sink/faucet?, folding counter under the window, upper storage.

## Use + cabinet build (V03, everything on WALL 4)
Laundry/mudroom. **LG WashTower WKEX200HWA** (27 W × 74⅜ H × 30⅜ D; ~55" door-open;
~1" side/rear clearance). Frameless carcasses, **full-overlay shaker (Stumpy Nubs 2-bit
cope-and-stick)**, **light walnut** throughout. All units 30⅜" deep (flush w/ washer)
except the 21"-deep bench.

**Out-of-square method (agreed):** build boxes DEAD SQUARE, set the run out perpendicular
to wall 1 (the square datum), and put the room's error in **named scribe fillers** at the
wall-1 and wall-3 ends (+ toe/leveler + back scribe). Run sized to the safe 93.25 depth.
On install, trim a FILLER not a box. Gate before cutting: wall 4 ×3 heights (smallest),
2 diagonals, W1↔W4 square, floor high point.

**Sequence (wall-1 corner → wall 3):** ¾" scribe filler · **corner tower 12"** (doors 75"
+ 15") · 1" gap · **LG WashTower 27"** + upper cab · 1" gap · **tall storage 21"** (two
full-height side-by-side doors) · **bench 29¾"** (hinged lift-lid @ 19" + ~2" cushion) ·
¾" scribe filler. **Uppers band:** 15" tall, bottoms ~79³⁄₁₆", tops 94¼", FLUSH 30⅜" deep
→ single clean **crown** line (light-walnut sprung cove, not flat trim). **Shiplap** =
nickel-gap (~⅛") light walnut behind the bench, seat→uppers. WashTower modeled to resemble
the unit + open washer/dryer door footprints (hinge LEFT default — CONFIRM) + 55" front
clearance zone.

Tags: `01_Carcasses 02_Doors_and_Faces 03_Bench_Lid_Cushion 05_Toe_Kicks_Fillers
05B_Crown_Molding 05C_Shiplap` (cut list) + room `06_Wall_*`, `08_Appliance…IGNORE`,
`10_Clearance…IGNORE`.

## Laundry sink (V04) — under the window, wall 1
Client wanted a laundry sink; room read as tight but only wall 4 was used. Chosen: **Option
C — sink under the window on wall 1**. 30" light-walnut base **centered on the glass**,
single 16×18 undermount bowl, pull-down faucet, 2 shaker doors. **Counter @ 34¾"** = the
window sill-trim bottom, so it tucks under with no casing rework. Clear of the WashTower
(door hinges front, sits ~Y53). **Vent RELOCATED** off wall 1 to a **toe-kick register** in
the sink base (re-route the duct). Counter modeled as light-walnut butcher block — **seal
well or swap to quartz** near water. Plumbing keep-out + back cut-later included.
(Alternatives considered: A = sink on wall 4, bench→wall 3; B = shallow base on wall 2.)

## Status
V04 = full model (shell + wall-4 run + sink under window). V03 = shell + wall-4 run. Verified `ruby -c` + mocked-SketchUp run (no ≤0
dims, no nils). Open confirms: W3 84⅞ vs 84⅜; vent W-vs-H; WashTower hinge sides; the two
room diagonals (to lock exact skew). Next after review: pulls/hardware choice, adjustable
shelf counts, finalize crown profile + shiplap board width, then OpenCutList pass.

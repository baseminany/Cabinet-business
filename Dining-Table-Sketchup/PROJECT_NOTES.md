# Dining table — breakfast nook (per-job brief = source of truth)

Design v3, locked 2026-07-11. First-ever table build. Bench DROPPED from scope (buying instead).

## Spec
- 66" L × 37" W × 30" H. White oak **8/4 S4S** throughout (1¾" finished). Solid, not ply.
- Top: edge-glued, grain along length. **Textured/hewn edge on the FRONT long edge ONLY** (one side, not two): jigsaw wave → drawknife/spokeshave or grinder carving disc → sand 80→180.
- Legs: two slab panels 1¾ × 26 × 28¼, grain vertical, inset 12" from each end (outer face). Each = 3 boards edge-glued.
- Beam: 1¾ × 4 × 38½ hidden under top between legs. Knee clearance 24¼" (don't raise beam_h past 4).
- Glue-ups: track-saw complementary-cut jointing (no jointer); **Tenso P-14 every 6–8" = clampless**; preload clips; stages of 2–3 boards.
- Finish: Rubio Monocoat Oil Plus 2C "Pure", hand-applied.

## Hardware (all modeled as red markers, tag 09_Hardware_IGNORE)
- 2× **Clamex P-14 pairs** — beam ends → legs, vertical, centered; 6mm lever access from beam underside. Makes the base knockdown.
- 4× pocket screws 2½" — 2 per joint, beam underside → leg (insurance; omit for pure knockdown).
- 8× **figure-8 fasteners** — 4 per leg, mortised flush into leg top edge (Forstner), #8×1¼ up into top; they swivel so the top can move.
- 2× steel L-brackets — beam sides → top underside near midspan; **slots run ACROSS width** (movement).
- NOTHING glued or hard-screwed across the top's width — 37" oak moves ~¼–3/8" seasonally.

## Files
- `dining_table_v01.rb` — idempotent CONFIG build; verified (ruby -c + mocked run, all checks PASS).
  Load: `load "/Users/baseminany/Desktop/Cabinet Business/Dining-Table-Sketchup/dining_table_v01.rb"`
- OCL: exclude tag `09_Hardware_IGNORE`; material = solid wood; grain follows part length (legs modeled grain-vertical).
- Buy: ~73 bd-ft 8/4 S4S white oak (56.5 net × 1.30).

## Open
- Nook dims still unconfirmed → table_w 37 is the only number likely to move (CONFIG one-liner change).
- Leg plank seams: default = seamless match; optional 1/16" V-groove chamfer at each seam as a deliberate detail (decide before leg glue-up).

Craft rules: vault [[furniture-tables-fundamentals]] · job page [[job-nook-dining-table]].

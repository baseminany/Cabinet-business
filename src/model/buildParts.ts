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
  // Montessori forward-facing bookshelf — open carcass with display ledges + rails.
  if (unit.type === 'montessori') return buildMontessori(unit);
  // Twin-over-twin bunk bed — plywood panel ends, rails, slatted decks, ladder.
  if (unit.type === 'bunk') return buildBunk(unit);
  // Montessori learning tower — toddler kitchen helper with a safe standing platform.
  if (unit.type === 'learning-tower') return buildLearningTower(unit);

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

  // Sides — full height, full depth, continuous to the floor (compression loads
  // go straight through the wood). Tiered joinery for TIME efficiency: normal
  // casework joins with Lamello P-System slots (~15s each, self-aligning — no
  // dado setup); only people-load surfaces (seats/steps) get a routed dado.
  // Back sits in a 1/4" groove — one saw pass, keeps the box square.
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
      notes: 'Lamello slots for top/bottom (Tenso shop-side, Clamex customer-side); 1/4" back groove. Add a shallow dado ONLY if the top is a seat.',
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
    notes: 'Lamello-joined to the sides (no screws). If used as a seat/step, house it in a shallow dado instead.',
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

// =============================================================================
// MONTESSORI forward-facing bookshelf
// =============================================================================
// A low, child-height open shelf with shallow display ledges + front retaining
// rails so book covers face out. Material-efficient: one carcass box + thin
// ledges and rails, all nesting from a single sheet for a typical 30" unit.
//   • full-height sides capture top + bottom (frameless)
//   • 1/4" back for squareness
//   • N display ledges (shelvesPerSection drives count; default 3)
//   • a low front rail per ledge to hold books in place
// =============================================================================
function buildMontessori(unit: Unit): BuiltUnit {
  const parts: Part[] = [];
  let n = 0;
  const id = (role: string) => `${role}-${n++}`;

  const T = C.carcassThickness;
  const TB = C.backThickness;
  const W = unit.overall.width;
  const H = unit.overall.height;
  const D = unit.overall.depth;
  const mat = unit.materials;

  const interiorWidth = W - 2 * T;
  const interiorHeight = H - 2 * T;
  const bottomInsideY = T;
  const frontZ = D / 2;
  const backInsideZ = -D / 2 + TB;

  // Sides — full height.
  for (const side of [-1, 1] as const) {
    parts.push({
      id: id('side'),
      name: side < 0 ? 'Side (Left)' : 'Side (Right)',
      role: 'side',
      material: mat.carcass,
      length: H,
      width: D,
      thickness: T,
      grain: 'length',
      bandedEdges: ['L1'],
      position: { x: side * (W / 2 - T / 2), y: H / 2, z: 0 },
      size3d: { w: T, h: H, d: D },
    });
  }

  // Bottom + Top captured between the sides.
  for (const [name, cy] of [
    ['Bottom', bottomInsideY - T / 2],
    ['Top', H - T / 2],
  ] as const) {
    parts.push({
      id: id(name.toLowerCase()),
      name,
      role: name === 'Top' ? 'top' : 'bottom',
      material: mat.carcass,
      length: interiorWidth,
      width: D,
      thickness: T,
      grain: 'length',
      bandedEdges: ['L1'],
      position: { x: 0, y: cy, z: 0 },
      size3d: { w: interiorWidth, h: T, d: D },
    });
  }

  // Back — 1/4" panel for squareness.
  parts.push({
    id: id('back'),
    name: 'Back Panel',
    role: 'back',
    material: mat.back,
    length: interiorHeight,
    width: interiorWidth,
    thickness: TB,
    grain: 'length',
    bandedEdges: [],
    position: { x: 0, y: H / 2, z: backInsideZ - TB / 2 },
    size3d: { w: interiorWidth, h: interiorHeight, d: TB },
  });

  // Display ledges + front rails. shelvesPerSection drives the pocket count.
  const pockets = Math.max(2, Math.floor(unit.shelvesPerSection) || 3);
  const ledgeDepth = D - TB - 0.5; // nearly full depth; book leans back
  const ledgeCenterZ = (frontZ + backInsideZ) / 2;
  const railH = 3.0; // low retaining rail
  const railThk = 0.5;
  for (let k = 1; k <= pockets; k++) {
    const y = bottomInsideY + (k * interiorHeight) / (pockets + 1);
    // Display ledge (a shallow shelf).
    parts.push({
      id: id('shelf'),
      name: 'Display Ledge',
      role: 'shelf',
      material: mat.carcass,
      length: interiorWidth,
      width: ledgeDepth,
      thickness: T,
      grain: 'length',
      bandedEdges: ['L1'],
      position: { x: 0, y, z: ledgeCenterZ },
      size3d: { w: interiorWidth, h: T, d: ledgeDepth },
    });
    // Front retaining rail (covers face the room, rail keeps them from sliding).
    parts.push({
      id: id('rail'),
      name: 'Book Rail',
      role: 'shelf',
      material: mat.carcass,
      length: interiorWidth,
      width: railH,
      thickness: railThk,
      grain: 'length',
      bandedEdges: ['L1', 'W1', 'W2'],
      position: { x: 0, y: y + railH / 2, z: frontZ - railThk / 2 - 0.25 },
      size3d: { w: interiorWidth, h: railH, d: railThk },
      notes: 'Low front rail so book covers face out without sliding off.',
    });
  }

  const shelves = parts.filter((p) => p.name === 'Display Ledge');
  return {
    parts,
    hardware: { hinges: 0, shelfPins: shelves.length * C.shelfPinsPerShelf, pulls: 0, drawerSlides: 0 },
  };
}

// =============================================================================
// TWIN-OVER-TWIN BUNK BED
// =============================================================================
// Material-efficient plywood bunk that ships as flat panels (House of Nook's
// method). Twin mattress is 38" x 75"; the default 80 x 42 x 65 frame gives
// clearance. Coordinate convention: width (X) runs along the wall = bed LENGTH;
// depth (Z) projects into the room = bed WIDTH; height (Y) is total height.
//   • 2 plywood end panels (head + foot) — the structure, ship flat
//   • 2 side rails per bunk (front + back) carry the slatted deck
//   • 1 slatted mattress deck per bunk (shown solid; cut as slats)
//   • upper guard rail on the open (front) side for safety
//   • integrated ladder (2 stringers + rungs) at the foot end
// =============================================================================
function buildBunk(unit: Unit): BuiltUnit {
  const parts: Part[] = [];
  let n = 0;
  const id = (role: string) => `${role}-${n++}`;

  const T = C.carcassThickness; // 3/4" panels
  const W = unit.overall.width; // bed length along the wall (~80)
  const H = unit.overall.height; // total height (~65)
  const D = unit.overall.depth; // bed width into the room (~42)
  const mat = unit.materials;

  // Deck heights (top of the mattress platform) off the floor.
  const lowerDeckY = 13;
  const upperDeckY = Math.max(lowerDeckY + 24, H - 28);
  const railH = 6; // rail face height
  const railThk = 1.5; // doubled 3/4 ply or solid
  const innerLen = W - 2 * T; // clear length between end panels

  // End panels (head + foot) — full depth x full height.
  for (const [sx, label] of [
    [-1, 'End Panel (Head)'],
    [1, 'End Panel (Foot)'],
  ] as const) {
    parts.push({
      id: id('side'),
      name: label,
      role: 'side',
      material: mat.carcass,
      length: H,
      width: D,
      thickness: T,
      grain: 'length',
      bandedEdges: ['L1', 'L2'],
      position: { x: sx * (W / 2 - T / 2), y: H / 2, z: 0 },
      size3d: { w: T, h: H, d: D },
    });
  }

  // Side rails + slatted deck per bunk level.
  for (const [lvl, deckY] of [
    ['Lower', lowerDeckY],
    ['Upper', upperDeckY],
  ] as const) {
    for (const sz of [-1, 1] as const) {
      parts.push({
        id: id('divider'),
        name: `${lvl} Side Rail (${sz < 0 ? 'Back' : 'Front'})`,
        role: 'divider',
        material: mat.carcass,
        length: innerLen,
        width: railH,
        thickness: railThk,
        grain: 'length',
        bandedEdges: ['L1'],
        position: { x: 0, y: deckY - railH / 2, z: sz * (D / 2 - railThk / 2) },
        size3d: { w: innerLen, h: railH, d: railThk },
      });
    }
    // Slatted mattress deck (shown solid; cut as ~13 slats at the shop).
    parts.push({
      id: id('shelf'),
      name: `${lvl} Mattress Deck`,
      role: 'shelf',
      material: mat.carcass,
      length: innerLen,
      width: D - 2 * railThk,
      thickness: 0.75,
      grain: 'length',
      bandedEdges: [],
      position: { x: 0, y: deckY, z: 0 },
      size3d: { w: innerLen, h: 0.75, d: D - 2 * railThk },
      notes: 'Slatted platform: 13 slats × 3" on 3" gaps. Shown solid for preview.',
    });
  }

  // Upper guard rail on the open (front) side, above the upper deck.
  const guardLen = innerLen * 0.66;
  parts.push({
    id: id('divider'),
    name: 'Upper Guard Rail',
    role: 'divider',
    material: mat.carcass,
    length: guardLen,
    width: railH,
    thickness: railThk,
    grain: 'length',
    bandedEdges: ['L1', 'L2'],
    position: { x: -innerLen * 0.12, y: upperDeckY + 7, z: D / 2 - railThk / 2 },
    size3d: { w: guardLen, h: railH, d: railThk },
    notes: 'Safety rail — leaves a clear opening at the ladder end.',
  });

  // Ladder at the foot end, on the front side: 2 stringers + 4 rungs.
  const ladderX = W / 2 - T - 2;
  const ladderZ = D / 2 + 1.5;
  const stringerH = upperDeckY + 4;
  for (const dz of [-3.5, 3.5]) {
    parts.push({
      id: id('divider'),
      name: 'Ladder Stringer',
      role: 'divider',
      material: mat.carcass,
      length: stringerH,
      width: 2.5,
      thickness: 1.0,
      grain: 'length',
      bandedEdges: ['L1', 'L2'],
      position: { x: ladderX + dz, y: stringerH / 2, z: ladderZ },
      size3d: { w: 1.0, h: stringerH, d: 2.5 },
    });
  }
  const rungs = 4;
  for (let r = 1; r <= rungs; r++) {
    const y = (r * upperDeckY) / (rungs + 1);
    parts.push({
      id: id('divider'),
      name: 'Ladder Rung',
      role: 'divider',
      material: mat.carcass,
      length: 7,
      width: 1.5,
      thickness: 1.0,
      grain: 'length',
      bandedEdges: ['L1'],
      position: { x: ladderX, y, z: ladderZ },
      size3d: { w: 7, h: 1.5, d: 1.0 },
    });
  }

  return {
    parts,
    hardware: { hinges: 0, shelfPins: 0, pulls: 0, drawerSlides: 0 },
  };
}

// =============================================================================
// MONTESSORI LEARNING TOWER (toddler kitchen helper)
// =============================================================================
// A standing platform that lets a toddler reach the counter. Two plywood side
// panels run continuous to the floor; the platform and step are HOUSED in dados
// so the wood carries the standing load (connectors only clamp). A base stretcher
// ties the sides together for rigidity and a wide, stable stance.
// NOTE: load-bearing kids product — verify stability / load rating before sale.
// =============================================================================
function buildLearningTower(unit: Unit): BuiltUnit {
  const parts: Part[] = [];
  let n = 0;
  const id = (role: string) => `${role}-${n++}`;

  const T = C.carcassThickness;
  const W = unit.overall.width; // ~16
  const H = unit.overall.height; // ~36 (counter reach)
  const D = unit.overall.depth; // ~18
  const mat = unit.materials;

  const interiorWidth = W - 2 * T;
  const platformY = Math.min(H - 14, Math.round(H * 0.56)); // standing height
  const stepY = Math.max(8, Math.round(platformY * 0.45));
  const frontZ = D / 2;
  const backInsideZ = -D / 2 + T;
  const railH = 3;
  const railThk = 1.0;

  // Two side panels — the structure.
  for (const side of [-1, 1] as const) {
    parts.push({
      id: id('side'),
      name: side < 0 ? 'Side (Left)' : 'Side (Right)',
      role: 'side',
      material: mat.carcass,
      length: H,
      width: D,
      thickness: T,
      grain: 'length',
      bandedEdges: ['L1', 'L2'],
      position: { x: side * (W / 2 - T / 2), y: H / 2, z: 0 },
      size3d: { w: T, h: H, d: D },
    });
  }

  // Standing platform (load-bearing, 1" thick) + a lower climbing step, both
  // housed in dados in the sides so the wood carries the load.
  for (const [name, y, depthFrac, zc, thick] of [
    ['Standing Platform', platformY, 0.95, 0, 1.0],
    ['Step', stepY, 0.5, D * 0.2, 0.75],
  ] as const) {
    const pd = D * depthFrac;
    parts.push({
      id: id('shelf'),
      name,
      role: 'shelf',
      material: mat.carcass,
      length: interiorWidth,
      width: pd,
      thickness: thick,
      grain: 'length',
      bandedEdges: ['L1'],
      position: { x: 0, y, z: zc },
      size3d: { w: interiorWidth, h: thick, d: pd },
      notes: 'Housed in 3/4" dados in the sides — carries the standing load in shear.',
    });
  }

  // Enclosed rear panel from the platform up, set in a groove for rigidity.
  const backH = H - platformY - 2;
  parts.push({
    id: id('divider'),
    name: 'Back Panel',
    role: 'divider',
    material: mat.carcass,
    length: interiorWidth,
    width: backH,
    thickness: 0.5,
    grain: 'length',
    bandedEdges: ['L1'],
    position: { x: 0, y: platformY + backH / 2, z: backInsideZ - 0.25 },
    size3d: { w: interiorWidth, h: backH, d: 0.5 },
    notes: 'Set in 1/4" grooves in both sides — stiffens the frame against racking.',
  });

  // Front rails (top + chest height) so the child is enclosed on three sides.
  for (const [name, y] of [
    ['Top Front Rail', H - 4],
    ['Front Rail', platformY + 9],
  ] as const) {
    parts.push({
      id: id('divider'),
      name,
      role: 'divider',
      material: mat.carcass,
      length: interiorWidth,
      width: railH,
      thickness: railThk,
      grain: 'length',
      bandedEdges: ['L1', 'L2'],
      position: { x: 0, y, z: frontZ - railThk / 2 },
      size3d: { w: interiorWidth, h: railH, d: railThk },
    });
  }

  // Base stretchers — front + back rails tying the sides together at the floor.
  // Resist racking and give a wide, stable stance (the structural backbone).
  for (const sz of [-1, 1] as const) {
    parts.push({
      id: id('divider'),
      name: 'Base Stretcher',
      role: 'divider',
      material: mat.carcass,
      length: interiorWidth,
      width: 4,
      thickness: railThk,
      grain: 'length',
      bandedEdges: ['L1'],
      position: { x: 0, y: 2, z: sz * (D / 2 - railThk / 2) },
      size3d: { w: interiorWidth, h: 4, d: railThk },
      notes: 'Glued + Clamex into the sides at the base — ties the frame, anti-racking.',
    });
  }

  return {
    parts,
    hardware: { hinges: 0, shelfPins: 4, pulls: 0, drawerSlides: 0 },
  };
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

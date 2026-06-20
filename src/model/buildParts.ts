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

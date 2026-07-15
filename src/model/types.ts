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

/** Product family. Drives default size, mounting height, and a little geometry.
 *  'bunk' is retained for legacy/dormant use but is no longer offered in the
 *  catalog (too hard to ship + safety-regulated). */
export type UnitType = 'base' | 'upper' | 'tall' | 'shelf' | 'montessori' | 'bunk' | 'learning-tower';

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
  /** Customer special requests for this piece (vent cutouts, wire holes, etc.).
   *  Captured for the House of Nook team to review — not yet modeled in 3D. */
  notes?: string;
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
  /** Hidden steel floating-shelf brackets (one per floating shelf). */
  brackets?: number;
}

/** The full computed output of the model — parts + hardware. */
export interface BuiltUnit {
  parts: Part[];
  hardware: HardwareCounts;
}

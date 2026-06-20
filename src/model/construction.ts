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

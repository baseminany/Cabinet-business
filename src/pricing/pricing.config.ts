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
    'white-oak-rift-warm': { sheetWidth: 48, sheetHeight: 96, sheetCost: 240, yield: 0.85, note: 'White oak rift-sliced veneer ply (warm)' },
    'walnut': { sheetWidth: 48, sheetHeight: 96, sheetCost: 240, yield: 0.85, note: 'Walnut plain-sliced veneer ply' },
    'walnut-deep': { sheetWidth: 48, sheetHeight: 96, sheetCost: 240, yield: 0.85, note: 'Walnut veneer ply (deep tone)' },

    // Sherwin-Williams + custom paints — all painted MDF substrate ($60/sheet).
    'sw-alabaster': { sheetWidth: 48, sheetHeight: 96, sheetCost: 60, yield: 0.85, note: '3/4" MDF — painted SW Alabaster' },
    'sw-pure-white': { sheetWidth: 48, sheetHeight: 96, sheetCost: 60, yield: 0.85, note: '3/4" MDF — painted SW Pure White' },
    'sw-accessible-beige': { sheetWidth: 48, sheetHeight: 96, sheetCost: 60, yield: 0.85, note: '3/4" MDF — painted SW Accessible Beige' },
    'sw-agreeable-gray': { sheetWidth: 48, sheetHeight: 96, sheetCost: 60, yield: 0.85, note: '3/4" MDF — painted SW Agreeable Gray' },
    'sw-evergreen-fog': { sheetWidth: 48, sheetHeight: 96, sheetCost: 60, yield: 0.85, note: '3/4" MDF — painted SW Evergreen Fog' },
    'sw-iron-ore': { sheetWidth: 48, sheetHeight: 96, sheetCost: 60, yield: 0.85, note: '3/4" MDF — painted SW Iron Ore' },
    'paint-custom': { sheetWidth: 48, sheetHeight: 96, sheetCost: 60, yield: 0.85, note: '3/4" MDF — custom paint match' },

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

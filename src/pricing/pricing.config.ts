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
    /** Fixed setup/admin/packing time charged once per order. */
    baseHours: number;
    /** Time per sheet of material (cut, band, sand, assemble, finish share). */
    hoursPerSheet: number;
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

  /** Packaging materials: boxes, edge/corner protectors, foam, tape, labels.
   *  Fixed per order + a bit per sheet (more panels = more packing). */
  packaging: { fixed: number; perSheet: number };

  /** Card processing fee (Stripe ≈ 2.9% + $0.30). Added so you don't eat it. */
  paymentFeePercent: number;
  paymentFeeFixed: number;

  /** Floor on the customer price — covers setup/admin on the smallest items. */
  minPrice: number;
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
    shelfPinEach: 0.2, // nickel shelf pins, ~$0.20 ea (real)
    pullEach: 5, // mid-range pull/knob, ~$5 ea (real; varies by style)
  },

  // Finishing MATERIALS only (primer, paint/clear, sandpaper specific to finish).
  // Your finishing TIME is already in the labor line. Prefinished UV ply needs
  // little of this; painted MDF needs more — $15/sheet is a blended average.
  finish: { mode: 'perSheet', ratePerSqft: 2, ratePerSheet: 15 },

  // Labor — you are the only maker. Pay yourself a real $60/hr shop wage as a
  // COST (separate from profit). Hours scale with sheets: ~1 hr base per order
  // + ~1.6 hr per sheet (cut, edge-band, sand, assemble, finish).
  labor: { ratePerHour: 60, baseHours: 1.0, hoursPerSheet: 1.6 },

  // No CNC yet — hand/track-saw shop.
  machine: { ratePerSheet: 0 },

  // Garage overhead is low: no shop rent. Fixed $35/order covers packaging +
  // consumables (glue, screws, sandpaper); 12% covers blade/bit wear, finish
  // supplies, electricity, software/hosting, and marketing.
  overhead: { fixed: 35, percent: 12 },

  // Margin = markup on total cost. 50% markup = 33% gross margin — healthy for
  // furniture and still far under custom-contractor pricing. Flex 40–60% by line:
  // higher on standardized kids products, leaner on big competitive built-ins.
  margin: { markupPercent: 50 },

  // Packaging: ~$12 base (box, tape, labels) + ~$6/sheet of panels (edge/corner
  // protectors, foam, kraft fill). A real, recurring cost on every order.
  packaging: { fixed: 12, perSheet: 6 },

  // Card processing — Stripe's standard 2.9% + $0.30. Added so it isn't eaten.
  paymentFeePercent: 2.9,
  paymentFeeFixed: 0.3,

  // Minimum customer price — even a tiny shelf carries setup + admin + packing.
  minPrice: 95,
};

// -----------------------------------------------------------------------------
// CHECKLIST: every number is now a real starting value. Tune these from your
// actual builds as you go:
//   • labor.hoursPerSheet — time the first few builds; adjust up/down.
//   • margin.markupPercent — raise on standardized/kids products, lower to
//     stay competitive on big built-ins.
//   • overhead.percent — bump if you add shop rent, tools, or paid ads.
// -----------------------------------------------------------------------------
export const PLACEHOLDER_NOTES: string[] = [];

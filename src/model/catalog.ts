// =============================================================================
// PRODUCT CATALOG — the presets a customer can add to their design
// =============================================================================
// Each entry makes a ready-to-place Unit with sensible default dimensions for
// that product family. Everything stays fully editable after it's added. To add
// a new product type: add a UnitType in types.ts, a preset here, and (only if its
// geometry differs) a branch in buildParts.ts.
// =============================================================================

import type { Unit, UnitType, ConstructionStyle } from './types';

let _seq = 0;
const uid = () => `u${++_seq}`;

const DEFAULT_CONSTRUCTION: ConstructionStyle = {
  carcass: 'frameless',
  doorStyle: 'slab',
  overlay: 'full-overlay',
};

export interface CatalogEntry {
  type: UnitType;
  name: string;
  blurb: string;
}

export const CATALOG: CatalogEntry[] = [
  { type: 'base', name: 'Base cabinet', blurb: 'Floor cabinet — counters, vanities, islands' },
  { type: 'upper', name: 'Wall cabinet', blurb: 'Upper, mounted on the wall' },
  { type: 'tall', name: 'Tall / pantry', blurb: 'Floor-to-near-ceiling storage' },
  { type: 'shelf', name: 'Floating shelf', blurb: 'Open wall shelf' },
];

const NAMES: Record<UnitType, string> = { base: 'Base', upper: 'Upper', tall: 'Pantry', shelf: 'Shelf' };

/** Per-type running counts so labels read "Base 1", "Base 2"… */
const counts: Record<UnitType, number> = { base: 0, upper: 0, tall: 0, shelf: 0 };

export function makeUnit(type: UnitType): Unit {
  counts[type] += 1;
  const base = {
    id: uid(),
    type,
    label: `${NAMES[type]} ${counts[type]}`,
    sections: 1,
    construction: { ...DEFAULT_CONSTRUCTION },
    placement: { wallIndex: 0, offset: 0 },
    materials: { carcass: 'uv-ply-natural', doors: 'painted-white', back: 'ply-back' },
  };

  switch (type) {
    case 'base':
      return { ...base, overall: { width: 24, height: 34.5, depth: 24 }, shelvesPerSection: 1, door: 'double', toeKick: { enabled: true, height: 4.5 }, mountHeight: 0 };
    case 'upper':
      return { ...base, overall: { width: 30, height: 30, depth: 12 }, shelvesPerSection: 2, door: 'double', toeKick: { enabled: false, height: 0 }, mountHeight: 54 };
    case 'tall':
      return { ...base, overall: { width: 24, height: 84, depth: 24 }, shelvesPerSection: 4, door: 'double', toeKick: { enabled: true, height: 4.5 }, mountHeight: 0 };
    case 'shelf':
      return {
        ...base,
        overall: { width: 36, height: 1.5, depth: 10 },
        shelvesPerSection: 0,
        door: 'none',
        toeKick: { enabled: false, height: 0 },
        mountHeight: 48,
        materials: { carcass: 'white-oak', doors: 'white-oak', back: 'white-oak' },
      };
  }
}

import type { Unit, UnitType, ConstructionStyle } from './types';

const uid = () => `u${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

const DEFAULT_CONSTRUCTION: ConstructionStyle = { carcass: 'frameless', doorStyle: 'slab', overlay: 'full-overlay' };

export interface CatalogEntry { type: UnitType; name: string; blurb: string; }

export const CATALOG: CatalogEntry[] = [
  { type: 'base', name: 'Bench / base module', blurb: 'Low storage for mudrooms, playrooms, coffee bars, and laundry nooks' },
  { type: 'upper', name: 'Upper module', blurb: 'Wall storage for hutches, laundry, and coffee nooks' },
  { type: 'tall', name: 'Locker / tower module', blurb: 'Tall storage for entry, pantry, or utility zones' },
  { type: 'shelf', name: 'Shelf module', blurb: 'Open display, books, baskets, or coffee bar styling' },
  { type: 'montessori', name: 'Montessori bookshelf', blurb: 'Child-height forward-facing book display with safety rails' },
  { type: 'learning-tower', name: 'Learning tower', blurb: 'Toddler kitchen helper with a safe standing platform — ships in a box' },
];

const NAMES: Record<UnitType, string> = { base: 'Bench module', upper: 'Upper module', tall: 'Tower module', shelf: 'Shelf module', montessori: 'Montessori shelf', bunk: 'Bunk bed', 'learning-tower': 'Learning tower' };
const counts: Record<UnitType, number> = { base: 0, upper: 0, tall: 0, shelf: 0, montessori: 0, bunk: 0, 'learning-tower': 0 };

export function makeUnit(type: UnitType): Unit {
  counts[type] += 1;
  const base = { id: uid(), type, label: `${NAMES[type]} ${counts[type]}`, sections: 1, construction: { ...DEFAULT_CONSTRUCTION }, placement: { wallIndex: 0, offset: 0 }, materials: { carcass: 'uv-ply-natural', doors: 'sw-alabaster', back: 'ply-back' } };
  switch (type) {
    case 'base': return { ...base, overall: { width: 24, height: 34.5, depth: 20 }, shelvesPerSection: 1, door: 'double', toeKick: { enabled: true, height: 4.5 }, mountHeight: 0 };
    case 'upper': return { ...base, overall: { width: 30, height: 30, depth: 12 }, shelvesPerSection: 2, door: 'double', toeKick: { enabled: false, height: 0 }, mountHeight: 54 };
    case 'tall': return { ...base, overall: { width: 24, height: 84, depth: 18 }, shelvesPerSection: 4, door: 'double', toeKick: { enabled: true, height: 4.5 }, mountHeight: 0 };
    case 'shelf': return { ...base, overall: { width: 36, height: 1.5, depth: 10 }, shelvesPerSection: 0, door: 'none', toeKick: { enabled: false, height: 0 }, mountHeight: 48, materials: { carcass: 'white-oak-rift', doors: 'white-oak-rift', back: 'white-oak-rift' } };
    case 'montessori': return { ...base, overall: { width: 30, height: 33, depth: 9 }, shelvesPerSection: 3, door: 'none', toeKick: { enabled: false, height: 0 }, mountHeight: 0, materials: { carcass: 'white-oak', doors: 'white-oak', back: 'ply-back' } };
    case 'bunk': return { ...base, overall: { width: 80, height: 65, depth: 42 }, shelvesPerSection: 0, door: 'none', toeKick: { enabled: false, height: 0 }, mountHeight: 0, materials: { carcass: 'sw-alabaster', doors: 'sw-alabaster', back: 'ply-back' } };
    case 'learning-tower': return { ...base, overall: { width: 16, height: 36, depth: 18 }, shelvesPerSection: 0, door: 'none', toeKick: { enabled: false, height: 0 }, mountHeight: 0, materials: { carcass: 'uv-ply-natural', doors: 'uv-ply-natural', back: 'ply-back' } };
  }
}

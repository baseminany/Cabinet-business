// =============================================================================
// MATERIAL CATALOG — appearance only (3D + labels)
// =============================================================================

import type { MaterialId } from './types';

export type MaterialRole = 'carcass' | 'door' | 'back' | 'shelf';

export interface MaterialDef {
  id: MaterialId;
  label: string;
  color: string;
  roughness: number;
  kind: 'wood' | 'painted' | 'laminate' | 'back';
  customerFacing?: boolean;
  appliesTo: MaterialRole[];
  premiumLabel?: string;
  grainStrength?: number;
}

export const MATERIALS: MaterialDef[] = [
  { id: 'uv-ply-natural', label: 'Natural Birch (UV)', premiumLabel: 'clean utility birch', color: '#dcc095', roughness: 0.55, kind: 'wood', appliesTo: ['carcass', 'shelf'] },
  { id: 'white-oak', label: 'White Oak — Plain', premiumLabel: 'warm natural oak', color: '#ceae7a', roughness: 0.5, kind: 'wood', appliesTo: ['carcass', 'door', 'shelf'], grainStrength: 0.5 },
  { id: 'white-oak-rift', label: 'White Oak — Rift', premiumLabel: 'linear designer grain', color: '#d4b886', roughness: 0.48, kind: 'wood', appliesTo: ['carcass', 'door', 'shelf'], grainStrength: 0.7 },
  { id: 'walnut', label: 'Walnut — Natural', premiumLabel: 'rich architectural walnut', color: '#574030', roughness: 0.42, kind: 'wood', appliesTo: ['carcass', 'door', 'shelf'], grainStrength: 0.8 },
  { id: 'painted-white', label: 'Painted — Alabaster', premiumLabel: 'soft gallery white', color: '#efece4', roughness: 0.68, kind: 'painted', appliesTo: ['carcass', 'door', 'shelf'] },
  { id: 'painted-greige', label: 'Painted — Mushroom', premiumLabel: 'warm designer neutral', color: '#c8bca8', roughness: 0.7, kind: 'painted', appliesTo: ['carcass', 'door', 'shelf'] },
  { id: 'painted-sage', label: 'Painted — Deep Olive', premiumLabel: 'muted custom green', color: '#73806f', roughness: 0.7, kind: 'painted', appliesTo: ['carcass', 'door', 'shelf'] },
  { id: 'painted-navy', label: 'Painted — Navy Black', premiumLabel: 'deep tailored blue', color: '#273341', roughness: 0.72, kind: 'painted', appliesTo: ['carcass', 'door', 'shelf'] },
  { id: 'painted-charcoal', label: 'Painted — Charcoal', premiumLabel: 'near-black matte', color: '#333437', roughness: 0.72, kind: 'painted', appliesTo: ['carcass', 'door', 'shelf'] },
  { id: 'ply-back', label: '1/4" Back (UV)', color: '#cdb084', roughness: 0.6, kind: 'back', customerFacing: false, appliesTo: ['back'] },
];

export const CUSTOMER_FINISHES = MATERIALS.filter((m) => m.customerFacing !== false);

export function materialsFor(role: MaterialRole): MaterialDef[] {
  return MATERIALS.filter((m) => m.customerFacing !== false && m.appliesTo.includes(role));
}

const BY_ID: Record<string, MaterialDef> = Object.fromEntries(MATERIALS.map((m) => [m.id, m]));

export function getMaterial(id: MaterialId): MaterialDef {
  return BY_ID[id] ?? { id, label: id, color: '#9a9a9a', roughness: 0.6, kind: 'wood', appliesTo: ['carcass', 'door', 'shelf'] };
}

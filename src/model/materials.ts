import type { MaterialId } from './types';

export type MaterialRole = 'carcass' | 'door' | 'back' | 'shelf';
export type MaterialCategory = 'Painted' | 'White Oak' | 'Rift White Oak' | 'Walnut' | 'Utility';

export interface MaterialDef {
  id: MaterialId;
  label: string;
  color: string;
  roughness: number;
  kind: 'wood' | 'painted' | 'laminate' | 'back';
  category: MaterialCategory;
  customerFacing?: boolean;
  appliesTo: MaterialRole[];
  premiumLabel?: string;
  grainStrength?: number;
  brand?: string;
  code?: string;
}

export const MATERIALS: MaterialDef[] = [
  { id: 'uv-ply-natural', label: 'Pre-finished Birch', premiumLabel: 'pre-finished — ships faster, best value', color: '#dcc095', roughness: 0.55, kind: 'wood', category: 'Utility', appliesTo: ['carcass', 'shelf', 'door'] },
  { id: 'white-oak', label: 'White Oak Natural', premiumLabel: 'warm natural oak', color: '#ceae7a', roughness: 0.5, kind: 'wood', category: 'White Oak', appliesTo: ['carcass', 'door', 'shelf'], grainStrength: 0.5 },
  { id: 'white-oak-rift', label: 'Rift White Oak Natural', premiumLabel: 'linear designer grain', color: '#d4b886', roughness: 0.48, kind: 'wood', category: 'Rift White Oak', appliesTo: ['carcass', 'door', 'shelf'], grainStrength: 0.7 },
  { id: 'white-oak-rift-warm', label: 'Rift White Oak Warm', premiumLabel: 'slightly honeyed tone', color: '#c99f67', roughness: 0.5, kind: 'wood', category: 'Rift White Oak', appliesTo: ['carcass', 'door', 'shelf'], grainStrength: 0.75 },
  { id: 'walnut', label: 'Walnut Natural', premiumLabel: 'rich architectural walnut', color: '#574030', roughness: 0.42, kind: 'wood', category: 'Walnut', appliesTo: ['carcass', 'door', 'shelf'], grainStrength: 0.8 },
  { id: 'walnut-deep', label: 'Walnut Deep', premiumLabel: 'deeper furniture tone', color: '#3f281c', roughness: 0.43, kind: 'wood', category: 'Walnut', appliesTo: ['carcass', 'door', 'shelf'], grainStrength: 0.85 },
  { id: 'sw-alabaster', label: 'Sherwin-Williams Alabaster', brand: 'Sherwin-Williams', code: 'SW 7008', premiumLabel: 'soft warm white', color: '#ede7d9', roughness: 0.7, kind: 'painted', category: 'Painted', appliesTo: ['carcass', 'door', 'shelf'] },
  { id: 'sw-pure-white', label: 'Sherwin-Williams Pure White', brand: 'Sherwin-Williams', code: 'SW 7005', premiumLabel: 'clean warm white', color: '#f1eee6', roughness: 0.7, kind: 'painted', category: 'Painted', appliesTo: ['carcass', 'door', 'shelf'] },
  { id: 'sw-accessible-beige', label: 'Sherwin-Williams Accessible Beige', brand: 'Sherwin-Williams', code: 'SW 7036', premiumLabel: 'warm greige', color: '#d1c7b8', roughness: 0.72, kind: 'painted', category: 'Painted', appliesTo: ['carcass', 'door', 'shelf'] },
  { id: 'sw-agreeable-gray', label: 'Sherwin-Williams Agreeable Gray', brand: 'Sherwin-Williams', code: 'SW 7029', premiumLabel: 'soft neutral gray', color: '#d1cbc0', roughness: 0.72, kind: 'painted', category: 'Painted', appliesTo: ['carcass', 'door', 'shelf'] },
  { id: 'sw-evergreen-fog', label: 'Sherwin-Williams Evergreen Fog', brand: 'Sherwin-Williams', code: 'SW 9130', premiumLabel: 'muted designer green', color: '#95978a', roughness: 0.72, kind: 'painted', category: 'Painted', appliesTo: ['carcass', 'door', 'shelf'] },
  { id: 'sw-iron-ore', label: 'Sherwin-Williams Iron Ore', brand: 'Sherwin-Williams', code: 'SW 7069', premiumLabel: 'soft near-black', color: '#434341', roughness: 0.75, kind: 'painted', category: 'Painted', appliesTo: ['carcass', 'door', 'shelf'] },
  { id: 'paint-custom', label: 'Custom paint color', premiumLabel: 'enter brand + color later', color: '#cfc4b4', roughness: 0.72, kind: 'painted', category: 'Painted', appliesTo: ['carcass', 'door', 'shelf'] },
  { id: 'painted-white', label: 'Painted Alabaster', premiumLabel: 'legacy default', color: '#ede7d9', roughness: 0.7, kind: 'painted', category: 'Painted', customerFacing: false, appliesTo: ['carcass', 'door', 'shelf'] },
  { id: 'painted-greige', label: 'Painted Mushroom', premiumLabel: 'legacy default', color: '#c8bca8', roughness: 0.72, kind: 'painted', category: 'Painted', customerFacing: false, appliesTo: ['carcass', 'door', 'shelf'] },
  { id: 'ply-back', label: '1/4 inch Back UV', color: '#cdb084', roughness: 0.6, kind: 'back', category: 'Utility', customerFacing: false, appliesTo: ['back'] },
];

export const CUSTOMER_FINISHES = MATERIALS.filter((m) => m.customerFacing !== false);

export type MaterialTier = 'value' | 'premium';

/** Value = pre-finished birch + painted birch ply (cheaper, faster, ships flat).
 *  Premium = hardwood veneer (white oak, rift oak, walnut) for high-end. */
export function materialTier(m: MaterialDef): MaterialTier {
  return (m.category === 'White Oak' || m.category === 'Rift White Oak' || m.category === 'Walnut') ? 'premium' : 'value';
}

export function materialsFor(role: MaterialRole): MaterialDef[] {
  return MATERIALS.filter((m) => m.customerFacing !== false && m.appliesTo.includes(role));
}

const BY_ID: Record<string, MaterialDef> = Object.fromEntries(MATERIALS.map((m) => [m.id, m]));

export function getMaterial(id: MaterialId): MaterialDef {
  return BY_ID[id] ?? { id, label: id, color: '#9a9a9a', roughness: 0.6, kind: 'wood', category: 'Utility', appliesTo: ['carcass', 'door', 'shelf'] };
}

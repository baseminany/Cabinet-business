// =============================================================================
// MATERIAL CATALOG — the LOOK of each material (for the 3D preview + labels)
// =============================================================================
// This file is about appearance only: a name and a color/finish for the 3D
// scene. The COST of each material lives separately and privately in
// `src/pricing/pricing.config.ts`, keyed by the same id. Keeping look and price
// apart means you can share screenshots without exposing your numbers.
// =============================================================================

import type { MaterialId } from './types';

export interface MaterialDef {
  id: MaterialId;
  label: string;
  /** Base color shown in the 3D preview (hex). */
  color: string;
  /** 0 = glossy, 1 = flat. Rough guide for the 3D look. */
  roughness: number;
  /** How the part is finished — informational, also reused by pricing. */
  kind: 'wood' | 'painted' | 'laminate' | 'back';
  /** false = internal/maker-only (e.g. back panel), hidden from customer finish pickers. */
  customerFacing?: boolean;
}

// Customer-facing FINISHES (the look). Each maps to a real substrate + cost in
// pricing.config.ts via the same id. Painted finishes are MDF underneath.
export const MATERIALS: MaterialDef[] = [
  { id: 'uv-ply-natural', label: 'Natural Birch (UV)', color: '#dcc095', roughness: 0.55, kind: 'wood' },
  { id: 'white-oak', label: 'White Oak — Plain', color: '#ceae7a', roughness: 0.5, kind: 'wood' },
  { id: 'white-oak-rift', label: 'White Oak — Rift', color: '#d4b886', roughness: 0.48, kind: 'wood' },
  { id: 'walnut', label: 'Walnut', color: '#574030', roughness: 0.42, kind: 'wood' },
  { id: 'painted-white', label: 'Painted — Alabaster', color: '#efece4', roughness: 0.7, kind: 'painted' },
  { id: 'painted-greige', label: 'Painted — Greige', color: '#c8bca8', roughness: 0.72, kind: 'painted' },
  { id: 'painted-sage', label: 'Painted — Sage', color: '#8a9580', roughness: 0.72, kind: 'painted' },
  { id: 'painted-navy', label: 'Painted — Navy', color: '#33414f', roughness: 0.72, kind: 'painted' },
  { id: 'painted-charcoal', label: 'Painted — Charcoal', color: '#3a3d42', roughness: 0.72, kind: 'painted' },
  { id: 'ply-back', label: '1/4" Back (UV)', color: '#cdb084', roughness: 0.6, kind: 'back', customerFacing: false },
];

/** Finishes a customer can pick (hides internal/back-only materials). */
export const CUSTOMER_FINISHES = MATERIALS.filter((m) => m.customerFacing !== false);

const BY_ID: Record<string, MaterialDef> = Object.fromEntries(
  MATERIALS.map((m) => [m.id, m])
);

/** Look up a material's look; falls back to a neutral gray if unknown. */
export function getMaterial(id: MaterialId): MaterialDef {
  return BY_ID[id] ?? { id, label: id, color: '#9a9a9a', roughness: 0.6, kind: 'wood' };
}

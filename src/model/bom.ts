import type { BuiltUnit, HardwareCounts, KitItem, Part } from './types';

export interface BomLine {
  sku: string;
  category: 'panel' | KitItem['category'];
  description: string;
  quantity: number;
  dimensions?: string;
  material?: string;
  estimatedCost: number;
  estimatedWeightLb: number;
  notes?: string;
  placeholder?: boolean;
}

export interface FulfillmentPlan {
  lane: 'parcel-pilot' | 'oversize-hold';
  packed: { length: number; width: number; height: number; weightLb: number };
  shippingEstimate: number;
  reasons: string[];
  needsPhysicalPackTest: boolean;
}

export interface DigitalBom {
  lines: BomLine[];
  panelCount: number;
  connectorPairs: number;
  estimatedWeightLb: number;
  estimatedKitCost: number;
  fulfillment: FulfillmentPlan;
}

const CONNECTOR_ROLES = new Set(['top', 'bottom', 'divider', 'toekick']);
export const connectorPairsFor = (parts: Part[]) => parts.reduce((n, p) => n + (CONNECTOR_ROLES.has(p.role) ? 4 : 0), 0);

const r2 = (n: number) => Math.round(n * 100) / 100;
const density = (material: string) => material.includes('hdf') ? 50 : 34;
const partWeight = (p: Part) => p.length * p.width * p.thickness / 1728 * density(p.material);

function hardwareLines(hw: HardwareCounts, connectors: number): BomLine[] {
  const rows: Array<[string, string, number, number, number]> = [
    ['LAMELLO-P14', 'Lamello connector pair', connectors, 2.2, 0.025],
    ['HINGE-SC', 'Soft-close hinge', hw.hinges, 8, 0.22],
    ['PIN-SHELF', 'Shelf pin', hw.shelfPins, 0.2, 0.01],
    ['PULL-STD', 'Pull / knob', hw.pulls, 5, 0.18],
    ['SLIDE-PAIR', 'Drawer slide pair', hw.drawerSlides, 38, 2.5],
    ['BRACKET-FLOAT', 'Hidden floating-shelf bracket', hw.brackets ?? 0, 18, 1.5],
  ];
  return rows.filter(([, , qty]) => qty > 0).map(([sku, description, quantity, cost, weight]) => ({
    sku, category: 'hardware', description, quantity, estimatedCost: r2(quantity * cost), estimatedWeightLb: r2(quantity * weight), placeholder: sku === 'LAMELLO-P14',
  }));
}

/** The shop/fulfillment source of truth. It includes wood, product-specific
 * hardware, assembly items, documents, labels, and a conservative pack model. */
export function createDigitalBom(built: BuiltUnit): DigitalBom {
  const panelLines: BomLine[] = built.parts.map((p) => ({
    sku: `PANEL-${p.role.toUpperCase()}`,
    category: 'panel',
    description: p.name,
    quantity: 1,
    dimensions: `${p.length.toFixed(2)} × ${p.width.toFixed(2)} × ${p.thickness.toFixed(2)} in`,
    material: p.material,
    estimatedCost: 0,
    estimatedWeightLb: r2(partWeight(p)),
    notes: [p.bandedEdges.length ? `Band ${p.bandedEdges.join(', ')}` : '', p.notes ?? ''].filter(Boolean).join(' · '),
  }));
  const connectors = connectorPairsFor(built.parts);
  const generic: KitItem[] = [
    { sku: 'TOOL-HEX', name: 'Assembly tool', category: 'tool', quantity: 1, unitCost: 2.5, unitWeightLb: 0.12 },
    { sku: 'DOC-ASSEMBLY', name: 'Product-specific assembly instructions', category: 'documentation', quantity: 1, unitCost: 0.75, unitWeightLb: 0.05 },
    { sku: 'LABEL-PART', name: 'Matched part label', category: 'documentation', quantity: built.parts.length, unitCost: 0.08, unitWeightLb: 0.002 },
    { sku: 'PACK-PROTECT', name: 'Carton, foam, edge guards, tape and label', category: 'packaging', quantity: 1, unitCost: 14, unitWeightLb: 3.5, placeholder: true },
  ];
  const kitLines: BomLine[] = [...hardwareLines(built.hardware, connectors), ...generic, ...(built.kitItems ?? [])].map((x: any) => 'description' in x ? x : ({
    sku: x.sku, category: x.category, description: x.name, quantity: x.quantity,
    estimatedCost: r2(x.quantity * x.unitCost), estimatedWeightLb: r2(x.quantity * x.unitWeightLb), notes: x.notes, placeholder: x.placeholder,
  }));
  const lines = [...panelLines, ...kitLines];
  const rawLongest = Math.max(0, ...built.parts.flatMap((p) => [p.length, p.width]));
  const rawSecond = Math.max(0, ...built.parts.map((p) => Math.min(p.length, p.width)));
  const weight = r2(lines.reduce((n, l) => n + l.estimatedWeightLb, 0));
  const packed = { length: Math.ceil(rawLongest + 2), width: Math.ceil(rawSecond + 2), height: Math.max(4, Math.ceil(built.parts.reduce((n, p) => n + p.thickness, 0) + 2)), weightLb: Math.ceil(weight) };
  const reasons: string[] = [];
  if (packed.length > 48) reasons.push(`Modeled carton length is ${packed.length}″; pilot limit is 48″.`);
  if (packed.weightLb > 50) reasons.push(`Modeled packed weight is ${packed.weightLb} lb; pilot limit is 50 lb.`);
  const lane = reasons.length ? 'oversize-hold' : 'parcel-pilot';
  // Planning estimate only. Actual launch amount must be replaced after a
  // packed prototype is rated with the carrier from the real origin ZIP.
  const shippingEstimate = lane === 'parcel-pilot' ? Math.ceil((24 + packed.weightLb * 0.82) / 5) * 5 : 0;
  return {
    lines, panelCount: built.parts.length, connectorPairs: connectors,
    estimatedWeightLb: weight,
    estimatedKitCost: r2(kitLines.reduce((n, l) => n + l.estimatedCost, 0)),
    fulfillment: { lane, packed, shippingEstimate, reasons, needsPhysicalPackTest: true },
  };
}

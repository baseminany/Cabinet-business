// =============================================================================
// PRICING ENGINE — transparent, line-item, no black box
// =============================================================================
// priceModel() takes the built unit (the same Part[] the 3D and cut list use)
// plus your pricing.config.ts numbers, and returns every cost line, the
// subtotal, overhead, margin, and the final customer price. It does ONLY
// arithmetic on values from the config — it never invents a number.
//
// Flow:
//   material sheets + edge banding + hardware + finish + labor + machine
//     = SUBTOTAL (cost)
//   + overhead (fixed + percent of subtotal)
//     = TOTAL COST
//   + margin (markup % of total cost)
//     = CUSTOMER PRICE
// =============================================================================

import type { BuiltUnit } from '../model/types';
import { getMaterial } from '../model/materials';
import { pricing, type PricingConfig, type SheetMaterialCost } from './pricing.config';

export interface PriceLine {
  key: string;
  label: string;
  detail: string;
  amount: number;
  /** True if this line relied on a placeholder number. */
  placeholder: boolean;
}

export interface PriceResult {
  lines: PriceLine[];
  subtotal: number; // sum of all cost lines
  overheadAmount: number;
  totalCost: number; // subtotal + overhead
  marginAmount: number;
  customerPrice: number; // totalCost + margin
  usesPlaceholders: boolean;
  sheetsByMaterial: { materialId: string; label: string; sheets: number }[];
}

const SQIN_PER_SQFT = 144;

function partArea(length: number, width: number): number {
  return length * width; // square inches, one face
}

/** Linear inches of banded edge on a single part. */
function bandedInches(edges: string[], length: number, width: number): number {
  let total = 0;
  for (const e of edges) {
    if (e === 'L1' || e === 'L2') total += length;
    else if (e === 'W1' || e === 'W2') total += width;
  }
  return total;
}

export function priceModel(unit: BuiltUnit, config: PricingConfig = pricing): PriceResult {
  const lines: PriceLine[] = [];
  const sheetsByMaterial: PriceResult['sheetsByMaterial'] = [];

  // --- 1) SHEET GOODS, grouped by material id --------------------------------
  const areaByMaterial = new Map<string, number>();
  for (const p of unit.parts) {
    areaByMaterial.set(
      p.material,
      (areaByMaterial.get(p.material) ?? 0) + partArea(p.length, p.width)
    );
  }

  for (const [materialId, areaSqIn] of areaByMaterial) {
    const cost: SheetMaterialCost =
      config.materials[materialId] ?? config.defaultMaterial;
    const usableArea = cost.sheetWidth * cost.sheetHeight * cost.yield;
    const sheets = Math.max(1, Math.ceil(areaSqIn / usableArea));
    const amount = sheets * cost.sheetCost;
    const label = getMaterial(materialId).label;
    const isPlaceholder = !!cost.placeholder || !config.materials[materialId];

    sheetsByMaterial.push({ materialId, label, sheets });
    lines.push({
      key: `mat-${materialId}`,
      label: `Sheet goods — ${label}`,
      detail: `${sheets} sheet${sheets > 1 ? 's' : ''} × $${cost.sheetCost} · ${(
        areaSqIn / SQIN_PER_SQFT
      ).toFixed(1)} sqft used @ ${Math.round(cost.yield * 100)}% yield`,
      amount,
      placeholder: isPlaceholder,
    });
  }

  // --- 2) EDGE BANDING -------------------------------------------------------
  let bandInches = 0;
  for (const p of unit.parts) {
    bandInches += bandedInches(p.bandedEdges, p.length, p.width);
  }
  const bandFeet = bandInches / 12;
  const eb = config.edgeBanding;
  const perFoot = (eb.useFinished ? eb.finishedRollCost : eb.unfinishedRollCost) / eb.rollLengthFt;
  lines.push({
    key: 'edge-banding',
    label: 'Edge banding',
    detail: `${bandFeet.toFixed(1)} lin ft × $${perFoot.toFixed(2)}/ft (${
      eb.useFinished ? 'pre-finished' : 'unfinished'
    })`,
    amount: bandFeet * perFoot,
    placeholder: false,
  });

  // --- 3) HARDWARE -----------------------------------------------------------
  const hw = unit.hardware;
  const h = config.hardware;
  const hardwareAmount =
    hw.hinges * h.hingeEach +
    hw.shelfPins * h.shelfPinEach +
    hw.pulls * h.pullEach +
    hw.drawerSlides * h.drawerSlidePairEach;
  lines.push({
    key: 'hardware',
    label: 'Hardware',
    detail: `${hw.hinges} hinges, ${hw.pulls} pulls, ${hw.shelfPins} shelf pins`,
    amount: hardwareAmount,
    placeholder: !!h.placeholder,
  });

  // --- 4) FINISH -------------------------------------------------------------
  const totalAreaSqFt =
    unit.parts.reduce((sum, p) => sum + partArea(p.length, p.width), 0) / SQIN_PER_SQFT;
  const totalSheets = sheetsByMaterial.reduce((n, s) => n + s.sheets, 0);
  let finishAmount = 0;
  let finishDetail = 'pre-finished — no separate cost';
  if (config.finish.mode === 'perSqft') {
    finishAmount = totalAreaSqFt * config.finish.ratePerSqft;
    finishDetail = `${totalAreaSqFt.toFixed(1)} sqft × $${config.finish.ratePerSqft}/sqft`;
  } else if (config.finish.mode === 'perSheet') {
    finishAmount = totalSheets * config.finish.ratePerSheet;
    finishDetail = `${totalSheets} sheets × $${config.finish.ratePerSheet}/sheet`;
  }
  lines.push({
    key: 'finish',
    label: 'Finishing',
    detail: finishDetail,
    amount: finishAmount,
    placeholder: !!config.finish.placeholder && config.finish.mode !== 'none',
  });

  // --- 5) LABOR --------------------------------------------------------------
  const laborAmount = config.labor.ratePerHour * config.labor.hoursPerUnit;
  lines.push({
    key: 'labor',
    label: 'Labor',
    detail: `${config.labor.hoursPerUnit} hr × $${config.labor.ratePerHour}/hr`,
    amount: laborAmount,
    placeholder: !!config.labor.placeholder,
  });

  // --- 6) MACHINE / CNC (optional) ------------------------------------------
  if (config.machine.ratePerSheet > 0) {
    lines.push({
      key: 'machine',
      label: 'CNC / machine time',
      detail: `${totalSheets} sheets × $${config.machine.ratePerSheet}/sheet`,
      amount: totalSheets * config.machine.ratePerSheet,
      placeholder: !!config.machine.placeholder,
    });
  }

  // --- SUBTOTAL --------------------------------------------------------------
  const subtotal = lines.reduce((sum, l) => sum + l.amount, 0);

  // --- OVERHEAD --------------------------------------------------------------
  const overheadAmount =
    config.overhead.fixed + subtotal * (config.overhead.percent / 100);
  const totalCost = subtotal + overheadAmount;

  // --- MARGIN ----------------------------------------------------------------
  const marginAmount = totalCost * (config.margin.markupPercent / 100);
  const customerPrice = totalCost + marginAmount;

  const usesPlaceholders =
    lines.some((l) => l.placeholder) ||
    !!config.overhead.placeholder ||
    !!config.margin.placeholder;

  return {
    lines,
    subtotal,
    overheadAmount,
    totalCost,
    marginAmount,
    customerPrice,
    usesPlaceholders,
    sheetsByMaterial,
  };
}

/** Format a dollar amount for display. */
export function usd(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

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
  /** Total fractional sheets of material actually consumed (all materials). */
  sheetsUsed: number;
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

  // Material is billed by the HALF SHEET, rounded up. Products are designed to
  // nest cleanly into full sheets; when a cut leaves a leftover, that cost is
  // carried by the order (per Basem: "leftovers are fine, but the customer
  // carries that cost") — while half-sheet granularity keeps small items from
  // unfairly paying for a whole sheet of every material they barely touch.
  let fractionalSheets = 0;
  for (const [materialId, areaSqIn] of areaByMaterial) {
    const cost: SheetMaterialCost =
      config.materials[materialId] ?? config.defaultMaterial;
    const usableArea = cost.sheetWidth * cost.sheetHeight * cost.yield;
    const used = areaSqIn / usableArea; // fractional sheets consumed
    // Quarter-sheet billing: rounds waste UP so the order carries it, without
    // forcing tiny accessory items to buy half a sheet of every material they
    // touch (small items batch several-per-sheet in production).
    const billed = Math.max(0.25, Math.ceil(used * 4) / 4);
    const wholeSheets = Math.max(1, Math.ceil(used)); // for the shop cut list
    const amount = billed * cost.sheetCost;
    fractionalSheets += used;
    const label = getMaterial(materialId).label;
    const isPlaceholder = !!cost.placeholder || !config.materials[materialId];

    sheetsByMaterial.push({ materialId, label, sheets: wholeSheets });
    lines.push({
      key: `mat-${materialId}`,
      label: `Sheet goods — ${label}`,
      detail: `${(areaSqIn / SQIN_PER_SQFT).toFixed(1)} sqft used → billed ${billed} sheet × $${cost.sheetCost} @ ${Math.round(cost.yield * 100)}% yield`,
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
    finishAmount = fractionalSheets * config.finish.ratePerSheet;
    finishDetail = `${fractionalSheets.toFixed(2)} sheet × $${config.finish.ratePerSheet}/sheet (materials)`;
  }
  lines.push({
    key: 'finish',
    label: 'Finishing',
    detail: finishDetail,
    amount: finishAmount,
    placeholder: !!config.finish.placeholder && config.finish.mode !== 'none',
  });

  // --- 5) LABOR --------------------------------------------------------------
  // Hours scale with the real work: a base setup/pack time per order plus time
  // per sheet of material (cut, band, sand, assemble, finish). This makes a
  // 3-module project cost more labor than a single shelf, instead of a flat fee.
  const laborHours = config.labor.baseHours + config.labor.hoursPerSheet * fractionalSheets;
  const laborAmount = config.labor.ratePerHour * laborHours;
  lines.push({
    key: 'labor',
    label: 'Labor',
    detail: `${laborHours.toFixed(1)} hr (${config.labor.baseHours} base + ${config.labor.hoursPerSheet}/sheet × ${fractionalSheets.toFixed(2)}) × $${config.labor.ratePerHour}/hr`,
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

  // --- 7) PACKAGING ----------------------------------------------------------
  // Box, edge/corner protectors, foam, kraft fill, tape, labels.
  const packagingAmount = config.packaging.fixed + config.packaging.perSheet * fractionalSheets;
  lines.push({
    key: 'packaging',
    label: 'Packaging & ship prep',
    detail: `$${config.packaging.fixed} base + $${config.packaging.perSheet}/sheet × ${fractionalSheets.toFixed(2)}`,
    amount: packagingAmount,
    placeholder: false,
  });

  // --- SUBTOTAL --------------------------------------------------------------
  const subtotal = lines.reduce((sum, l) => sum + l.amount, 0);

  // --- OVERHEAD --------------------------------------------------------------
  const overheadAmount =
    config.overhead.fixed + subtotal * (config.overhead.percent / 100);
  const totalCost = subtotal + overheadAmount;

  // --- MARGIN ----------------------------------------------------------------
  const marginAmount = totalCost * (config.margin.markupPercent / 100);
  let customerPrice = totalCost + marginAmount;

  // --- CARD PROCESSING FEE (added so it isn't eaten) -------------------------
  // Grossed up: the fee applies to the final charged amount, so solve for it.
  const feeRate = config.paymentFeePercent / 100;
  customerPrice = (customerPrice + config.paymentFeeFixed) / (1 - feeRate);

  // --- MINIMUM PRICE FLOOR ---------------------------------------------------
  customerPrice = Math.max(customerPrice, config.minPrice);

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
    sheetsUsed: fractionalSheets,
  };
}

/** Format a dollar amount for display. */
export function usd(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

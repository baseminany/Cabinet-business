// =============================================================================
// configurePreset — ONE place that turns (preset + customer choices) into units
// =============================================================================
// Used by BOTH the product page (sliders) and the checkout Netlify function
// (server-side price recompute). Because the server prices with this exact
// code, a tampered browser request can never buy below the real price: the
// server clamps every dimension to the product's allowed range, rejects
// unknown finishes, and recomputes the price itself.
// =============================================================================

import type { Unit, MaterialId } from './types';
import { type PresetSpec, instantiatePreset } from './presets';
import { CUSTOMER_FINISHES } from './materials';

export interface Range { min: number; max: number }

export interface SizeInfo {
  widthRange: Range | null;
  depthRange: Range | null;
  heightRange: Range | null;
  defaults: { width: number; depth: number; height: number };
}

export interface PresetConfig {
  width?: number;
  depth?: number;
  height?: number;
  finish?: string;
}

/** The allowed size ranges for a preset, derived from its real default unit.
 *  Depth/height fine-tuning is offered for SINGLE-piece products only (multi-
 *  piece sets share a width but have intentionally different depths/heights). */
export function sizeInfoFor(spec: PresetSpec): SizeInfo {
  const first = instantiatePreset(spec)[0];
  const d = first.overall.depth;
  const h = first.overall.height;
  const singlePiece = spec.items.length === 1;
  const firstType = spec.items[0]?.type;
  return {
    widthRange: spec.widthRange ?? null,
    depthRange: singlePiece
      ? { min: Math.max(4, Math.round(d * 0.7)), max: Math.min(30, Math.round(d * 1.4)) }
      : null,
    heightRange: singlePiece && (firstType === 'tall' || firstType === 'montessori')
      ? { min: Math.max(12, h - 8), max: Math.min(84, h + 12) }
      : null,
    defaults: { width: first.overall.width, depth: d, height: h },
  };
}

const clamp = (v: number, r: Range) => Math.min(r.max, Math.max(r.min, Math.round(v * 4) / 4));

/** Instantiate a preset and apply a customer configuration, clamped to the
 *  product's allowed ranges. Unknown finishes are ignored (default stays). */
export function configurePreset(spec: PresetSpec, cfg: PresetConfig): Unit[] {
  const units = instantiatePreset(spec);
  const { widthRange, depthRange, heightRange } = sizeInfoFor(spec);
  const finish = cfg.finish && CUSTOMER_FINISHES.some((m) => m.id === cfg.finish)
    ? (cfg.finish as MaterialId)
    : null;
  for (const u of units) {
    if (widthRange && cfg.width != null && Number.isFinite(cfg.width)) {
      u.overall = { ...u.overall, width: clamp(cfg.width, widthRange) };
    }
    if (depthRange && cfg.depth != null && Number.isFinite(cfg.depth)) {
      u.overall = { ...u.overall, depth: clamp(cfg.depth, depthRange) };
    }
    if (heightRange && cfg.height != null && Number.isFinite(cfg.height)) {
      u.overall = { ...u.overall, height: clamp(cfg.height, heightRange) };
    }
    if (finish) u.materials = { ...u.materials, carcass: finish, doors: finish };
  }
  return units;
}

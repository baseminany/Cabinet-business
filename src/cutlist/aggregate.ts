// =============================================================================
// CUT LIST AGGREGATION
// =============================================================================
// buildParts() emits one Part per physical piece. For a shop cut list we want
// identical pieces grouped into a single row with a quantity. This groups parts
// that share the same name, material, dimensions, grain, and banding.
// =============================================================================

import type { EdgeId, Grain, Part } from '../model/types';
import { getMaterial } from '../model/materials';

export interface CutListRow {
  name: string;
  materialId: string;
  materialLabel: string;
  qty: number;
  length: number;
  width: number;
  thickness: number;
  grain: Grain;
  bandedEdges: EdgeId[];
  notes?: string;
}

/** Round to 1/16" so tiny float noise doesn't split otherwise-identical rows. */
function r16(n: number): number {
  return Math.round(n * 16) / 16;
}

export function aggregateParts(parts: Part[]): CutListRow[] {
  const map = new Map<string, CutListRow>();

  for (const p of parts) {
    const length = r16(p.length);
    const width = r16(p.width);
    const thickness = r16(p.thickness);
    const banded = [...p.bandedEdges].sort().join('');
    const key = [p.name, p.material, length, width, thickness, p.grain, banded].join('|');

    const existing = map.get(key);
    if (existing) {
      existing.qty += 1;
    } else {
      map.set(key, {
        name: p.name,
        materialId: p.material,
        materialLabel: getMaterial(p.material).label,
        qty: 1,
        length,
        width,
        thickness,
        grain: p.grain,
        bandedEdges: p.bandedEdges,
        notes: p.notes,
      });
    }
  }

  // Stable, shop-friendly ordering: by material, then largest parts first.
  return [...map.values()].sort(
    (a, b) =>
      a.materialLabel.localeCompare(b.materialLabel) ||
      b.length * b.width - a.length * a.width
  );
}

/** Human label for which edges are banded, e.g. "Front" for a single L1 edge. */
export function bandedLabel(edges: EdgeId[]): string {
  if (edges.length === 0) return '—';
  if (edges.length === 4) return 'All 4';
  const names: Record<EdgeId, string> = {
    L1: 'Front',
    L2: 'Back',
    W1: 'Top',
    W2: 'Bottom',
  };
  return edges.map((e) => names[e]).join(', ');
}

/** Format inches as a decimal, trimming trailing zeros (e.g. 22.5, 0.75). */
export function inches(n: number): string {
  return parseFloat(n.toFixed(3)).toString();
}

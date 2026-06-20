// =============================================================================
// EXPORTERS — CSV (for the shop) and JSON (for a future SketchUp importer)
// =============================================================================

import type { BuiltUnit, Unit } from '../model/types';
import { aggregateParts, bandedLabel, inches } from './aggregate';

/** Trigger a browser download of a text file. */
export function downloadText(filename: string, text: string, mime: string) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function csvCell(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** The aggregated cut list as CSV. */
export function cutListCSV(unit: BuiltUnit): string {
  const rows = aggregateParts(unit.parts);
  const header = [
    'Part',
    'Material',
    'Qty',
    'Length (in)',
    'Width (in)',
    'Thickness (in)',
    'Grain',
    'Banded Edges',
    'Notes',
  ];
  const lines = [header.map(csvCell).join(',')];
  for (const r of rows) {
    lines.push(
      [
        r.name,
        r.materialLabel,
        r.qty,
        inches(r.length),
        inches(r.width),
        inches(r.thickness),
        r.grain,
        bandedLabel(r.bandedEdges),
        r.notes ?? '',
      ]
        .map(csvCell)
        .join(',')
    );
  }
  return lines.join('\n');
}

/**
 * Full structured JSON. Shaped so a later SketchUp importer can rebuild the
 * model: every part carries `position` (center, inches) and `size3d` (w/h/d).
 * Also includes the aggregated cut list and hardware counts for convenience.
 */
export function projectJSON(units: Unit[], built: BuiltUnit): string {
  const payload = {
    meta: {
      app: 'cabinet-configurator',
      schema: 'cabinet-project.v2',
      units: 'in',
      generatedAt: new Date().toISOString(),
    },
    design: units, // the editable design (all units)
    parts: built.parts, // per-instance, with position + size3d for 3D rebuild
    hardware: built.hardware,
    cutList: aggregateParts(built.parts),
  };
  return JSON.stringify(payload, null, 2);
}

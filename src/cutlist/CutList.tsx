// =============================================================================
// CUT LIST TABLE + export buttons (Maker view)
// =============================================================================
import { useMemo } from 'react';
import { useStore } from '../store';
import { buildProject } from '../model/buildParts';
import { aggregateParts, bandedLabel, inches } from './aggregate';
import { cutListCSV, downloadText, projectJSON } from './exporters';
import { cabinetRubyScript } from '../export/sketchup';

export default function CutList() {
  const units = useStore((s) => s.units);
  const unit = useMemo(() => buildProject(units), [units]);
  const rows = useMemo(() => aggregateParts(unit.parts), [unit]);
  const totalPieces = rows.reduce((n, r) => n + r.qty, 0);

  const exportBtn =
    'rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 transition hover:border-clay-300 hover:text-clay-700';

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-stone-200 px-3 py-2.5">
        <span className="text-xs text-stone-500">
          {rows.length} part types · {totalPieces} pieces
        </span>
        <div className="flex gap-2">
          <button className={exportBtn} onClick={() => downloadText('cut-list.csv', cutListCSV(unit), 'text/csv')}>
            Export CSV
          </button>
          <button
            className={exportBtn}
            onClick={() => downloadText('cabinet.json', projectJSON(units, unit), 'application/json')}
          >
            Export JSON
          </button>
          <button
            className={exportBtn}
            onClick={() => downloadText('cabinet-sketchup.rb', cabinetRubyScript(units, unit), 'text/x-ruby')}
          >
            SketchUp (.rb)
          </button>
        </div>
      </div>

      <div className="nice-scroll min-h-0 flex-1 overflow-auto">
        <table className="w-full border-collapse text-xs">
          <thead className="sticky top-0 bg-stone-50 text-stone-500">
            <tr className="text-left">
              <th className="px-2 py-2 font-semibold">Part</th>
              <th className="px-2 py-2 font-semibold">Material</th>
              <th className="px-2 py-2 text-right font-semibold">Qty</th>
              <th className="px-2 py-2 text-right font-semibold">Length</th>
              <th className="px-2 py-2 text-right font-semibold">Width</th>
              <th className="px-2 py-2 text-right font-semibold">Thick</th>
              <th className="px-2 py-2 font-semibold">Grain</th>
              <th className="px-2 py-2 font-semibold">Banded</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-stone-100 text-stone-700">
                <td className="px-2 py-1.5 font-medium text-stone-800">{r.name}</td>
                <td className="px-2 py-1.5 text-stone-500">{r.materialLabel}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{r.qty}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{inches(r.length)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{inches(r.width)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{inches(r.thickness)}</td>
                <td className="px-2 py-1.5 text-stone-500">{r.grain}</td>
                <td className="px-2 py-1.5 text-stone-500">{bandedLabel(r.bandedEdges)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

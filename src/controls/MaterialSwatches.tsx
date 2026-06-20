// A visual material picker: rounded swatches a customer can actually see, with
// the selected one ringed and named. Replaces the old dropdown.
import { MATERIALS, type MaterialDef } from '../model/materials';
import type { MaterialId } from '../model/types';

/** Darken a #rrggbb hex by an amount (0..1) for a subtle grain gradient. */
function shade(hex: string, amount: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const f = (c: number) => Math.max(0, Math.round(c * (1 - amount)));
  return `rgb(${f(r)}, ${f(g)}, ${f(b)})`;
}

/** A CSS background that hints at the material — soft grain for wood, sheen for paint. */
export function swatchBackground(m: MaterialDef): string {
  if (m.kind === 'wood') {
    return `repeating-linear-gradient(115deg, ${m.color} 0 4px, ${shade(
      m.color,
      0.12
    )} 4px 7px), linear-gradient(160deg, ${shade(m.color, -0.0)} , ${shade(m.color, 0.18)})`;
  }
  // painted / laminate: smooth with a soft top highlight
  return `linear-gradient(155deg, ${shade(m.color, -0.04)} 0%, ${m.color} 45%, ${shade(
    m.color,
    0.1
  )} 100%)`;
}

export default function MaterialSwatches({
  label,
  value,
  onChange,
}: {
  label: string;
  value: MaterialId;
  onChange: (id: MaterialId) => void;
}) {
  const selected = MATERIALS.find((m) => m.id === value);
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-sm font-medium text-ink-soft">{label}</span>
        <span className="text-xs text-ink-muted">{selected?.label}</span>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {MATERIALS.filter((m) => m.customerFacing !== false).map((m) => {
          const active = m.id === value;
          return (
            <button
              key={m.id}
              type="button"
              title={m.label}
              onClick={() => onChange(m.id)}
              className={
                'h-11 w-11 rounded-full ring-offset-2 ring-offset-white transition ' +
                (active ? 'ring-2 ring-clay-600 scale-105 shadow-soft' : 'ring-1 ring-ivory-200 hover:scale-105')
              }
              style={{ background: swatchBackground(m) }}
            />
          );
        })}
      </div>
    </div>
  );
}

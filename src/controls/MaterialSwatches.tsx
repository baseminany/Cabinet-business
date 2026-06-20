import { MATERIALS, materialsFor, type MaterialDef, type MaterialRole } from '../model/materials';
import type { MaterialId } from '../model/types';

function shade(hex: string, amount: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(c * (1 - amount))));
  return `rgb(${f(r)}, ${f(g)}, ${f(b)})`;
}

export function swatchBackground(m: MaterialDef): string {
  if (m.kind === 'wood') {
    return `linear-gradient(160deg, ${shade(m.color, -0.04)} 0%, ${m.color} 45%, ${shade(m.color, 0.18)} 100%)`;
  }
  return `linear-gradient(155deg, ${shade(m.color, -0.04)} 0%, ${m.color} 48%, ${shade(m.color, 0.12)} 100%)`;
}

export default function MaterialSwatches({
  label,
  value,
  onChange,
  role = 'carcass',
}: {
  label: string;
  value: MaterialId;
  onChange: (id: MaterialId) => void;
  role?: MaterialRole;
}) {
  const selected = MATERIALS.find((m) => m.id === value);
  const options = materialsFor(role);
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-sm font-bold text-ink-soft">{label}</span>
        <span className="truncate text-xs text-ink-muted">{selected?.label}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {options.map((m) => {
          const active = m.id === value;
          return (
            <button
              key={m.id}
              type="button"
              title={m.label}
              onClick={() => onChange(m.id)}
              className={
                'group overflow-hidden rounded-2xl border bg-warmWhite p-2 text-left transition active:scale-[0.99] ' +
                (active ? 'border-brass shadow-premiumGlow' : 'border-champagne/25 hover:border-brass/60 hover:shadow-soft')
              }
            >
              <div className="h-14 rounded-xl ring-1 ring-black/5" style={{ background: swatchBackground(m) }} />
              <div className="mt-2 text-[11px] font-black leading-tight text-ink">{m.label}</div>
              {m.premiumLabel && <div className="mt-0.5 text-[10px] leading-tight text-ink-muted">{m.premiumLabel}</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

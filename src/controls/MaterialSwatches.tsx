import { materialsFor, materialTier, type MaterialRole } from '../model/materials';
import type { MaterialId } from '../model/types';

const TIER_LABEL: Record<'value' | 'premium', string> = {
  value: 'Value · pre-finished + painted (ships faster)',
  premium: 'Premium · oak + walnut veneer plywood',
};

export default function MaterialSwatches({ label, value, onChange, role = 'carcass' }: { label: string; value: MaterialId; onChange: (id: MaterialId) => void; role?: MaterialRole }) {
  const options = materialsFor(role);
  const value_ = options.filter((m) => materialTier(m) === 'value');
  const premium = options.filter((m) => materialTier(m) === 'premium');
  const groups = ([['value', value_], ['premium', premium]] as const).filter(([, list]) => list.length > 0);

  return (
    <div>
      <div className="mb-2 text-sm font-bold text-ink-soft">{label}</div>
      <div className="space-y-3">
        {groups.map(([tier, list]) => (
          <div key={tier}>
            <div className="mb-1.5 flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-brass">{TIER_LABEL[tier]}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {list.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onChange(m.id)}
                  title={m.premiumLabel}
                  className={'rounded-2xl border p-3 text-left text-xs font-bold transition ' + (m.id === value ? 'border-brass bg-parchment text-walnut' : 'border-champagne/25 bg-warmWhite text-ink-soft hover:border-brass/50')}
                >
                  <span className="block h-10 rounded-xl border border-black/10" style={{ background: m.color }} />
                  <span className="mt-2 block">{m.label}</span>
                  {m.code && <span className="mt-1 block text-brass">{m.code}</span>}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

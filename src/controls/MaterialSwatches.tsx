import { materialsFor, type MaterialRole } from '../model/materials';
import type { MaterialId } from '../model/types';

export default function MaterialSwatches({ label, value, onChange, role = 'carcass' }: { label: string; value: MaterialId; onChange: (id: MaterialId) => void; role?: MaterialRole }) {
  const options = materialsFor(role);
  return <div><div className="mb-2 text-sm font-bold text-ink-soft">{label}</div><div className="grid grid-cols-2 gap-2">{options.map((m) => <button key={m.id} type="button" onClick={() => onChange(m.id)} className={'rounded-2xl border p-3 text-left text-xs font-bold ' + (m.id === value ? 'border-brass bg-parchment text-walnut' : 'border-champagne/25 bg-warmWhite text-ink-soft')}><span className="block h-10 rounded-xl border border-black/10" style={{ background: m.color }} /><span className="mt-2 block">{m.label}</span>{m.code && <span className="mt-1 block text-brass">{m.code}</span>}</button>)}</div></div>;
}

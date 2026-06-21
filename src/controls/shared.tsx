import type { DoorConfig } from '../model/types';
import type { RoomShape } from '../model/room';
import { SHAPE_LABELS } from '../model/roomShapes';
import type { CardOption } from './fields';

export function DoorIcon({ kind }: { kind: DoorConfig }) {
  return (
    <svg width="34" height="30" viewBox="0 0 34 30" fill="none" className="stroke-current" strokeWidth="1.6">
      <rect x="3" y="2" width="28" height="26" rx="2" />
      {kind === 'single' && <line x1="24" y1="2" x2="24" y2="28" />}
      {kind === 'double' && <line x1="17" y1="2" x2="17" y2="28" />}
      {kind === 'none' && <><line x1="3" y1="10" x2="31" y2="10" strokeDasharray="2 2" /><line x1="3" y1="19" x2="31" y2="19" strokeDasharray="2 2" /></>}
    </svg>
  );
}

export const doorOptions: CardOption<DoorConfig>[] = [
  { value: 'none', label: 'Open', icon: <DoorIcon kind="none" /> },
  { value: 'single', label: 'Single', icon: <DoorIcon kind="single" /> },
  { value: 'double', label: 'Double', icon: <DoorIcon kind="double" /> },
];

export function ShapeIcon({ shape }: { shape: RoomShape }) {
  const c = 'fill-current opacity-90';
  switch (shape) {
    case 'rect': return <svg width="30" height="24" viewBox="0 0 30 24"><rect x="3" y="3" width="24" height="18" className={c} /></svg>;
    case 'l': return <svg width="30" height="24" viewBox="0 0 30 24"><path d="M3 3h24v11H15v7H3z" className={c} /></svg>;
    case 'u': return <svg width="30" height="24" viewBox="0 0 30 24"><path d="M3 3h24v18h-7v-9h-10v9H3z" className={c} /></svg>;
    case 'alcove': return <svg width="30" height="24" viewBox="0 0 30 24"><path d="M3 7h7V3h10v4h7v14H3z" className={c} /></svg>;
    case 'corner': return <svg width="30" height="24" viewBox="0 0 30 24"><path d="M3 3h17l7 7v11H3z" className={c} /></svg>;
  }
}

export const shapeOptions: CardOption<RoomShape>[] = (['rect', 'l', 'u', 'alcove', 'corner'] as RoomShape[]).map((s) => ({ value: s, label: SHAPE_LABELS[s], icon: <ShapeIcon shape={s} /> }));

export function WallPicker({ count, value, onChange }: { count: number; value: number; onChange: (i: number) => void }) {
  const safeCount = Math.max(0, count);
  if (safeCount === 0) return <p className="rounded-2xl bg-parchment/50 p-3 text-xs text-ink-muted">No walls available yet. Turn room mode on first.</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {Array.from({ length: safeCount }, (_, i) => <button key={i} type="button" onClick={() => onChange(i)} className={'h-9 min-w-9 rounded-xl px-2.5 text-xs font-bold transition ' + (value === i ? 'bg-walnut text-porcelain shadow-soft' : 'bg-warmWhite text-ink-soft ring-1 ring-champagne/35 hover:ring-brass')}>{i + 1}</button>)}
    </div>
  );
}

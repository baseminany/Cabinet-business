import { useMemo } from 'react';
import { useStore } from '../store';
import { footprint } from '../model/roomShapes';
import { DimensionSlider } from '../controls/fields';
import { WallPicker } from '../controls/shared';

export default function OpeningsStep() {
  const room = useStore((s) => s.room);
  const addOpening = useStore((s) => s.addOpening);
  const updateOpening = useStore((s) => s.updateOpening);
  const removeOpening = useStore((s) => s.removeOpening);
  const walls = useMemo(() => footprint(room).walls, [room]);
  const wallCount = walls.length;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-porcelain p-4 text-sm leading-6 text-ink-muted ring-1 ring-champagne/30">Add only nearby windows and doors that affect cabinetry. Openings are now clamped to their wall so they do not float outside the room.</div>
      <div className="flex gap-2"><button onClick={() => addOpening('window', 0)} className="rounded-full bg-obsidian px-4 py-2 text-sm font-bold text-porcelain">+ Window</button><button onClick={() => addOpening('door', 0)} className="rounded-full border border-brass/40 px-4 py-2 text-sm font-bold text-walnut">+ Door</button></div>
      {room.openings.length === 0 && <p className="rounded-2xl border border-dashed border-champagne/45 p-4 text-sm text-ink-muted">No interruptions yet. Skip this step if your cabinet wall is clear.</p>}
      <div className="space-y-3">{room.openings.map((o) => { const w = walls[Math.min(o.wallIndex, Math.max(0, wallCount - 1))]; const maxOffset = w ? Math.max(0, Math.round(w.length / 2 - o.width / 2)) : 0; const maxHeight = o.kind === 'door' ? Math.min(96, room.height) : Math.min(120, room.height); return <div key={o.id} className="premium-card p-4"><div className="mb-3 flex items-center justify-between"><div><span className="text-sm font-black capitalize text-ink">{o.kind}</span><p className="text-xs text-ink-muted">{Math.round(o.width)} × {Math.round(o.height)} in{o.kind === 'window' ? ` · sill ${Math.round(o.sill)} in` : ''}</p></div><button onClick={() => removeOpening(o.id)} className="text-xs font-bold text-ink-muted hover:text-red-600">Remove</button></div><p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-muted">Wall</p><WallPicker count={wallCount} value={Math.min(o.wallIndex, Math.max(0, wallCount - 1))} onChange={(i) => updateOpening(o.id, { wallIndex: i, offset: 0 })} /><div className="mt-3 space-y-3"><DimensionSlider label="Width" value={o.width} min={12} max={w ? Math.max(12, Math.min(120, w.length - 2)) : 120} onChange={(v) => updateOpening(o.id, { width: v })} /><DimensionSlider label="Height" value={o.height} min={12} max={maxHeight} onChange={(v) => updateOpening(o.id, { height: v })} />{o.kind === 'window' && <DimensionSlider label="Sill height" value={o.sill} min={0} max={Math.max(0, room.height - o.height)} onChange={(v) => updateOpening(o.id, { sill: v })} />}<DimensionSlider label="Slide along wall" value={Math.max(-maxOffset, Math.min(maxOffset, o.offset))} min={-maxOffset} max={maxOffset} onChange={(v) => updateOpening(o.id, { offset: v })} /></div></div>; })}</div>
    </div>
  );
}

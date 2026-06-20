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

  const addBtn = 'rounded-xl bg-white px-3 py-2 text-sm font-semibold text-ink-soft ring-1 ring-ivory-200 transition hover:ring-clay-300 active:scale-95';

  return (
    <div className="space-y-5">
      <p className="text-sm text-ink-muted">Add any windows and doors in your room, with your own measurements. Skip if there are none nearby.</p>

      <div className="flex gap-2">
        <button onClick={() => addOpening('window', 0)} className={addBtn}>+ Add window</button>
        <button onClick={() => addOpening('door', 0)} className={addBtn}>+ Add door</button>
      </div>

      {room.openings.length === 0 && <p className="text-sm text-ink-muted">No windows or doors yet.</p>}

      <div className="space-y-3">
        {room.openings.map((o) => {
          const w = walls[Math.min(o.wallIndex, wallCount - 1)];
          const slide = w ? Math.round(w.length / 2) : 0;
          return (
            <div key={o.id} className="rounded-2xl bg-ivory-50 p-4 ring-1 ring-ivory-200">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold capitalize text-ink">{o.kind}</span>
                <button onClick={() => removeOpening(o.id)} className="text-xs font-medium text-ink-muted hover:text-red-600">Remove</button>
              </div>
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-ink-muted">On wall</p>
              <WallPicker count={wallCount} value={Math.min(o.wallIndex, wallCount - 1)} onChange={(i) => updateOpening(o.id, { wallIndex: i })} />
              <div className="mt-3 space-y-3">
                <DimensionSlider label="Width" value={o.width} min={12} max={120} onChange={(v) => updateOpening(o.id, { width: v })} />
                <DimensionSlider label="Height" value={o.height} min={12} max={Math.min(120, room.height)} onChange={(v) => updateOpening(o.id, { height: v })} />
                {o.kind === 'window' && (
                  <DimensionSlider label="Sill height" value={o.sill} min={0} max={Math.max(12, room.height - o.height)} onChange={(v) => updateOpening(o.id, { sill: v })} />
                )}
                <DimensionSlider label="Position along wall" value={o.offset} min={-slide} max={slide} onChange={(v) => updateOpening(o.id, { offset: v })} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

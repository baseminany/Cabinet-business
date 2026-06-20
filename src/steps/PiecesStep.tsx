import { useMemo } from 'react';
import { useStore, useSelectedUnit } from '../store';
import { CATALOG } from '../model/catalog';
import type { DoorConfig } from '../model/types';
import { footprint } from '../model/roomShapes';
import { Section, DimensionSlider, Stepper, OptionCards, Toggle } from '../controls/fields';
import { doorOptions, WallPicker } from '../controls/shared';
import MaterialSwatches from '../controls/MaterialSwatches';

export default function PiecesStep() {
  const units = useStore((s) => s.units);
  const selectedId = useStore((s) => s.selectedId);
  const room = useStore((s) => s.room);
  const addUnit = useStore((s) => s.addUnit);
  const removeUnit = useStore((s) => s.removeUnit);
  const duplicateUnit = useStore((s) => s.duplicateUnit);
  const selectUnit = useStore((s) => s.selectUnit);
  const sel = useSelectedUnit();

  return (
    <div className="space-y-6">
      {/* Catalog */}
      <Section title="Add a piece" subtitle="Build up your space — add as many as you like.">
        <div className="grid grid-cols-2 gap-2">
          {CATALOG.map((c) => (
            <button
              key={c.type}
              onClick={() => addUnit(c.type)}
              className="rounded-2xl border border-ivory-200 bg-white p-3 text-left transition hover:border-clay-300 hover:shadow-soft active:scale-[0.98]"
            >
              <div className="text-sm font-semibold text-ink">{c.name}</div>
              <div className="mt-0.5 text-[11px] leading-snug text-ink-muted">{c.blurb}</div>
            </button>
          ))}
        </div>
      </Section>

      {/* Your pieces */}
      {units.length > 0 && (
        <Section title={`Your pieces (${units.length})`}>
          <div className="flex flex-wrap gap-2">
            {units.map((u) => (
              <button
                key={u.id}
                onClick={() => selectUnit(u.id)}
                className={
                  'rounded-full px-3 py-1.5 text-xs font-semibold transition ' +
                  (u.id === selectedId ? 'bg-clay-600 text-white shadow-soft' : 'bg-white text-ink-soft ring-1 ring-ivory-200 hover:ring-clay-300')
                }
              >
                {u.label}
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* Editor for the selected unit */}
      {sel && <UnitEditor key={sel.id} room={room} onRemove={() => removeUnit(sel.id)} onDuplicate={() => duplicateUnit(sel.id)} />}

      {units.length === 0 && (
        <p className="rounded-xl bg-ivory-50 p-4 text-sm text-ink-muted">Add your first piece above to start designing.</p>
      )}
    </div>
  );
}

function UnitEditor({ room, onRemove, onDuplicate }: { room: ReturnType<typeof useStore.getState>['room']; onRemove: () => void; onDuplicate: () => void }) {
  const sel = useSelectedUnit()!;
  const setSelOverall = useStore((s) => s.setSelOverall);
  const updateSel = useStore((s) => s.updateSel);
  const setSelToeKick = useStore((s) => s.setSelToeKick);
  const setSelMaterials = useStore((s) => s.setSelMaterials);
  const setSelPlacement = useStore((s) => s.setSelPlacement);

  const walls = useMemo(() => (room.enabled ? footprint(room).walls : []), [room]);
  const cabWall = walls[Math.min(sel.placement.wallIndex, walls.length - 1)];
  const cabSlide = cabWall ? Math.round(cabWall.length / 2 - sel.overall.width / 2) : 0;
  const isShelf = sel.type === 'shelf';
  const isUpper = sel.type === 'upper';

  return (
    <div className="rounded-2xl border border-ivory-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-ink">{sel.label}</h3>
        <div className="flex gap-3 text-xs font-medium">
          <button onClick={onDuplicate} className="text-ink-muted hover:text-clay-700">Duplicate</button>
          <button onClick={onRemove} className="text-ink-muted hover:text-red-600">Remove</button>
        </div>
      </div>

      <div className="space-y-6">
        <Section title="Size">
          <DimensionSlider label="Width" value={sel.overall.width} min={6} max={120} onChange={(v) => setSelOverall({ width: v })} />
          <DimensionSlider label={isShelf ? 'Thickness' : 'Height'} value={sel.overall.height} min={isShelf ? 1 : 12} max={isShelf ? 4 : 120} onChange={(v) => setSelOverall({ height: v })} />
          <DimensionSlider label="Depth" value={sel.overall.depth} min={4} max={36} onChange={(v) => setSelOverall({ depth: v })} />
          {(isShelf || isUpper) && (
            <DimensionSlider label="Mount height (floor → bottom)" value={sel.mountHeight} min={0} max={Math.max(12, room.height - sel.overall.height)} onChange={(v) => updateSel({ mountHeight: v })} />
          )}
        </Section>

        {!isShelf && (
          <>
            <Section title="Layout">
              <Stepper label="Compartments" value={sel.sections} min={1} max={8} onChange={(v) => updateSel({ sections: v })} />
              <Stepper label="Shelves in each" value={sel.shelvesPerSection} min={0} max={12} onChange={(v) => updateSel({ shelvesPerSection: v })} />
            </Section>

            <Section title="Doors">
              <OptionCards<DoorConfig> value={sel.door} options={doorOptions} onChange={(v) => updateSel({ door: v })} columns={3} />
            </Section>

            {sel.type !== 'upper' && (
              <Section title="Base">
                <Toggle label="Recessed base (toe kick)" checked={sel.toeKick.enabled} onChange={(v) => setSelToeKick({ enabled: v })} />
                {sel.toeKick.enabled && <DimensionSlider label="Base height" value={sel.toeKick.height} min={2} max={10} onChange={(v) => setSelToeKick({ height: v })} />}
              </Section>
            )}
          </>
        )}

        <Section title="Finishes">
          <MaterialSwatches label={isShelf ? 'Shelf' : 'Cabinet body'} value={sel.materials.carcass} onChange={(v) => setSelMaterials({ carcass: v })} />
          {!isShelf && <MaterialSwatches label="Doors" value={sel.materials.doors} onChange={(v) => setSelMaterials({ doors: v })} />}
        </Section>

        {room.enabled && walls.length > 0 && (
          <Section title="Where it sits" subtitle="Drag the piece in the preview to move it — or pick a wall here.">
            <WallPicker count={walls.length} value={Math.min(sel.placement.wallIndex, walls.length - 1)} onChange={(i) => setSelPlacement({ wallIndex: i, offset: 0 })} />
            <DimensionSlider label="Slide along wall" value={sel.placement.offset} min={-cabSlide} max={cabSlide} onChange={(v) => setSelPlacement({ offset: v })} />
          </Section>
        )}
      </div>
    </div>
  );
}

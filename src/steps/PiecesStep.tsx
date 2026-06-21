import { useMemo, useState } from 'react';
import { useStore, useSelectedUnit } from '../store';
import type { DoorConfig, UnitType } from '../model/types';
import { footprint } from '../model/roomShapes';
import { Section, DimensionSlider, Stepper, OptionCards, Toggle } from '../controls/fields';
import { doorOptions, WallPicker } from '../controls/shared';
import MaterialSwatches from '../controls/MaterialSwatches';

const modules: { label: string; type: UnitType; width?: number; note: string }[] = [
  { label: '48 in bench base', type: 'base', width: 48, note: 'entry or reading nook starter' },
  { label: '60 in bench base', type: 'base', width: 60, note: 'mudroom / playroom size' },
  { label: '24 in locker tower', type: 'tall', width: 24, note: 'one shippable tall module' },
  { label: '36 in hutch base', type: 'base', width: 36, note: 'coffee or laundry storage' },
  { label: 'Wall cabinet', type: 'upper', width: 36, note: 'optional upper storage' },
  { label: 'Book / display shelf', type: 'shelf', width: 48, note: 'simple shelf module' },
];

const starters = [
  { label: 'Mudroom Nook', note: 'bench + locker + upper shelf', items: [['tall', 24], ['base', 60], ['shelf', 60]] as [UnitType, number][] },
  { label: 'Coffee Nook', note: 'base hutch + shelves', items: [['base', 48], ['upper', 48], ['shelf', 48]] as [UnitType, number][] },
  { label: 'Playroom Nook', note: 'low storage + display shelves', items: [['base', 72], ['shelf', 72], ['shelf', 60]] as [UnitType, number][] },
  { label: 'Laundry Nook', note: 'utility base + upper storage', items: [['base', 60], ['upper', 60]] as [UnitType, number][] },
];

export default function PiecesStep() {
  const units = useStore((s) => s.units);
  const selectedId = useStore((s) => s.selectedId);
  const room = useStore((s) => s.room);
  const addPresetUnit = useStore((s) => s.addPresetUnit);
  const removeUnit = useStore((s) => s.removeUnit);
  const duplicateUnit = useStore((s) => s.duplicateUnit);
  const selectUnit = useStore((s) => s.selectUnit);
  const sel = useSelectedUnit();
  const addStarter = (items: [UnitType, number][]) => items.forEach(([type, width]) => addPresetUnit(type, width));

  return (
    <div className="space-y-6">
      <Section title="Starter systems" subtitle="One click adds a small, realistic module set. These are intentionally garage-buildable and shippable in pieces.">
        <div className="grid grid-cols-2 gap-2.5">{starters.map((p) => <button key={p.label} onClick={() => addStarter(p.items)} className="rounded-2xl border border-champagne/30 bg-warmWhite p-4 text-left shadow-soft transition hover:border-brass/70 hover:shadow-card active:scale-[0.98]"><div className="text-sm font-black tracking-tight text-ink">{p.label}</div><div className="mt-1 text-[11px] leading-snug text-ink-muted">{p.note}</div></button>)}</div>
      </Section>

      <Section title="Single modules" subtitle="Add one product at a time if the starter systems are too much.">
        <div className="grid grid-cols-2 gap-2.5">{modules.map((p) => <button key={p.label} onClick={() => addPresetUnit(p.type, p.width)} className="rounded-2xl border border-champagne/30 bg-warmWhite p-4 text-left shadow-soft transition hover:border-brass/70 hover:shadow-card active:scale-[0.98]"><div className="text-sm font-black tracking-tight text-ink">{p.label}</div><div className="mt-1 text-[11px] leading-snug text-ink-muted">{p.note}</div></button>)}</div>
      </Section>

      {units.length > 0 && <Section title={`Your modules (${units.length})`}><div className="flex flex-wrap gap-2">{units.map((u) => <button key={u.id} onClick={() => selectUnit(u.id)} className={'rounded-full px-3 py-1.5 text-xs font-bold transition ' + (u.id === selectedId ? 'bg-walnut text-porcelain shadow-soft' : 'bg-warmWhite text-ink-soft ring-1 ring-champagne/30 hover:ring-brass/70')}>{u.label}</button>)}</div></Section>}
      {sel && <UnitEditor key={sel.id} room={room} onRemove={() => removeUnit(sel.id)} onDuplicate={() => duplicateUnit(sel.id)} />}
      {units.length === 0 && <div className="rounded-3xl border border-dashed border-champagne/50 bg-warmWhite p-6 text-sm leading-6 text-ink-muted">Add a starter system or a single module above. The planner works best when you start small and adjust dimensions.</div>}
    </div>
  );
}

function UnitEditor({ room, onRemove, onDuplicate }: { room: ReturnType<typeof useStore.getState>['room']; onRemove: () => void; onDuplicate: () => void }) {
  const [advanced, setAdvanced] = useState(false);
  const sel = useSelectedUnit()!;
  const setSelOverall = useStore((s) => s.setSelOverall);
  const updateSel = useStore((s) => s.updateSel);
  const setSelToeKick = useStore((s) => s.setSelToeKick);
  const setSelMaterials = useStore((s) => s.setSelMaterials);
  const setSelPlacement = useStore((s) => s.setSelPlacement);
  const walls = useMemo(() => (room.enabled ? footprint(room).walls : []), [room]);
  const wallIndex = Math.min(sel.placement.wallIndex, Math.max(0, walls.length - 1));
  const cabWall = walls[wallIndex];
  const cabSlide = cabWall ? Math.max(0, Math.round(cabWall.length / 2 - sel.overall.width / 2)) : 0;
  const widerThanWall = Boolean(cabWall && sel.overall.width > cabWall.length);
  const isShelf = sel.type === 'shelf';
  const isUpper = sel.type === 'upper';

  return (
    <div className="premium-card p-5">
      <div className="mb-4 flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brass">Selected module</p><h3 className="mt-1 text-2xl font-black tracking-tight text-ink">{sel.label}</h3><p className="mt-1 text-xs capitalize text-ink-muted">{sel.type} · {Math.round(sel.overall.width)}w × {Math.round(sel.overall.height)}h × {Math.round(sel.overall.depth)}d</p></div><div className="flex gap-3 text-xs font-bold"><button onClick={onDuplicate} className="text-ink-muted hover:text-walnut">Duplicate</button><button onClick={onRemove} className="text-ink-muted hover:text-red-600">Remove</button></div></div>
      {widerThanWall && <div className="mb-5 rounded-2xl bg-[#fff4dd] p-3 text-xs leading-5 text-walnut ring-1 ring-brass/30">This module is wider than the selected wall. Reduce width or choose a longer wall.</div>}
      <div className="space-y-6"><Section title="Basic size"><DimensionSlider label="Width" value={sel.overall.width} min={6} max={96} onChange={(v) => setSelOverall({ width: v })} /><DimensionSlider label={isShelf ? 'Thickness' : 'Height'} value={sel.overall.height} min={isShelf ? 1 : 12} max={isShelf ? 4 : 120} onChange={(v) => setSelOverall({ height: v })} /><DimensionSlider label="Depth" value={sel.overall.depth} min={4} max={30} onChange={(v) => setSelOverall({ depth: v })} /></Section><Section title="Finish"><MaterialSwatches role={isShelf ? 'shelf' : 'carcass'} label={isShelf ? 'Shelf finish' : 'Body finish'} value={sel.materials.carcass} onChange={(v) => setSelMaterials({ carcass: v })} />{!isShelf && <MaterialSwatches role="door" label="Door / front finish" value={sel.materials.doors} onChange={(v) => setSelMaterials({ doors: v })} />}</Section>{room.enabled && walls.length > 0 && <Section title="Placement"><WallPicker count={walls.length} value={wallIndex} onChange={(i) => setSelPlacement({ wallIndex: i, offset: 0 })} /><DimensionSlider label="Slide along wall" value={Math.max(-cabSlide, Math.min(cabSlide, sel.placement.offset))} min={-cabSlide} max={cabSlide} onChange={(v) => setSelPlacement({ offset: v })} /></Section>}<Toggle label="Show advanced construction details" checked={advanced} onChange={setAdvanced} />{advanced && !isShelf && <><Section title="Interior layout"><Stepper label="Compartments" value={sel.sections} min={1} max={8} onChange={(v) => updateSel({ sections: v })} /><Stepper label="Shelves in each" value={sel.shelvesPerSection} min={0} max={12} onChange={(v) => updateSel({ shelvesPerSection: v })} /></Section><Section title="Doors"><OptionCards<DoorConfig> value={sel.door} options={doorOptions} onChange={(v) => updateSel({ door: v })} columns={3} /></Section>{sel.type !== 'upper' && <Section title="Base detail"><Toggle label="Recessed base" checked={sel.toeKick.enabled} onChange={(v) => setSelToeKick({ enabled: v })} />{sel.toeKick.enabled && <DimensionSlider label="Base height" value={sel.toeKick.height} min={2} max={10} onChange={(v) => setSelToeKick({ height: v })} />}</Section>}</>}{advanced && (isShelf || isUpper) && <Section title="Mounting"><DimensionSlider label="Mount height" value={sel.mountHeight} min={0} max={Math.max(12, room.height - sel.overall.height)} onChange={(v) => updateSel({ mountHeight: v })} /></Section>}</div>
    </div>
  );
}

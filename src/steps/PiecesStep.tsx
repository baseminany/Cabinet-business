import { useMemo, useState } from 'react';
import { useStore, useSelectedUnit } from '../store';
import type { DoorConfig, UnitType } from '../model/types';
import { footprint } from '../model/roomShapes';
import { Section, DimensionSlider, Stepper, OptionCards, Toggle } from '../controls/fields';
import { doorOptions, WallPicker } from '../controls/shared';
import MaterialSwatches from '../controls/MaterialSwatches';

// ─── Data ────────────────────────────────────────────────────────────────────

const starters = [
  {
    label: 'Mudroom Nook',
    sub: 'bench · locker · shelf',
    note: 'Garage-buildable in 3 modules. Ships in pieces.',
    color: '#4a6741',
    items: [['tall', 24], ['base', 60], ['shelf', 60]] as [UnitType, number][],
  },
  {
    label: 'Coffee Nook',
    sub: 'base hutch · upper · shelf',
    note: 'Counter-height base, open shelves, finished back panel.',
    color: '#5a4832',
    items: [['base', 48], ['upper', 48], ['shelf', 48]] as [UnitType, number][],
  },
  {
    label: 'Playroom Nook',
    sub: 'low storage · display shelves',
    note: 'Montessori-height cubbies with easy-reach shelves.',
    color: '#6b5a7e',
    items: [['base', 72], ['shelf', 72], ['shelf', 60]] as [UnitType, number][],
  },
  {
    label: 'Laundry Nook',
    sub: 'base storage · upper cabinet',
    note: 'Utility tower, folding counter, and wall uppers.',
    color: '#3a5060',
    items: [['base', 60], ['upper', 60]] as [UnitType, number][],
  },
];

const modules: { label: string; sub: string; type: UnitType; width?: number; note: string }[] = [
  { label: '48″ bench base', sub: 'base cabinet', type: 'base', width: 48, note: 'Entry or reading nook starter' },
  { label: '60″ bench base', sub: 'base cabinet', type: 'base', width: 60, note: 'Mudroom or playroom size' },
  { label: '24″ locker tower', sub: 'tall cabinet', type: 'tall', width: 24, note: 'Shippable tall module' },
  { label: '36″ hutch base', sub: 'base cabinet', type: 'base', width: 36, note: 'Coffee or laundry storage' },
  { label: 'Wall cabinet', sub: 'upper cabinet', type: 'upper', width: 36, note: 'Optional upper storage' },
  { label: 'Book / display shelf', sub: 'open shelf', type: 'shelf', width: 48, note: 'Simple shelf module' },
  { label: 'Montessori bookshelf', sub: 'kids display', type: 'montessori', width: 30, note: 'Forward-facing, child height' },
  { label: 'Learning tower', sub: 'kitchen helper', type: 'learning-tower', width: 16, note: 'Toddler standing platform' },
];

// ─── Main component ──────────────────────────────────────────────────────────

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
  const [tab, setTab] = useState<'starters' | 'single'>('starters');

  return (
    <div className="space-y-5">
      {/* Tab toggle */}
      <div className="flex gap-1 rounded-2xl border border-champagne/30 bg-porcelain p-1">
        {(['starters', 'single'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={'flex-1 rounded-xl py-2 text-xs font-bold uppercase tracking-[0.14em] transition ' +
              (tab === t ? 'bg-walnut text-porcelain shadow-soft' : 'text-ink-muted hover:text-ink')}
          >
            {t === 'starters' ? 'Starter systems' : 'Single modules'}
          </button>
        ))}
      </div>

      {tab === 'starters' && (
        <div className="grid grid-cols-1 gap-3">
          {starters.map((p) => (
            <StarterCard key={p.label} starter={p} onAdd={() => addStarter(p.items)} />
          ))}
        </div>
      )}

      {tab === 'single' && (
        <div className="grid grid-cols-2 gap-3">
          {modules.map((m) => (
            <ModuleCard key={m.label} module={m} onAdd={() => addPresetUnit(m.type, m.width)} />
          ))}
        </div>
      )}

      {/* Module list */}
      {units.length > 0 && (
        <div>
          <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted">
            Your modules ({units.length}) — click to select · Delete key removes
          </p>
          <div className="flex flex-wrap gap-2">
            {units.map((u) => (
              <button
                key={u.id}
                onClick={() => selectUnit(u.id)}
                className={
                  'rounded-full px-3 py-1.5 text-xs font-bold transition ' +
                  (u.id === selectedId
                    ? 'bg-walnut text-porcelain shadow-soft'
                    : 'bg-warmWhite text-ink-soft ring-1 ring-champagne/30 hover:ring-brass/60')
                }
              >
                {u.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {sel && (
        <UnitEditor
          key={sel.id}
          room={room}
          onRemove={() => removeUnit(sel.id)}
          onDuplicate={() => duplicateUnit(sel.id)}
        />
      )}

      {units.length === 0 && (
        <div className="rounded-3xl border border-dashed border-champagne/40 bg-warmWhite/60 p-6 text-center text-sm leading-6 text-ink-muted">
          Add a starter system or a single module above.
          <br />The planner works best starting small.
        </div>
      )}
    </div>
  );
}

// ─── Starter card ─────────────────────────────────────────────────────────────

function StarterCard({ starter, onAdd }: { starter: typeof starters[number]; onAdd: () => void }) {
  return (
    <button
      onClick={onAdd}
      className="group flex items-stretch gap-0 overflow-hidden rounded-2xl border border-champagne/30 bg-warmWhite text-left shadow-soft transition hover:border-brass/50 hover:shadow-card active:scale-[0.99]"
    >
      {/* Color accent strip */}
      <div className="w-1.5 shrink-0 rounded-l-2xl" style={{ background: starter.color }} />

      {/* Illustration */}
      <div className="flex w-20 shrink-0 items-center justify-center bg-porcelain p-3">
        <StarterIllustration label={starter.label} color={starter.color} />
      </div>

      {/* Text */}
      <div className="flex flex-1 flex-col justify-center gap-1 px-4 py-4">
        <div className="text-sm font-black tracking-tight text-ink">{starter.label}</div>
        <div className="text-[11px] font-semibold text-brass">{starter.sub}</div>
        <div className="mt-0.5 text-[11px] leading-snug text-ink-muted">{starter.note}</div>
      </div>

      {/* Add button */}
      <div className="flex items-center pr-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-porcelain text-sm font-black text-ink-muted ring-1 ring-champagne/40 transition group-hover:bg-walnut group-hover:text-porcelain group-hover:ring-walnut">
          +
        </span>
      </div>
    </button>
  );
}

// ─── Single module card ────────────────────────────────────────────────────────

function ModuleCard({ module: m, onAdd }: { module: typeof modules[number]; onAdd: () => void }) {
  return (
    <button
      onClick={onAdd}
      className="group flex flex-col overflow-hidden rounded-2xl border border-champagne/30 bg-warmWhite text-left shadow-soft transition hover:border-brass/50 hover:shadow-card active:scale-[0.98]"
    >
      {/* Illustration area */}
      <div className="flex w-full items-end justify-center bg-[linear-gradient(160deg,#f4ede0,#ece3d4)] px-4 pt-4 pb-2">
        <CabinetSVG type={m.type} />
      </div>
      {/* Label */}
      <div className="flex flex-col gap-0.5 p-3">
        <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-muted">{m.sub}</div>
        <div className="text-sm font-black tracking-tight text-ink leading-snug">{m.label}</div>
        <div className="mt-1 text-[10px] leading-snug text-ink-muted">{m.note}</div>
      </div>
      {/* Add row */}
      <div className="flex items-center justify-between border-t border-champagne/25 px-3 py-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-brass">Add module</span>
        <span className="text-xs font-black text-ink-muted transition group-hover:text-walnut">+</span>
      </div>
    </button>
  );
}

// ─── SVG illustrations ────────────────────────────────────────────────────────

function CabinetSVG({ type }: { type: UnitType }) {
  const stroke = '#b89c6c';
  const fill = '#ede5d5';
  const shadow = '#c4a87a';
  const brass = '#c9a840';
  const wood = '#b88040';

  if (type === 'shelf') {
    return (
      <svg viewBox="0 0 80 28" className="w-full" style={{ maxHeight: 40 }}>
        <rect x="2" y="10" width="76" height="14" rx="1.5" fill={fill} stroke={stroke} strokeWidth="1.5" />
        <rect x="2" y="10" width="76" height="4" rx="1.5" fill={wood} opacity="0.55" />
        <rect x="10" y="3" width="2.5" height="10" rx="1" fill={shadow} opacity="0.5" />
        <rect x="67.5" y="3" width="2.5" height="10" rx="1" fill={shadow} opacity="0.5" />
        <line x1="10" y1="24" x2="70" y2="24" stroke={stroke} strokeWidth="0.6" opacity="0.4" />
      </svg>
    );
  }

  if (type === 'montessori') {
    return (
      <svg viewBox="0 0 64 72" className="w-full" style={{ maxHeight: 70 }}>
        <rect x="6" y="4" width="52" height="64" rx="2" fill={fill} stroke={stroke} strokeWidth="1.5" />
        {[22, 40, 58].map((y) => (
          <g key={y}>
            <rect x="9" y={y} width="46" height="3" fill={shadow} opacity="0.6" />
            <rect x="12" y={y - 8} width="7" height="7" rx="1" fill="#7a9a6e" />
            <rect x="21" y={y - 8} width="7" height="7" rx="1" fill="#b9794f" />
            <rect x="30" y={y - 8} width="7" height="7" rx="1" fill="#6e86a8" />
          </g>
        ))}
      </svg>
    );
  }

  if (type === 'bunk') {
    return (
      <svg viewBox="0 0 90 72" className="w-full" style={{ maxHeight: 68 }}>
        <rect x="4" y="10" width="7" height="56" rx="1.5" fill={fill} stroke={stroke} strokeWidth="1.5" />
        <rect x="79" y="10" width="7" height="56" rx="1.5" fill={fill} stroke={stroke} strokeWidth="1.5" />
        <rect x="11" y="24" width="68" height="5" fill={wood} opacity="0.6" />
        <rect x="11" y="54" width="68" height="5" fill={wood} opacity="0.6" />
        <line x1="11" y1="20" x2="58" y2="20" stroke={stroke} strokeWidth="2" />
        <line x1="70" y1="24" x2="70" y2="66" stroke={stroke} strokeWidth="1.5" />
        <line x1="76" y1="24" x2="76" y2="66" stroke={stroke} strokeWidth="1.5" />
        {[34, 46, 58].map((y) => <line key={y} x1="70" y1={y} x2="76" y2={y} stroke={stroke} strokeWidth="1.5" />)}
      </svg>
    );
  }

  if (type === 'upper') {
    return (
      <svg viewBox="0 0 80 58" className="w-full" style={{ maxHeight: 60 }}>
        <rect x="3" y="2" width="74" height="54" rx="2" fill={fill} stroke={stroke} strokeWidth="1.5" />
        <rect x="3" y="2" width="74" height="4" rx="2" fill={shadow} opacity="0.3" />
        {/* Center divide */}
        <line x1="40" y1="5" x2="40" y2="53" stroke={stroke} strokeWidth="0.9" />
        {/* Rails */}
        <line x1="6" y1="11" x2="74" y2="11" stroke={stroke} strokeWidth="0.7" opacity="0.55" />
        <line x1="6" y1="51" x2="74" y2="51" stroke={stroke} strokeWidth="0.7" opacity="0.55" />
        {/* Stiles */}
        <line x1="12" y1="11" x2="12" y2="51" stroke={stroke} strokeWidth="0.6" opacity="0.4" />
        <line x1="68" y1="11" x2="68" y2="51" stroke={stroke} strokeWidth="0.6" opacity="0.4" />
        {/* Pulls */}
        <rect x="35.5" y="27" width="2.5" height="7" rx="1.2" fill={brass} />
        <rect x="44" y="27" width="2.5" height="7" rx="1.2" fill={brass} />
      </svg>
    );
  }

  if (type === 'tall') {
    return (
      <svg viewBox="0 0 46 100" className="w-full" style={{ maxHeight: 80 }}>
        <rect x="2" y="2" width="42" height="90" rx="2" fill={fill} stroke={stroke} strokeWidth="1.5" />
        <rect x="2" y="2" width="42" height="4" rx="2" fill={shadow} opacity="0.3" />
        {/* Toekick */}
        <rect x="5" y="84" width="36" height="8" rx="1" fill={shadow} opacity="0.4" />
        {/* Rail lines */}
        <line x1="5" y1="13" x2="41" y2="13" stroke={stroke} strokeWidth="0.8" opacity="0.55" />
        <line x1="5" y1="48" x2="41" y2="48" stroke={stroke} strokeWidth="0.8" opacity="0.55" />
        <line x1="5" y1="82" x2="41" y2="82" stroke={stroke} strokeWidth="0.8" opacity="0.4" />
        {/* Stile lines */}
        <line x1="10" y1="13" x2="10" y2="82" stroke={stroke} strokeWidth="0.6" opacity="0.35" />
        <line x1="36" y1="13" x2="36" y2="82" stroke={stroke} strokeWidth="0.6" opacity="0.35" />
        {/* Pull */}
        <rect x="25" y="40" width="2.5" height="10" rx="1.2" fill={brass} />
      </svg>
    );
  }

  // base
  return (
    <svg viewBox="0 0 80 72" className="w-full" style={{ maxHeight: 68 }}>
      <rect x="3" y="2" width="74" height="62" rx="2" fill={fill} stroke={stroke} strokeWidth="1.5" />
      <rect x="3" y="2" width="74" height="4" rx="2" fill={shadow} opacity="0.3" />
      {/* Toekick */}
      <rect x="7" y="56" width="66" height="8" rx="1" fill={shadow} opacity="0.4" />
      {/* Wood bench top */}
      <rect x="1" y="60" width="78" height="6" rx="1.5" fill={wood} stroke={stroke} strokeWidth="1" opacity="0.85" />
      {/* Center divide */}
      <line x1="40" y1="5" x2="40" y2="55" stroke={stroke} strokeWidth="0.9" />
      {/* Rails */}
      <line x1="6" y1="12" x2="74" y2="12" stroke={stroke} strokeWidth="0.75" opacity="0.55" />
      <line x1="6" y1="53" x2="74" y2="53" stroke={stroke} strokeWidth="0.75" opacity="0.55" />
      {/* Stiles */}
      <line x1="12" y1="12" x2="12" y2="53" stroke={stroke} strokeWidth="0.6" opacity="0.38" />
      <line x1="68" y1="12" x2="68" y2="53" stroke={stroke} strokeWidth="0.6" opacity="0.38" />
      {/* Pulls */}
      <rect x="35" y="29" width="2.5" height="8" rx="1.2" fill={brass} />
      <rect x="44" y="29" width="2.5" height="8" rx="1.2" fill={brass} />
    </svg>
  );
}

function StarterIllustration({ label, color }: { label: string; color: string }) {
  const stroke = color;
  const fill = color + '22';
  const light = color + '44';

  if (label === 'Mudroom Nook') {
    return (
      <svg viewBox="0 0 56 72" className="w-full h-auto">
        {/* Locker tower */}
        <rect x="1" y="4" width="18" height="68" rx="1.5" fill={fill} stroke={stroke} strokeWidth="1.4" />
        <line x1="3" y1="18" x2="17" y2="18" stroke={stroke} strokeWidth="0.7" opacity="0.6" />
        <rect x="11" y="38" width="2" height="7" rx="1" fill={stroke} opacity="0.8" />
        {/* Bench base */}
        <rect x="20" y="26" width="35" height="38" rx="1.5" fill={fill} stroke={stroke} strokeWidth="1.4" />
        <rect x="20" y="60" width="35" height="8" rx="1" fill={light} />
        {/* Bench top (wood) */}
        <rect x="18" y="62" width="38" height="5" rx="1" fill={stroke} opacity="0.5" />
        {/* Shelf above */}
        <rect x="20" y="2" width="35" height="12" rx="1.5" fill={fill} stroke={stroke} strokeWidth="1.4" />
        {/* Hooks (dots) */}
        <circle cx="29" cy="20" r="1.5" fill={stroke} opacity="0.9" />
        <circle cx="40" cy="20" r="1.5" fill={stroke} opacity="0.9" />
        <circle cx="51" cy="20" r="1.5" fill={stroke} opacity="0.9" />
      </svg>
    );
  }

  if (label === 'Coffee Nook') {
    return (
      <svg viewBox="0 0 56 72" className="w-full h-auto">
        {/* Upper shelves */}
        <rect x="3" y="2" width="50" height="28" rx="1.5" fill={fill} stroke={stroke} strokeWidth="1.4" />
        <line x1="3" y1="16" x2="53" y2="16" stroke={stroke} strokeWidth="0.8" opacity="0.6" />
        {/* Counter/base */}
        <rect x="3" y="44" width="50" height="28" rx="1.5" fill={fill} stroke={stroke} strokeWidth="1.4" />
        <rect x="3" y="66" width="50" height="6" rx="1" fill={light} />
        {/* Counter top (wood) */}
        <rect x="1" y="38" width="54" height="6" rx="1.5" fill={stroke} opacity="0.55" />
        {/* Door lines */}
        <line x1="28" y1="47" x2="28" y2="69" stroke={stroke} strokeWidth="0.8" />
        <rect x="23" y="55" width="2" height="6" rx="1" fill={stroke} opacity="0.8" />
        <rect x="31" y="55" width="2" height="6" rx="1" fill={stroke} opacity="0.8" />
      </svg>
    );
  }

  if (label === 'Playroom Nook') {
    return (
      <svg viewBox="0 0 72 50" className="w-full h-auto">
        {/* Wide low base */}
        <rect x="2" y="14" width="68" height="34" rx="1.5" fill={fill} stroke={stroke} strokeWidth="1.4" />
        {/* Cubby dividers */}
        <line x1="25" y1="16" x2="25" y2="46" stroke={stroke} strokeWidth="0.9" />
        <line x1="48" y1="16" x2="48" y2="46" stroke={stroke} strokeWidth="0.9" />
        {/* Small doors at bottom */}
        <line x1="2" y1="36" x2="70" y2="36" stroke={stroke} strokeWidth="0.8" />
        <rect x="9" y="38" width="2" height="6" rx="1" fill={stroke} opacity="0.7" />
        <rect x="32" y="38" width="2" height="6" rx="1" fill={stroke} opacity="0.7" />
        <rect x="55" y="38" width="2" height="6" rx="1" fill={stroke} opacity="0.7" />
        {/* Shelf above */}
        <rect x="2" y="2" width="68" height="9" rx="1.5" fill={fill} stroke={stroke} strokeWidth="1.4" />
      </svg>
    );
  }

  // Laundry Nook
  return (
    <svg viewBox="0 0 56 72" className="w-full h-auto">
      {/* Upper cabinet */}
      <rect x="3" y="2" width="50" height="26" rx="1.5" fill={fill} stroke={stroke} strokeWidth="1.4" />
      <line x1="28" y1="4" x2="28" y2="26" stroke={stroke} strokeWidth="0.8" />
      <rect x="22" y="13" width="2" height="6" rx="1" fill={stroke} opacity="0.8" />
      <rect x="30" y="13" width="2" height="6" rx="1" fill={stroke} opacity="0.8" />
      {/* Counter top */}
      <rect x="1" y="28" width="54" height="5" rx="1.5" fill={stroke} opacity="0.45" />
      {/* Washer/dryer slots */}
      <rect x="3" y="33" width="22" height="34" rx="1.5" fill={fill} stroke={stroke} strokeWidth="1.4" />
      <circle cx="14" cy="50" r="7" fill="none" stroke={stroke} strokeWidth="1.2" opacity="0.7" />
      <rect x="27" y="33" width="22" height="34" rx="1.5" fill={fill} stroke={stroke} strokeWidth="1.4" />
      <circle cx="38" cy="50" r="7" fill="none" stroke={stroke} strokeWidth="1.2" opacity="0.7" />
      {/* Tower at right */}
      <rect x="51" y="2" width="4" height="65" rx="1" fill={light} stroke={stroke} strokeWidth="1" />
    </svg>
  );
}

// ─── Unit editor (unchanged logic, refreshed shell) ───────────────────────────

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
  const isMontessori = sel.type === 'montessori';
  const isBunk = sel.type === 'bunk';
  const isCabinet = sel.type === 'base' || sel.type === 'upper' || sel.type === 'tall';
  const depthMax = isBunk ? 48 : 30;

  return (
    <div className="overflow-hidden rounded-3xl border border-champagne/35 bg-warmWhite shadow-card">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-champagne/25 bg-porcelain/60 px-5 py-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brass">Selected module</p>
          <h3 className="mt-0.5 text-xl font-black tracking-tight text-ink">{sel.label}</h3>
          <p className="mt-0.5 text-xs capitalize text-ink-muted">
            {sel.type} · {Math.round(sel.overall.width)}″w × {Math.round(sel.overall.height)}″h × {Math.round(sel.overall.depth)}″d
          </p>
        </div>
        <div className="flex gap-3 pt-0.5 text-xs font-bold">
          <button onClick={onDuplicate} className="text-ink-muted transition hover:text-walnut">Duplicate</button>
          <button onClick={onRemove} className="text-red-400 transition hover:text-red-600">Remove</button>
        </div>
      </div>

      {widerThanWall && (
        <div className="mx-5 mt-4 rounded-2xl bg-[#fff6e0] px-4 py-3 text-xs leading-5 text-walnut ring-1 ring-brass/25">
          This module is wider than the selected wall. Reduce width or choose a longer wall.
        </div>
      )}

      <div className="space-y-6 p-5">
        <Section title="Basic size">
          <DimensionSlider label={isBunk ? 'Length' : 'Width'} value={sel.overall.width} min={6} max={96} onChange={(v) => setSelOverall({ width: v })} />
          <DimensionSlider label={isShelf ? 'Thickness' : 'Height'} value={sel.overall.height} min={isShelf ? 1 : 12} max={isShelf ? 4 : 120} onChange={(v) => setSelOverall({ height: v })} />
          <DimensionSlider label={isBunk ? 'Bed width' : 'Depth'} value={sel.overall.depth} min={4} max={depthMax} onChange={(v) => setSelOverall({ depth: v })} />
        </Section>

        {isMontessori && (
          <Section title="Display">
            <Stepper label="Book ledges" value={sel.shelvesPerSection} min={2} max={6} onChange={(v) => updateSel({ shelvesPerSection: v })} />
          </Section>
        )}

        <Section title="Finish">
          <MaterialSwatches role={isShelf ? 'shelf' : 'carcass'} label={isShelf ? 'Shelf finish' : 'Body finish'} value={sel.materials.carcass} onChange={(v) => setSelMaterials({ carcass: v })} />
          {!isShelf && <MaterialSwatches role="door" label="Door / front finish" value={sel.materials.doors} onChange={(v) => setSelMaterials({ doors: v })} />}
        </Section>

        <Section title="Special requests">
          <p className="-mt-1 mb-2 text-[11px] leading-5 text-ink-muted">Vent or A/C return cutouts, wire/outlet holes, pull-out trays, specific hooks — anything custom. Our team reviews these and confirms feasibility + cost in your quote.</p>
          <textarea
            value={sel.notes ?? ''}
            onChange={(e) => updateSel({ notes: e.target.value })}
            rows={3}
            placeholder="e.g. 6×10 return-air vent cutout in the back of this cabinet, lower left"
            className="w-full resize-none rounded-2xl border border-champagne/45 bg-warmWhite px-3.5 py-2.5 text-sm outline-none transition focus:border-brass"
          />
        </Section>

        {room.enabled && walls.length > 0 && (
          <Section title="Placement">
            <WallPicker count={walls.length} value={wallIndex} onChange={(i) => setSelPlacement({ wallIndex: i, offset: 0 })} />
            <DimensionSlider label="Slide along wall" value={Math.max(-cabSlide, Math.min(cabSlide, sel.placement.offset))} min={-cabSlide} max={cabSlide} onChange={(v) => setSelPlacement({ offset: v })} />
          </Section>
        )}

        {(isCabinet || isShelf || isUpper) && <Toggle label="Show advanced construction details" checked={advanced} onChange={setAdvanced} />}

        {advanced && isCabinet && (
          <>
            <Section title="Interior layout">
              <Stepper label="Compartments" value={sel.sections} min={1} max={8} onChange={(v) => updateSel({ sections: v })} />
              <Stepper label="Shelves in each" value={sel.shelvesPerSection} min={0} max={12} onChange={(v) => updateSel({ shelvesPerSection: v })} />
            </Section>
            <Section title="Doors">
              <OptionCards<DoorConfig> value={sel.door} options={doorOptions} onChange={(v) => updateSel({ door: v })} columns={3} />
            </Section>
            {sel.type !== 'upper' && (
              <Section title="Base detail">
                <Toggle label="Recessed base" checked={sel.toeKick.enabled} onChange={(v) => setSelToeKick({ enabled: v })} />
                {sel.toeKick.enabled && <DimensionSlider label="Base height" value={sel.toeKick.height} min={2} max={10} onChange={(v) => setSelToeKick({ height: v })} />}
              </Section>
            )}
          </>
        )}

        {advanced && (isShelf || isUpper) && (
          <Section title="Mounting">
            <DimensionSlider label="Mount height" value={sel.mountHeight} min={0} max={Math.max(12, room.height - sel.overall.height)} onChange={(v) => updateSel({ mountHeight: v })} />
          </Section>
        )}
      </div>
    </div>
  );
}

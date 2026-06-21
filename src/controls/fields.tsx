import type { ReactNode } from 'react';

export function Section({ title, subtitle, children }: { title?: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="rounded-[24px] border border-champagne/25 bg-warmWhite/80 p-4 shadow-soft">
      {title && (
        <div className="mb-4">
          <h3 className="text-[11px] font-black uppercase tracking-[0.16em] text-brass">{title}</h3>
          {subtitle && <p className="mt-1 text-xs leading-5 text-ink-muted">{subtitle}</p>}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function DimensionSlider({ label, value, min, max, step = 0.25, unit = 'in', onChange }: { label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (n: number) => void }) {
  const safeMax = Math.max(min, max);
  const clamp = (n: number) => Math.min(safeMax, Math.max(min, Number.isFinite(n) ? n : min));
  const shown = clamp(value);
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold text-ink-soft">{label}</span>
        <span className="flex items-baseline gap-1">
          <input type="number" inputMode="decimal" value={Number.isFinite(value) ? value : ''} min={min} max={safeMax} step={step} onChange={(e) => { const n = parseFloat(e.target.value); if (!Number.isNaN(n)) onChange(clamp(n)); }} className="w-16 rounded-xl border border-champagne/35 bg-warmWhite px-2 py-1.5 text-right text-sm font-bold text-ink outline-none focus:border-brass focus:ring-2 focus:ring-champagne/30" />
          <span className="text-xs text-ink-muted">{unit}</span>
        </span>
      </div>
      <input type="range" min={min} max={safeMax} step={step} value={shown} onChange={(e) => onChange(clamp(parseFloat(e.target.value)))} className="w-full" />
    </div>
  );
}

export function Stepper({ label, value, min = 0, max = 99, onChange }: { label: string; value: number; min?: number; max?: number; onChange: (n: number) => void }) {
  const set = (n: number) => onChange(Math.min(max, Math.max(min, n)));
  const btn = 'flex h-11 w-11 items-center justify-center rounded-2xl border border-champagne/35 bg-warmWhite text-xl font-semibold text-ink-soft transition hover:border-brass hover:text-walnut active:scale-95 disabled:opacity-40';
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-semibold text-ink-soft">{label}</span>
      <div className="flex items-center gap-2.5"><button type="button" className={btn} onClick={() => set(value - 1)} disabled={value <= min}>−</button><span className="w-7 text-center text-base font-bold tabular-nums text-ink">{value}</span><button type="button" className={btn} onClick={() => set(value + 1)} disabled={value >= max}>+</button></div>
    </div>
  );
}

export interface CardOption<T extends string> { value: T; label: string; icon?: ReactNode; }

export function OptionCards<T extends string>({ value, options, onChange, columns = 3 }: { value: T; options: CardOption<T>[]; onChange: (v: T) => void; columns?: number }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {options.map((o) => {
        const active = o.value === value;
        return <button key={o.value} type="button" onClick={() => onChange(o.value)} className={'flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3.5 transition active:scale-[0.98] ' + (active ? 'border-brass bg-parchment shadow-soft' : 'border-champagne/30 bg-warmWhite hover:border-brass/60')}>
          {o.icon && <span className={active ? 'text-walnut' : 'text-ink-muted'}>{o.icon}</span>}
          <span className={'text-xs font-bold ' + (active ? 'text-walnut' : 'text-ink-soft')}>{o.label}</span>
        </button>;
      })}
    </div>
  );
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex w-full items-center justify-between gap-3 rounded-2xl border border-champagne/25 bg-warmWhite px-3 py-3 transition hover:border-brass/45">
      <span className="text-sm font-semibold text-ink-soft">{label}</span>
      <span className={'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition ' + (checked ? 'bg-walnut' : 'bg-parchment')}><span className={'inline-block h-6 w-6 transform rounded-full bg-white shadow transition ' + (checked ? 'translate-x-5' : 'translate-x-0.5')} /></span>
    </button>
  );
}

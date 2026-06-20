// Friendly, consumer-grade form controls. Warm palette, generous touch targets.
import type { ReactNode } from 'react';

export function Section({ title, subtitle, children }: { title?: string; subtitle?: string; children: ReactNode }) {
  return (
    <section>
      {title && (
        <div className="mb-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">{title}</h3>
          {subtitle && <p className="mt-1 text-xs text-ink-muted">{subtitle}</p>}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function DimensionSlider({
  label,
  value,
  min,
  max,
  step = 0.25,
  unit = 'in',
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (n: number) => void;
}) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-sm font-medium text-ink-soft">{label}</span>
        <span className="flex items-baseline gap-1">
          <input
            type="number"
            inputMode="decimal"
            value={Number.isFinite(value) ? value : ''}
            min={min}
            max={max}
            step={step}
            onChange={(e) => {
              const n = parseFloat(e.target.value);
              if (!Number.isNaN(n)) onChange(clamp(n));
            }}
            className="w-16 rounded-lg border border-ivory-200 bg-ivory-50 px-2 py-1.5 text-right text-sm font-semibold text-ink outline-none focus:border-clay-400 focus:ring-2 focus:ring-clay-100"
          />
          <span className="text-xs text-ink-muted">{unit}</span>
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={Number.isFinite(value) ? value : min} onChange={(e) => onChange(clamp(parseFloat(e.target.value)))} className="w-full" />
    </div>
  );
}

export function Stepper({ label, value, min = 0, max = 99, onChange }: { label: string; value: number; min?: number; max?: number; onChange: (n: number) => void }) {
  const set = (n: number) => onChange(Math.min(max, Math.max(min, n)));
  const btn =
    'flex h-11 w-11 items-center justify-center rounded-xl border border-ivory-200 bg-white text-xl font-medium text-ink-soft transition hover:border-clay-300 hover:text-clay-600 active:scale-95 disabled:opacity-40';
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-ink-soft">{label}</span>
      <div className="flex items-center gap-2.5">
        <button type="button" className={btn} onClick={() => set(value - 1)} disabled={value <= min}>−</button>
        <span className="w-7 text-center text-base font-semibold tabular-nums text-ink">{value}</span>
        <button type="button" className={btn} onClick={() => set(value + 1)} disabled={value >= max}>+</button>
      </div>
    </div>
  );
}

export interface CardOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

export function OptionCards<T extends string>({ value, options, onChange, columns = 3 }: { value: T; options: CardOption<T>[]; onChange: (v: T) => void; columns?: number }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={
              'flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3.5 transition active:scale-[0.98] ' +
              (active ? 'border-clay-500 bg-clay-50 shadow-soft' : 'border-ivory-200 bg-white hover:border-clay-200')
            }
          >
            {o.icon && <span className={active ? 'text-clay-600' : 'text-ink-muted'}>{o.icon}</span>}
            <span className={'text-xs font-semibold ' + (active ? 'text-clay-700' : 'text-ink-soft')}>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex w-full items-center justify-between">
      <span className="text-sm font-medium text-ink-soft">{label}</span>
      <span className={'relative inline-flex h-7 w-12 items-center rounded-full transition ' + (checked ? 'bg-clay-600' : 'bg-ivory-200')}>
        <span className={'inline-block h-6 w-6 transform rounded-full bg-white shadow transition ' + (checked ? 'translate-x-5' : 'translate-x-0.5')} />
      </span>
    </button>
  );
}

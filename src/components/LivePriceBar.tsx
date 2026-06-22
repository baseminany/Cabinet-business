import { useMemo } from 'react';
import { useStore } from '../store';
import { buildProject } from '../model/buildParts';
import { priceModel } from '../pricing/engine';

function money(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

/** Round to the nearest $25 so the live number reads like a friendly estimate. */
function round25(n: number): number {
  return Math.max(0, Math.round(n / 25) * 25);
}

/**
 * Always-visible live estimate. Updates the moment a module, size, or finish
 * changes — so the price builds up transparently instead of landing as a
 * surprise at the quote step.
 */
export default function LivePriceBar() {
  const units = useStore((s) => s.units);
  const setStep = useStore((s) => s.setStep);
  const step = useStore((s) => s.step);

  const { low, high, count } = useMemo(() => {
    if (units.length === 0) return { low: 0, high: 0, count: 0 };
    const base = priceModel(buildProject(units)).customerPrice;
    return { low: round25(base), high: round25(base * 1.22), count: units.length };
  }, [units]);

  if (count === 0) return null;

  return (
    <div className="flex items-center justify-between gap-3 border-t border-champagne/30 bg-[linear-gradient(180deg,#fffdf8,#f7f1e6)] px-4 py-2.5 sm:px-6">
      <div className="flex items-baseline gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brass">Live estimate</span>
        <span className="text-lg font-black tracking-tight text-ink">{money(low)}</span>
        <span className="text-sm font-bold text-ink-muted">– {money(high)}</span>
        <span className="hidden text-[11px] text-ink-muted sm:inline">· {count} module{count > 1 ? 's' : ''} · final quote after measure</span>
      </div>
      {step !== 'quote' && (
        <button onClick={() => setStep('quote')} className="shrink-0 rounded-full bg-walnut px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-porcelain transition hover:bg-obsidian">
          Get quote →
        </button>
      )}
    </div>
  );
}

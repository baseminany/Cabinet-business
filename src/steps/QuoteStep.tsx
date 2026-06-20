import { useMemo, useState } from 'react';
import { useStore } from '../store';
import { buildProject } from '../model/buildParts';
import { priceModel } from '../pricing/engine';

function money(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

const Check = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" className="mt-0.5 shrink-0 text-brass" fill="none">
    <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function QuoteStep() {
  const units = useStore((s) => s.units);
  const result = useMemo(() => priceModel(buildProject(units)), [units]);
  const [requested, setRequested] = useState(false);

  if (units.length === 0) {
    return <p className="rounded-2xl border border-champagne/30 bg-warmWhite p-5 text-sm text-ink-muted">Add at least one piece to see your starting estimate.</p>;
  }

  const counts = units.reduce<Record<string, number>>((m, u) => ((m[u.type] = (m[u.type] || 0) + 1), m), {});
  const summary = Object.entries(counts).map(([t, n]) => `${n} ${t}${n > 1 ? 's' : ''}`).join(' · ');

  const includes = [
    'Furniture-grade materials cut to your dimensions',
    'Soft-close concealed hardware where specified',
    'Finish selections carried into the review packet',
    'Shop review before final quote, crate, and ship',
  ];

  return (
    <div className="space-y-5">
      <div className="premium-card overflow-hidden p-0">
        <div className="bg-obsidian p-6 text-porcelain">
          <p className="eyebrow text-champagne">Initial estimate</p>
          <div className="mt-3 text-6xl font-black tracking-[-0.06em] text-warmWhite">{money(result.customerPrice)}</div>
          <p className="mt-3 text-sm leading-6 text-porcelain/60">Starting price from the current design. Final quote follows measurement, construction, and shipping review.</p>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-ivory-100 px-3 py-1 text-[11px] font-bold text-ink-soft">{units.length} piece{units.length > 1 ? 's' : ''}</span>
            {summary && <span className="rounded-full bg-ivory-100 px-3 py-1 text-[11px] font-bold capitalize text-ink-soft">{summary}</span>}
          </div>

          {requested ? (
            <div className="mt-5 rounded-2xl bg-[#edf5ee] px-4 py-4 text-center text-sm font-bold text-deepGreen ring-1 ring-deepGreen/20">
              Review request captured locally. Connect the submit endpoint next so this sends to the shop automatically.
            </div>
          ) : (
            <div className="mt-5 space-y-2.5">
              <button onClick={() => setRequested(true)} className="premium-button w-full px-5 py-4 text-base">Send my design for review</button>
              <button onClick={() => setRequested(true)} className="w-full rounded-full border border-champagne/45 bg-warmWhite px-5 py-3 text-sm font-bold text-ink-soft transition hover:border-walnut hover:text-walnut">Request a measurement call</button>
            </div>
          )}
        </div>
      </div>

      <div className="premium-card p-6">
        <h3 className="text-xl font-black tracking-tight text-ink">What this includes</h3>
        <ul className="mt-4 space-y-3">
          {includes.map((line) => (
            <li key={line} className="flex gap-2 text-sm leading-6 text-ink-soft"><Check /><span>{line}</span></li>
          ))}
        </ul>
        <p className="mt-5 border-t border-champagne/25 pt-4 text-xs leading-5 text-ink-muted">
          This is intentionally labeled as an estimate until backend submission, shipping, and measurement verification are connected.
        </p>
      </div>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { useStore } from '../store';
import { buildProject } from '../model/buildParts';
import { priceModel } from '../pricing/engine';

function money(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

const Check = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" className="mt-0.5 shrink-0 text-clay-600" fill="none">
    <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function QuoteStep() {
  const units = useStore((s) => s.units);
  const result = useMemo(() => priceModel(buildProject(units)), [units]);
  const [requested, setRequested] = useState(false);

  if (units.length === 0) {
    return <p className="rounded-xl bg-ivory-50 p-4 text-sm text-ink-muted">Add at least one piece to see your quote.</p>;
  }

  const counts = units.reduce<Record<string, number>>((m, u) => ((m[u.type] = (m[u.type] || 0) + 1), m), {});
  const summary = Object.entries(counts).map(([t, n]) => `${n} ${t}${n > 1 ? 's' : ''}`).join(' · ');

  const includes = [
    'Furniture-grade plywood, built to your exact measurements',
    'Soft-close concealed hinges where there are doors',
    'Your choice of finish on every piece',
    'Crated and shipped to your door — nationwide',
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-ivory-200">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-clay-600">Your design is ready</p>
        <div className="mt-2 font-display text-5xl font-semibold text-ink">{money(result.customerPrice)}</div>
        <p className="mt-1.5 text-sm text-ink-muted">All-in estimate — materials, hardware, finishing & build. Shipping quoted after a measure.</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-ivory-100 px-3 py-1 text-[11px] font-medium text-ink-soft">{units.length} piece{units.length > 1 ? 's' : ''}</span>
          {summary && <span className="rounded-full bg-ivory-100 px-3 py-1 text-[11px] font-medium text-ink-soft capitalize">{summary}</span>}
        </div>

        {requested ? (
          <div className="mt-5 rounded-2xl bg-clay-50 px-4 py-4 text-center text-sm font-semibold text-clay-700 ring-1 ring-clay-200">
            Thank you — your design is saved. We'll reach out to confirm measurements and shipping.
          </div>
        ) : (
          <div className="mt-5 space-y-2.5">
            <button onClick={() => setRequested(true)} className="w-full rounded-2xl bg-clay-600 px-5 py-4 text-base font-semibold text-white shadow-lift transition hover:bg-clay-700 active:scale-[0.99]">Reserve this design</button>
            <button onClick={() => setRequested(true)} className="w-full rounded-2xl border border-ivory-200 bg-white px-5 py-3 text-sm font-semibold text-ink-soft transition hover:border-clay-300">Request a call about it</button>
          </div>
        )}
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-ivory-200">
        <h3 className="font-display text-lg font-semibold text-ink">What's included</h3>
        <ul className="mt-3 space-y-2.5">
          {includes.map((line) => (
            <li key={line} className="flex gap-2 text-sm text-ink-soft"><Check /><span>{line}</span></li>
          ))}
        </ul>
        <p className="mt-4 border-t border-ivory-100 pt-3 text-xs text-ink-muted">Final quote confirmed after we verify your measurements.</p>
      </div>
    </div>
  );
}

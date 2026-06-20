// =============================================================================
// PRICE BREAKDOWN (Maker view) — every line, for the business owner
// =============================================================================
import { useMemo } from 'react';
import { useStore } from '../store';
import { buildProject } from '../model/buildParts';
import { priceModel, usd } from './engine';
import { pricing } from './pricing.config';

export default function PriceBreakdown() {
  const units = useStore((s) => s.units);
  const result = useMemo(() => priceModel(buildProject(units)), [units]);

  return (
    <div className="nice-scroll flex h-full flex-col overflow-auto">
      {result.usesPlaceholders && (
        <div className="m-3 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
          ⚠️ Uses placeholder numbers. Edit{' '}
          <code className="rounded bg-amber-100 px-1">src/pricing/pricing.config.ts</code> to set
          your real prices. Flagged lines are marked ⚠️.
        </div>
      )}

      <div className="px-3 pb-3">
        <table className="w-full text-sm">
          <tbody>
            {result.lines.map((l) => (
              <tr key={l.key} className="align-top border-b border-stone-100">
                <td className="py-2 pr-2">
                  <div className="font-medium text-stone-800">
                    {l.label}
                    {l.placeholder && (
                      <span className="ml-1 text-amber-500" title="uses a placeholder number">
                        ⚠️
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-stone-500">{l.detail}</div>
                </td>
                <td className="whitespace-nowrap py-2 text-right tabular-nums text-stone-800">
                  {usd(l.amount)}
                </td>
              </tr>
            ))}

            <Row label="Subtotal (cost)" amount={usd(result.subtotal)} strong />
            <Row label="Overhead" amount={usd(result.overheadAmount)} muted />
            <Row label="Total cost" amount={usd(result.totalCost)} strong />
            <Row label={`Margin (${pricing.margin.markupPercent}% markup)`} amount={usd(result.marginAmount)} muted />
          </tbody>
        </table>

        <div className="mt-3 flex items-center justify-between rounded-xl bg-stone-900 px-4 py-3">
          <span className="text-sm font-semibold text-white">Customer price</span>
          <span className="font-display text-xl font-semibold tabular-nums text-emerald-300">
            {usd(result.customerPrice)}
          </span>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  amount,
  muted,
  strong,
}: {
  label: string;
  amount: string;
  muted?: boolean;
  strong?: boolean;
}) {
  return (
    <tr className="border-b border-stone-100">
      <td className={'py-1.5 ' + (strong ? 'font-semibold text-stone-900' : muted ? 'text-stone-500' : 'text-stone-700')}>
        {label}
      </td>
      <td
        className={
          'py-1.5 text-right tabular-nums ' +
          (strong ? 'font-semibold text-stone-900' : muted ? 'text-stone-500' : 'text-stone-700')
        }
      >
        {amount}
      </td>
    </tr>
  );
}

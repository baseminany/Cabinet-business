import { useMemo } from 'react';
import { useStore } from '../store';
import { buildProject } from '../model/buildParts';
import { createDigitalBom } from '../model/bom';
import { downloadText } from './exporters';

export default function BomPanel() {
  const units = useStore((s) => s.units);
  const bom = useMemo(() => createDigitalBom(buildProject(units)), [units]);
  return <div className="nice-scroll h-full overflow-auto p-3 text-xs text-stone-700">
    <div className="grid grid-cols-2 gap-2">
      <Stat label="Panels" value={String(bom.panelCount)} /><Stat label="Connector pairs" value={String(bom.connectorPairs)} />
      <Stat label="Modeled packed weight" value={`${bom.fulfillment.packed.weightLb} lb`} /><Stat label="Longest carton side" value={`${bom.fulfillment.packed.length} in`} />
    </div>
    <div className={`mt-3 rounded-lg border p-3 ${bom.fulfillment.lane === 'parcel-pilot' ? 'border-emerald-200 bg-emerald-50' : 'border-amber-300 bg-amber-50'}`}><b>{bom.fulfillment.lane === 'parcel-pilot' ? 'Parcel pilot candidate' : 'Checkout hold'}</b><p className="mt-1 leading-5">{bom.fulfillment.reasons.join(' ') || `Modeled ground shipping: $${bom.fulfillment.shippingEstimate}. Physical pack test still required.`}</p></div>
    <button onClick={() => downloadText('digital-bom.json', JSON.stringify(bom, null, 2), 'application/json')} className="mt-3 rounded border border-stone-300 bg-white px-3 py-2 font-semibold">Export digital BOM</button>
    <table className="mt-3 w-full"><thead><tr className="border-b text-left text-stone-500"><th className="py-2">SKU / item</th><th>Qty</th><th className="text-right">Weight</th></tr></thead><tbody>{bom.lines.map((l, i)=><tr key={`${l.sku}-${i}`} className="border-b border-stone-100 align-top"><td className="py-2 pr-2"><b>{l.description}</b><div className="text-[10px] text-stone-500">{l.sku}{l.dimensions?` · ${l.dimensions}`:''}{l.material?` · ${l.material}`:''}</div></td><td>{l.quantity}</td><td className="text-right">{l.estimatedWeightLb.toFixed(2)} lb</td></tr>)}</tbody></table>
  </div>;
}
function Stat({label,value}:{label:string;value:string}) { return <div className="rounded-lg bg-stone-100 p-3"><div className="text-[10px] uppercase tracking-wider text-stone-500">{label}</div><b className="mt-1 block text-sm text-stone-900">{value}</b></div>; }

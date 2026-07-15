// Maker view: the shop-facing panel — full price breakdown and the cut list with
// exports. Light theme to match the rest of the app.
import { useState } from 'react';
import CutList from './cutlist/CutList';
import PriceBreakdown from './pricing/PriceBreakdown';
import BomPanel from './cutlist/BomPanel';

type Tab = 'price' | 'cutlist' | 'bom';

export default function RightPanel() {
  const [tab, setTab] = useState<Tab>('price');

  return (
    <div className="flex h-full w-[420px] shrink-0 flex-col border-l border-stone-200 bg-white">
      <div className="flex gap-1 border-b border-stone-200 px-3 pt-3">
        <TabButton active={tab === 'price'} onClick={() => setTab('price')}>
          Price breakdown
        </TabButton>
        <TabButton active={tab === 'cutlist'} onClick={() => setTab('cutlist')}>
          Cut list
        </TabButton>
        <TabButton active={tab === 'bom'} onClick={() => setTab('bom')}>Digital BOM</TabButton>
      </div>
      <div className="min-h-0 flex-1">
        {tab === 'price' ? <PriceBreakdown /> : tab === 'cutlist' ? <CutList /> : <BomPanel />}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        'rounded-t-lg px-3 py-2 text-xs font-semibold transition ' +
        (active
          ? 'bg-stone-100 text-stone-900'
          : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700')
      }
    >
      {children}
    </button>
  );
}

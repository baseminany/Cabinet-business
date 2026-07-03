import { useMemo, useState } from 'react';
import { useStore } from '../store';
import { PRESETS, instantiatePreset, presetPrice, type PresetSpec, type PresetCategory } from '../model/presets';
import { startCheckout, CheckoutUnavailableError } from '../services/checkout';
import { CUSTOMER_FINISHES } from '../model/materials';
import type { UnitType } from '../model/types';

// A row of finish swatches so every product shows it comes in many colors/woods,
// not just the one shown in the photo.
function FinishOptions() {
  const seen = new Set<string>();
  const dots = CUSTOMER_FINISHES.filter((m) => (seen.has(m.color) ? false : (seen.add(m.color), true))).slice(0, 8);
  return (
    <div className="mt-2.5 flex items-center gap-2">
      <div className="flex">
        {dots.map((m) => (
          <span key={m.id} title={m.label} className="-ml-0.5 h-4 w-4 rounded-full border border-black/10 ring-1 ring-white first:ml-0" style={{ background: m.color }} />
        ))}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink-muted">{CUSTOMER_FINISHES.length} finishes</span>
    </div>
  );
}

function money(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

const CATS: (PresetCategory | 'All')[] = ['All', 'Kids', 'Entry', 'Coffee', 'Laundry', 'Storage'];

export default function ShopPrebuilt() {
  const setStep = useStore((s) => s.setStep);
  const orderPreset = useStore((s) => s.orderPreset);
  const openProduct = useStore((s) => s.openProduct);
  const initialCat = useStore((s) => s.shopCategory);
  const [cat, setCat] = useState<PresetCategory | 'All'>(initialCat);

  const shown = useMemo(() => (cat === 'All' ? PRESETS : PRESETS.filter((p) => p.category === cat)), [cat]);
  const prices = useMemo(() => Object.fromEntries(PRESETS.map((p) => [p.id, presetPrice(p)])), []);
  const [busyId, setBusyId] = useState<string | null>(null);

  const customize = (spec: PresetSpec) => orderPreset(instantiatePreset(spec), 'pieces');
  // Buy now → Stripe Checkout. Until STRIPE_SECRET_KEY is set, fall back to the
  // quote/order-capture flow so the order is still captured (nothing breaks).
  const buy = async (spec: PresetSpec) => {
    setBusyId(spec.id);
    try {
      await startCheckout([{ name: spec.name, amount: Math.round(prices[spec.id] * 100), quantity: 1 }], spec.name);
    } catch (e) {
      void (e instanceof CheckoutUnavailableError);
      orderPreset(instantiatePreset(spec), 'quote');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="nice-scroll min-h-0 flex-1 overflow-y-auto bg-[linear-gradient(180deg,#fffdf8,#f4eadb)] text-ink">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-champagne/30 bg-warmWhite/92 px-4 py-3 backdrop-blur sm:px-6">
        <button onClick={() => setStep('welcome')} className="text-sm font-black uppercase tracking-[0.22em] text-ink">House of Nook</button>
        <button onClick={() => setStep('entry')} className="rounded-full border border-champagne/45 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-muted transition hover:border-walnut hover:text-walnut">Design my own →</button>
      </header>

      <div className="mx-auto max-w-6xl px-6 pb-16 pt-10 sm:px-10">
        <p className="eyebrow text-brass">Ready-made nooks for every room · built in the USA</p>
        <h1 className="mt-4 max-w-2xl text-5xl font-semibold leading-[0.95] tracking-[-0.05em] text-ink sm:text-6xl">Pre-built nooks — order, then make them yours.</h1>
        <p className="mt-5 max-w-xl text-base leading-8 text-ink-soft">Entryways, coffee bars, reading nooks, kids' rooms, and more — real wood, ships flat, assembles in an afternoon. Order a ready-made design as-is, or open it in the planner and change the size, finish, and layout. Every price is a real starting estimate from our shop.</p>

        {/* Category filter */}
        <div className="mt-8 flex flex-wrap gap-2">
          {CATS.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={'rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition ' + (cat === c ? 'bg-walnut text-porcelain shadow-soft' : 'bg-warmWhite text-ink-muted ring-1 ring-champagne/40 hover:ring-brass/60')}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((spec) => (
            <article key={spec.id} onClick={() => openProduct(spec.id)} className="premium-card group flex cursor-pointer flex-col overflow-hidden p-0 transition hover:shadow-lift">
              <div className="flex h-44 items-center justify-center overflow-hidden bg-[linear-gradient(160deg,#f4ede0,#e8ddc9)]">
                <CardImage image={spec.image} alt={spec.name} type={spec.items[0].type} />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-champagne/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-walnut">{spec.category}</span>
                  <span className="text-sm font-black text-ink">{money(prices[spec.id])}<span className="ml-1 text-[10px] font-bold uppercase tracking-wide text-ink-muted">from</span></span>
                </div>
                <h2 className="mt-3 text-xl font-black leading-tight tracking-tight text-ink">{spec.name}</h2>
                <FinishOptions />
                <p className="mt-2 text-sm leading-6 text-ink-muted">{spec.blurb}</p>
                <ul className="mt-3 space-y-1.5">
                  {spec.highlights.map((h) => (
                    <li key={h} className="flex gap-2 text-[12px] leading-5 text-ink-soft">
                      <span className="mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full bg-brass" />{h}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex gap-2 pt-1">
                  <button onClick={(e) => { e.stopPropagation(); buy(spec); }} disabled={busyId === spec.id} className="premium-button flex-1 px-4 py-3 text-sm disabled:opacity-60">{busyId === spec.id ? 'Starting…' : 'Buy now'}</button>
                  <button onClick={(e) => { e.stopPropagation(); customize(spec); }} className="flex-1 rounded-full border border-brass/40 px-4 py-3 text-sm font-bold text-walnut transition hover:border-walnut hover:bg-walnut hover:text-porcelain">Customize</button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-10 text-center text-xs leading-6 text-ink-muted">Don't see your size? Every design here opens in the planner — change anything, then send it for a quote.</p>
      </div>
    </div>
  );
}

// ─── Lightweight product sketches by type ──────────────────────────────────────

// Shows the product photo, falling back to the line-drawing sketch if the
// image is missing or fails to load (so a not-yet-rendered product never breaks).
export function CardImage({ image, alt, type }: { image?: string; alt: string; type: UnitType }) {
  const [failed, setFailed] = useState(false);
  if (!image || failed) return <ProductSketch type={type} />;
  return <img src={image} alt={alt} onError={() => setFailed(true)} className="h-full w-full object-cover" />;
}

export function ProductSketch({ type }: { type: UnitType }) {
  const stroke = '#9a7b4a';
  const fill = '#efe7d6';
  const wood = '#c79a5c';
  const shadow = '#bfa379';

  if (type === 'montessori') {
    return (
      <svg viewBox="0 0 90 96" className="h-32 w-auto">
        <rect x="14" y="6" width="62" height="84" rx="2.5" fill={fill} stroke={stroke} strokeWidth="2" />
        {[26, 46, 66].map((y) => (
          <g key={y}>
            <rect x="18" y={y} width="54" height="3.5" rx="1" fill={shadow} />
            <rect x="18" y={y - 11} width="54" height="11" rx="1" fill={wood} opacity="0.35" />
            {/* book covers facing out */}
            <rect x="22" y={y - 10} width="9" height="9" rx="1" fill="#7a9a6e" />
            <rect x="33" y={y - 10} width="9" height="9" rx="1" fill="#b9794f" />
            <rect x="44" y={y - 10} width="9" height="9" rx="1" fill="#6e86a8" />
          </g>
        ))}
      </svg>
    );
  }

  if (type === 'bunk') {
    return (
      <svg viewBox="0 0 120 96" className="h-32 w-auto">
        {/* end panels */}
        <rect x="6" y="14" width="9" height="74" rx="2" fill={fill} stroke={stroke} strokeWidth="2" />
        <rect x="105" y="14" width="9" height="74" rx="2" fill={fill} stroke={stroke} strokeWidth="2" />
        {/* upper bunk */}
        <rect x="15" y="30" width="90" height="6" fill={wood} opacity="0.6" />
        <line x1="15" y1="24" x2="80" y2="24" stroke={stroke} strokeWidth="2.5" />
        {/* lower bunk */}
        <rect x="15" y="68" width="90" height="6" fill={wood} opacity="0.6" />
        {/* ladder */}
        <line x1="96" y1="30" x2="96" y2="88" stroke={stroke} strokeWidth="2" />
        <line x1="103" y1="30" x2="103" y2="88" stroke={stroke} strokeWidth="2" />
        {[42, 56, 70, 84].map((y) => <line key={y} x1="96" y1={y} x2="103" y2={y} stroke={stroke} strokeWidth="2" />)}
      </svg>
    );
  }

  if (type === 'shelf') {
    return (
      <svg viewBox="0 0 110 70" className="h-24 w-auto">
        <rect x="6" y="30" width="98" height="12" rx="2" fill={fill} stroke={stroke} strokeWidth="2" />
        <rect x="6" y="30" width="98" height="4" fill={wood} opacity="0.5" />
      </svg>
    );
  }

  if (type === 'learning-tower') {
    return (
      <svg viewBox="0 0 60 96" className="h-32 w-auto">
        {/* side panels */}
        <rect x="8" y="8" width="8" height="84" rx="2" fill={fill} stroke={stroke} strokeWidth="1.5" />
        <rect x="44" y="8" width="8" height="84" rx="2" fill={fill} stroke={stroke} strokeWidth="1.5" />
        {/* standing platform */}
        <rect x="14" y="50" width="32" height="5" fill={wood} opacity="0.6" />
        {/* lower step */}
        <rect x="16" y="72" width="22" height="5" fill={wood} opacity="0.5" />
        {/* top + front safety rails */}
        <rect x="14" y="14" width="32" height="4" rx="2" fill={fill} stroke={stroke} strokeWidth="1.2" />
        <rect x="14" y="34" width="32" height="3.5" rx="2" fill={fill} stroke={stroke} strokeWidth="1.2" />
      </svg>
    );
  }

  // base / upper / tall cabinet
  return (
    <svg viewBox="0 0 100 96" className="h-32 w-auto">
      <rect x="12" y="8" width="76" height="80" rx="2.5" fill={fill} stroke={stroke} strokeWidth="2" />
      <rect x="12" y="80" width="76" height="8" fill={shadow} opacity="0.5" />
      <line x1="50" y1="12" x2="50" y2="78" stroke={stroke} strokeWidth="1.5" />
      <rect x="44" y="42" width="3" height="9" rx="1.5" fill="#c9a840" />
      <rect x="53" y="42" width="3" height="9" rx="1.5" fill="#c9a840" />
    </svg>
  );
}

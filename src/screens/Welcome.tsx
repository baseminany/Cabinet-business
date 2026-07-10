// =============================================================================
// LANDING — editorial, image-led, calm (Thuma-school, not template-school)
// =============================================================================
// Design rules for this page (from the July 2026 DTC research pass):
//   · Serif display type (Fraunces) for every headline; quiet sans for UI.
//   · One idea per section. Short, confident copy. No comparison tables,
//     no emoji, no pill-chip rows, no gradient blobs.
//   · Photography leads. Only images of products we actually sell.
//   · Square-ish corners and thin rules — editorial, not app-like.
// =============================================================================

import { useMemo } from 'react';
import { useStore, type ShopCategory } from '../store';
import Img from '../components/Img';
import { PRESETS, presetPrice, type PresetSpec } from '../model/presets';

function money(n: number): string { return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }); }

const FEATURED_IDS = ['montessori-bookshelf', 'media-console-open', 'floating-shelves', 'shoe-bench'];

const ROOMS: { img: string; title: string; cat: ShopCategory }[] = [
  { img: 'product-shoe-bench.png', title: 'Entryway', cat: 'Entry' },
  { img: 'kids-montessori-bookshelf.png', title: 'Kids & Playroom', cat: 'Kids' },
  { img: 'product-coffee-open.png', title: 'Coffee Corner', cat: 'Coffee' },
  { img: 'product-media-open.png', title: 'Living & Media', cat: 'Storage' },
  { img: 'product-laundry-tower.png', title: 'Laundry', cat: 'Laundry' },
  { img: 'product-wall-boxes.png', title: 'Walls & Desk', cat: 'Decor' },
];

export default function Welcome() {
  const setStep = useStore((s) => s.setStep);
  const openShop = useStore((s) => s.openShop);
  const openProduct = useStore((s) => s.openProduct);
  const featured = useMemo(() => FEATURED_IDS.map((id) => PRESETS.find((p) => p.id === id)).filter(Boolean) as PresetSpec[], []);
  const prices = useMemo(() => Object.fromEntries(featured.map((p) => [p.id, presetPrice(p)])), [featured]);
  const checkout = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('checkout') : null;

  return (
    <div className="nice-scroll min-h-0 flex-1 overflow-y-auto bg-warmWhite text-ink">
      {checkout === 'success' && (
        <div className="bg-deepGreen px-6 py-3 text-center text-sm font-semibold text-porcelain">Thank you — your order is in. Your receipt and shipping details are on the way.</div>
      )}

      {/* ── Header ── */}
      <header className="sticky top-0 z-20 border-b border-ink/10 bg-warmWhite/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 sm:px-10">
          <span className="font-display text-[22px] font-medium tracking-tight">House of Nook</span>
          <nav className="hidden items-center gap-8 text-[13px] font-medium text-ink-soft sm:flex">
            <button onClick={() => openShop('All')} className="transition hover:text-ink">Shop</button>
            <button onClick={() => setStep('entry')} className="transition hover:text-ink">Custom</button>
            <a href="#craft" className="transition hover:text-ink">Our craft</a>
          </nav>
          <button onClick={() => openShop('All')} className="rounded-sm bg-ink px-6 py-2.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-warmWhite transition hover:bg-walnut">Shop</button>
        </div>
      </header>

      {/* ── Statement + full-bleed hero image ── */}
      <section className="mx-auto max-w-[1400px] px-6 sm:px-10">
        <div className="py-16 sm:py-24">
          <h1 className="font-display mx-auto max-w-4xl text-center text-[clamp(2.6rem,5.4vw,4.8rem)] font-normal leading-[1.06] tracking-[-0.01em]">
            Furniture that fits the way you live.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-center text-[15px] leading-7 text-ink-soft">
            Real-hardwood pieces for the corners big furniture forgets — sized to your wall
            to the inch, shipped flat, and assembled without a single screw.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-6">
            <button onClick={() => openShop('All')} className="rounded-sm bg-ink px-9 py-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-warmWhite transition hover:bg-walnut">Shop the collection</button>
            <button onClick={() => setStep('entry')} className="text-[13px] font-medium text-ink underline decoration-brass/60 underline-offset-4 transition hover:decoration-brass">Design something custom</button>
          </div>
          <p className="mt-10 text-center text-[11px] font-medium uppercase tracking-[0.24em] text-ink-muted">
            Made in Michigan&ensp;·&ensp;Ships flat&ensp;·&ensp;No-tool assembly&ensp;·&ensp;Real hardwood
          </p>
        </div>
        <figure className="overflow-hidden">
          <Img name="product-art-ledges.png" alt="Walnut art ledges styled in a warm living room" className="aspect-[16/8] w-full object-cover" />
        </figure>
        <p className="border-b border-ink/10 py-3 text-[11px] uppercase tracking-[0.18em] text-ink-muted">The Art Ledge Set · solid walnut</p>
      </section>

      {/* ── Shop by room ── */}
      <section className="mx-auto max-w-[1400px] px-6 py-20 sm:px-10 sm:py-28">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-[clamp(1.9rem,3.2vw,2.8rem)] font-normal leading-tight">Shop by room</h2>
          <button onClick={() => openShop('All')} className="hidden text-[12px] font-semibold uppercase tracking-[0.14em] text-ink underline decoration-brass/60 underline-offset-4 hover:decoration-brass sm:block">View everything</button>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-3">
          {ROOMS.map((r) => (
            <button key={r.title} onClick={() => openShop(r.cat)} className="group text-left">
              <div className="overflow-hidden bg-porcelain">
                <Img name={r.img} alt={r.title} className="aspect-[5/4] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
              </div>
              <div className="mt-3 flex items-baseline justify-between border-b border-ink/10 pb-3">
                <span className="font-display text-lg">{r.title}</span>
                <span className="text-[11px] uppercase tracking-[0.16em] text-ink-muted transition group-hover:text-brass">Shop →</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Featured pieces ── */}
      <section className="border-y border-ink/10 bg-porcelain/60">
        <div className="mx-auto max-w-[1400px] px-6 py-20 sm:px-10 sm:py-28">
          <h2 className="font-display text-center text-[clamp(1.9rem,3.2vw,2.8rem)] font-normal leading-tight">This season's pieces</h2>
          <p className="mx-auto mt-3 max-w-md text-center text-sm leading-6 text-ink-muted">Each one sized to the inch for your wall, in your choice of thirteen finishes.</p>
          <div className="mt-12 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <button key={p.id} onClick={() => openProduct(p.id)} className="group text-left">
                <div className="overflow-hidden bg-warmWhite">
                  {p.image && <img src={p.image} alt={p.name} className="aspect-square w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />}
                </div>
                <div className="mt-3">
                  <div className="font-display text-[17px] leading-snug">{p.name}</div>
                  <div className="mt-1 text-[13px] text-ink-muted">from {money(prices[p.id])}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Craft ── */}
      <section id="craft" className="mx-auto max-w-[1400px] px-6 py-20 sm:px-10 sm:py-28">
        <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:items-center">
          <figure className="overflow-hidden">
            <Img name="product-coffee-open.png" alt="Open coffee station in white oak" className="aspect-[4/5] w-full object-cover" />
          </figure>
          <div className="max-w-lg">
            <h2 className="font-display text-[clamp(1.9rem,3.2vw,2.8rem)] font-normal leading-[1.12]">A one-person shop, not a warehouse.</h2>
            <div className="mt-6 space-y-5 text-[15px] leading-8 text-ink-soft">
              <p>Every House of Nook piece is cut, edge-banded, and finished by hand in a small Michigan workshop — then packed flat and shipped to your door.</p>
              <p>The joinery is the quiet star: precision Lamello connectors let panels align and lock with the flip of a lever. No screws to strip, no cam locks to wobble loose, nothing to outsmart. Load-bearing surfaces sit in routed grooves, so the wood — not the hardware — carries the weight.</p>
            </div>
            <dl className="mt-9 space-y-5 border-t border-ink/10 pt-7">
              {[
                ['Real hardwood', 'White oak and walnut veneer plywood, matched solid edging. Painted pieces use furniture-grade MDF and Sherwin-Williams color.'],
                ['Clip-together assembly', 'Align the panels, flip the levers, done. The one small tool you need is in the box.'],
                ['Made to your inch', 'Nearly every piece can be sized down to the quarter-inch for your exact wall.'],
              ].map(([t, b]) => (
                <div key={t}>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brass">{t}</dt>
                  <dd className="mt-1.5 text-sm leading-6 text-ink-soft">{b}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ── How it arrives ── */}
      <section className="border-y border-ink/10 bg-porcelain/60">
        <div className="mx-auto max-w-[1400px] px-6 py-20 sm:px-10 sm:py-24">
          <h2 className="font-display text-center text-[clamp(1.9rem,3.2vw,2.8rem)] font-normal leading-tight">From our shop to your wall</h2>
          <div className="mx-auto mt-12 grid max-w-5xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['1', 'Choose your piece', 'Pick a design, your finish, and the exact width for your space.'],
              ['2', 'We build it', 'Cut, banded, and finished by hand, to your measurements.'],
              ['3', 'It ships flat', 'Labeled panels, protected corners, hardware bagged — standard carrier.'],
              ['4', 'Clip it together', 'Minutes with the included tool. No drill, no screws, no guesswork.'],
            ].map(([n, t, b]) => (
              <div key={n}>
                <div className="font-display text-3xl text-brass">{n}</div>
                <h3 className="mt-3 text-[15px] font-semibold text-ink">{t}</h3>
                <p className="mt-1.5 text-sm leading-6 text-ink-muted">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Closing ── */}
      <section className="mx-auto max-w-[1400px] px-6 py-24 text-center sm:px-10 sm:py-32">
        <h2 className="font-display mx-auto max-w-2xl text-[clamp(2rem,4vw,3.4rem)] font-normal leading-[1.1]">Start with one corner.</h2>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-7 text-ink-soft">A shelf, a bench, a bookcase for small hands — every calm home starts somewhere.</p>
        <button onClick={() => openShop('All')} className="mt-9 rounded-sm bg-ink px-10 py-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-warmWhite transition hover:bg-walnut">Shop the collection</button>
        <p className="mt-16 border-t border-ink/10 pt-8 text-[11px] uppercase tracking-[0.22em] text-ink-muted">House of Nook · Made in Michigan, USA</p>
      </section>
    </div>
  );
}

// =============================================================================
// PRODUCT DETAIL PAGE — the conversion machine
// =============================================================================
// One product, everything a buyer needs on a single page: photo gallery, a live
// 3D preview of the ACTUAL parametric model, finish choices (value vs premium),
// width customization down to the inch (bounded so the max still cuts from the
// same sheet allowance), a live price, and Buy now. The full room planner stays
// one click away for people who want deeper customization.
// =============================================================================

import { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { useStore } from '../store';
import { PRESETS, instantiatePreset } from '../model/presets';
import { buildParts, buildProject } from '../model/buildParts';
import { priceModel } from '../pricing/engine';
import { materialsFor, materialTier, getMaterial } from '../model/materials';
import { startCheckout } from '../services/checkout';
import CabinetMesh from '../scene/CabinetMesh';
import { ProductSketch } from './ShopPrebuilt';
import type { MaterialId } from '../model/types';

function money(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export default function ProductDetail() {
  const productId = useStore((s) => s.productId);
  const setStep = useStore((s) => s.setStep);
  const openShop = useStore((s) => s.openShop);
  const orderPreset = useStore((s) => s.orderPreset);
  const spec = PRESETS.find((p) => p.id === productId);

  const defaultWidth = spec?.items[0]?.patch?.overall?.width ?? 36;
  const [width, setWidth] = useState<number | null>(null);
  const [finish, setFinish] = useState<MaterialId | null>(null);
  const [view, setView] = useState<'photo' | '3d'>('photo');
  const [imgIdx, setImgIdx] = useState(0);
  const [busy, setBusy] = useState(false);

  const curWidth = width ?? defaultWidth;

  // Build the REAL units for the current configuration — the same objects the
  // planner, pricing engine, and cut list use. Nothing on this page is a mockup.
  const units = useMemo(() => {
    if (!spec) return [];
    const us = instantiatePreset(spec);
    for (const u of us) {
      if (spec.widthRange && width != null) u.overall = { ...u.overall, width: curWidth };
      if (finish) u.materials = { ...u.materials, carcass: finish, doors: finish };
    }
    return us;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec, width, finish, curWidth]);

  const price = useMemo(() => (units.length ? priceModel(buildProject(units)) : null), [units]);

  // Simple centered-row layout for the live 3D preview (studio style).
  const scene3d = useMemo(() => {
    if (units.length === 0) return null;
    const GAP = 4;
    const widths = units.map((u) => u.overall.width);
    const total = widths.reduce((a, b) => a + b, 0) + GAP * (units.length - 1);
    let cx = -total / 2;
    const groups = units.map((u, i) => {
      const x = cx + widths[i] / 2;
      cx += widths[i] + GAP;
      return { key: u.id, x, y: u.mountHeight, parts: buildParts(u).parts };
    });
    const topY = Math.max(...units.map((u) => u.mountHeight + u.overall.height));
    return { groups, total, topY };
  }, [units]);

  if (!spec) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 bg-warmWhite p-10 text-ink">
        <p className="text-lg font-bold">That product wasn't found.</p>
        <button onClick={() => openShop('All')} className="premium-button px-6 py-3 text-sm">Back to the shop →</button>
      </div>
    );
  }

  const gallery = spec.images && spec.images.length > 0 ? spec.images : spec.image ? [spec.image] : [];
  const finishOptions = materialsFor('carcass');
  const valueFinishes = finishOptions.filter((m) => materialTier(m) === 'value');
  const premiumFinishes = finishOptions.filter((m) => materialTier(m) === 'premium');
  const curFinishId = finish ?? spec.items[0]?.patch?.materials?.carcass ?? 'uv-ply-natural';
  const curFinish = getMaterial(curFinishId);

  const buy = async () => {
    if (!price) return;
    setBusy(true);
    try {
      await startCheckout(
        [{ name: `${spec.name} — ${Math.round(curWidth)}″ · ${curFinish.label}`, amount: Math.round(price.customerPrice * 100), quantity: 1 }],
        spec.name
      );
    } catch {
      // Stripe not configured (or failed) → capture the configured order as a saved design.
      orderPreset(units, 'quote');
    } finally {
      setBusy(false);
    }
  };

  const customize = () => orderPreset(units, 'pieces');
  const dist = scene3d ? Math.max(scene3d.total, scene3d.topY) * 1.6 + 24 : 120;

  return (
    <div className="nice-scroll min-h-0 flex-1 overflow-y-auto bg-[linear-gradient(180deg,#fffdf8,#f4eadb)] text-ink">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-champagne/30 bg-warmWhite/92 px-4 py-3 backdrop-blur sm:px-6">
        <button onClick={() => setStep('welcome')} className="text-sm font-black uppercase tracking-[0.22em] text-ink">House of Nook</button>
        <button onClick={() => openShop('All')} className="rounded-full border border-champagne/45 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-muted transition hover:border-walnut hover:text-walnut">← All products</button>
      </header>

      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[1.05fr_0.95fr] sm:px-10">
        {/* ── Left: gallery + live 3D ── */}
        <div>
          <div className="overflow-hidden rounded-3xl border border-champagne/35 bg-[linear-gradient(160deg,#f4ede0,#e8ddc9)] shadow-card">
            {view === 'photo' ? (
              <div className="flex aspect-[4/3] items-center justify-center overflow-hidden">
                {gallery.length > 0
                  ? <img src={gallery[Math.min(imgIdx, gallery.length - 1)]} alt={spec.name} className="h-full w-full object-cover" />
                  : <ProductSketch type={spec.items[0].type} />}
              </div>
            ) : (
              <div className="aspect-[4/3]">
                {scene3d && (
                  <Canvas dpr={[1, 2]} camera={{ position: [dist * 0.42, scene3d.topY * 0.72 + 8, dist], fov: 35, near: 1, far: 5000 }}>
                    <color attach="background" args={['#f0e9da']} />
                    <ambientLight intensity={0.55} />
                    <directionalLight position={[60, 90, 70]} intensity={1.5} color="#fff2e0" />
                    <Environment preset="apartment" environmentIntensity={0.5} />
                    {scene3d.groups.map((g) => (
                      <group key={g.key} position={[g.x, g.y, 0]}><CabinetMesh parts={g.parts} /></group>
                    ))}
                    <ContactShadows position={[0, 0.02, 0]} scale={scene3d.total * 2.2} blur={2.1} opacity={0.35} color="#2b2016" />
                    <OrbitControls target={[0, scene3d.topY * 0.45, 0]} enableDamping minPolarAngle={0.1} maxPolarAngle={Math.PI / 2 + 0.05} />
                  </Canvas>
                )}
              </div>
            )}
          </div>

          {/* Thumbnails + 3D toggle */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {gallery.map((src, i) => (
              <button key={src} onClick={() => { setView('photo'); setImgIdx(i); }} className={'h-16 w-20 overflow-hidden rounded-xl border transition ' + (view === 'photo' && imgIdx === i ? 'border-brass ring-1 ring-brass' : 'border-champagne/40 hover:border-brass/50')}>
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
            <button onClick={() => setView('3d')} className={'flex h-16 w-20 flex-col items-center justify-center gap-1 rounded-xl border text-[10px] font-bold uppercase tracking-wide transition ' + (view === '3d' ? 'border-brass bg-parchment text-walnut ring-1 ring-brass' : 'border-champagne/40 text-ink-muted hover:border-brass/50')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M12 2 3 7v10l9 5 9-5V7z" /><path d="M3 7l9 5 9-5M12 12v10" /></svg>
              Live 3D
            </button>
            <span className="ml-1 text-[11px] text-ink-muted">The 3D view is the real build at your exact size — spin it around.</span>
          </div>

          {/* Why this works — the assembly + shipping story */}
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              ['🔗', 'No screws', 'Lamello Clamex clips: align the panels, flip the levers, done. Nothing to strip.'],
              ['🪵', 'Wood carries the load', 'Shelves and seats sit in routed dados — the connectors just lock the fit.'],
              ['📦', 'Ships flat', 'Labeled panels, protected edges, hardware bagged. Assembles with one small tool (included).'],
            ].map(([icon, t, b]) => (
              <div key={t} className="rounded-2xl border border-champagne/35 bg-warmWhite p-4">
                <div className="text-xl">{icon}</div>
                <div className="mt-1.5 text-sm font-black tracking-tight text-ink">{t}</div>
                <p className="mt-1 text-[12px] leading-5 text-ink-muted">{b}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: configure + buy ── */}
        <div>
          <span className="rounded-full bg-champagne/30 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-walnut">{spec.category}</span>
          <h1 className="mt-3 text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-ink">{spec.name}</h1>
          <p className="mt-3 text-sm leading-7 text-ink-soft">{spec.blurb}</p>

          <ul className="mt-4 space-y-1.5">
            {spec.highlights.map((h) => (
              <li key={h} className="flex gap-2 text-[13px] leading-6 text-ink-soft">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brass" />{h}
              </li>
            ))}
          </ul>

          {/* Finish picker */}
          <div className="mt-7">
            <div className="flex items-baseline justify-between">
              <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">Finish</h3>
              <span className="text-[11px] font-semibold text-ink-soft">{curFinish.label}</span>
            </div>
            {[['Value · pre-finished + painted', valueFinishes], ['Premium · hardwood veneer', premiumFinishes]].map(([label, list]) => (
              <div key={label as string} className="mt-2.5">
                <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-brass">{label as string}</div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {(list as typeof finishOptions).map((m) => (
                    <button key={m.id} title={m.label} onClick={() => setFinish(m.id)}
                      className={'h-9 w-9 rounded-full border transition ' + (curFinishId === m.id ? 'border-walnut ring-2 ring-brass' : 'border-black/10 hover:ring-1 hover:ring-brass/60')}
                      style={{ background: m.color }} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Width customization — the sheet-bounded superpower */}
          {spec.widthRange && (
            <div className="mt-7 rounded-2xl border border-champagne/35 bg-warmWhite p-4">
              <div className="flex items-baseline justify-between">
                <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">Made-to-fit width</h3>
                <span className="text-sm font-black text-ink">{curWidth}″</span>
              </div>
              <input
                type="range" min={spec.widthRange.min} max={spec.widthRange.max} step={0.25}
                value={curWidth} onChange={(e) => setWidth(parseFloat(e.target.value))}
                className="mt-3 w-full accent-[#8a6a3c]"
              />
              <div className="mt-1 flex justify-between text-[10px] font-bold text-ink-muted">
                <span>{spec.widthRange.min}″</span><span>{spec.widthRange.max}″</span>
              </div>
              <p className="mt-2 text-[11px] leading-5 text-ink-muted">
                Sized to the inch for your wall. The max is where this design still cuts cleanly from its plywood sheets — that discipline is what keeps the price honest. Need different depth or height? <button onClick={customize} className="font-bold text-walnut underline-offset-2 hover:underline">Open the full planner →</button>
              </p>
            </div>
          )}

          {/* Price + buy */}
          {price && (
            <div className="mt-7 rounded-3xl border-2 border-walnut/25 bg-warmWhite p-5 shadow-card">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-brass">Your configuration</div>
                  <div className="mt-1 text-4xl font-semibold tracking-[-0.04em] text-ink">{money(price.customerPrice)}</div>
                </div>
                <div className="text-right text-[11px] leading-5 text-ink-muted">
                  cut from ~{Math.max(0.5, Math.round(price.sheetsUsed * 2) / 2)} sheet{price.sheetsUsed > 0.75 ? 's' : ''}<br />of premium plywood
                </div>
              </div>
              <button onClick={buy} disabled={busy} className="premium-button mt-4 w-full px-5 py-4 text-base disabled:opacity-60">
                {busy ? 'Starting…' : 'Buy now'}
              </button>
              <div className="mt-2.5 flex justify-center gap-4 text-[11px] font-semibold text-ink-muted">
                <button onClick={customize} className="underline-offset-2 hover:text-walnut hover:underline">Customize further</button>
                <span>·</span>
                <button onClick={() => orderPreset(units, 'quote')} className="underline-offset-2 hover:text-walnut hover:underline">Save this design</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

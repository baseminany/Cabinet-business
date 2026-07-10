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
import { ProductSketch, CardImage } from './ShopPrebuilt';
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
  const defaultDepth = spec?.items[0]?.patch?.overall?.depth ?? 12;
  const defaultHeight = spec?.items[0]?.patch?.overall?.height ?? 30;
  const [width, setWidth] = useState<number | null>(null);
  const [depth, setDepth] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [finish, setFinish] = useState<MaterialId | null>(null);
  const [view, setView] = useState<'photo' | '3d'>('photo');
  const [imgIdx, setImgIdx] = useState(0);
  const [busy, setBusy] = useState(false);

  const curWidth = width ?? defaultWidth;
  const curDepth = depth ?? defaultDepth;
  const curHeight = height ?? defaultHeight;

  // Depth/height fine-tuning is offered for SINGLE-piece products (multi-piece
  // sets share a width but have intentionally different depths/heights).
  const singlePiece = (spec?.items.length ?? 0) === 1;
  const firstType = spec?.items[0]?.type;
  const depthRange = singlePiece
    ? { min: Math.max(4, Math.round(defaultDepth * 0.7)), max: Math.min(30, Math.round(defaultDepth * 1.4)) }
    : null;
  const heightRange = singlePiece && (firstType === 'tall' || firstType === 'montessori')
    ? { min: Math.max(12, defaultHeight - 8), max: Math.min(84, defaultHeight + 12) }
    : null;

  // Build the REAL units for the current configuration — the same objects the
  // planner, pricing engine, and cut list use. Nothing on this page is a mockup.
  const units = useMemo(() => {
    if (!spec) return [];
    const us = instantiatePreset(spec);
    for (const u of us) {
      if (spec.widthRange && width != null) u.overall = { ...u.overall, width: curWidth };
      if (depthRange && depth != null) u.overall = { ...u.overall, depth: curDepth };
      if (heightRange && height != null) u.overall = { ...u.overall, height: curHeight };
      if (finish) u.materials = { ...u.materials, carcass: finish, doors: finish };
    }
    return us;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec, width, depth, height, finish, curWidth, curDepth, curHeight]);

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

  const dist = scene3d ? Math.max(scene3d.total, scene3d.topY) * 1.6 + 24 : 120;

  return (
    <div className="nice-scroll min-h-0 flex-1 overflow-y-auto bg-warmWhite text-ink">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-ink/10 bg-warmWhite/95 px-4 py-4 backdrop-blur sm:px-6">
        <button onClick={() => setStep('welcome')} className="font-display text-[20px] font-medium tracking-tight">House of Nook</button>
        <button onClick={() => openShop('All')} className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-soft underline decoration-brass/50 underline-offset-4 transition hover:text-ink">← All products</button>
      </header>

      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[1.05fr_0.95fr] sm:px-10">
        {/* ── Left: gallery + live 3D ── */}
        <div>
          <div className="overflow-hidden rounded-3xl border border-champagne/35 bg-[linear-gradient(160deg,#f4ede0,#e8ddc9)] shadow-card">
            {view === 'photo' ? (
              <div className="flex aspect-[4/3] items-center justify-center overflow-hidden">
                <CardImage image={gallery[Math.min(imgIdx, gallery.length - 1)]} alt={spec.name} type={spec.items[0].type} />
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
                <img src={src} alt="" onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none'; }} className="h-full w-full object-cover" />
              </button>
            ))}
            <button onClick={() => setView('3d')} className={'flex h-16 w-20 flex-col items-center justify-center gap-1 rounded-xl border text-[10px] font-bold uppercase tracking-wide transition ' + (view === '3d' ? 'border-brass bg-parchment text-walnut ring-1 ring-brass' : 'border-champagne/40 text-ink-muted hover:border-brass/50')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M12 2 3 7v10l9 5 9-5V7z" /><path d="M3 7l9 5 9-5M12 12v10" /></svg>
              Live 3D
            </button>
            <span className="ml-1 text-[11px] text-ink-muted">The 3D view is the real build at your exact size — spin it around.</span>
          </div>

          {/* Why this works — the assembly + shipping story */}
          <div className="mt-8 grid gap-6 border-t border-ink/10 pt-6 sm:grid-cols-3">
            {[
              ['No screws', 'Lamello connectors: align the panels, flip the levers, done. Nothing to strip.'],
              ['Wood carries the load', 'Seats and steps sit in routed grooves; cases clip square — built to be leaned on.'],
              ['Ships flat', 'Labeled panels, protected edges, hardware bagged. One small tool, included.'],
            ].map(([t, b]) => (
              <div key={t}>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brass">{t}</div>
                <p className="mt-1.5 text-[12px] leading-5 text-ink-muted">{b}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: configure + buy ── */}
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brass">{spec.category}</span>
          <h1 className="font-display mt-3 text-[clamp(1.9rem,3vw,2.6rem)] font-normal leading-[1.1] text-ink">{spec.name}</h1>
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

          {/* Made-to-fit sizing — all in place, no separate planner */}
          {(spec.widthRange || depthRange || heightRange) && (
            <div className="mt-7 border border-ink/10 bg-warmWhite p-5">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-muted">Made to fit — size it here</h3>
              {spec.widthRange && (
                <SizeSlider label="Width" value={curWidth} min={spec.widthRange.min} max={spec.widthRange.max} onChange={setWidth} />
              )}
              {depthRange && (
                <SizeSlider label="Depth" value={curDepth} min={depthRange.min} max={depthRange.max} onChange={setDepth} />
              )}
              {heightRange && (
                <SizeSlider label="Height" value={curHeight} min={heightRange.min} max={heightRange.max} onChange={setHeight} />
              )}
              <p className="mt-3 text-[11px] leading-5 text-ink-muted">
                Sized to the quarter-inch for your exact spot. The limits keep the design cutting cleanly from its material — that's what keeps the price honest.
              </p>
            </div>
          )}

          {/* Price + buy */}
          {price && (
            <div className="mt-7 border border-ink/15 bg-warmWhite p-5">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brass">Your configuration</div>
                  <div className="font-display mt-1 text-4xl font-normal text-ink">{money(price.customerPrice)}</div>
                </div>
                <div className="text-right text-[11px] leading-5 text-ink-muted">
                  made to order<br />ships flat-pack
                </div>
              </div>
              <button onClick={buy} disabled={busy} className="mt-4 w-full rounded-sm bg-ink px-5 py-4 text-[13px] font-semibold uppercase tracking-[0.14em] text-warmWhite transition hover:bg-walnut disabled:opacity-60">
                {busy ? 'Starting…' : 'Buy now'}
              </button>
              <div className="mt-2.5 text-center text-[11px] font-medium text-ink-muted">
                <button onClick={() => orderPreset(units, 'quote')} className="underline decoration-brass/50 underline-offset-2 hover:text-walnut">Save this design for later</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Compact labeled slider for in-place made-to-fit sizing. */
function SizeSlider({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="mt-4">
      <div className="flex items-baseline justify-between">
        <span className="text-[12px] font-medium text-ink-soft">{label}</span>
        <span className="font-display text-[15px] text-ink">{value}″</span>
      </div>
      <input
        type="range" min={min} max={max} step={0.25} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="mt-2 w-full accent-[#8a6a3c]"
      />
      <div className="mt-0.5 flex justify-between text-[10px] text-ink-muted"><span>{min}″</span><span>{max}″</span></div>
    </div>
  );
}

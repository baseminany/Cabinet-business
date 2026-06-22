import type { ReactNode } from 'react';
import { useStore, type ShopCategory } from '../store';

// A calm "what are you here to do?" router between the landing and the planner.
// Splits the two business modes cleanly: order something ready-made (volume) vs
// design a custom built-in for your exact space (margin).

export default function Intake() {
  const setStep = useStore((s) => s.setStep);
  const openShop = useStore((s) => s.openShop);

  const readyMade: { cat: ShopCategory; title: string; sub: string; icon: ReactNode; accent: string }[] = [
    { cat: 'Kids', title: 'Kids & playroom', sub: 'Montessori shelves, learning tower, book ledges, toy storage', accent: '#6b7f53', icon: <PathIcon d="M4 19V8l8-4 8 4v11M9 19v-6h6v6" /> },
    { cat: 'Entry', title: 'Mudroom & entry', sub: 'Bench, lockers, hooks, shoe cubbies', accent: '#5a4832', icon: <PathIcon d="M3 21h18M5 21V7l7-4 7 4v14M10 21v-6h4v6" /> },
    { cat: 'Coffee', title: 'Coffee bar', sub: 'Counter base, mug shelves, wall storage', accent: '#7a5a3a', icon: <PathIcon d="M4 8h13v4a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 9h2a2 2 0 0 1 0 4h-2" /> },
    { cat: 'Storage', title: 'Reading & storage', sub: 'Bench nooks, book ledges, shelf walls', accent: '#3a5060', icon: <PathIcon d="M4 5h7v14H4zM13 5h7v14h-7z" /> },
  ];

  return (
    <div className="nice-scroll min-h-0 flex-1 overflow-y-auto bg-[linear-gradient(180deg,#fffdf8,#f4eadb)] text-ink">
      <header className="flex items-center justify-between gap-4 border-b border-champagne/30 bg-warmWhite/92 px-4 py-3 backdrop-blur sm:px-6">
        <button onClick={() => setStep('welcome')} className="text-sm font-black uppercase tracking-[0.22em] text-ink">House of Nook</button>
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brass">Let's get started</span>
      </header>

      <div className="mx-auto max-w-5xl px-6 pb-16 pt-12 sm:px-10">
        <p className="eyebrow text-brass">No pressure — nothing is locked in</p>
        <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-[1.0] tracking-[-0.045em] text-ink sm:text-5xl">What are you making?</h1>
        <p className="mt-4 max-w-xl text-base leading-8 text-ink-soft">Pick a ready-made piece to order and customize, or design a built-in to fit your exact wall. You can switch paths any time.</p>

        {/* Ready-made */}
        <div className="mt-10">
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-ink-muted">Order ready-made · ships flat, customize anything</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {readyMade.map((r) => (
              <button key={r.cat} onClick={() => openShop(r.cat)} className="group flex items-center gap-4 rounded-3xl border border-champagne/35 bg-warmWhite p-5 text-left shadow-soft transition hover:border-brass/55 hover:shadow-card active:scale-[0.99]">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-porcelain" style={{ background: r.accent }}>{r.icon}</span>
                <span className="flex-1">
                  <span className="block text-lg font-black tracking-tight text-ink">{r.title}</span>
                  <span className="mt-0.5 block text-[12px] leading-5 text-ink-muted">{r.sub}</span>
                </span>
                <span className="text-xl font-black text-ink-muted transition group-hover:translate-x-0.5 group-hover:text-walnut">→</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom built-in */}
        <div className="mt-10">
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-ink-muted">Design custom · fit to your exact space</h2>
          <button onClick={() => setStep('entry')} className="group mt-4 flex w-full items-center gap-5 overflow-hidden rounded-3xl border border-walnut/25 bg-[linear-gradient(135deg,#4b2e20,#2a1c13)] p-6 text-left text-porcelain shadow-card transition hover:shadow-lift active:scale-[0.99]">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-champagne ring-1 ring-white/15">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="11" r="2" /><path d="m4 18 5-4 4 3 3-2 4 3" /></svg>
            </span>
            <span className="flex-1">
              <span className="block text-xl font-black tracking-tight text-warmWhite">Design a built-in for my room</span>
              <span className="mt-1 block max-w-md text-sm leading-6 text-porcelain/70">Den, office, mudroom, or wall-to-wall. Upload a photo of your space, see it in 3D, and get a starting price — measurements confirmed before we build.</span>
            </span>
            <span className="text-2xl font-black text-champagne transition group-hover:translate-x-0.5">→</span>
          </button>
        </div>

        <button onClick={() => openShop('All')} className="mt-8 text-sm font-bold text-ink-muted underline-offset-4 transition hover:text-walnut hover:underline">Or browse everything ready-made →</button>
      </div>
    </div>
  );
}

function PathIcon({ d }: { d: string }) {
  return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d={d} /></svg>;
}

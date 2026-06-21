import { useStore, makerEnabled, type Step } from './store';
import Scene from './scene/Scene';
import RoomStep from './steps/RoomStep';
import OpeningsStep from './steps/OpeningsStep';
import PiecesStep from './steps/PiecesStep';
import QuoteStep from './steps/QuoteStep';
import DesignAssistantPanel from './components/DesignAssistantPanel';

type WStep = 'room' | 'openings' | 'pieces' | 'quote';

const META: Record<WStep, { eyebrow: string; title: string; subtitle: string }> = {
  room: { eyebrow: '01 · Room', title: 'Shape the room.', subtitle: 'Start with the envelope your pieces will live in.' },
  openings: { eyebrow: '02 · Openings', title: 'Mark the interruptions.', subtitle: 'Add windows and doors so cabinetry avoids what matters.' },
  pieces: { eyebrow: '03 · Pieces', title: 'Build the wall.', subtitle: 'Add cabinets and shelves, then refine size, finish, and placement.' },
  quote: { eyebrow: '04 · Estimate', title: 'Review the starting estimate.', subtitle: 'A clear design summary before measurement and shipping review.' },
};

export default function Wizard() {
  const step = useStore((s) => s.step) as WStep;
  const setStep = useStore((s) => s.setStep);
  const roomEnabled = useStore((s) => s.room.enabled);
  const setView = useStore((s) => s.setView);

  const order: WStep[] = roomEnabled ? ['room', 'openings', 'pieces', 'quote'] : ['pieces', 'quote'];
  const idx = Math.max(0, order.indexOf(step));
  const meta = META[step];

  const goBack = () => (idx === 0 ? setStep('entry' as Step) : setStep(order[idx - 1]));
  const goNext = () => idx < order.length - 1 && setStep(order[idx + 1]);
  const nextLabel = order[idx + 1] === 'quote' ? 'See estimate' : 'Continue';

  return (
    <div className="flex h-full min-h-0 flex-col bg-obsidian text-ink">
      <header className="flex items-center justify-between gap-4 border-b border-champagne/15 bg-obsidian px-4 py-3 text-porcelain sm:px-6">
        <button onClick={() => setStep('welcome')} className="text-sm font-black uppercase tracking-[0.22em] text-porcelain">Studio</button>
        <div className="flex flex-1 items-center justify-center gap-3">
          <div className="h-1.5 w-full max-w-[260px] overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-champagne transition-all" style={{ width: `${((idx + 1) / order.length) * 100}%` }} />
          </div>
          <span className="hidden whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.14em] text-porcelain/45 sm:inline">Step {idx + 1} of {order.length}</span>
        </div>
        {makerEnabled() ? (
          <button onClick={() => setView('maker')} className="text-[11px] font-bold uppercase tracking-[0.16em] text-porcelain/50 transition hover:text-champagne">Maker</button>
        ) : (
          <span className="w-10" />
        )}
      </header>

      <div className="flex min-h-0 flex-1 flex-col bg-warmWhite md:flex-row">
        <div className="relative h-[44vh] w-full shrink-0 bg-[#f1ede5] md:h-auto md:flex-1">
          <Scene />
          <div className="scene-vignette" />
        </div>

        <aside className="nice-scroll flex min-h-0 flex-1 flex-col overflow-y-auto border-t border-champagne/25 bg-[linear-gradient(180deg,#fffdf8,#f7f3ea)] md:w-[430px] md:flex-none md:border-l md:border-t-0">
          <div key={step} className="fade-up flex-1 p-5 sm:p-7">
            <p className="eyebrow text-brass">{meta.eyebrow}</p>
            <h2 className="mt-2 text-4xl font-black leading-[0.95] tracking-[-0.04em] text-ink">{meta.title}</h2>
            <p className="mb-6 mt-3 text-sm leading-6 text-ink-muted">{meta.subtitle}</p>
            {step === 'room' && <RoomStep />}
            {step === 'openings' && <OpeningsStep />}
            {step === 'pieces' && <PiecesStep />}
            {step === 'quote' && <QuoteStep />}
          </div>
        </aside>
      </div>

      <nav className="flex items-center justify-between gap-3 border-t border-champagne/20 bg-warmWhite px-4 py-3 sm:px-6">
        <button onClick={goBack} className="rounded-full px-4 py-2.5 text-sm font-bold text-ink-muted transition hover:bg-ivory-100 hover:text-ink">← Back</button>
        {step !== 'quote' ? (
          <button onClick={goNext} className="premium-button px-7 py-2.5 text-sm">{nextLabel} →</button>
        ) : (
          <button onClick={() => setStep('welcome')} className="rounded-full px-4 py-2.5 text-sm font-bold text-ink-muted transition hover:bg-ivory-100 hover:text-ink">Start over</button>
        )}
      </nav>

      <DesignAssistantPanel />
    </div>
  );
}
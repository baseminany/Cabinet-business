import { useStore, makerEnabled, type Step } from './store';
import Scene from './scene/Scene';
import RoomStep from './steps/RoomStep';
import OpeningsStep from './steps/OpeningsStep';
import PiecesStep from './steps/PiecesStep';
import QuoteStep from './steps/QuoteStep';

type WStep = 'room' | 'openings' | 'pieces' | 'quote';

const META: Record<WStep, { title: string; subtitle: string }> = {
  room: { title: 'Your room', subtitle: 'Start with the space your pieces will live in.' },
  openings: { title: 'Windows & doors', subtitle: 'Add anything near your built-ins.' },
  pieces: { title: 'Your pieces', subtitle: 'Add cabinets and shelves, then size each one.' },
  quote: { title: 'Your quote', subtitle: 'Everything that goes into it.' },
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
  const nextLabel = order[idx + 1] === 'quote' ? 'See my quote' : 'Continue';

  return (
    <div className="flex h-full min-h-0 flex-col bg-ivory">
      <header className="flex items-center justify-between gap-4 border-b border-ivory-200 bg-ivory-50/80 px-4 py-3 backdrop-blur sm:px-6">
        <span className="font-display text-lg font-semibold tracking-tight text-ink">Studio</span>
        <div className="flex flex-1 items-center justify-center gap-2">
          <div className="h-1.5 w-full max-w-[220px] overflow-hidden rounded-full bg-ivory-200">
            <div className="h-full rounded-full bg-clay-600 transition-all" style={{ width: `${((idx + 1) / order.length) * 100}%` }} />
          </div>
          <span className="hidden whitespace-nowrap text-xs font-medium text-ink-muted sm:inline">Step {idx + 1} of {order.length}</span>
        </div>
        {makerEnabled() ? (
          <button onClick={() => setView('maker')} className="text-xs font-medium text-ink-muted transition hover:text-clay-700">Maker</button>
        ) : (
          <span className="w-10" />
        )}
      </header>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="relative h-[42vh] w-full shrink-0 md:h-auto md:flex-1" style={{ background: 'radial-gradient(120% 90% at 50% 12%, #fcf8f1 0%, #f0e6d6 60%, #e7d8be 100%)' }}>
          <Scene />
        </div>

        <aside className="nice-scroll flex min-h-0 flex-1 flex-col overflow-y-auto border-t border-ivory-200 bg-ivory-50 md:w-[400px] md:flex-none md:border-l md:border-t-0">
          <div key={step} className="fade-up flex-1 p-5 sm:p-6">
            <h2 className="font-display text-2xl font-semibold text-ink">{meta.title}</h2>
            <p className="mt-1 mb-5 text-sm text-ink-muted">{meta.subtitle}</p>
            {step === 'room' && <RoomStep />}
            {step === 'openings' && <OpeningsStep />}
            {step === 'pieces' && <PiecesStep />}
            {step === 'quote' && <QuoteStep />}
          </div>
        </aside>
      </div>

      <nav className="flex items-center justify-between gap-3 border-t border-ivory-200 bg-white px-4 py-3 sm:px-6">
        <button onClick={goBack} className="rounded-full px-4 py-2.5 text-sm font-semibold text-ink-soft transition hover:bg-ivory-100">← Back</button>
        {step !== 'quote' ? (
          <button onClick={goNext} className="rounded-full bg-clay-600 px-7 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-clay-700 active:scale-95">{nextLabel} →</button>
        ) : (
          <button onClick={() => setStep('welcome')} className="rounded-full px-4 py-2.5 text-sm font-semibold text-ink-muted transition hover:bg-ivory-100">Start over</button>
        )}
      </nav>
    </div>
  );
}

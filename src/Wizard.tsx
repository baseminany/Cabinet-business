import { useEffect } from 'react';
import { useStore, makerEnabled, type Step, type CameraPreset } from './store';
import Scene from './scene/Scene';
import RoomStep from './steps/RoomStep';
import OpeningsStep from './steps/OpeningsStep';
import PiecesStep from './steps/PiecesStep';
import QuoteStep from './steps/QuoteStep';
import DesignAssistantPanel from './components/DesignAssistantPanel';
import LivePriceBar from './components/LivePriceBar';

type WStep = 'room' | 'openings' | 'pieces' | 'quote';

const META: Record<WStep, { eyebrow: string; title: string; subtitle: string }> = {
  room: { eyebrow: '01 · Space', title: 'Fit the nook to your space.', subtitle: 'Start with a wall or simple room so the module has a real home.' },
  openings: { eyebrow: '02 · Openings', title: 'Mark what we need to avoid.', subtitle: 'Add only windows and doors that affect the nook system.' },
  pieces: { eyebrow: '03 · Nook system', title: 'Choose the pieces.', subtitle: 'Start with a shippable module and open advanced details only when needed.' },
  quote: { eyebrow: '04 · Estimate', title: 'Review the starting estimate.', subtitle: 'A planning estimate before measurement, shipping, and final shop review.' },
};

export default function Wizard() {
  const step = useStore((s) => s.step) as WStep;
  const setStep = useStore((s) => s.setStep);
  const roomEnabled = useStore((s) => s.room.enabled);
  const setView = useStore((s) => s.setView);
  const resetProject = useStore((s) => s.resetProject);
  const cameraPreset = useStore((s) => s.cameraPreset);
  const setCameraPreset = useStore((s) => s.setCameraPreset);
  const selectedId = useStore((s) => s.selectedId);
  const removeUnit = useStore((s) => s.removeUnit);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (!selectedId) return;
      e.preventDefault();
      removeUnit(selectedId);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId, removeUnit]);
  const order: WStep[] = roomEnabled ? ['room', 'openings', 'pieces', 'quote'] : ['pieces', 'quote'];
  const idx = Math.max(0, order.indexOf(step));
  const meta = META[step];
  const goBack = () => (idx === 0 ? setStep('entry' as Step) : setStep(order[idx - 1]));
  const goNext = () => idx < order.length - 1 && setStep(order[idx + 1]);
  const nextLabel = order[idx + 1] === 'quote' ? 'See estimate' : 'Continue';
  const presets: CameraPreset[] = ['perspective', 'front', 'top'];

  return (
    <div className="flex h-full min-h-0 flex-col bg-[linear-gradient(180deg,#fffdf8,#f4eadb)] text-ink">
      <header className="flex items-center justify-between gap-4 border-b border-champagne/30 bg-warmWhite/92 px-4 py-3 text-ink backdrop-blur sm:px-6">
        <button onClick={() => setStep('welcome')} className="text-sm font-black uppercase tracking-[0.22em] text-ink">House of Nook</button>
        <div className="hidden flex-1 items-center justify-center gap-3 sm:flex">
          <div className="h-1.5 w-full max-w-[260px] overflow-hidden rounded-full bg-champagne/25"><div className="h-full rounded-full bg-brass transition-all" style={{ width: `${((idx + 1) / order.length) * 100}%` }} /></div>
          <span className="whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.14em] text-ink-muted">Step {idx + 1} of {order.length}</span>
        </div>
        <div className="flex items-center gap-3">
          {makerEnabled() && <button onClick={() => setView('maker')} className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-muted transition hover:text-brass">Maker</button>}
          <button onClick={resetProject} className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-muted transition hover:text-brass">Reset</button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col bg-warmWhite md:flex-row">
        <div className="relative h-[46vh] w-full shrink-0 bg-[#f2eadb] md:h-auto md:flex-1">
          <Scene />
          <div className="absolute left-4 top-4 z-10 flex gap-1 rounded-full border border-champagne/40 bg-warmWhite/85 p-1 shadow-soft backdrop-blur">
            {presets.map((p) => <button key={p} onClick={() => setCameraPreset(p)} className={'rounded-full px-3 py-1.5 text-[11px] font-bold capitalize transition ' + (cameraPreset === p ? 'bg-walnut text-porcelain' : 'text-ink-muted hover:bg-porcelain')}>{p}</button>)}
          </div>
          <div className="scene-vignette" />
        </div>

        <aside className="nice-scroll flex min-h-0 flex-1 flex-col overflow-y-auto border-t border-champagne/25 bg-[linear-gradient(180deg,#fffdf8,#f7f3ea)] md:w-[440px] md:flex-none md:border-l md:border-t-0">
          <div key={step} className="fade-up flex-1 p-5 sm:p-7">
            <p className="eyebrow text-brass">{meta.eyebrow}</p>
            <h2 className="mt-2 text-4xl font-semibold leading-[0.96] tracking-[-0.045em] text-ink">{meta.title}</h2>
            <p className="mb-6 mt-3 text-sm leading-6 text-ink-muted">{meta.subtitle}</p>
            {step === 'room' && <RoomStep />}
            {step === 'openings' && <OpeningsStep />}
            {step === 'pieces' && <PiecesStep />}
            {step === 'quote' && <QuoteStep />}
          </div>
        </aside>
      </div>

      <LivePriceBar />

      <nav className="flex items-center justify-between gap-3 border-t border-champagne/25 bg-warmWhite px-4 py-3 sm:px-6"><button onClick={goBack} className="rounded-full px-4 py-2.5 text-sm font-bold text-ink-muted transition hover:bg-porcelain hover:text-ink">← Back</button>{step !== 'quote' ? <button onClick={goNext} className="premium-button px-7 py-2.5 text-sm">{nextLabel} →</button> : <button onClick={resetProject} className="rounded-full px-4 py-2.5 text-sm font-bold text-ink-muted transition hover:bg-porcelain hover:text-ink">Start new plan</button>}</nav>
      <DesignAssistantPanel />
    </div>
  );
}

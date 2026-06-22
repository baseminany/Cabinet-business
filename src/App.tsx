import { useStore, makerEnabled } from './store';
import Welcome from './screens/Welcome';
import EntryChoice from './screens/EntryChoice';
import Intake from './screens/Intake';
import ShopPrebuilt from './screens/ShopPrebuilt';
import PhotoRoomReviewStep from './steps/PhotoRoomReviewStep';
import Wizard from './Wizard';
import Scene from './scene/Scene';
import RightPanel from './RightPanel';
import ErrorBoundary from './components/ErrorBoundary';
import DesignAssistantPanel from './components/DesignAssistantPanel';

function AppInner() {
  const view = useStore((s) => s.view);
  const step = useStore((s) => s.step);
  const setView = useStore((s) => s.setView);
  const setStep = useStore((s) => s.setStep);

  if (view === 'maker' && makerEnabled()) {
    return (
      <div className="flex h-full min-h-0 flex-col bg-ivory text-ink">
        <header className="flex items-center justify-between border-b border-champagne/30 bg-warmWhite px-5 py-3">
          <span className="text-lg font-semibold text-ink">House of Nook · Maker</span>
          <button onClick={() => setView('design')} className="rounded-full px-4 py-2 text-sm font-semibold text-ink-soft transition hover:bg-porcelain">← Back to planner</button>
        </header>
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <main className="relative h-[40vh] min-w-0 flex-1 md:h-auto" style={{ background: 'radial-gradient(120% 90% at 50% 12%, #fffdf8 0%, #f4eadb 60%, #e4d3b8 100%)' }}><Scene /></main>
          <RightPanel />
        </div>
      </div>
    );
  }

  if (step === 'welcome') return <div className="flex h-full min-h-0 flex-col"><Welcome /></div>;
  if (step === 'intake') return <div className="flex h-full min-h-0 flex-col"><Intake /></div>;
  if (step === 'entry') return <div className="flex h-full min-h-0 flex-col"><EntryChoice /></div>;
  if (step === 'shop') return <div className="flex h-full min-h-0 flex-col"><ShopPrebuilt /></div>;
  if (step === 'photoReview') return (
    <div className="flex h-full min-h-0 flex-col bg-[linear-gradient(180deg,#fffdf8,#f4eadb)] text-ink">
      <header className="flex items-center justify-between gap-4 border-b border-champagne/30 bg-warmWhite/92 px-4 py-3 backdrop-blur sm:px-6">
        <button onClick={() => setStep('welcome')} className="text-sm font-black uppercase tracking-[0.22em] text-ink">House of Nook</button>
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brass">AI room scan</span>
      </header>
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="relative h-[46vh] w-full shrink-0 bg-[#f2eadb] md:h-auto md:flex-1">
          <Scene />
          <div className="scene-vignette" />
          <div className="absolute left-3 top-3 z-10 rounded-2xl border border-champagne/40 bg-warmWhite/90 px-3 py-2 text-[11px] font-semibold text-ink-muted shadow-soft backdrop-blur">
            AI-generated room — confirm below
          </div>
        </div>
        <aside className="nice-scroll flex min-h-0 flex-1 flex-col overflow-y-auto border-t border-champagne/25 bg-[linear-gradient(180deg,#fffdf8,#f7f3ea)] md:w-[440px] md:flex-none md:border-l md:border-t-0">
          <PhotoRoomReviewStep />
        </aside>
      </div>
      <DesignAssistantPanel />
    </div>
  );
  return <Wizard />;
}

export default function App() { return <ErrorBoundary><AppInner /></ErrorBoundary>; }

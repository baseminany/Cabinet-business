import { useStore, makerEnabled } from './store';
import Welcome from './screens/Welcome';
import EntryChoice from './screens/EntryChoice';
import PhotoRoomReviewStep from './steps/PhotoRoomReviewStep';
import Wizard from './Wizard';
import Scene from './scene/Scene';
import RightPanel from './RightPanel';
import ErrorBoundary from './components/ErrorBoundary';

function AppInner() {
  const view = useStore((s) => s.view);
  const step = useStore((s) => s.step);
  const setView = useStore((s) => s.setView);

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
  if (step === 'entry') return <div className="flex h-full min-h-0 flex-col"><EntryChoice /></div>;
  if (step === 'photoReview') return <div className="flex h-full min-h-0 flex-col"><PhotoRoomReviewStep /></div>;
  return <Wizard />;
}

export default function App() { return <ErrorBoundary><AppInner /></ErrorBoundary>; }

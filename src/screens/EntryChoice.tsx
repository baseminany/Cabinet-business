import { useRef, useState, type ReactNode } from 'react';
import { useStore, type Step } from '../store';

export default function EntryChoice() {
  const setStep = useStore((s) => s.setStep);
  const setRoom = useStore((s) => s.setRoom);
  const setRoomPhoto = useStore((s) => s.setRoomPhoto);
  const shopCategory = useStore((s) => s.shopCategory);
  const openShop = useStore((s) => s.openShop);
  const startBlankRoom = useStore((s) => s.startBlankRoom);
  const resetProject = useStore((s) => s.resetProject);
  const roomPhoto = useStore((s) => s.roomPhoto);
  const savedUnits = useStore((s) => s.units);
  const savedStep = useStore((s) => s.step) as Step;
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  // Accept the photo as a backdrop reference and go straight to the planner.
  // No AI call — works everywhere, including production.
  const handleFile = (file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setRoomPhoto(reader.result);
      setRoom({ enabled: true, openings: [] });
      setStep('room');
    };
    reader.readAsDataURL(file);
  };

  const hasSavedDesign = savedUnits.length > 0;
  const resumeStep: Step = (['room', 'openings', 'pieces', 'quote'] as Step[]).includes(savedStep) ? savedStep : 'pieces';

  return (
    <div className="nice-scroll min-h-0 flex-1 overflow-y-auto bg-[linear-gradient(180deg,#fffdf8,#f4eadb)] px-6 py-8 text-ink sm:px-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <button onClick={() => setStep('welcome')} className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-muted transition hover:text-brass">← House of Nook</button>
        <span className="rounded-full border border-champagne/40 bg-white/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted">Planner</span>
      </div>

      {hasSavedDesign && (
        <div className="mx-auto mt-6 max-w-6xl">
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-brass/30 bg-[#fffbf0] px-5 py-4 shadow-soft">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brass">Saved design</p>
              <p className="mt-0.5 text-sm font-semibold text-ink">You have {savedUnits.length} module{savedUnits.length !== 1 ? 's' : ''} from a previous session.</p>
            </div>
            <div className="flex shrink-0 gap-3">
              <button onClick={() => resetProject()} className="rounded-full border border-champagne/50 px-4 py-2 text-xs font-bold text-ink-muted transition hover:border-red-300 hover:text-red-500">Clear</button>
              <button onClick={() => setStep(resumeStep)} className="rounded-full bg-walnut px-5 py-2 text-xs font-bold text-porcelain shadow-soft transition hover:bg-obsidian">Resume →</button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto grid max-w-6xl items-end gap-10 pb-12 pt-12 lg:grid-cols-[0.9fr_1.1fr] lg:pt-20">
        <div className="fade-up">
          <p className="eyebrow text-brass">{shopCategory && shopCategory !== 'All' ? `${shopCategory} · fit it to your space` : 'Start with the least friction'}</p>
          <h1 className="mt-5 text-5xl font-semibold leading-[0.94] tracking-[-0.05em] text-ink sm:text-7xl">Fit it to your space.</h1>
          <p className="mt-6 max-w-md text-base leading-8 text-ink-soft">Start from a ready-made design, use a photo of your room as reference, or build a simple wall to size it exactly. Nothing is locked in.</p>
          <button onClick={() => openShop(shopCategory)} className="mt-7 inline-flex items-center gap-2 rounded-full bg-walnut px-5 py-3 text-sm font-bold text-porcelain shadow-soft transition hover:bg-obsidian">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 2 3 6v14a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V6l-3-4z" /><path d="M3 6h18M16 10a4 4 0 0 1-8 0" /></svg>
            Start from a ready-made {shopCategory && shopCategory !== 'All' ? shopCategory.toLowerCase() : ''} design →
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }} className={'premium-card relative flex min-h-[22rem] flex-col p-6 text-ink transition ' + (dragOver ? 'ring-2 ring-brass' : '')}>
            <span className="absolute right-4 top-4 rounded-full bg-deepGreen px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-porcelain">Reference</span>
            <IconShell><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="11" r="2" /><path d="m4 18 5-4 4 3 3-2 4 3" /></svg></IconShell>
            <h2 className="mt-5 text-2xl font-black tracking-tight">Upload a space photo</h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-ink-muted">Drop in a photo of your room to use as a reference while you size and place your nook. (Live in-photo previews are coming soon.)</p>
            {roomPhoto && <img src={roomPhoto} alt="room" className="mt-4 h-24 w-full rounded-2xl object-cover ring-1 ring-champagne/40" />}
            <button onClick={() => fileRef.current?.click()} className="premium-button mt-5 px-4 py-3 text-sm">Upload photo</button>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
          </div>

          <EntryCard icon={<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" /><path d="M9 21v-6h6v6" /></svg>} title="Plan against a wall" body="Start with a blank wall or simple room, then add doors, windows, and the nook system." cta="Start blank" onClick={startBlankRoom} />

          <EntryCard icon={<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="5" y="3" width="14" height="18" rx="1.5" /><line x1="12" y1="3" x2="12" y2="21" /></svg>} title="Start with a module" body="Skip the room and create a mudroom bench, coffee hutch, shelf wall, or storage piece by size." cta="Choose a module" onClick={() => { setRoom({ enabled: false, openings: [] }); setStep('pieces'); }} />
        </div>
      </div>
    </div>
  );
}

function IconShell({ children }: { children: ReactNode }) {
  return <div className="inline-flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-champagne/35 text-walnut ring-1 ring-brass/20">{children}</div>;
}

function EntryCard({ icon, title, body, cta, onClick }: { icon: ReactNode; title: string; body: string; cta: string; onClick: () => void }) {
  return <div className="premium-card flex min-h-[22rem] flex-col p-6 text-ink"><IconShell>{icon}</IconShell><h2 className="mt-5 text-2xl font-black tracking-tight">{title}</h2><p className="mt-2 flex-1 text-sm leading-6 text-ink-muted">{body}</p><button onClick={onClick} className="mt-5 rounded-full border border-brass/35 px-4 py-3 text-sm font-bold text-walnut transition hover:border-walnut hover:bg-walnut hover:text-porcelain">{cta}</button></div>;
}

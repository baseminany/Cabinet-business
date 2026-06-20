import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useStore } from '../store';

export default function EntryChoice() {
  const setStep = useStore((s) => s.setStep);
  const setRoom = useStore((s) => s.setRoom);
  const analyze = useStore((s) => s.analyzeRoomPhoto);
  const applyRes = useStore((s) => s.applyRoomAnalysis);
  const status = useStore((s) => s.roomScanStatus);
  const error = useStore((s) => s.roomScanError);
  const result = useStore((s) => s.roomAnalysisResult);
  const roomPhoto = useStore((s) => s.roomPhoto);
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (status === 'success' && result) {
      applyRes(result);
      setStep('photoReview');
    }
  }, [status, result, applyRes, setStep]);

  const handleFile = (file?: File | null) => {
    if (file) analyze(file);
  };

  return (
    <div className="luxury-shell nice-scroll min-h-0 flex-1 overflow-y-auto px-6 py-8 text-porcelain sm:px-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <button onClick={() => setStep('welcome')} className="text-[11px] font-bold uppercase tracking-[0.18em] text-porcelain/50 transition hover:text-champagne">← Studio</button>
        <span className="rounded-full border border-champagne/18 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-porcelain/45">Setup</span>
      </div>

      <div className="mx-auto grid max-w-6xl items-end gap-10 pb-12 pt-12 lg:grid-cols-[0.9fr_1.1fr] lg:pt-20">
        <div className="fade-up">
          <p className="eyebrow text-champagne">A simpler start</p>
          <h1 className="mt-5 text-5xl font-black leading-[0.92] tracking-[-0.05em] text-warmWhite sm:text-7xl">How should we map your space?</h1>
          <p className="mt-6 max-w-md text-base leading-8 text-porcelain/62">
            Start from a photo, draw the room yourself, or skip straight to cabinetry. Every path stays editable.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
            className={'premium-card relative flex min-h-[22rem] flex-col p-6 text-ink transition ' + (dragOver ? 'ring-2 ring-brass' : '')}
          >
            <span className="absolute right-4 top-4 rounded-full bg-deepGreen px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-porcelain">Fastest</span>
            <IconShell>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="11" r="2" /><path d="m4 18 5-4 4 3 3-2 4 3" /></svg>
            </IconShell>
            <h2 className="mt-5 text-2xl font-black tracking-tight">Start from a photo</h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-ink-muted">
              Studio creates a room draft, finds visible openings, and asks you to confirm the measurements that matter.
            </p>

            {roomPhoto && status !== 'idle' && <img src={roomPhoto} alt="room" className="mt-4 h-24 w-full rounded-2xl object-cover ring-1 ring-champagne/40" />}

            <button onClick={() => fileRef.current?.click()} disabled={status === 'analyzing'} className="premium-button mt-5 px-4 py-3 text-sm disabled:opacity-60">
              {status === 'analyzing' ? 'Analyzing…' : 'Analyze my photo'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />

            {status === 'error' && (
              <div className="mt-4 rounded-2xl bg-parchment/70 p-3 text-xs leading-5 text-ink-soft ring-1 ring-brass/30">
                {error}
                <button onClick={() => { setRoom({ enabled: true }); setStep('room'); }} className="mt-2 block font-bold text-walnut underline-offset-4 hover:underline">
                  Use this photo as reference →
                </button>
              </div>
            )}
          </div>

          <EntryCard
            icon={<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" /><path d="M9 21v-6h6v6" /></svg>}
            title="Draw the room"
            body="Choose a room shape, enter wall lengths, and place windows or doors."
            cta="Build manually"
            onClick={() => { setRoom({ enabled: true }); setStep('room'); }}
          />

          <EntryCard
            icon={<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="5" y="3" width="14" height="18" rx="1.5" /><line x1="12" y1="3" x2="12" y2="21" /></svg>}
            title="Design a piece"
            body="Skip the room and create a cabinet, shelf, or pantry by size."
            cta="Start with a piece"
            onClick={() => { setRoom({ enabled: false }); setStep('pieces'); }}
          />
        </div>
      </div>
    </div>
  );
}

function IconShell({ children }: { children: ReactNode }) {
  return <div className="inline-flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-champagne/35 text-walnut ring-1 ring-brass/20">{children}</div>;
}

function EntryCard({ icon, title, body, cta, onClick }: { icon: ReactNode; title: string; body: string; cta: string; onClick: () => void }) {
  return (
    <div className="premium-card flex min-h-[22rem] flex-col p-6 text-ink">
      <IconShell>{icon}</IconShell>
      <h2 className="mt-5 text-2xl font-black tracking-tight">{title}</h2>
      <p className="mt-2 flex-1 text-sm leading-6 text-ink-muted">{body}</p>
      <button onClick={onClick} className="mt-5 rounded-full border border-brass/35 px-4 py-3 text-sm font-bold text-walnut transition hover:border-walnut hover:bg-walnut hover:text-porcelain">{cta}</button>
    </div>
  );
}

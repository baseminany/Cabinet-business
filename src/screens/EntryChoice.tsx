import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';

// How should we map your space? Photo (analysis-ready, honest fallback), manual,
// or skip to a piece. High-end and easy.
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

  // Auto-advance to review when a real analysis succeeds.
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
    <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-10" style={{ background: 'radial-gradient(130% 100% at 50% -10%, #fdf9f2 0%, #f3ece0 55%, #ece1cf 100%)' }}>
      <div className="w-full max-w-4xl fade-up text-center">
        <h1 className="font-display text-4xl font-semibold text-ink">How should we map your space?</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-ink-muted">
          Start from a photo, draw the room yourself, or skip straight to a piece. You can adjust everything later.
        </p>

        <div className="mt-9 grid gap-4 text-left md:grid-cols-3">
          {/* Photo */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
            className={'premium-card relative flex flex-col p-6 transition ' + (dragOver ? 'ring-2 ring-gold-400' : '')}
          >
            <span className="absolute right-4 top-4 rounded-full bg-espresso px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-porcelain">Fastest</span>
            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-300/25 text-gold-600 ring-1 ring-gold-300/40">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="11" r="2" /><path d="m4 18 5-4 4 3 3-2 4 3" /></svg>
            </div>
            <h2 className="font-display text-xl font-semibold text-ink">Upload a room photo</h2>
            <p className="mt-1 flex-1 text-sm text-ink-muted">
              Studio creates a room draft, finds visible openings, and asks you to confirm the measurements that matter.
            </p>

            {roomPhoto && status !== 'idle' && (
              <img src={roomPhoto} alt="room" className="mt-3 h-24 w-full rounded-xl object-cover ring-1 ring-ivory-200" />
            )}

            <button
              onClick={() => fileRef.current?.click()}
              disabled={status === 'analyzing'}
              className="premium-button mt-4 px-4 py-2.5 text-sm disabled:opacity-60"
            >
              {status === 'analyzing' ? 'Analyzing…' : 'Analyze my photo'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />

            {status === 'error' && (
              <div className="mt-3 rounded-xl bg-parchment/60 p-3 text-xs text-ink-soft ring-1 ring-gold-300/40">
                {error}
                <button onClick={() => { setRoom({ enabled: true }); setStep('room'); }} className="mt-2 block font-semibold text-gold-600 underline-offset-2 hover:underline">
                  Use this photo as a reference → shape the room
                </button>
              </div>
            )}
          </div>

          {/* Manual */}
          <EntryCard
            icon={<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" /><path d="M9 21v-6h6v6" /></svg>}
            title="Build the room manually"
            body="Choose a room shape and enter your wall lengths."
            cta="Draw my room"
            onClick={() => { setRoom({ enabled: true }); setStep('room'); }}
          />

          {/* Piece only */}
          <EntryCard
            icon={<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="5" y="3" width="14" height="18" rx="1.5" /><line x1="12" y1="3" x2="12" y2="21" /></svg>}
            title="Design a piece only"
            body="Skip the room and create a cabinet, shelf, or pantry by size."
            cta="Start with a piece"
            onClick={() => { setRoom({ enabled: false }); setStep('pieces'); }}
          />
        </div>

        <button onClick={() => useStore.getState().setStep('welcome')} className="mt-7 text-sm font-medium text-ink-muted underline-offset-4 transition hover:text-ink-soft hover:underline">
          ← Back
        </button>
      </div>
    </div>
  );
}

function EntryCard({ icon, title, body, cta, onClick }: { icon: React.ReactNode; title: string; body: string; cta: string; onClick: () => void }) {
  return (
    <div className="premium-card flex flex-col p-6">
      <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-300/25 text-gold-600 ring-1 ring-gold-300/40">{icon}</div>
      <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
      <p className="mt-1 flex-1 text-sm text-ink-muted">{body}</p>
      <button onClick={onClick} className="premium-button-secondary mt-4 px-4 py-2.5 text-sm" style={{ color: '#2e1c12', borderColor: 'rgba(184,138,68,0.5)' }}>{cta}</button>
    </div>
  );
}

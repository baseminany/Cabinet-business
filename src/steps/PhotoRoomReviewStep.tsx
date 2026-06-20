import { useStore } from '../store';

// Shown after a successful photo analysis. The result is already applied to the
// room; here the customer confirms the starting layout + measurements. Honest
// language: a STARTING draft, not an exact measurement.
export default function PhotoRoomReviewStep() {
  const result = useStore((s) => s.roomAnalysisResult);
  const photo = useStore((s) => s.roomPhoto);
  const setStep = useStore((s) => s.setStep);
  const resetScan = useStore((s) => s.resetRoomScan);

  if (!result) {
    // Shouldn't happen, but never strand the user.
    setStep('room');
    return null;
  }

  return (
    <div className="nice-scroll min-h-0 flex-1 overflow-y-auto px-6 py-10" style={{ background: 'radial-gradient(130% 100% at 50% -10%, #fdf9f2 0%, #f3ece0 100%)' }}>
      <div className="mx-auto max-w-3xl fade-up">
        <p className="eyebrow text-gold-600">From your photo</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink">We created a starting layout</h1>
        <p className="mt-2 text-sm text-ink-muted">Confirm these before ordering — we’ll verify exact measurements during shop review.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-[200px_1fr]">
          {photo && <img src={photo} alt="your room" className="h-44 w-full rounded-card object-cover ring-1 ring-ivory-200" />}
          <div className="premium-card p-5">
            <p className="text-sm text-ink-soft">{result.summary}</p>
            <p className="mt-2 text-xs text-ink-muted">Confidence: {Math.round(result.confidence * 100)}%</p>
            {result.assumptions.length > 0 && (
              <ul className="mt-3 list-disc space-y-1 pl-4 text-xs text-ink-muted">
                {result.assumptions.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            )}
          </div>
        </div>

        {result.requiredMeasurements.length > 0 && (
          <div className="premium-card mt-4 p-5">
            <h2 className="font-display text-lg font-semibold text-ink">Confirm these measurements</h2>
            <div className="mt-3 space-y-2">
              {result.requiredMeasurements.map((m) => (
                <div key={m.key} className="flex items-center justify-between text-sm">
                  <span className="text-ink-soft">{m.label}<span className="ml-2 text-xs text-ink-muted">{m.reason}</span></span>
                  <span className="font-semibold text-ink">{m.value ?? '—'} {m.unit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-7 flex flex-wrap gap-3">
          <button onClick={() => setStep('pieces')} className="premium-button px-6 py-3 text-sm">Looks right — continue</button>
          <button onClick={() => setStep('room')} className="premium-button-secondary px-5 py-3 text-sm" style={{ color: '#2e1c12', borderColor: 'rgba(184,138,68,0.5)' }}>Edit room manually</button>
          <button onClick={() => { resetScan(); setStep('entry'); }} className="px-5 py-3 text-sm font-semibold text-ink-muted hover:text-ink-soft">Retake photo</button>
        </div>
      </div>
    </div>
  );
}

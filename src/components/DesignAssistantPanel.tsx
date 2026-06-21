import { useRef, useState } from 'react';
import { askAssistant, AssistantUnavailableError } from '../services/designAssistant';
import { buildContext, executeDesignActions } from '../assistant/actions';

type Msg = { role: 'you' | 'studio'; text: string };

const CHIPS = [
  'Add a 36" base under the window',
  'Add a tall pantry on the left wall',
  'Make the doors walnut',
  'Add floating shelves above the base',
];

// Action-based AI design assistant. Type a request; the backend returns
// structured actions that are applied to the real design. Honest when the
// backend isn't connected.
export default function DesignAssistantPanel() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState('');
  const [log, setLog] = useState<Msg[]>([{ role: 'studio', text: 'Tell me what to build — e.g. “add a 36-inch base cabinet under the window.”' }]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const send = async (text: string) => {
    const msg = text.trim();
    if (!msg || busy) return;
    setInput('');
    setLog((l) => [...l, { role: 'you', text: msg }]);
    setBusy(true);
    try {
      const resp = await askAssistant(msg, buildContext());
      const warnings = executeDesignActions(resp.actions);
      const extra = [...(resp.questions ?? []), ...warnings, ...(resp.warnings ?? [])];
      setLog((l) => [...l, { role: 'studio', text: resp.message + (extra.length ? '\n\n• ' + extra.join('\n• ') : '') }]);
    } catch (e) {
      const text = e instanceof AssistantUnavailableError
        ? 'The AI designer isn’t connected yet. Once the assistant endpoint + key are set up, I can add and arrange pieces for you. For now, use the panel on the right.'
        : `Sorry — ${(e as Error).message}`;
      setLog((l) => [...l, { role: 'studio', text }]);
    } finally {
      setBusy(false);
      requestAnimationFrame(() => scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight));
    }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="fixed bottom-20 right-4 z-30 flex items-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-semibold text-white shadow-lift transition hover:bg-black sm:bottom-6">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3a9 9 0 0 0-9 9 8.8 8.8 0 0 0 1.2 4.5L3 21l4.7-1.2A9 9 0 1 0 12 3z" /></svg>
        Ask Studio
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-30 flex h-[28rem] w-[22rem] max-w-[calc(100vw-2rem)] flex-col rounded-3xl bg-white shadow-card ring-1 ring-black/10">
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
        <span className="text-sm font-bold text-ink">Studio · AI designer</span>
        <button onClick={() => setOpen(false)} className="text-neutral-400 hover:text-ink">✕</button>
      </div>
      <div ref={scrollRef} className="nice-scroll flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {log.map((m, i) => (
          <div key={i} className={m.role === 'you' ? 'text-right' : ''}>
            <div className={'inline-block max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm ' + (m.role === 'you' ? 'bg-ink text-white' : 'bg-neutral-100 text-ink-soft')}>{m.text}</div>
          </div>
        ))}
        {busy && <div className="text-xs text-neutral-400">Studio is thinking…</div>}
      </div>
      <div className="border-t border-neutral-200 p-3">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {CHIPS.map((c) => (
            <button key={c} onClick={() => send(c)} disabled={busy} className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] text-ink-soft transition hover:bg-neutral-200 disabled:opacity-50">{c}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send(input)} placeholder="Tell Studio what to build…" className="flex-1 rounded-full border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-ink" />
          <button onClick={() => send(input)} disabled={busy} className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Send</button>
        </div>
      </div>
    </div>
  );
}

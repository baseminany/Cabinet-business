import { useRef, useState } from 'react';
import { askAssistant, AssistantUnavailableError } from '../services/designAssistant';
import { generateRender, RenderUnavailableError } from '../services/renderGen';
import { buildContext, executeDesignActions } from '../assistant/actions';
import { useStore } from '../store';

type Msg = { role: 'you' | 'studio'; text: string; renderUrl?: string };

const CHIPS = [
  'Add a mudroom bench with locker',
  'Build a coffee nook hutch',
  'Add shelves above in sage green',
  'Make it white oak with brass pulls',
];

export default function DesignAssistantPanel() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'chat' | 'render'>('chat');
  const [busy, setBusy] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [input, setInput] = useState('');
  const [log, setLog] = useState<Msg[]>([{ role: 'studio', text: 'Tell me what nook to plan — I\'ll add the pieces and you can generate a photo render any time.' }]);
  const [latestRender, setLatestRender] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const units = useStore((s) => s.units);

  const scrollToBottom = () => requestAnimationFrame(() => scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight));

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
      scrollToBottom();
    } catch (e) {
      const errText = e instanceof AssistantUnavailableError
        ? 'The AI planner needs an API key to work. Add ANTHROPIC_API_KEY to your Netlify environment variables, then redeploy. For local dev, run `netlify dev` with a `.env` file.'
        : `Sorry — ${(e as Error).message}`;
      setLog((l) => [...l, { role: 'studio', text: errText }]);
      scrollToBottom();
    } finally {
      setBusy(false);
    }
  };

  const genRender = async () => {
    if (rendering || units.length === 0) return;
    setRendering(true);
    setTab('render');
    try {
      const { url } = await generateRender();
      setLatestRender(url);
      setLog((l) => [...l, { role: 'studio', text: 'Here\'s a photo render of your design. Each generation is unique — tap the camera again for a new angle or variation.', renderUrl: url }]);
    } catch (e) {
      const errText = e instanceof RenderUnavailableError
        ? 'Photo renders need an OpenAI API key. Add OPENAI_API_KEY to your Netlify environment variables.'
        : `Render failed — ${(e as Error).message}`;
      setLog((l) => [...l, { role: 'studio', text: errText }]);
      setTab('chat');
    } finally {
      setRendering(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-28 right-4 z-30 flex items-center gap-2 rounded-full bg-walnut px-4 py-3 text-sm font-semibold text-porcelain shadow-lift transition hover:bg-obsidian sm:bottom-24"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3a9 9 0 0 0-9 9 8.8 8.8 0 0 0 1.2 4.5L3 21l4.7-1.2A9 9 0 1 0 12 3z" /></svg>
        Ask Nook
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 z-30 flex w-[22rem] max-w-[calc(100vw-2rem)] flex-col rounded-3xl bg-warmWhite shadow-card ring-1 ring-champagne/45 sm:bottom-20" style={{ height: tab === 'render' && latestRender ? '34rem' : '28rem' }}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-champagne/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-ink">House of Nook · AI</span>
          <span className="rounded-full bg-deepGreen/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-deepGreen">Claude</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Render button */}
          <button
            onClick={genRender}
            disabled={rendering || units.length === 0}
            title={units.length === 0 ? 'Add modules first' : 'Generate a photorealistic render with DALL-E'}
            className="flex items-center gap-1.5 rounded-full border border-champagne/50 px-2.5 py-1 text-[11px] font-bold text-ink-muted transition hover:border-brass/60 hover:text-brass disabled:opacity-40"
          >
            {rendering
              ? <span className="animate-pulse">Rendering…</span>
              : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="11" r="2" /><path d="m4 18 5-4 4 3 3-2 4 3" /></svg>Render</>
            }
          </button>
          <button onClick={() => setOpen(false)} className="text-ink-muted hover:text-ink">✕</button>
        </div>
      </div>

      {/* Tab bar — only shown when a render exists */}
      {latestRender && (
        <div className="flex border-b border-champagne/20">
          {(['chat', 'render'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={'flex-1 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition ' + (tab === t ? 'border-b-2 border-brass text-brass' : 'text-ink-muted hover:text-ink')}
            >
              {t === 'chat' ? 'Chat' : 'Photo render'}
            </button>
          ))}
        </div>
      )}

      {/* Render tab */}
      {tab === 'render' && latestRender && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-4">
          <img src={latestRender} alt="AI-generated render of your nook" className="w-full rounded-2xl object-cover shadow-card" style={{ aspectRatio: '16/9' }} />
          <p className="text-center text-[11px] leading-5 text-ink-muted">Generated with DALL-E 3 · Not a final design rendering</p>
          <button
            onClick={genRender}
            disabled={rendering}
            className="rounded-full border border-champagne/50 px-4 py-2 text-xs font-bold text-ink-muted transition hover:border-brass hover:text-brass disabled:opacity-40"
          >
            {rendering ? 'Generating…' : 'Generate another →'}
          </button>
        </div>
      )}

      {/* Chat tab */}
      {tab === 'chat' && (
        <>
          <div ref={scrollRef} className="nice-scroll flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {log.map((m, i) => (
              <div key={i} className={m.role === 'you' ? 'text-right' : ''}>
                <div className={'inline-block max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm ' + (m.role === 'you' ? 'bg-walnut text-porcelain' : 'bg-porcelain text-ink-soft')}>
                  {m.text}
                </div>
                {m.renderUrl && (
                  <div className="mt-2">
                    <img src={m.renderUrl} alt="render" className="w-full rounded-xl" style={{ aspectRatio: '16/9', objectFit: 'cover' }} />
                  </div>
                )}
              </div>
            ))}
            {busy && <div className="text-xs text-ink-muted">Claude is thinking…</div>}
            {rendering && <div className="text-xs text-ink-muted">DALL-E is rendering…</div>}
          </div>

          <div className="border-t border-champagne/30 p-3">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {CHIPS.map((c) => (
                <button key={c} onClick={() => send(c)} disabled={busy} className="rounded-full bg-porcelain px-2.5 py-1 text-[11px] text-ink-soft transition hover:bg-parchment disabled:opacity-50">{c}</button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send(input)}
                placeholder="Design my nook…"
                className="flex-1 rounded-full border border-champagne/45 bg-warmWhite px-3 py-2 text-sm outline-none focus:border-brass"
              />
              <button onClick={() => send(input)} disabled={busy} className="rounded-full bg-walnut px-4 py-2 text-sm font-semibold text-porcelain disabled:opacity-50">→</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

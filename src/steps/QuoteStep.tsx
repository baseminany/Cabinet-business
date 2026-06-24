import { useMemo, useState } from 'react';
import { useStore } from '../store';
import { buildProject } from '../model/buildParts';
import { priceModel } from '../pricing/engine';
import { submitQuote, QuoteUnavailableError } from '../services/quote';

function money(n: number): string { return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }); }
function round25(n: number): number { return Math.max(0, Math.round(n / 25) * 25); }

const Check = () => <svg width="16" height="16" viewBox="0 0 16 16" className="mt-0.5 shrink-0 text-brass" fill="none"><path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;

type SubmitState = 'idle' | 'sending' | 'sent' | 'saved' | 'error';

export default function QuoteStep() {
  const units = useStore((s) => s.units);
  const result = useMemo(() => priceModel(buildProject(units)), [units]);
  const low = round25(result.customerPrice);
  const high = round25(result.customerPrice * 1.22);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [state, setState] = useState<SubmitState>('idle');
  const [errMsg, setErrMsg] = useState('');

  if (units.length === 0) return <p className="rounded-2xl border border-champagne/30 bg-warmWhite p-5 text-sm text-ink-muted">Add at least one module to see your starting estimate.</p>;

  const counts = units.reduce<Record<string, number>>((m, u) => ((m[u.type] = (m[u.type] || 0) + 1), m), {});
  const summary = Object.entries(counts).map(([t, n]) => `${n} ${t}${n > 1 ? 's' : ''}`).join(' · ');
  const includes = ['Modular parts sized for your plan', 'Visible finish selections in the review packet', 'Shop review before final production', 'Shipping / crate review before the final quote'];

  const emailValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
  const canSubmit = name.trim().length > 0 && emailValid && state !== 'sending';

  const submit = async () => {
    if (!canSubmit) return;
    setState('sending');
    setErrMsg('');
    try {
      const unitRequests = units.filter((u) => u.notes && u.notes.trim()).map((u) => `${u.label}: ${u.notes!.trim()}`);
      const combinedNotes = [notes.trim(), ...unitRequests].filter(Boolean).join('\n');
      const res = await submitQuote({
        contact: { name: name.trim(), email: email.trim(), phone: phone.trim() || undefined, notes: combinedNotes || undefined },
        estimate: { low, high },
        summary: `${units.length} module(s): ${summary}`,
        units,
      });
      setState(res.delivered ? 'sent' : 'saved');
    } catch (e) {
      if (e instanceof QuoteUnavailableError) { setState('saved'); return; }
      setErrMsg((e as Error).message || 'Something went wrong.');
      setState('error');
    }
  };

  const done = state === 'sent' || state === 'saved';

  return (
    <div className="space-y-5">
      {/* Price card */}
      <div className="premium-card overflow-hidden p-0">
        <div className="bg-[linear-gradient(135deg,#4b2e20,#211813)] p-6 text-porcelain">
          <p className="eyebrow text-champagne">Planning estimate</p>
          <div className="mt-3 text-5xl font-semibold tracking-[-0.05em] text-warmWhite">{money(low)} <span className="text-2xl text-porcelain/60">– {money(high)}</span></div>
          <p className="mt-3 text-sm leading-6 text-porcelain/68">Starting range from your current module plan. Final quote follows measurement, build review, crate size, and shipping.</p>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-ivory-100 px-3 py-1 text-[11px] font-bold text-ink-soft">{units.length} module{units.length > 1 ? 's' : ''}</span>
            {summary && <span className="rounded-full bg-ivory-100 px-3 py-1 text-[11px] font-bold capitalize text-ink-soft">{summary}</span>}
          </div>

          {done ? (
            <div className="mt-5 rounded-2xl bg-[#edf5ee] px-4 py-5 text-center ring-1 ring-deepGreen/20">
              <p className="text-base font-black text-deepGreen">Thanks, {name.split(' ')[0]}! Your design is saved.</p>
              <p className="mt-1.5 text-sm leading-6 text-ink-soft">Custom quotes aren't open online just yet. This saves your design and details so we can pick it right back up — check back as we launch.</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="mt-5 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Your name" value={name} onChange={setName} placeholder="Jordan Smith" required />
                <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@email.com" required />
              </div>
              <Field label="Phone (optional)" value={phone} onChange={setPhone} placeholder="(555) 123-4567" />
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted">Anything we should know? (optional)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Timeline, room details, finish ideas…" className="w-full resize-none rounded-2xl border border-champagne/45 bg-warmWhite px-3.5 py-2.5 text-sm outline-none transition focus:border-brass" />
              </div>
              {state === 'error' && <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 ring-1 ring-red-200">{errMsg}</p>}
              <button type="submit" disabled={!canSubmit} className="premium-button w-full px-5 py-4 text-base disabled:opacity-50">
                {state === 'sending' ? 'Saving…' : 'Save my design'}
              </button>
              <p className="text-center text-[11px] leading-5 text-ink-muted">No payment. For larger or fully-custom pieces — saves your design so we can quote it as we launch.</p>
            </form>
          )}
        </div>
      </div>

      {/* What's included */}
      <div className="premium-card p-6">
        <h3 className="text-xl font-black tracking-tight text-ink">What this includes</h3>
        <ul className="mt-4 space-y-3">{includes.map((line) => <li key={line} className="flex gap-2 text-sm leading-6 text-ink-soft"><Check /><span>{line}</span></li>)}</ul>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text', required }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted">{label}{required && <span className="text-brass"> *</span>}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-2xl border border-champagne/45 bg-warmWhite px-3.5 py-2.5 text-sm outline-none transition focus:border-brass" />
    </div>
  );
}

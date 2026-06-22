// =============================================================================
// QUOTE SUBMISSION (client adapter)
// =============================================================================
// Posts the customer's contact + design to /api/submit-quote. Throws
// QuoteUnavailableError when the endpoint isn't deployed so the UI can fall back
// to an honest "saved locally" message instead of pretending it sent.
// =============================================================================

import type { Unit } from '../model/types';

const ENDPOINT = '/api/submit-quote';

export class QuoteUnavailableError extends Error {}

export interface QuoteContact {
  name: string;
  email: string;
  phone?: string;
  notes?: string;
}

export interface QuoteSubmission {
  contact: QuoteContact;
  estimate?: { low: number; high: number };
  summary?: string;
  units: Unit[];
  renderUrl?: string;
}

export interface QuoteResult {
  ok: boolean;
  delivered: boolean;
}

export async function submitQuote(sub: QuoteSubmission, timeoutMs = 20000): Promise<QuoteResult> {
  const modules = sub.units.map((u) => ({
    label: u.label,
    type: u.type,
    w: Math.round(u.overall.width),
    h: Math.round(u.overall.height),
    d: Math.round(u.overall.depth),
  }));

  const payload = {
    contact: sub.contact,
    estimate: sub.estimate,
    summary: sub.summary,
    modules,
    renderUrl: sub.renderUrl,
    designJson: JSON.stringify(sub.units),
  };

  let res: Response;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
  } catch {
    throw new QuoteUnavailableError('Quote endpoint not reachable.');
  }

  if (res.status === 404 || res.status === 501) throw new QuoteUnavailableError('Quote endpoint not deployed.');
  if (!(res.headers.get('content-type') || '').includes('application/json')) throw new QuoteUnavailableError('Quote endpoint not deployed.');
  if (!res.ok) {
    let msg = `Quote submission failed (${res.status}).`;
    try { const j = await res.json(); if (j?.error) msg = j.error; } catch { /* ignore */ }
    throw new Error(msg);
  }
  return (await res.json()) as QuoteResult;
}

// =============================================================================
// /api/submit-quote — captures a customer's design + contact as a real lead
// =============================================================================
// No API key required. Delivery options, in priority order:
//   1. QUOTE_WEBHOOK_URL  — POST the lead as JSON to any webhook (Formspree,
//      Zapier "Catch Hook", Make, Discord, etc). This is the no-API-key path:
//      paste a free webhook URL into your Netlify env and you get the lead by
//      email/Slack/etc. with zero code.
//   2. Netlify function logs — if no webhook is set, the full lead is logged so
//      it is never silently lost; the response tells the client delivered:false.
// The owner always gets the lead; the customer always gets a clean confirmation.
// =============================================================================

export const config = { path: '/api/submit-quote' };

interface QuotePayload {
  contact: { name: string; email: string; phone?: string; notes?: string };
  estimate?: { low: number; high: number };
  summary?: string;
  modules?: { label: string; type: string; w: number; h: number; d: number }[];
  renderUrl?: string;
  designJson?: string;
}

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);

  let body: QuotePayload;
  try {
    body = (await req.json()) as QuotePayload;
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  const name = (body.contact?.name ?? '').trim().slice(0, 200);
  const email = (body.contact?.email ?? '').trim().slice(0, 200);
  if (!name || !email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ error: 'A name and a valid email are required.' }, 400);
  }

  // Build a clean, human-readable lead summary.
  const lines: string[] = [];
  lines.push(`New House of Nook quote request`);
  lines.push(`Name:  ${name}`);
  lines.push(`Email: ${email}`);
  if (body.contact?.phone) lines.push(`Phone: ${body.contact.phone.slice(0, 60)}`);
  if (body.estimate) lines.push(`Live estimate: $${body.estimate.low} – $${body.estimate.high}`);
  if (body.summary) lines.push(`Summary: ${body.summary.slice(0, 500)}`);
  if (body.modules?.length) {
    lines.push(`Modules (${body.modules.length}):`);
    for (const m of body.modules.slice(0, 40)) {
      lines.push(`  • ${m.label} [${m.type}] — ${m.w}"W × ${m.h}"H × ${m.d}"D`);
    }
  }
  if (body.contact?.notes) lines.push(`Notes: ${body.contact.notes.slice(0, 2000)}`);
  if (body.renderUrl) lines.push(`Render: ${body.renderUrl.slice(0, 500)}`);
  const text = lines.join('\n');

  const lead = {
    receivedAt: new Date().toISOString(),
    contact: { name, email, phone: body.contact?.phone ?? '', notes: body.contact?.notes ?? '' },
    estimate: body.estimate ?? null,
    summary: body.summary ?? '',
    modules: body.modules ?? [],
    renderUrl: body.renderUrl ?? '',
    designJson: body.designJson ?? '',
    text,
  };

  const webhook = process.env.QUOTE_WEBHOOK_URL;
  if (webhook) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 12000);
      const res = await fetch(webhook, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(lead),
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (res.ok) return json({ ok: true, delivered: true }, 200);
      console.error('[submit-quote] webhook returned', res.status);
    } catch (e: any) {
      console.error('[submit-quote] webhook error:', e?.message);
    }
    // Webhook failed — fall through to logging so the lead is still captured.
  }

  // No webhook (or it failed): log the full lead so the owner can recover it.
  console.log('[submit-quote] LEAD CAPTURED (set QUOTE_WEBHOOK_URL to auto-deliver):\n' + text);
  return json({ ok: true, delivered: !!webhook }, 200);
};

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
}

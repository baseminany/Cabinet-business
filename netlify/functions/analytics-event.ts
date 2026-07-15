import { getStore } from '@netlify/blobs';

export const config = { path: '/api/analytics-event' };
const ALLOWED = new Set(['landing_view', 'shop_view', 'category_selected', 'product_view', 'checkout_started', 'checkout_blocked', 'quote_view', 'quote_submitted', 'order_completed']);

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') return new Response('POST only', { status: 405 });
  let b: any;
  try { b = await req.json(); } catch { return new Response('Bad JSON', { status: 400 }); }
  if (!ALLOWED.has(b?.event) || JSON.stringify(b).length > 8000) return new Response('Invalid event', { status: 400 });
  const clean = {
    event: b.event, visitorId: String(b.visitorId || '').slice(0, 80), sessionId: String(b.sessionId || '').slice(0, 80),
    path: String(b.path || '').slice(0, 300), referrer: String(b.referrer || '').slice(0, 160),
    source: String(b.source || '').slice(0, 100), campaign: String(b.campaign || '').slice(0, 100),
    device: b.device === 'mobile' ? 'mobile' : 'desktop',
    properties: typeof b.properties === 'object' ? b.properties : {}, occurredAt: new Date().toISOString(),
  };
  await getStore('journey-events').setJSON(`${clean.occurredAt.slice(0, 10)}/${Date.now()}-${crypto.randomUUID()}.json`, clean);
  return new Response(null, { status: 204 });
};

import { getStore } from '@netlify/blobs';

export const config = { path: '/api/analytics-summary' };
const FUNNEL = ['landing_view', 'shop_view', 'product_view', 'checkout_started', 'order_completed'];

export default async (req: Request): Promise<Response> => {
  const secret = process.env.ANALYTICS_DASHBOARD_TOKEN;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) return json({ error: 'Unauthorized' }, 401);
  const days = Math.min(90, Math.max(7, Number(new URL(req.url).searchParams.get('days')) || 30));
  const cutoff = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
  const store = getStore('journey-events');
  const listed = await store.list();
  const keys = listed.blobs.map((b) => b.key).filter((k) => k.slice(0, 10) >= cutoff).slice(-5000);
  const events = (await Promise.all(keys.map((k) => store.get(k, { type: 'json' })))).filter(Boolean) as any[];
  const countBy = (fn: (e: any) => string) => Object.entries(events.reduce<Record<string, number>>((m, e) => { const k = fn(e) || 'Direct / unknown'; m[k] = (m[k] || 0) + 1; return m; }, {})).sort((a, b) => b[1] - a[1]);
  const funnel = FUNNEL.map((event) => ({ event, count: new Set(events.filter((e) => e.event === event).map((e) => e.visitorId)).size }));
  return json({
    days, generatedAt: new Date().toISOString(), events: events.length,
    visitors: new Set(events.map((e) => e.visitorId).filter(Boolean)).size,
    sessions: new Set(events.map((e) => e.sessionId).filter(Boolean)).size,
    funnel,
    daily: countBy((e) => String(e.occurredAt).slice(0, 10)).sort((a, b) => a[0].localeCompare(b[0])),
    products: countBy((e) => e.event === 'product_view' ? String(e.properties?.productId || 'Unknown') : '').filter(([k]) => k !== 'Direct / unknown').slice(0, 10),
    sources: countBy((e) => e.source || e.referrer).slice(0, 10), devices: countBy((e) => e.device),
  });
};
function json(data: unknown, status = 200) { return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } }); }

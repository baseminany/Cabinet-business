export type JourneyEvent =
  | 'landing_view' | 'shop_view' | 'category_selected' | 'product_view'
  | 'checkout_started' | 'checkout_blocked' | 'quote_view' | 'quote_submitted';

const safeId = () => crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const getStored = (store: Storage, key: string) => {
  let value = store.getItem(key);
  if (!value) { value = safeId(); store.setItem(key, value); }
  return value;
};

export function analyticsContext() {
  if (typeof window === 'undefined') return { visitorId: '', sessionId: '' };
  return { visitorId: getStored(localStorage, 'hon_visitor'), sessionId: getStored(sessionStorage, 'hon_session') };
}

export function track(event: JourneyEvent, properties: Record<string, string | number | boolean | null> = {}) {
  if (typeof window === 'undefined' || navigator.doNotTrack === '1') return;
  const { visitorId, sessionId } = analyticsContext();
  const params = new URLSearchParams(location.search);
  const payload = {
    event, visitorId, sessionId, properties,
    path: location.pathname + location.search,
    referrer: document.referrer ? new URL(document.referrer).hostname : '',
    source: params.get('utm_source') || '', campaign: params.get('utm_campaign') || '',
    device: matchMedia('(max-width: 640px)').matches ? 'mobile' : 'desktop',
    occurredAt: new Date().toISOString(),
  };
  const body = JSON.stringify(payload);
  if (navigator.sendBeacon) navigator.sendBeacon('/api/analytics-event', new Blob([body], { type: 'application/json' }));
  else void fetch('/api/analytics-event', { method: 'POST', headers: { 'content-type': 'application/json' }, body, keepalive: true }).catch(() => undefined);
}

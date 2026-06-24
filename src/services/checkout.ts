// =============================================================================
// CHECKOUT (client adapter) — "Buy now" → Stripe Checkout
// =============================================================================
// Posts the order to /api/checkout, which creates a Stripe Checkout session and
// returns its URL; we redirect the browser there. Throws CheckoutUnavailableError
// when Stripe isn't configured yet (no STRIPE_SECRET_KEY) so the UI can fall back
// to the quote/order-capture flow.
// =============================================================================

export class CheckoutUnavailableError extends Error {}

export interface CheckoutLineItem { name: string; amount: number /* cents */; quantity: number }

export async function startCheckout(items: CheckoutLineItem[], summary?: string): Promise<void> {
  let res: Response;
  try {
    res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ items, summary, successUrl: `${location.origin}/?checkout=success`, cancelUrl: location.href }),
    });
  } catch {
    throw new CheckoutUnavailableError('Checkout not reachable.');
  }

  if (res.status === 404 || res.status === 501) throw new CheckoutUnavailableError('Checkout not configured.');
  if (!(res.headers.get('content-type') || '').includes('application/json')) throw new CheckoutUnavailableError('Checkout not configured.');
  if (!res.ok) {
    let msg = `Checkout failed (${res.status}).`;
    try { const j = await res.json(); if (j?.error) msg = j.error; } catch { /* ignore */ }
    throw new Error(msg);
  }

  const data = (await res.json()) as { url?: string };
  if (!data.url) throw new Error('Checkout session had no URL.');
  location.href = data.url; // redirect to Stripe's hosted checkout
}

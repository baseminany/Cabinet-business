// =============================================================================
// CHECKOUT (client adapter) — "Buy now" → Stripe Checkout
// =============================================================================
// SECURITY: the client sends only WHAT to buy (preset id + configuration);
// the server recomputes the price from the canonical model. No price ever
// travels from the browser. Throws CheckoutUnavailableError when Stripe isn't
// configured yet (no STRIPE_SECRET_KEY) so the UI falls back to quote capture.
// =============================================================================

export class CheckoutUnavailableError extends Error {}

export interface CheckoutRequest {
  presetId: string;
  config?: { width?: number; depth?: number; height?: number; finish?: string };
  quantity?: number;
}

export async function startCheckout(order: CheckoutRequest): Promise<void> {
  let res: Response;
  try {
    res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ...order,
        successUrl: `${location.origin}/?checkout=success`,
        cancelUrl: location.href,
      }),
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

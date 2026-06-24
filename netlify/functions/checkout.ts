// =============================================================================
// /api/checkout — create a Stripe Checkout session for a "Buy now" order
// =============================================================================
// PCI-compliant: the customer enters their card on Stripe's hosted page, never
// on our site. We pass line items (name + amount) computed from our own pricing,
// so no products need to be pre-created in Stripe.
//
// To enable: set STRIPE_SECRET_KEY in Netlify env (Site settings → Environment
// variables). Until then this returns 501 and the client falls back to the
// quote/order-capture flow, so nothing breaks.
// =============================================================================

import Stripe from 'stripe';

export const config = { path: '/api/checkout' };

interface LineItem { name: string; amount: number /* cents */; quantity: number }
interface CheckoutBody {
  items: LineItem[];
  successUrl?: string;
  cancelUrl?: string;
  summary?: string;
}

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return json({ error: 'Checkout not configured. Set STRIPE_SECRET_KEY in Netlify env.' }, 501);

  let body: CheckoutBody;
  try {
    body = (await req.json()) as CheckoutBody;
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  const items = Array.isArray(body.items) ? body.items.slice(0, 30) : [];
  if (items.length === 0) return json({ error: 'No items provided.' }, 400);
  for (const it of items) {
    if (!it.name || typeof it.amount !== 'number' || it.amount < 50 || !it.quantity) {
      return json({ error: 'Invalid line item.' }, 400);
    }
  }

  const origin = req.headers.get('origin') || new URL(req.url).origin;

  try {
    const stripe = new Stripe(key);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: items.map((it) => ({
        price_data: {
          currency: 'usd',
          product_data: { name: it.name.slice(0, 250) },
          unit_amount: Math.round(it.amount),
        },
        quantity: Math.max(1, Math.min(20, it.quantity)),
      })),
      success_url: body.successUrl || `${origin}/?checkout=success`,
      cancel_url: body.cancelUrl || `${origin}/?checkout=cancel`,
      shipping_address_collection: { allowed_countries: ['US'] },
      phone_number_collection: { enabled: true },
      automatic_tax: { enabled: false },
      metadata: { summary: (body.summary || '').slice(0, 480) },
    });
    return json({ url: session.url }, 200);
  } catch (e: any) {
    return json({ error: e?.message || 'Checkout failed.' }, 502);
  }
};

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
}

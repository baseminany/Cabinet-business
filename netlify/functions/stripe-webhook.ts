// =============================================================================
// /api/stripe-webhook — durable order records for completed checkouts
// =============================================================================
// Stripe calls this after a customer pays. We verify the signature, then:
//   1. store the full order (what, size, finish, price, shipping address)
//      in Netlify Blobs — a durable record independent of the Stripe dashboard;
//   2. forward a plain-English summary to QUOTE_WEBHOOK_URL if configured
//      (e.g. a Zapier hook that emails/texts Basem "you sold something").
//
// Setup (Stripe dashboard → Developers → Webhooks):
//   endpoint  https://<site>/api/stripe-webhook
//   event     checkout.session.completed
//   then put the signing secret in Netlify env as STRIPE_WEBHOOK_SECRET.
// =============================================================================

import Stripe from 'stripe';
import { getStore } from '@netlify/blobs';

export const config = { path: '/api/stripe-webhook' };

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') return new Response('POST only', { status: 405 });

  const key = process.env.STRIPE_SECRET_KEY;
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!key || !whSecret) return new Response('Webhook not configured', { status: 501 });

  const sig = req.headers.get('stripe-signature');
  if (!sig) return new Response('Missing signature', { status: 400 });

  const stripe = new Stripe(key);
  let event: Stripe.Event;
  try {
    const raw = await req.text();
    event = await stripe.webhooks.constructEventAsync(raw, sig, whSecret);
  } catch {
    return new Response('Bad signature', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const s = event.data.object as Stripe.Checkout.Session;
    const order = {
      orderId: s.id,
      paidAt: new Date().toISOString(),
      amountTotal: (s.amount_total ?? 0) / 100,
      currency: s.currency,
      customer: {
        name: s.customer_details?.name ?? null,
        email: s.customer_details?.email ?? null,
        phone: s.customer_details?.phone ?? null,
      },
      shippingAddress: (s as any).shipping_details?.address ?? s.customer_details?.address ?? null,
      product: {
        presetId: s.metadata?.presetId ?? null,
        config: safeParse(s.metadata?.config),
        quantity: Number(s.metadata?.quantity ?? 1),
        computedPrice: Number(s.metadata?.computedPrice ?? 0),
        sheetsUsed: Number(s.metadata?.sheetsUsed ?? 0),
      },
      paymentStatus: s.payment_status,
    };

    // 1) Durable record (survives regardless of email/Zapier state)
    try {
      const store = getStore('orders');
      await store.setJSON(`${order.paidAt.slice(0, 10)}/${s.id}.json`, order);
    } catch (e) {
      console.error('Order blob write failed', e);
    }

    // 2) Owner notification
    const hook = process.env.QUOTE_WEBHOOK_URL;
    if (hook) {
      try {
        await fetch(hook, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            text: `NEW ORDER $${order.amountTotal} — ${order.product.presetId} ×${order.product.quantity} for ${order.customer.name ?? 'unknown'} (${order.customer.email ?? 'no email'})`,
            order,
          }),
        });
      } catch (e) {
        console.error('Owner notification failed', e);
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
};

function safeParse(s: string | undefined): unknown {
  try { return s ? JSON.parse(s) : null; } catch { return s; }
}

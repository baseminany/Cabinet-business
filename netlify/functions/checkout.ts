// =============================================================================
// /api/checkout — create a Stripe Checkout session for a "Buy now" order
// =============================================================================
// SECURITY MODEL: the browser sends only WHAT it wants to buy (preset id +
// size/finish choices + quantity) — never a price. This function rebuilds the
// exact units with configurePreset (which clamps sizes to the product's real
// ranges and rejects unknown finishes) and recomputes the price with the same
// pricing engine the site uses. A tampered request cannot lower the price.
//
// PCI-compliant: the customer enters their card on Stripe's hosted page.
//
// To enable: set STRIPE_SECRET_KEY in Netlify env. Until then this returns 501
// and the client falls back to the quote/order-capture flow.
// Optional env: STRIPE_TAX=1 turns on Stripe automatic tax (register your
// Michigan sales-tax obligation in the Stripe dashboard first).
// =============================================================================

import Stripe from 'stripe';
import { PRESETS, launchDecision } from '../../src/model/presets';
import { configurePreset, type PresetConfig } from '../../src/model/configurePreset';
import { buildProject } from '../../src/model/buildParts';
import { priceModel } from '../../src/pricing/engine';
import { createDigitalBom } from '../../src/model/bom';

export const config = { path: '/api/checkout' };

interface CheckoutBody {
  presetId: string;
  config?: PresetConfig;
  quantity?: number;
  successUrl?: string;
  cancelUrl?: string;
  analytics?: { visitorId?: string; sessionId?: string };
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

  const spec = PRESETS.find((p) => p.id === body.presetId);
  if (!spec) return json({ error: 'Unknown product.' }, 400);
  const launch = launchDecision(spec);
  if (launch.status !== 'pilot') return json({ error: 'This product is on the first-build list while its safety/compliance file is completed.' }, 409);
  const quantity = Math.max(1, Math.min(10, Math.round(Number(body.quantity) || 1)));

  // ── Recompute the price server-side from the canonical model ──
  const units = configurePreset(spec, body.config ?? {});
  const built = buildProject(units);
  const priced = priceModel(built);
  const bom = createDigitalBom(built);
  if (bom.fulfillment.lane !== 'parcel-pilot') return json({ error: bom.fulfillment.reasons.join(' ') || 'This size requires a custom shipping quote.' }, 409);
  const unitAmountCents = Math.round(priced.customerPrice * 100);
  if (!Number.isFinite(unitAmountCents) || unitAmountCents < 100) {
    return json({ error: 'Pricing failed.' }, 500);
  }

  // Planning rate from the digital BOM's packed-weight model. It remains a
  // launch placeholder until the physical pack test supplies carrier rates.
  const shipCents = Math.round(bom.fulfillment.shippingEstimate * quantity * 100);

  const u = units[0];
  const sizeDesc = `${u.overall.width}"W × ${u.overall.depth}"D × ${u.overall.height}"H · ${u.materials.carcass}`;
  const origin = req.headers.get('origin') || new URL(req.url).origin;

  try {
    const stripe = new Stripe(key);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: spec.name.slice(0, 250), description: sizeDesc.slice(0, 250) },
            unit_amount: unitAmountCents,
          },
          quantity,
        },
      ],
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            display_name: 'Flat-pack ground shipping',
            fixed_amount: { amount: shipCents, currency: 'usd' },
          },
        },
      ],
      success_url: body.successUrl || `${origin}/?checkout=success`,
      cancel_url: body.cancelUrl || `${origin}/?checkout=cancel`,
      shipping_address_collection: { allowed_countries: ['US'] },
      phone_number_collection: { enabled: true },
      automatic_tax: { enabled: process.env.STRIPE_TAX === '1' },
      metadata: {
        presetId: spec.id,
        config: JSON.stringify(body.config ?? {}).slice(0, 480),
        computedPrice: String(priced.customerPrice),
        sheetsUsed: String(priced.sheetsUsed),
        packedWeightLb: String(bom.fulfillment.packed.weightLb),
        fulfillmentLane: bom.fulfillment.lane,
        visitorId: String(body.analytics?.visitorId ?? '').slice(0, 80),
        sessionId: String(body.analytics?.sessionId ?? '').slice(0, 80),
        quantity: String(quantity),
      },
    });
    return json({ url: session.url }, 200);
  } catch (e: any) {
    return json({ error: e?.message || 'Checkout failed.' }, 502);
  }
};

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
}

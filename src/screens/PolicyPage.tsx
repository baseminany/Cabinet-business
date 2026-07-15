const PAGES: Record<string, { title: string; intro: string; sections: Array<[string, string]> }> = {
  shipping: { title: 'Shipping', intro: 'A launch-ready policy for small-batch, made-to-order furniture.', sections: [
    ['Where we ship', 'Pilot checkout is limited to addresses in the United States. Products outside our tested 48-inch and 50-pound parcel lane require a manual quote or local pickup.'],
    ['Timing', 'Every piece is made to order. The estimated build and dispatch window will be confirmed before payment is opened; carrier transit time begins after dispatch.'],
    ['Rates', 'The cart shows a modeled ground-shipping amount. We will replace modeled rates with tested carrier rates before public launch. Taxes are calculated at checkout when enabled.'],
    ['Damage', 'Photograph the carton before opening and report visible or concealed shipping damage within 48 hours of delivery. Keep the carton and packing until we resolve the claim.'],
  ]},
  returns: { title: 'Returns & cancellations', intro: 'Made-to-order work has different limits from warehouse inventory.', sections: [
    ['Cancellations', 'Request a cancellation within 24 hours of purchase. After material has been cut, the order cannot normally be cancelled.'],
    ['Returns', 'Standard-size, non-customized pieces may be eligible for return within 14 days of delivery if unused and safely repacked. Customer-selected dimensions, colors, and custom work are final sale unless defective. Return shipping and original shipping are not refundable.'],
    ['Problems with an order', 'If we made the wrong item or it arrives defective, contact us with photos and the order number. We will repair, replace, or refund as appropriate.'],
  ]},
  warranty: { title: 'Workmanship warranty', intro: 'Built carefully, supported directly.', sections: [
    ['Coverage', 'House of Nook warrants original-purchaser workmanship and manufacturing defects for one year from delivery. Our first response may be a replacement part because the system is modular.'],
    ['Not covered', 'Normal wear, wood and veneer color variation, misuse, overload, water exposure, improper assembly, missed wall anchoring, customer modification, and carrier damage reported after the claim window are excluded.'],
    ['Children’s products', 'Follow every age, use, anchoring, and supervision instruction supplied with the product. A warranty does not replace adult supervision or required installation.'],
  ]},
  privacy: { title: 'Privacy', intro: 'Plain-language data practices for the launch site.', sections: [
    ['What we collect', 'Quote forms collect the contact and project information you submit. Checkout is hosted by our payment provider. We also collect pseudonymous journey events such as page, product, device class, referral source, and funnel step. Journey analytics does not intentionally include names, emails, or message contents.'],
    ['Why', 'We use this information to answer requests, fulfill orders, understand where shoppers stop, improve products, prevent abuse, and meet legal obligations. We do not sell personal information.'],
    ['Controls', 'Browser Do Not Track is respected by our first-party journey analytics. Contact us through the design form to request access or deletion of information tied to your email.'],
  ]},
  terms: { title: 'Terms of sale', intro: 'Important launch terms—review with counsel before opening public payment.', sections: [
    ['Measurements', 'You are responsible for the dimensions and access path you approve. Screens and wood samples can vary in color; natural veneer varies from piece to piece.'],
    ['Installation and anchoring', 'Follow the supplied instructions and use fasteners appropriate for your wall. Items marked for anchoring must not be used until anchored. When uncertain, hire a qualified installer.'],
    ['Estimates', 'Planner prices, packed weights, build dates, and shipping amounts remain estimates until the order is accepted. We may decline or refund an order that cannot be built or shipped safely as configured.'],
  ]},
  contact: { title: 'Contact House of Nook', intro: 'Tell us what you are trying to fit and we will keep the context with your design.', sections: [
    ['Start a conversation', 'Use “Design something custom” to save measurements, product choices, and your contact details together. No payment is collected through the design form.'],
    ['Workshop', 'House of Nook is an owner-operated small workshop in Michigan. Public support hours and a dedicated support email must be added before checkout launches.'],
  ]},
};

export default function PolicyPage({ page }: { page: string }) {
  const data = PAGES[page] ?? PAGES.terms;
  return <div className="nice-scroll min-h-0 flex-1 overflow-y-auto bg-warmWhite text-ink">
    <header className="border-b border-ink/10 px-6 py-4 sm:px-10"><a href="/" className="font-display text-[22px]">House of Nook</a></header>
    <main className="mx-auto max-w-3xl px-6 py-14 sm:px-10 sm:py-20">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brass">Customer care</p>
      <h1 className="font-display mt-3 text-4xl sm:text-5xl">{data.title}</h1><p className="mt-5 text-base leading-8 text-ink-soft">{data.intro}</p>
      <div className="mt-10 space-y-8">{data.sections.map(([h, b]) => <section key={h} className="border-t border-ink/10 pt-6"><h2 className="text-sm font-bold uppercase tracking-[0.12em]">{h}</h2><p className="mt-3 text-sm leading-7 text-ink-soft">{b}</p></section>)}</div>
      <p className="mt-12 border-t border-ink/10 pt-6 text-xs leading-6 text-ink-muted">Draft effective July 15, 2026. Operational details marked as launch dependencies must be completed before public checkout.</p>
    </main>
  </div>;
}

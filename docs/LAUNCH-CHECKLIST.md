# Year-one launch checklist

## Goal and constraint

The year-one target is a learning side business producing roughly $300–$500 per month in owner profit, not a miniature production factory. One or two profitable, repeatable orders per month can satisfy the target while generating the evidence needed for a future CNC investment.

## Before accepting payment

- Choose at most three pilot SKUs. Recommended demand test: Montessori bookshelf waitlist, book ledges waitlist, and one non-children’s small parcel product as the first paid operational test.
- Build and time one first article per paid SKU. Record cutting, machining, banding, sanding/finishing, packing, and admin minutes separately.
- Replace every BOM item marked `placeholder` with an invoice-backed SKU/cost/weight.
- Pack the actual product, weigh and measure the closed carton, then obtain carrier quotes from the real origin ZIP. The website’s current shipping number is explicitly a model.
- Drop/handling test the packaging; revise corner protection and instructions; photograph the approved pack-out.
- Complete the safety file in `PRODUCT-SAFETY.md` before changing a children’s SKU from `compliance-hold` to `pilot`.
- Approve final build time, price floor, cancellation/return/warranty language, support email, lead time, and weekly capacity.
- Configure Netlify environment: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `ANALYTICS_DASHBOARD_TOKEN`, and optionally `STRIPE_TAX=1` only after tax setup. Configure `QUOTE_WEBHOOK_URL` for owner alerts.
- Create Stripe webhook for `checkout.session.completed` at `/api/stripe-webhook` and place test orders through success, cancellation, refund, and failed payment.
- Review Michigan sales-tax registration/collection with an accountant before public checkout: https://www.michigan.gov/taxes/business-taxes/sales-use-tax
- Review origin claims before advertising “Made in USA.” Current copy uses the narrower factual statement “built in a Michigan workshop.” FTC guidance: https://www.ftc.gov/business-guidance/resources/complying-made-usa-standard

## Weekly scorecard

- Qualified waitlist/quote leads by product
- Product-view → quote/checkout-start rate
- Checkout-start → paid-order rate
- Contribution profit per order after material, labor at the owner wage, packaging, fees, shipping variance, remakes, and refunds
- Actual shop hours per order and on-time dispatch rate
- Damage, defect, missing-part, and support contacts per shipment
- Repeat/referral customers

Do not buy a CNC because revenue feels exciting. Set an investment trigger using sustained order backlog, verified hours saved per sheet/order, cash payback, electrical/dust/space costs, and a post-purchase working-capital reserve.


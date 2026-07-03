# House of Nook — Project Notes

> **Shared source of truth.** This file is committed to the repo so any AI assistant
> or chat (ChatGPT, Claude, etc.) can read the current project state from GitHub
> without the owner re-explaining. Keep it current; update it whenever something
> meaningful changes, and push.

_Last updated: 2026-06-22_

---

## What this is

**House of Nook** — a custom modular built-in furniture business + the web app that sells it.
The owner (Basem) is a Sr PgM at Amazon building this on the side, and is also the carpenter.
The app lets a customer design a piece online (or order a ready-made one), see it in live 3D,
get a price, and submit a quote. Behind the scenes the same design data drives the shop's
cut list and a SketchUp Ruby script.

**Stack:** React + TypeScript + Vite + TailwindCSS + Zustand + react-three-fiber (3D).
Serverless via Netlify Functions. No backend DB yet.

---

## Core architecture (the one thing to understand)

`buildParts(unit)` is the single source of truth. It turns a `Unit` (the design) into a flat
list of physical `Part`s (panels with dimensions, grain, edge banding, 3D position). Everything
reads from that same list, so they can never disagree:

```
Unit(s)  ──►  buildParts()  ──►  ┌─ 3D preview (react-three-fiber)
                                 ├─ cut list (CSV/JSON)
                                 ├─ price (pricing/engine.ts + pricing.config.ts)
                                 └─ SketchUp Ruby script (export/sketchup.ts → OpenCutList)
```

- Product types live in `src/model/types.ts` (`UnitType`). Geometry per type in `src/model/buildParts.ts`.
- Pre-built products: `src/model/presets.ts`. The shop renders these.
- App flow/state: `src/store.ts` (Zustand). Screens in `src/screens/`, planner steps in `src/steps/`.

---

## App flow (current)

```
Landing (Welcome.tsx)  →  "What are you making?" (Intake.tsx)  →  Shop (ShopPrebuilt.tsx)  ─┐
   portfolio / why-us /        choose nook type:                    order or customize       │
   how-we-ship / CTA           Kids · Coffee · Mudroom ·                                      ▼
                               Reading · Custom built-in  ──►  Fit the space (EntryChoice)  → Planner (Wizard)
                                                               upload photo / design wall      3D + options + live price → Quote
```

Hero CTA "Start designing" → Intake. Category tiles → Shop (pre-filtered). Custom tile → Fit-the-space.

---

## Product line (balanced — everyday rooms, kids slightly forward)

Positioned as **modular built-ins for everyday rooms** (mudroom, coffee, entry, reading, laundry,
kids). Kids/Montessori is one prominent category, not the whole brand. Landing + shop lead general;
kids is slightly forward in the portfolio. Built-ins (den, mudroom) are the higher-ticket margin tier.

**Non-kids profitable nooks (parcel-ship, 1-2 sheet builds, good margin):**
Floating Wall Shelves set ($289, walnut), Entryway Console ($631), Bedside Nightstand ($424),
Compact Coffee Station ($690), Coffee Bar Hutch ($1,408), Mudroom Bench + Lockers ($1,713),
Window Reading Bench ($636), Entry Shoe Bench, Media Console, Narrow Bookcase, Toy Box Bench,
Toddler Step Stool. All built from existing base/shelf/tall geometry via presets, all with AI
product renders. Shop now has ~18 products across Kids / Entry / Coffee / Storage.

**Kids shop products (all ship parcel, ~1-2 sheet builds, no safety-cert liability):**
| Product | ~Price | Photo |
|---|---|---|
| Montessori forward-facing bookshelf (white oak) | $545 | ✅ real |
| Montessori tall book tower (painted) | $456 | ✅ real |
| Learning tower (toddler kitchen helper) | $365 | ✅ real |
| Forward-facing book ledges (set of 3) | $222 | ✅ real |
| Toy cubby bench | $479 | ✅ real |
| Montessori play nook (cubbies + bookshelf) | $1,041 | ✅ real |

Also: mudroom, coffee, reading, laundry nook systems (the "built-in" tier).

**Dropped: bunk bed.** Too hard to ship (freight, not parcel), federally safety-regulated
(16 CFR 1213 / ASTM F1427 = liability), heavy build. Geometry left dormant in code, removed
from catalog/shop. Rule going forward: only products that ship parcel, build from ~1 sheet,
and carry no safety-cert liability.

Product photos are AI-generated through ChatGPT (see "AI setup"). Stored in `public/images/kids-*.png`.

---

## Pricing model (real numbers, `src/pricing/pricing.config.ts`)

- **Materials:** real per-sheet costs (UV ply $130, MDF $60, white oak $220, walnut $240, etc.).
  Charged by the **fraction of a sheet actually consumed** (parts nest/share sheets), not rounded
  up to whole sheets — so small products price realistically.
- **Labor:** $60/hr as a COST (separate from profit). Scales with sheets: 1.0 hr base + 1.6 hr/sheet.
- **Finish:** $15/sheet (materials only; finishing time is in labor).
- **Overhead:** $35/order + 12% (garage shop, no rent).
- **Margin:** 50% markup (= 33% gross margin). Flex higher on kids, leaner on big built-ins.
- **Finishes are tiered:** Value (pre-finished UV birch + painted MDF, ships faster) vs
  Premium (white oak / rift oak / walnut veneer).

> Prices shown in-app are labeled "planning estimate." Tune `hoursPerSheet` and `markupPercent`
> from real builds.

---

## AI setup (no API keys — browser proxy)

AI runs through the owner's logged-in **claude.ai** (Max) and **ChatGPT** (Pro) sessions via a
local proxy, NOT API keys:
- `browser-proxy/proxy.cjs` (port 3001) drives the `mbrowse` headless-Chrome daemon.
- Netlify functions (`assistant.ts`, `generate-render.ts`, `analyze-room.ts`) forward to the proxy
  when `BROWSER_PROXY_URL` is set.
- Routes: chat→design actions (claude.ai), photo→room dimensions (claude.ai vision), renders (ChatGPT DALL-E).

**To run AI locally:** `mbrowse headed` → `npm run proxy` → `netlify dev`.

**⚠️ On Netlify (production): AI does NOT work** — the proxy is on the owner's local machine and
there are no API keys. Everything else works (landing, intake, shop, 3D planner, live pricing,
quote capture). To enable AI in prod later: add API keys to Netlify env, or tunnel to the local proxy.

Website product images are generated build-time via ChatGPT through mbrowse and saved to `public/images/`.

---

## Quote capture

`src/steps/QuoteStep.tsx` → `netlify/functions/submit-quote.ts`. No API key needed:
forwards each lead to `QUOTE_WEBHOOK_URL` (Formspree/Zapier/Slack webhook) if set, else logs it.
Per-unit "Special requests" field (vent cutouts, wire holes) flows into the quote for the team to review.

---

## Deployment

- GitHub: `https://github.com/baseminany/Cabinet-business`, branch **`premium-ui-pass`** (Netlify builds this branch).
- Netlify: `npm run build` (tsc + vite) → `dist/`. Functions in `netlify/functions`. SPA fallback redirect.
- **Always commit + push after meaningful work** (owner's standing request) so GitHub + Netlify stay current.

---

## Strategy (the moat + scale path)

- **Barbell, not pivot:** kids/Montessori = beachhead (ship-easy, brand/IG, batchable); custom
  built-ins = margin ceiling. Same configurator serves both via the intake page.
- **The moat is the SYSTEM, not the product** (a shelf is a shelf): the design-online configurator +
  photo→3D→price, and the AI→cut-list pipeline that lets one person produce like a team.
- **Scale to replace ~$200k Amazon comp:** standardize+batch kids SKUs → outsource fabrication (CNC) →
  hire → eventually productize the configurator + cut-list engine as SaaS for other makers.

---

## App flow detail (current)

- Landing hero "Start designing" → Intake. Intake category tiles (Kids/Coffee/Mudroom/Reading)
  → **fit-the-space** (EntryChoice) remembering the category; "Custom built-in" tile → fit-the-space too.
- Fit-the-space (EntryChoice) offers, for the chosen category: "Start from a ready-made {category}
  design" (→ shop filtered) + upload-photo + design-against-a-wall + start-blank-module.
- Landing has a "Who we are" section (owner-run USA shop story).

## Direction / roadmap (set 2026-06-23)

**Productization pivot.** Three tiers:
1. **Curated products** — we choose them: aesthetic, functional, affordable, HIGH margin, easy to
   make, scalable. A few per nook category.
2. **Bounded customization** — depth / width / height / extra shelves or doors, but CONSTRAINED so
   each variant still nests in reasonable sheet-good use; pricing scales with the added material +
   labor (engine already does fractional-sheet + per-sheet labor).
3. **Fully custom** — kept and advertised but SECONDARY: expensive, a few/year, custom quote only.

**Build method (carpenter + scale):**
- Design every product so its parts **nest from one or two 48×96 sheets** with >85% yield. Standardize
  part sizes across products so offcuts get reused. Document the sheet layout per product.
- **Lamello Zeta P2 + Clamex P-14** (and Tenso/Divario variants) for tool-light, no-screwdriver
  assembly — advertise "no power tools, no stripped screws." BUT **let the wood do the lifting**:
  captured dados/rabbets/housed shelves so the case geometry carries load; Clamex clamps the joint,
  it isn't the sole structure. Load/climb pieces ship structural core pre-assembled (glued+pinned).
- Connector cost (~$1–2 ea ×several) goes in the hardware pricing line; Zeta P2 (~$1,800) amortized in overhead.

**High-demand products to design + render (research-backed), by category:**
- Entry: Hall tree (bench+hooks+shelf), shoe bench, key/mail wall rail.
- Living/Storage: Media/TV console, floating shelf sets, plant ladder shelf, narrow bookcase, nightstand pair.
- Office/WFH: Floating wall desk, wall organizer.
- Coffee: floating coffee shelf set, coffee cart.
- Kids: Montessori floor/house bed (high demand; ships larger), toy box bench, step stool.
Each: design with sheet-yield + Lamello in mind, then AI-render (ChatGPT pipeline) and wire into the shop.

**Checkout / Buy Now (item 5) — BUILT.** Stripe Checkout is wired:
- `netlify/functions/checkout.ts` creates a Checkout session (inline price_data from our pricing,
  US shipping + phone collection). `src/services/checkout.ts` redirects the browser to Stripe.
- Shop cards have a **"Buy now"** button → Stripe Checkout. Until `STRIPE_SECRET_KEY` is set it
  gracefully falls back to the quote/order-capture flow (verified). Success → `/?checkout=success`
  shows a thank-you banner.
- **TO GO LIVE: owner creates a Stripe account and sets `STRIPE_SECRET_KEY` in Netlify env.** No
  raw card fields on our site (PCI-safe).

**In-photo preview (item 9).** Replace AI room-scan with: customer uploads a room photo, we overlay a
PRODUCT RENDER (our pre-made images) onto it, sized to scale. To-scale needs a reference — simplest:
user drags/scales the render and/or enters one known dimension (e.g., wall width or ceiling height) so
we can size the overlay. Keep the 3D virtual space too, but lead with the render-overlay demo. This
needs NO runtime AI.

**AI is back-office only.** Customer-facing AI removed (couldn't run on Netlify). AI is used by the
owner to generate product renders + cut lists. Site is now fully reliable in production.

## Catalog expansion (2026-07-03, same day) — accessories + Decor category

Added 9 fast-lane products (all ≤2 shop hrs, most build from OFFCUTS of the bigger SKUs —
waste becomes revenue; all with buildable AI renders): **Laundry** Over-Machine Shelf,
Hamper Bench, Drying Rail + Shelf. **Coffee** Mug Rack Shelf, Coffee Counter Riser.
**Entry** Mail + Key Organizer. **NEW Decor category** (regular walls + tabletop):
Art Ledge Set, Wall Display Boxes (set of 3), Monitor Riser. Catalog = **26 SKUs**, 26/26
photographed.

**Pricing calibration:** material billing softened from half-sheet to QUARTER-sheet
granularity (min 0.25/material) — half-sheet minimums were punishing small items
(montessori $545→$816; now $678). ⚠️ Accessory prices still read premium (monitor riser
~$349, mug rack ~$283) because global baseHours(1.0)+fixed overhead($35)+packaging($12)
stack on tiny items. Real fix = per-product labor profiles calibrated from Basem's first
actual builds; batching amortizes setup across a run. Flagged, not yet tuned.

## Fast-lane catalog cut (2026-07-03) — start small, grow later

Per Basem: the catalog is now FAST-LANE ONLY (≈1–3 shop hours, no doors, batchable, parcel-ship).
Door-heavy and multi-unit pieces removed until we scale (mudroom set, coffee hutch, doored media
console, doored laundry set, coffee wall cabinet, doored coffee station, hall tree, play nook,
tall book tower — renders kept in public/images for easy re-add).

**Current 17 SKUs** — Kids (6): montessori bookshelf, book ledges, toy cubby bench, toy box bench,
step stool, learning tower (kept by explicit owner call — the one >3hr exception, demand magnet).
Entry (3): shoe bench, entryway console, NEW hook rail + shelf. Coffee (2, both NEW): open coffee
station, coffee wall shelf set. Laundry (1, NEW): laundry shelf tower. Storage (5): floating
shelves, nightstand, bookcase, reading bench, NEW open media console (3 open bays, no doors).
All 17 have buildable AI renders.

**Joinery policy (time-efficiency, 2026-07-03):** Lamello-only butt joints for casework (~15s/slot,
no dado setup); routed dados ONLY on people-load surfaces (seats, steps, tower platform); backs in
grooves; Tenso on shop-glued joints, Clamex where the customer assembles.

## Shop-first restructure (2026-07-03) — THE conversion funnel

The app is now ONE funnel: **Landing → Shop → Product detail page → Buy**, with the room
planner demoted to a side door ("Design my own" → fit-the-space → planner → save design).
The intake page was REMOVED (redundant decision layer; the shop's category chips do that job).

**Product detail page (`src/screens/ProductDetail.tsx`)** — clickable from every shop/featured
card (`store.openProduct(id)`, step `'product'`):
- Photo gallery (preset `images[]`, falls back to `image`/sketch) + **Live 3D tab** rendering the
  ACTUAL parametric build at the chosen size (buildParts → CabinetMesh in a mini Canvas).
- Finish picker (value/premium tiers, 13 finishes) — repriced live.
- **Made-to-fit width** slider (preset `widthRange {min,max}`) — down to the inch; the MAX is set
  per product so it still cuts from the same sheet allowance (never spills into an extra sheet).
  Verified: media console 60″=$1,363 → 90″=$1,903 → walnut $1,990.
- Buy now (Stripe; falls back to save-design with the EXACT configured units) + assembly story
  (No screws / wood carries the load / ships flat).

**Pricing**: material now billed by HALF SHEET rounded up (min 0.5) — leftover cost is carried
per customer per Basem's rule; `sheetsUsed` exposed on PriceResult for the PDP badge.

**Catalog**: added Laundry category + Laundry Wall Set (base + upper, white). Finish-variant
renders added (media console walnut, montessori sage) as PDP gallery images. 21 products,
all photographed.

## Review-response changes (2026-06-24, after external code review)

Done (the agreed launch-hardening items):
- **Learning tower kept** but **safety CLAIMS removed** from copy ("anti-tip"/"safe" gone), and
  **geometry reinforced**: platform/step now housed in dados (wood carries load), 1" platform,
  added a base stretcher tying the sides for rigidity + stable stance. Still flagged in code as a
  load-bearing kids product to verify before sale.
- **Quote is an honest placeholder** — no email/webhook promised; copy says custom quotes aren't
  open online yet and the design is saved. Quote is for large/fully-custom only; everything else is
  Buy now.
- **Landing claims softened** — "assembled in an afternoon" → "straightforward assembly"; "no
  freight surcharge" → "shipping reviewed before order"; "4–8 hours" → "no power tools". Kept
  Made-in-USA (true).
- **Dead customer AI removed** — deleted DesignAssistantPanel + designAssistant/renderGen services
  + assistant/ dir (the unmounted browser-proxy chat/render). Back-office AI (netlify functions +
  browser-proxy for generating renders) stays.
- **Cut-list grouping fixed** — aggregateParts now groups by GENERIC part name, so identical pieces
  from different modules merge into one row + qty (the unit-label prefix no longer splits them).
- **Pricing hardened** — added packaging line ($12 + $6/sheet), card-processing fee (2.9% + $0.30,
  grossed up), and a $95 minimum price. Prices rose appropriately (e.g. learning tower $365→$418).

Deferred (lower priority, agreed not launch-blocking): single-wall planner mode, wall labels/minimap,
3D cutaway/opening cutouts/camera-remount, validateUnit/validateProject layer, starter-systems as
true placement templates, ProductSketch extraction, STUDIO_DESIGN_V1 rename, Laundry shop category.

## Open items / next steps

- Real shop numbers to finalize pricing (labor hrs per type, confirm overhead/margin). NEEDS OWNER INPUT.
- Vent cutouts are captured as quote notes only; not modeled in 3D/cut list yet.
- AI rate limiting on the Netlify functions (flagged in earlier review).
- Enable AI in production (API keys in Netlify env, or tunnel to local proxy) — currently local-only.

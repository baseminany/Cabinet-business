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

## Product line (kids-first)

Lead with kids/Montessori (easy to build, ship parcel, high margin, hot demand). Built-ins
(den, mudroom, coffee) are the higher-ticket margin tier.

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

## Open items / next steps

- Real shop numbers to finalize pricing (labor hrs per type, confirm overhead/margin). NEEDS OWNER INPUT.
- Vent cutouts are captured as quote notes only; not modeled in 3D/cut list yet.
- AI rate limiting on the Netlify functions (flagged in earlier review).
- Enable AI in production (API keys in Netlify env, or tunnel to local proxy) — currently local-only.

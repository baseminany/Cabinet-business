# Cabinet Configurator — v1

A parametric configurator for custom wood built-ins. One model of a cabinet drives
three outputs at once that always agree:

1. a live **3D preview** (orbit / pan / zoom, to scale),
2. a transparent **customer price**, and
3. a shop **cut list** you can export.

v1 builds one product type: a floor-to-ceiling **frameless (Euro) pantry** with
adjustable shelves and full-overlay slab doors.

---

## Running the app

You need **Node.js** (already installed on this machine at `~/.local/node`).

From this folder (`Cabinet Business`), in your Terminal:

```bash
npm install      # first time only — downloads the libraries
npm run dev      # starts the app, opens http://localhost:5173
```

Leave that running. Edit a file, save, and the browser updates automatically.
Press `Ctrl+C` in the Terminal to stop it.

> If your Terminal can't find `node` or `npm`, open a **new** Terminal window
> (the installer added Node to your shell startup), or run:
> `export PATH="$HOME/.local/node/bin:$PATH"`

To make a production build: `npm run build`, then `npm run preview`.

---

## Using it

- **Left panel** — type sizes and choose options (sections, shelves, doors, toe
  kick, materials). Everything updates instantly.
- **Middle** — the 3D model. Left-drag orbits, right-drag pans, scroll zooms.
- **Right panel** — two tabs:
  - **Price** — the full cost breakdown, line by line.
  - **Cut List** — every part with dimensions, grain, and edge banding.
    Buttons export **CSV** (for the shop) and **JSON** (structured for a future
    SketchUp importer).

---

## How it's built (the important part)

Everything flows from one place:

```
CabinetModel  ──►  buildParts(model)  ──►  Part[]  ──┬──►  3D preview
(what you type)    (construction rules)              ├──►  cut list + exports
                                                     └──►  price breakdown
```

`buildParts()` is the single source of truth. The picture, the price, and the cut
list all read the same parts, so they can never disagree.

Key files:

| File | What it is |
| --- | --- |
| `src/model/types.ts` | The data shapes: `CabinetModel` and `Part`. |
| `src/model/construction.ts` | **How your shop builds** — thicknesses, reveals, hinge rules. Edit to change methods. |
| `src/model/buildParts.ts` | Turns the model into real parts (the heart of it). |
| `src/model/materials.ts` | The *look* of each material (color/label) for the 3D view. |
| `src/pricing/pricing.config.ts` | **Your private prices.** The only file to edit for money. |
| `src/pricing/engine.ts` | Pure arithmetic — turns parts + prices into a breakdown. |

---

## ⚠️ Numbers to fill in (pricing)

The pricing engine works, but only **one** number is real so far: your carcass
sheet (UV pre-finished ply, **$120 / 48×96**). Everything else is a clearly
flagged placeholder. Open **`src/pricing/pricing.config.ts`** and replace each
value marked `⚠️ PLACEHOLDER`. The app shows an amber ⚠️ on every price line that
still uses a placeholder, and the warning banner disappears as you clear them.

Checklist (also kept in the config file):

- [ ] Door material sheet cost (currently a `painted-white` placeholder)
- [ ] Back material sheet cost (`ply-back` placeholder)
- [ ] Specialty veneer sheet costs (white oak, walnut)
- [ ] Edge banding cost per linear foot
- [ ] Hinge / shelf pin / pull unit costs
- [ ] Finishing method + rate (or confirm parts are pre-finished)
- [ ] Labor shop rate + hours per unit
- [ ] CNC / machine rate per sheet (if any)
- [ ] Overhead: fixed dollars + percent
- [ ] Target margin / markup percent

---

## Not in v1 (planned, but architected around)

Room scanning (camera/LiDAR), user accounts, payments, a multi-product catalog,
and AR preview. The model / parts / pricing separation leaves clean seams to add
these later without a rewrite.

# Design System — Studio

## North star
Studio should feel premium, architectural, and calm: an interior design studio with Apple-level restraint. The UI must make the user believe the result will make their home look magazine-worthy, while still being functional enough to support accurate custom cabinetry.

## Palette
- Obsidian `#0b0b0a` — hero and deep surfaces.
- Charcoal `#171412` — dark cards and secondary dark surfaces.
- Espresso `#211813` — buttons and rich shadows.
- Walnut `#4b2e20` — wood/warm accent.
- Porcelain `#f7f3ea` — premium light panels.
- Warm white `#fffdf8` — main editorial surfaces.
- Champagne `#d9c6a3` — hairlines, glow, luxury dividers.
- Brass `#b88a44` — selected state, accents, progress, icon color.
- Deep green `#173b33` — status badges and premium contrast.
- Plaster `#e4ded2` — 3D walls (cooled/cleaned so warm cabinets separate; was `#eee7da`, which matched painted-white doors and caused beige-on-beige).
- Oak floor `#a5713c` — 3D floor (richer/deeper, satin sheen roughness ~0.48 + faint metalness, stronger plank lines; was `#b98555`).
- 3D scene background `#e9e5dc`/`#e5e2da` (cleaner neutral, not warm beige); contact shadows darker + crisper (`#211810`, opacity ~0.45).
- 3D cabinets: satin sheen — painted fronts roughness ~0.40 metalness ~0.08; wood capped ~0.52; crisper door reveal seams + dark edge lines (`#241a12` doors, `#5a4a39` carcass).

## Typography
- Use Inter for most UI, controls, labels, buttons, and numbers.
- Use Fraunces only where the serif adds editorial warmth. Current pass leans more on bold Inter for INNERFORM-like impact.
- Headlines should be large, tight, and architectural: low line-height, negative tracking.
- Eyebrows are small uppercase with wide tracking.

## Components
- Primary buttons: dark espresso/obsidian or warm white on dark sections.
- Secondary buttons: transparent with champagne hairline.
- Cards: warm white/porcelain with champagne hairline and layered shadows.
- Dark cards: obsidian/charcoal with champagne hairline.
- Avoid generic blue SaaS accents and orange/clay CTA colors.

## 3D visual rules
- Walls must be lighter and flatter than cabinets.
- Floors must be clearly warmer/darker than walls.
- Trim must be crisp warm white.
- Windows/glass must read blue-gray and transparent.
- Selected units use brass edges/glow.
- Cabinets need visible doors/reveals/pulls enough to feel real, not simple colored blocks.

## What to avoid
- Beige-on-beige scenes where cabinets blend into walls.
- Every element as a pill.
- Generic rounded dashboard cards without hierarchy.
- Fake completion language for photo analysis or checkout.

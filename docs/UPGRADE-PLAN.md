# Upgrade Plan — assessment + sequencing (from the GPT 16-phase proposal)

This captures the full upgrade direction so it survives context compression. Each
phase: my verdict, priority, and whether it needs a backend. Build top-down.
Core invariant (do NOT break): `Room + Unit[] → buildParts/buildProject → Part[] →
3D / pricing / cut list / export`; `model/` stays pure (no React/three).

## Verdict in one line
The plan is **mostly good and correctly opinionated** (honest photo fallback, action-
based AI not chat-text, hide maker mode, keep model pure, prefer app-state actions over
headless browser). Main risks: it's huge, and Phases 5/11/12-backend are premature until
there's a backend. Sequence by impact × feasibility-without-backend.

## Design direction (agreed)
Premium, restrained, architectural — Apple restraint + luxury interior studio. Dark hero
sections; warm porcelain/ivory panels; deep walnut, obsidian, champagne brass, muted stone.
**Drop the clay/orange feel.** 3D must clearly separate walls / floor / cabinetry / glass /
trim / countertop / selected.

## Phases

| # | Phase | Verdict | Priority | Backend? |
|---|-------|---------|----------|----------|
| 1 | Global visual system (tokens, shadows, radii, CSS utils) | ✅ Do | **P0 foundation** | No |
| 2 | Landing redesign (dark cinematic hero + mock visual card) | ✅ Do | **P0** | No |
| 3 | Entry choice redesign (3 cards, honest photo state) | ✅ Do | **P0** | No |
| 4 | Photo→room flow (adapter + service + review step + honest fallback) | ✅ Do (client adapter now; AI later) | **P0** (fixes "upload broken") | Yes for real AI |
| 5 | AI design assistant (action schema + executor + chat panel) | ✅ Architecture good; ⚠️ defer chat/LLM | P2 | Yes (LLM) |
| 6 | 3D realism (lighting, reveals, pulls, brass selection, materials) | ✅ Do partial (brass select + material/light now; reveals/pulls later) | P1 | No |
| 7 | Top-down minimap (wall numbers, placement) | ✅ Great, low-cost | P1 | No |
| 8 | Materials upgrade (hide ply-back from customers; richer swatches; more finishes; split carcass/door pickers) | ✅ Do (hide ply-back now; richer cards next) | P1 | No |
| 9 | Wizard UX (quick-add cards, presets, progressive disclosure) | ✅ Good | P2 | No |
| 10 | Validation/smart rules (overlap, fits wall, ceiling, etc.) | ✅ Do | P1 | No (`model/validation.ts`, pure) |
| 11 | Auto-layout (snap, runs, under-window, fillers) | ✅ Good; powers AI | P2 | No |
| 12 | Quote + lead form (honest copy, export fallback) | ✅ Do (form + honest fallback now; submit endpoint later) | P1 | Yes for submit |
| 13 | Maker-mode security (hide behind ?maker=1 / localStorage / env) | ✅ Do — important | **P0** | No |
| 14 | Render pipeline seams (exportDesignSnapshot, captureSceneScreenshot, buildRenderPrompt) | ✅ Stubs only | P2 | Yes (image model) |
| 15 | Website polish (loading/empty states, transitions, mobile, copy) | ✅ Ongoing | P1 | No |
| 16 | Build + acceptance | ✅ Always | — | No |

## What I'm building THIS pass (P0 slice)
1, 2, 3, 4 (honest client flow + graceful fallback), 13, plus 8-partial (hide ply-back),
6-partial (brass selection color). Everything else above is staged here, in priority order.

## Backend (when ready) — contracts to implement
- **Photo analysis:** `POST VITE_ROOM_ANALYSIS_ENDPOINT` (default `/api/analyze-room`),
  FormData image → `RoomAnalysisResult` JSON (see `src/model/roomAnalysis.ts`). Never fake
  success; keys server-side. UX language: "We created a *starting* layout — confirm
  measurements before ordering," never "we measured exactly."
- **AI assistant:** client sends `{room, openings, units, selectedId, analysis, warnings,
  message}` → LLM returns strict `{message, actions: DesignAction[], questions?, warnings?}`;
  client runs `executeDesignActions`. Action-based, not free text. Headless browser only for
  render screenshots, never for design commands.
- **Lead submit:** `POST` project JSON + contact → CRM/email. Until then, export JSON + say
  "not connected yet."
- **Render:** server takes room+units+finishes+scene screenshot → photoreal magazine render;
  prompt generated from measured design (customer never edits prompt).

## Honest-product rules (keep)
Never claim exact measurement from a photo. Customer never sees cost breakdown / cut list /
SketchUp (maker-only). No API secrets in frontend. `model/` pure.

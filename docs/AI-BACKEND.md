# AI Backend — Photo Analysis + House of Nook Assistant

Both AI features call **Claude** from **serverless functions** (Netlify), so the API key is never exposed in the browser. They are wired and honest: until the key is set they show "not connected" and fall back gracefully.

## Files
- `netlify/functions/analyze-room.ts` → **`POST /api/analyze-room`** — vision: space photo (base64) → `RoomAnalysisResult` JSON (a *starting draft* the user confirms).
- `netlify/functions/assistant.ts` → **`POST /api/assistant`** — action-based House of Nook planner: project context + message → `{ message, actions, questions?, warnings? }`.
- `netlify.toml` — functions dir + SPA fallback.
- Client: `src/services/roomAnalysis.ts`, `src/services/designAssistant.ts`, `src/assistant/{types,actions}.ts`, `src/components/DesignAssistantPanel.tsx`.
- Model: `claude-opus-4-8`. SDK: `@anthropic-ai/sdk`.

## Turn it on
1. Get an Anthropic API key.
2. In Netlify: **Site settings → Environment variables → add `ANTHROPIC_API_KEY`**.
3. Redeploy. Netlify builds the site and bundles the two functions automatically.
4. Test: upload a space photo from the entry screen and use **Ask Nook** in the wizard, for example: "add a 60 inch mudroom bench with two shelves above."

> No key set → functions return `501` and the UI says "not connected." Never fakes a result.

## Local testing
The Vite dev server does not run functions. To test AI locally:
```
npm i -g netlify-cli
ANTHROPIC_API_KEY=sk-ant-... netlify dev
```
This serves the app and the `/api/*` functions together.

## Assistant behavior
The LLM returns structured **DesignAction[]** such as ADD_UNIT, MOVE_UNIT, SET_MATERIAL, ADD_OPENING, and SET_ROOM. `src/assistant/actions.ts` validates/clamps them and applies them to the Zustand store — it edits the real plan, not just chat.

The assistant prompt is now aligned with the House of Nook pivot: keep recommendations modest, shippable, garage-buildable, and family-home scale. Do not suggest full remodel-scale cabinetry or safety-sensitive bunk products as if they are production-ready.

Override endpoints with `VITE_ROOM_ANALYSIS_ENDPOINT` / `VITE_ASSISTANT_ENDPOINT`.

## Cost / safety notes
- Key is server-side only; the browser never sees it.
- Each photo analysis / assistant turn is one Claude call. Watch usage.
- Photo language stays honest: "starting layout" / "confirm before ordering."
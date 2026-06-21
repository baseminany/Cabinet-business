# AI Backend — Photo Analysis + Design Assistant

Both AI features call **Claude** from **serverless functions** (Netlify), so the
API key is never exposed in the browser. They are wired and honest: until the key
is set they show "not connected" and fall back gracefully (manual room building;
the right-hand panel for design).

## Files
- `netlify/functions/analyze-room.ts` → **`POST /api/analyze-room`** — vision: room
  photo (base64) → `RoomAnalysisResult` JSON (a *starting draft* the user confirms).
- `netlify/functions/assistant.ts` → **`POST /api/assistant`** — action-based design
  assistant: project context + message → `{ message, actions, questions?, warnings? }`.
- `netlify.toml` — functions dir + SPA fallback.
- Client: `src/services/roomAnalysis.ts`, `src/services/designAssistant.ts`,
  `src/assistant/{types,actions}.ts`, `src/components/DesignAssistantPanel.tsx`.
- Model: `claude-opus-4-8`. SDK: `@anthropic-ai/sdk` (a dependency).

## Turn it on
1. Get an Anthropic API key → https://console.anthropic.com
2. In Netlify: **Site settings → Environment variables → add `ANTHROPIC_API_KEY`**.
3. Redeploy (push to `premium-ui-pass`, or trigger a deploy). Netlify builds the
   site + bundles the two functions automatically.
4. Test: upload a room photo (entry screen) and use **Ask Studio** (bottom-right in
   the wizard) — e.g. "add a 36-inch base under the window."

> No key set → functions return `501` and the UI says "not connected." Never fakes a result.

## Local testing (optional)
The Vite dev server doesn't run functions. To test AI locally:
```
npm i -g netlify-cli
ANTHROPIC_API_KEY=sk-ant-... netlify dev
```
This serves the app *and* the `/api/*` functions together.

## How the assistant applies changes
The LLM returns structured **DesignAction[]** (ADD_UNIT, MOVE_UNIT, SET_MATERIAL,
ADD_OPENING, SET_ROOM, …). `src/assistant/actions.ts` validates + clamps them and
applies them to the Zustand store — it edits the real design, it doesn't just chat.
Override endpoints with `VITE_ROOM_ANALYSIS_ENDPOINT` / `VITE_ASSISTANT_ENDPOINT`.

## Cost / safety notes
- Key is server-side only; the browser never sees it.
- Each photo analysis / assistant turn is one Claude call (opus-4-8). Watch usage.
- Photo language stays honest: "we created a *starting* layout — confirm before ordering."

// =============================================================================
// /api/assistant — action-based AI design assistant (server-side)
// =============================================================================
// Takes the project context + a user message and returns structured actions the
// client applies to the design. Behaves like an interior designer + cabinetmaker
// + installer, but respects manufacturing reality. Key stays server-side.
// =============================================================================

import Anthropic from '@anthropic-ai/sdk';

export const config = { path: '/api/assistant' };

const SYSTEM = `You are Studio's AI design assistant — an interior designer, frameless cabinetmaker, and installer in one. You help a homeowner design custom built-ins.
You will receive the current project as JSON (room shape, walls, existing units, the selected unit id) plus a user request.
Respond with ONLY a JSON object (no prose outside it, no markdown fences):
{
 "message": string,            // short, friendly explanation of what you did / need
 "actions": DesignAction[],    // structured changes to apply
 "questions"?: string[],       // anything you must ask before ordering
 "warnings"?: string[]
}
DesignAction is one of:
 {"type":"ADD_UNIT","unitType":"base"|"upper"|"tall"|"shelf","wallIndex"?:number,"offset"?:number,"dimensions"?:{"width"?:number,"height"?:number,"depth"?:number},"label"?:string}
 {"type":"UPDATE_UNIT","unitId":string,"patch":object}
 {"type":"MOVE_UNIT","unitId":string,"wallIndex":number,"offset":number}
 {"type":"DELETE_UNIT","unitId":string}
 {"type":"ADD_OPENING","kind":"window"|"door","wallIndex":number,"offset":number,"width":number,"height":number,"sill"?:number}
 {"type":"SET_ROOM","patch":object}
 {"type":"SET_MATERIAL","unitId":string,"role":"carcass"|"doors"|"back","materialId":string}
 {"type":"EXPLAIN","message":string}
Rules: all dimensions in INCHES. Base cabinets ~24" deep / 34.5" tall; uppers ~12" deep mounted ~54"; tall/pantry ~24" deep up to ~84"+; shelves are thin boards. Frameless construction, full-overlay slab doors. Material ids include: white-oak, white-oak-rift, walnut, walnut-deep, sw-alabaster, sw-pure-white, sw-agreeable-gray, sw-evergreen-fog, sw-iron-ore. Use wall indexes that exist (wallCount). Suggest good layouts but never invent impossible geometry. If a measurement is missing, ask in "questions" rather than guessing.`;

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  if (!process.env.ANTHROPIC_API_KEY) return json({ error: 'Assistant not configured (set ANTHROPIC_API_KEY).' }, 501);

  let message = '';
  let context: unknown = {};
  try {
    const body = await req.json();
    message = body.message;
    context = body.context;
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }
  if (!message) return json({ error: 'No message provided.' }, 400);

  try {
    const client = new Anthropic();
    const resp = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 4096,
      system: SYSTEM,
      messages: [
        { role: 'user', content: `PROJECT CONTEXT:\n${JSON.stringify(context)}\n\nUSER REQUEST:\n${message}\n\nRespond with ONLY the JSON object.` },
      ],
    });
    const text = resp.content.filter((b) => b.type === 'text').map((b: any) => b.text).join('');
    const parsed = extractJson(text);
    if (!parsed || typeof parsed.message !== 'string' || !Array.isArray(parsed.actions)) return json({ error: 'Model returned an unexpected shape.' }, 502);
    return json(parsed, 200);
  } catch (e: any) {
    return json({ error: e?.message || 'Assistant failed.' }, 502);
  }
};

function extractJson(text: string): any {
  const a = text.indexOf('{');
  const b = text.lastIndexOf('}');
  if (a < 0 || b < 0) return null;
  try { return JSON.parse(text.slice(a, b + 1)); } catch { return null; }
}

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
}

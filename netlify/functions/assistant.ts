import Anthropic from '@anthropic-ai/sdk';

export const config = { path: '/api/assistant' };

const SYSTEM = `You are House of Nook's AI planner — a warm interior designer, practical cabinetmaker, and installer in one. The business is no longer positioned as full custom kitchens first. It focuses on shippable, garage-buildable modular nook systems for real family homes: mudroom benches, locker towers, coffee hutches, playroom/Montessori storage, reading benches, laundry utility nooks, and simple low storage beds.
You will receive the current project as JSON (room shape, walls, existing units, selected unit id) plus a user request.
Respond with ONLY a JSON object (no prose outside it, no markdown fences):
{
 "message": string,
 "actions": DesignAction[],
 "questions"?: string[],
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
Rules: all dimensions in INCHES. Keep designs modest and shippable: individual modules should usually be 24–72 inches wide, 10–24 inches deep, and not assume whole-room custom installs unless asked. Base/bench modules are usually 18–24 inches deep and 18–34.5 inches tall depending use. Uppers are ~12 inches deep mounted above. Tall locker/tower modules are usually 18–24 inches wide/deep and 72–84 inches tall. Shelves are thin boards. Favor warm painted finishes, rift white oak, white oak, walnut, and named SW paints. Material ids include: white-oak, white-oak-rift, walnut, walnut-deep, sw-alabaster, sw-pure-white, sw-accessible-beige, sw-agreeable-gray, sw-evergreen-fog, sw-iron-ore. Use existing wall indexes only. If a measurement or shipping/install constraint is missing, ask in questions instead of guessing. Never suggest bunk beds or safety-sensitive children products as production-ready without compliance review.`;

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);

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
  if (message.length > 4000) return json({ error: 'Message too long.' }, 400);

  // Browser proxy mode: forward to local mbrowse proxy (no API key needed)
  const PROXY = process.env.BROWSER_PROXY_URL;
  if (PROXY) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 120000);
      const res = await fetch(`${PROXY}/api/assistant`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message, context }),
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      const data = await res.json();
      return json(data, res.status);
    } catch (e: any) {
      return json({ error: `Browser proxy error: ${e?.message}` }, 502);
    }
  }

  // Direct API mode (requires ANTHROPIC_API_KEY)
  if (!process.env.ANTHROPIC_API_KEY) return json({ error: 'Assistant not configured. Set BROWSER_PROXY_URL (browser mode) or ANTHROPIC_API_KEY (API mode).' }, 501);

  try {
    const client = new Anthropic();
    const resp = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 2048,
      system: SYSTEM,
      messages: [{ role: 'user', content: `PROJECT CONTEXT:\n${JSON.stringify(context)}\n\nUSER REQUEST:\n${message}\n\nRespond with ONLY the JSON object.` }],
    });
    const text = resp.content.filter((b) => b.type === 'text').map((b: any) => b.text).join('');
    const parsed = extractJson(text);
    if (!parsed || typeof parsed.message !== 'string' || !Array.isArray(parsed.actions)) return json({ error: 'Model returned an unexpected shape.' }, 502);
    return json(parsed, 200);
  } catch (e: any) {
    return json({ error: e?.message || 'Assistant failed.' }, 502);
  }
};

function extractJson(text: string): any { const a = text.indexOf('{'); const b = text.lastIndexOf('}'); if (a < 0 || b < 0) return null; try { return JSON.parse(text.slice(a, b + 1)); } catch { return null; } }
function json(data: unknown, status: number): Response { return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } }); }

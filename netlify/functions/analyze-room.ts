// =============================================================================
// /api/analyze-room — vision: room photo → starting room draft (server-side)
// =============================================================================
// Holds ANTHROPIC_API_KEY server-side (never in the browser). Returns a
// RoomAnalysisResult the customer then CONFIRMS — we never claim exact measures.
// Set ANTHROPIC_API_KEY in Netlify env to enable; otherwise returns 501 and the
// client falls back to manual room building.
// =============================================================================

import Anthropic from '@anthropic-ai/sdk';

export const config = { path: '/api/analyze-room' };

const SYSTEM = `You are an architectural assistant that estimates a room layout from a single photo for a custom cabinetry app.
Return ONLY a JSON object (no prose, no markdown fences) matching exactly:
{
 "version":"1.0",
 "summary": string,                 // one friendly sentence
 "confidence": number,              // 0..1
 "assumptions": string[],           // what you inferred and could be wrong
 "room": { "shape":"rect"|"l"|"u"|"alcove"|"corner", "width"?:number, "length"?:number, "height"?:number, "notchW"?:number, "notchL"?:number, "recessW"?:number, "recessD"?:number, "corner"?:number },
 "openings": [ { "kind":"window"|"door", "wallIndex":number, "offset":number, "width":number, "height":number, "sill":number, "confidence":number, "label"?:string } ],
 "recommendedCabinetZones": [ { "wallIndex":number, "startOffset":number, "endOffset":number, "recommendedDepth":number, "notes":string } ],
 "requiredMeasurements": [ { "key":string, "label":string, "reason":string, "unit":"in", "value"?:number } ]
}
All dimensions are INCHES. Wall 0 is the main/back wall. This is a STARTING DRAFT — populate requiredMeasurements with the measurements the user must confirm before ordering. Never claim the photo gives exact measurements.`;

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  if (!process.env.ANTHROPIC_API_KEY) return json({ error: 'Photo analysis not configured (set ANTHROPIC_API_KEY).' }, 501);

  let imageBase64 = '';
  let mediaType = 'image/jpeg';
  try {
    const body = await req.json();
    imageBase64 = body.imageBase64;
    mediaType = body.mediaType || mediaType;
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }
  if (!imageBase64) return json({ error: 'No image provided.' }, 400);

  try {
    const client = new Anthropic();
    const resp = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 4096,
      system: SYSTEM,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType as any, data: imageBase64 } },
            { type: 'text', text: 'Analyze this room and return the JSON draft. Respond with ONLY the JSON object.' },
          ],
        },
      ],
    });
    const text = resp.content.filter((b) => b.type === 'text').map((b: any) => b.text).join('');
    const parsed = extractJson(text);
    if (!parsed || parsed.version !== '1.0' || !parsed.room) return json({ error: 'Model returned an unexpected shape.' }, 502);
    return json(parsed, 200);
  } catch (e: any) {
    return json({ error: e?.message || 'Analysis failed.' }, 502);
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

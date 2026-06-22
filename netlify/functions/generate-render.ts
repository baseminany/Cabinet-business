import OpenAI from 'openai';

export const config = { path: '/api/generate-render' };

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  if (!process.env.OPENAI_API_KEY) return json({ error: 'Image generation not configured (set OPENAI_API_KEY).' }, 501);

  let designDesc = '';
  try {
    const body = await req.json();
    designDesc = body.designDesc ?? '';
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }
  if (!designDesc) return json({ error: 'No design description provided.' }, 400);

  const prompt = buildPrompt(designDesc);

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1792x1024',
      quality: 'hd',
      style: 'natural',
    });
    return json({ url: response.data[0]?.url ?? null, revisedPrompt: response.data[0]?.revised_prompt }, 200);
  } catch (e: any) {
    return json({ error: e?.message || 'Image generation failed.' }, 502);
  }
};

function buildPrompt(designDesc: string): string {
  return `A photorealistic interior design photograph of a ${designDesc}. The space is warm and inviting with natural light, hardwood floors, and neutral painted walls. The built-in cabinetry is beautifully finished and professionally installed. Shot with a wide-angle lens at eye level. Highly detailed, architectural photography style. No people in the image.`;
}

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
}

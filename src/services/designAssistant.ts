// =============================================================================
// DESIGN ASSISTANT SERVICE (client adapter)
// =============================================================================
// Sends the user's message + compact project context to the backend, which runs
// the LLM (key server-side) and returns a strict AssistantResponse. Never calls
// the model from the browser. Throws AssistantUnavailableError when the endpoint
// isn't connected so the UI can explain honestly.
// =============================================================================

import type { AssistantContext, AssistantResponse } from '../assistant/types';

const ENDPOINT = (import.meta.env.VITE_ASSISTANT_ENDPOINT as string | undefined) || '/api/assistant';

export class AssistantUnavailableError extends Error {}

export async function askAssistant(message: string, context: AssistantContext, timeoutMs = 40000): Promise<AssistantResponse> {
  let res: Response;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message, context }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
  } catch {
    throw new AssistantUnavailableError('The design assistant isn’t reachable.');
  }
  if (res.status === 404 || res.status === 501) throw new AssistantUnavailableError('The design assistant isn’t connected yet.');
  if (!res.ok) throw new Error(`Assistant error (${res.status}).`);
  // SPA fallback (no function deployed) returns HTML, not JSON → treat as not connected.
  if (!(res.headers.get('content-type') || '').includes('application/json')) throw new AssistantUnavailableError('The design assistant isn’t connected yet.');

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new Error('Assistant returned an invalid response.');
  }
  const r = json as Partial<AssistantResponse>;
  if (typeof r.message !== 'string' || !Array.isArray(r.actions)) throw new Error('Assistant response was not in the expected format.');
  return r as AssistantResponse;
}

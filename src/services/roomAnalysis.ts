// =============================================================================
// ROOM ANALYSIS SERVICE (client adapter)
// =============================================================================
// Sends a room photo to the backend vision endpoint and validates the response.
// Backend (and any API keys) live server-side. This NEVER fakes a success — if
// the endpoint isn't connected, it throws AnalysisUnavailableError so the UI can
// gracefully fall back to "use this photo as a reference and continue manually."
// =============================================================================

import type { RoomAnalysisResult } from '../model/roomAnalysis';

const ENDPOINT =
  (import.meta.env.VITE_ROOM_ANALYSIS_ENDPOINT as string | undefined) || '/api/analyze-room';

/** Endpoint missing / unreachable — caller should offer the manual fallback. */
export class AnalysisUnavailableError extends Error {}

export async function requestRoomAnalysis(file: File, timeoutMs = 30000): Promise<RoomAnalysisResult> {
  const form = new FormData();
  form.append('image', file);

  let res: Response;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    res = await fetch(ENDPOINT, { method: 'POST', body: form, signal: ctrl.signal });
    clearTimeout(timer);
  } catch {
    throw new AnalysisUnavailableError('The photo-analysis service isn’t reachable.');
  }

  if (res.status === 404 || res.status === 501) {
    throw new AnalysisUnavailableError('Photo analysis isn’t connected yet.');
  }
  if (!res.ok) throw new Error(`Analysis failed (${res.status}).`);

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new Error('Analysis returned an invalid response.');
  }

  const r = json as Partial<RoomAnalysisResult>;
  if (!r || r.version !== '1.0' || !r.room || !Array.isArray(r.openings)) {
    throw new Error('Analysis response was not in the expected format.');
  }
  return r as RoomAnalysisResult;
}

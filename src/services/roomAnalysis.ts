// =============================================================================
// ROOM ANALYSIS SERVICE (client adapter)
// =============================================================================
// Sends a room photo (base64) to the backend vision endpoint and validates the
// response. The model + API key live server-side. NEVER fakes a success — if the
// endpoint isn't connected, throws AnalysisUnavailableError so the UI can fall
// back to "use this photo as a reference and continue manually."
// =============================================================================

import type { RoomAnalysisResult } from '../model/roomAnalysis';

const ENDPOINT = (import.meta.env.VITE_ROOM_ANALYSIS_ENDPOINT as string | undefined) || '/api/analyze-room';

export class AnalysisUnavailableError extends Error {}

function fileToBase64(file: File): Promise<{ data: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || '');
      const comma = url.indexOf(',');
      resolve({ data: url.slice(comma + 1), mediaType: file.type || 'image/jpeg' });
    };
    reader.onerror = () => reject(new Error('Could not read the image.'));
    reader.readAsDataURL(file);
  });
}

export async function requestRoomAnalysis(file: File, timeoutMs = 45000): Promise<RoomAnalysisResult> {
  const { data, mediaType } = await fileToBase64(file);

  let res: Response;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ imageBase64: data, mediaType }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
  } catch {
    throw new AnalysisUnavailableError('The photo-analysis service isn’t reachable.');
  }

  if (res.status === 404 || res.status === 501) throw new AnalysisUnavailableError('Photo analysis isn’t connected yet.');
  if (!res.ok) throw new Error(`Analysis failed (${res.status}).`);
  // SPA fallback (no function deployed) returns HTML, not JSON → treat as not connected.
  if (!(res.headers.get('content-type') || '').includes('application/json')) throw new AnalysisUnavailableError('Photo analysis isn’t connected yet.');

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new Error('Analysis returned an invalid response.');
  }
  const r = json as Partial<RoomAnalysisResult>;
  if (!r || r.version !== '1.0' || !r.room || !Array.isArray(r.openings)) throw new Error('Analysis response was not in the expected format.');
  return r as RoomAnalysisResult;
}

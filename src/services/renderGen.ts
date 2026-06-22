import { useStore } from '../store';
import type { Unit } from '../model/types';

const ENDPOINT = '/api/generate-render';

export class RenderUnavailableError extends Error {}

export async function generateRender(): Promise<{ url: string }> {
  const designDesc = buildDesignDescription();

  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ designDesc }),
    });
  } catch {
    throw new RenderUnavailableError('Render service is not reachable.');
  }

  if (res.status === 404 || res.status === 501) throw new RenderUnavailableError('Image generation is not connected yet.');
  if (!res.ok) throw new Error(`Render error (${res.status}).`);
  if (!(res.headers.get('content-type') || '').includes('application/json')) throw new RenderUnavailableError('Render service is not connected yet.');

  const data = await res.json() as { url?: string; error?: string };
  if (!data.url) throw new Error(data.error || 'No image returned.');
  return { url: data.url };
}

function buildDesignDescription(): string {
  const { units, room } = useStore.getState();

  if (units.length === 0) return 'empty built-in nook space with warm painted walls';

  const types = units.map((u) => u.type);
  const hasTall = types.includes('tall');
  const hasBase = types.includes('base');
  const hasUpper = types.includes('upper');
  const hasShelf = types.includes('shelf');

  const nookType = detectNookType(units);
  const finishDesc = buildFinishDescription(units);
  const sizeDesc = buildSizeDescription(units);
  const roomDesc = room.enabled ? `in a ${Math.round(room.width / 12)}×${Math.round(room.length / 12)} foot room` : 'against a wall';

  const parts: string[] = [];
  if (hasTall && hasBase) parts.push('locker tower and bench base storage unit');
  else if (hasBase) parts.push('bench cabinet with storage');
  else if (hasTall) parts.push('tall locker tower cabinet');
  if (hasUpper) parts.push('upper wall cabinet');
  if (hasShelf) parts.push('floating display shelf');

  const cabinetDesc = parts.length > 0 ? parts.join(', ') : 'custom built-in cabinetry';

  return `${nookType} with ${cabinetDesc}, ${finishDesc}, ${sizeDesc} ${roomDesc}. Shaker-style doors with satin brass hardware. Warm, family-home interior.`;
}

function detectNookType(units: Unit[]): string {
  const types = units.map((u) => u.type);
  const hasTall = types.includes('tall');
  const hasBase = types.includes('base');
  const hasUpper = types.includes('upper');

  if (hasTall && hasBase) return 'mudroom entry nook with coat storage';
  if (hasUpper && hasBase) return 'coffee hutch nook with counter and wall storage';
  if (hasBase && !hasTall) return 'low storage nook with bench seating';
  if (hasUpper && !hasBase) return 'laundry utility nook with upper cabinet storage';
  return 'custom built-in storage nook';
}

function buildFinishDescription(units: Unit[]): string {
  const materialIds = units.map((u) => u.materials.carcass);
  const unique = [...new Set(materialIds)];
  const labels: Record<string, string> = {
    'sw-alabaster': 'soft white painted finish',
    'sw-pure-white': 'crisp white painted finish',
    'sw-accessible-beige': 'warm beige painted finish',
    'sw-agreeable-gray': 'greige painted finish',
    'sw-evergreen-fog': 'sage green painted finish',
    'sw-iron-ore': 'dark charcoal painted finish',
    'white-oak': 'natural white oak wood finish',
    'white-oak-rift': 'rift-cut white oak wood finish',
    'walnut': 'warm walnut wood finish',
    'walnut-deep': 'dark walnut wood finish',
    'uv-ply-natural': 'natural birch plywood finish',
  };
  const desc = labels[unique[0]] ?? 'painted finish';
  return unique.length > 1 ? `${desc} with wood accents` : desc;
}

function buildSizeDescription(units: Unit[]): string {
  const totalWidth = units.reduce((s, u) => s + u.overall.width, 0);
  const maxHeight = Math.max(...units.map((u) => u.overall.height + u.mountHeight));
  const ft = (n: number) => `${Math.round(n / 12)} foot`;
  return `approximately ${ft(totalWidth)} wide and ${ft(maxHeight)} tall`;
}

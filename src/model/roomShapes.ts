// =============================================================================
// ROOM SHAPES — footprint outlines + wall segment geometry
// =============================================================================
// Each shape turns the room's dimensions into a list of corner points (in the
// x–z floor plane). From those we derive wall segments with the direction,
// outward normal, midpoint, length, and Y-rotation each needs to render and to
// snap cabinets / openings onto.
// =============================================================================

import type { RoomModel, RoomShape } from './room';

export type Vec2 = [number, number]; // [x, z]

export interface WallSeg {
  index: number;
  a: Vec2;
  b: Vec2;
  mid: Vec2;
  dir: Vec2; // unit vector a→b
  normal: Vec2; // unit outward normal (points away from the room interior)
  length: number;
  angleY: number; // Y-rotation so a box's local +x aligns with `dir`
  label: string; // friendly name for the wall picker
}

export interface Footprint {
  points: Vec2[];
  walls: WallSeg[];
}

export const SHAPE_LABELS: Record<RoomShape, string> = {
  rect: 'Rectangle',
  l: 'L-shape',
  u: 'U-shape',
  alcove: 'Alcove',
  corner: 'Corner',
};

// --- Footprint corner points per shape (clockwise from back-left) -----------
function points(room: RoomModel): Vec2[] {
  const W = room.width;
  const L = room.length;
  const x = W / 2;
  const z = L / 2;

  switch (room.shape) {
    case 'rect':
      return [
        [-x, -z],
        [x, -z],
        [x, z],
        [-x, z],
      ];

    case 'l': {
      // Notch removed from the front-right corner.
      const nw = Math.min(room.notchW, W - 12);
      const nl = Math.min(room.notchL, L - 12);
      return [
        [-x, -z],
        [x, -z],
        [x, z - nl],
        [x - nw, z - nl],
        [x - nw, z],
        [-x, z],
      ];
    }

    case 'u': {
      // Slot carved from the middle of the front wall.
      const nw = Math.min(room.notchW, W - 24);
      const nl = Math.min(room.notchL, L - 12);
      return [
        [-x, -z],
        [x, -z],
        [x, z],
        [nw / 2, z],
        [nw / 2, z - nl],
        [-nw / 2, z - nl],
        [-nw / 2, z],
        [-x, z],
      ];
    }

    case 'alcove': {
      // Niche pushed OUT of the back wall (great for nesting a built-in).
      const rw = Math.min(room.recessW, W - 24);
      const rd = room.recessD;
      return [
        [-x, -z],
        [-rw / 2, -z],
        [-rw / 2, -z - rd],
        [rw / 2, -z - rd],
        [rw / 2, -z],
        [x, -z],
        [x, z],
        [-x, z],
      ];
    }

    case 'corner': {
      // Back-right corner chamfered at 45° — where a corner pantry sits.
      const c = Math.min(room.corner, W - 12, L - 12);
      return [
        [-x, -z],
        [x - c, -z],
        [x, -z + c],
        [x, z],
        [-x, z],
      ];
    }
  }
}

function sub(a: Vec2, b: Vec2): Vec2 {
  return [a[0] - b[0], a[1] - b[1]];
}
function len(v: Vec2): number {
  return Math.hypot(v[0], v[1]);
}

/** Average of vertices — adequate "inside" reference for our shapes. */
function centroid(pts: Vec2[]): Vec2 {
  const s = pts.reduce<Vec2>((acc, p) => [acc[0] + p[0], acc[1] + p[1]], [0, 0]);
  return [s[0] / pts.length, s[1] / pts.length];
}

export function footprint(room: RoomModel): Footprint {
  const pts = points(room);
  const c = centroid(pts);
  const walls: WallSeg[] = [];

  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const e = sub(b, a);
    const l = len(e);
    if (l < 0.001) continue;
    const dir: Vec2 = [e[0] / l, e[1] / l];
    const mid: Vec2 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

    // Perpendicular, flipped to point away from the interior (centroid).
    let n: Vec2 = [dir[1], -dir[0]];
    const toMid: Vec2 = [mid[0] - c[0], mid[1] - c[1]];
    if (n[0] * toMid[0] + n[1] * toMid[1] < 0) n = [-n[0], -n[1]];

    walls.push({
      index: walls.length,
      a,
      b,
      mid,
      dir,
      normal: n,
      length: l,
      angleY: Math.atan2(-dir[1], dir[0]),
      label: `Wall ${walls.length + 1}`,
    });
  }

  return { points: pts, walls };
}

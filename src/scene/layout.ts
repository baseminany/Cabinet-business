// =============================================================================
// UNIT LAYOUT — where each unit sits in the 3D scene
// =============================================================================
// In a room: each unit snaps to its chosen wall (back to the wall, facing in),
// slid by its offset, lifted to its mount height. In studio mode (no room):
// units line up in a centered row. Returns a transform per unit, in order.
// =============================================================================

import type { RoomModel } from '../model/room';
import type { Unit } from '../model/types';
import { footprint } from '../model/roomShapes';

export interface UnitTransform {
  x: number;
  y: number;
  z: number;
  rotY: number;
}

export function unitTransforms(units: Unit[], room: RoomModel): UnitTransform[] {
  if (!room.enabled) {
    // Studio: centered row along x.
    const GAP = 4;
    const total = units.reduce((s, u) => s + u.overall.width, 0) + GAP * Math.max(0, units.length - 1);
    let cx = -total / 2;
    return units.map((u) => {
      const x = cx + u.overall.width / 2;
      cx += u.overall.width + GAP;
      return { x, y: u.mountHeight, z: 0, rotY: 0 };
    });
  }

  const walls = footprint(room).walls;
  return units.map((u) => {
    const wall = walls[Math.min(Math.max(u.placement.wallIndex, 0), walls.length - 1)];
    if (!wall) return { x: 0, y: u.mountHeight, z: 0, rotY: 0 };
    const inN: [number, number] = [-wall.normal[0], -wall.normal[1]];
    const maxOff = Math.max(0, wall.length / 2 - u.overall.width / 2);
    const off = Math.min(maxOff, Math.max(-maxOff, u.placement.offset));
    const ex = wall.mid[0] + wall.dir[0] * off;
    const ez = wall.mid[1] + wall.dir[1] * off;
    return {
      x: ex + inN[0] * (u.overall.depth / 2),
      y: u.mountHeight,
      z: ez + inN[1] * (u.overall.depth / 2),
      rotY: Math.atan2(inN[0], inN[1]),
    };
  });
}

/** A rough center + size of the whole project, for camera framing. */
export function projectFocus(units: Unit[], transforms: UnitTransform[]) {
  if (units.length === 0) return { cx: 0, cz: 0, topY: 36 };
  let cx = 0;
  let cz = 0;
  let topY = 0;
  transforms.forEach((t, i) => {
    cx += t.x;
    cz += t.z;
    topY = Math.max(topY, t.y + units[i].overall.height);
  });
  return { cx: cx / units.length, cz: cz / units.length, topY };
}

import type { CabinetModel } from './types';

// A sensible starting cabinet so there's something on screen immediately:
// a 36"-wide, 84"-tall, 24"-deep two-bay pantry with painted doors.
export const defaultModel: CabinetModel = {
  units: 'in',
  overall: { width: 36, height: 84, depth: 24 },
  sections: 2,
  shelvesPerSection: 4,
  door: 'double',
  toeKick: { enabled: true, height: 4 },
  materials: {
    carcass: 'uv-ply-natural',
    doors: 'painted-white',
    back: 'ply-back',
  },
};

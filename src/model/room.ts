// =============================================================================
// ROOM MODEL — the customer's measured space (editable wall outline)
// =============================================================================
// A room is a SHAPE preset (rectangle, L, U, alcove, corner-pantry) plus a few
// fine-tune dimensions, which together define a footprint outline = a list of
// wall segments. Windows and doors are added by the customer, each pinned to a
// wall with its own measurements and a position along that wall.
//
// This wall-outline model is the same one a future free editor will use — so
// nothing here is throwaway.
//
// Floor plane is x–z (x right, z toward viewer); y is up. Footprints are
// centered on the origin.
// =============================================================================

export type RoomShape = 'rect' | 'l' | 'u' | 'alcove' | 'corner';

export type OpeningKind = 'window' | 'door';

export interface Opening {
  id: string;
  kind: OpeningKind;
  wallIndex: number; // which wall segment it sits on
  offset: number; // distance from the wall's midpoint, + toward the wall's end
  width: number;
  height: number;
  sill: number; // floor → bottom of a window; doors ignore (start at floor)
}

export interface RoomModel {
  enabled: boolean;
  shape: RoomShape;

  // Overall bounding size.
  width: number; // x
  length: number; // z
  height: number; // ceiling

  // Shape-specific fine-tuning (each shape reads what it needs).
  notchW: number; // L & U: width of the removed corner / slot
  notchL: number; // L & U: depth of the removed corner / slot
  recessW: number; // alcove: width of the niche
  recessD: number; // alcove: how far the niche pushes out
  corner: number; // corner-pantry: size of the 45° chamfer

  openings: Opening[];
}

/** Where the cabinet sits: snapped to a wall, slid along it. */
export interface Placement {
  wallIndex: number;
  offset: number; // along the wall from its midpoint, 0 = centered
}

export const WALL_THICKNESS = 4.5;

let _id = 0;
export function newOpening(kind: OpeningKind, wallIndex: number): Opening {
  _id += 1;
  return kind === 'window'
    ? { id: `op${_id}`, kind, wallIndex, offset: 0, width: 36, height: 48, sill: 36 }
    : { id: `op${_id}`, kind, wallIndex, offset: 0, width: 32, height: 80, sill: 0 };
}

export const defaultRoom: RoomModel = {
  enabled: true,
  shape: 'rect',
  width: 144,
  length: 132,
  height: 96,
  notchW: 60,
  notchL: 54,
  recessW: 48,
  recessD: 14,
  corner: 32,
  openings: [{ id: 'op0', kind: 'window', wallIndex: 0, offset: 40, width: 36, height: 48, sill: 36 }],
};

export const defaultPlacement: Placement = { wallIndex: 0, offset: 0 };

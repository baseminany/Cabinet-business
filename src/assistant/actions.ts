// =============================================================================
// DESIGN ASSISTANT — action executor
// =============================================================================
// Applies validated DesignAction[] to the real app state. Clamps placements,
// selects newly added/changed units, and returns human warnings. Never lets the
// assistant create impossible geometry silently.
// =============================================================================

import { useStore } from '../store';
import { footprint } from '../model/roomShapes';
import type { DesignAction } from './types';
import type { AssistantContext } from './types';

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export function buildContext(): AssistantContext {
  const s = useStore.getState();
  const wallCount = s.room.enabled ? footprint(s.room).walls.length : 0;
  return {
    room: s.room,
    units: s.units.map((u) => ({ id: u.id, type: u.type, label: u.label, overall: u.overall, placement: u.placement, materials: u.materials, door: u.door })),
    selectedId: s.selectedId,
    wallCount,
  };
}

export function executeDesignActions(actions: DesignAction[]): string[] {
  const warnings: string[] = [];
  const s = () => useStore.getState();

  const wallsOf = () => (s().room.enabled ? footprint(s().room).walls : []);

  for (const a of actions) {
    try {
      switch (a.type) {
        case 'ADD_UNIT': {
          s().addUnit(a.unitType);
          const id = s().selectedId;
          if (!id) break;
          if (a.dimensions) s().setSelOverall(a.dimensions);
          if (a.label) s().updateUnit(id, { label: a.label });
          if (a.options) s().updateUnit(id, a.options);
          if (a.wallIndex != null || a.offset != null) {
            const walls = wallsOf();
            const wi = clamp(a.wallIndex ?? 0, 0, Math.max(0, walls.length - 1));
            const w = walls[wi];
            const u = s().units.find((x) => x.id === id);
            const maxOff = w && u ? Math.max(0, w.length / 2 - u.overall.width / 2) : 0;
            s().setSelPlacement({ wallIndex: wi, offset: clamp(a.offset ?? 0, -maxOff, maxOff) });
          }
          break;
        }
        case 'UPDATE_UNIT':
          s().updateUnit(a.unitId, a.patch);
          s().selectUnit(a.unitId);
          break;
        case 'MOVE_UNIT': {
          const walls = wallsOf();
          const wi = clamp(a.wallIndex, 0, Math.max(0, walls.length - 1));
          const w = walls[wi];
          const u = s().units.find((x) => x.id === a.unitId);
          if (!u) { warnings.push(`Couldn't find that piece to move.`); break; }
          const maxOff = w ? Math.max(0, w.length / 2 - u.overall.width / 2) : 0;
          s().updateUnit(a.unitId, { placement: { wallIndex: wi, offset: clamp(a.offset, -maxOff, maxOff) } });
          s().selectUnit(a.unitId);
          break;
        }
        case 'DELETE_UNIT':
          s().removeUnit(a.unitId);
          break;
        case 'ADD_OPENING': {
          const walls = wallsOf();
          if (walls.length === 0) { warnings.push('Add a room before adding windows or doors.'); break; }
          const wi = clamp(a.wallIndex, 0, walls.length - 1);
          s().addOpening(a.kind, wi);
          const op = s().room.openings[s().room.openings.length - 1];
          if (op) s().updateOpening(op.id, { offset: a.offset, width: a.width, height: a.height, sill: a.sill ?? op.sill });
          break;
        }
        case 'SET_ROOM':
          s().setRoom(a.patch);
          break;
        case 'SET_MATERIAL': {
          const u = s().units.find((x) => x.id === a.unitId);
          if (!u) { warnings.push('Couldn\'t find that piece to refinish.'); break; }
          s().updateUnit(a.unitId, { materials: { ...u.materials, [a.role]: a.materialId } });
          s().selectUnit(a.unitId);
          break;
        }
        case 'EXPLAIN':
          break; // text-only; surfaced via response.message
      }
    } catch (e) {
      warnings.push(`Couldn't apply one change: ${(e as Error).message}`);
    }
  }
  return warnings;
}

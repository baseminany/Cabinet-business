// =============================================================================
// DESIGN ASSISTANT — action schema
// =============================================================================
// The assistant is ACTION-BASED, not a chat that only replies with text. The
// backend LLM returns a strict JSON object of this shape; the client validates
// it and applies the actions to the real app state (see actions.ts).
// =============================================================================

import type { UnitType, Unit, MaterialId } from '../model/types';
import type { RoomModel, OpeningKind } from '../model/room';

export type DesignAction =
  | { type: 'ADD_UNIT'; unitType: UnitType; wallIndex?: number; offset?: number; dimensions?: Partial<Unit['overall']>; label?: string; options?: Partial<Unit> }
  | { type: 'UPDATE_UNIT'; unitId: string; patch: Partial<Unit> }
  | { type: 'MOVE_UNIT'; unitId: string; wallIndex: number; offset: number }
  | { type: 'DELETE_UNIT'; unitId: string }
  | { type: 'ADD_OPENING'; kind: OpeningKind; wallIndex: number; offset: number; width: number; height: number; sill?: number }
  | { type: 'SET_ROOM'; patch: Partial<RoomModel> }
  | { type: 'SET_MATERIAL'; unitId: string; role: 'carcass' | 'doors' | 'back'; materialId: MaterialId }
  | { type: 'EXPLAIN'; message: string };

/** What the backend returns. Strict JSON — never free text outside `message`. */
export interface AssistantResponse {
  message: string;
  actions: DesignAction[];
  questions?: string[];
  warnings?: string[];
}

/** Compact project context the client sends to the backend each turn. */
export interface AssistantContext {
  room: RoomModel;
  units: Array<Pick<Unit, 'id' | 'type' | 'label' | 'overall' | 'placement' | 'materials' | 'door'>>;
  selectedId: string | null;
  wallCount: number;
}

// =============================================================================
// APP STATE (Zustand)
// =============================================================================
// The design = a Room + a list of Units. Plus UI state (wizard step, selection,
// view). The 3D scene, pricing, and cut list all read from here.
// =============================================================================

import { create } from 'zustand';
import type { Unit, UnitType } from './model/types';
import { makeUnit } from './model/catalog';
import {
  defaultRoom,
  newOpening,
  type RoomModel,
  type Opening,
  type OpeningKind,
} from './model/room';
import type { RoomScanStatus, RoomAnalysisResult } from './model/roomAnalysis';
import { requestRoomAnalysis, AnalysisUnavailableError } from './services/roomAnalysis';

export type ViewMode = 'design' | 'maker';

/** Wizard steps. welcome + entry + photoReview are full-screen; rest are the wizard. */
export type Step = 'welcome' | 'entry' | 'photoReview' | 'room' | 'openings' | 'pieces' | 'quote';

/** Maker mode is gated — never visible to customers on the public site. */
export function makerEnabled(): boolean {
  try {
    if (new URLSearchParams(location.search).get('maker') === '1') return true;
    if (localStorage.getItem('STUDIO_MAKER_MODE') === 'true') return true;
  } catch { /* ignore */ }
  return import.meta.env.VITE_ENABLE_MAKER_MODE === 'true';
}

type UnitPatch = Partial<Unit>;

interface AppState {
  room: RoomModel;
  units: Unit[];
  selectedId: string | null;
  /** Id of the unit currently being dragged in the 3D view (disables orbit). */
  draggingId: string | null;
  setDragging: (id: string | null) => void;
  /** Optional reference photo of the room + analysis state. */
  roomPhoto: string | null;
  roomScanStatus: RoomScanStatus;
  roomScanError: string | null;
  roomAnalysisResult: RoomAnalysisResult | null;
  analyzeRoomPhoto: (file: File) => Promise<void>;
  applyRoomAnalysis: (r: RoomAnalysisResult) => void;
  resetRoomScan: () => void;

  view: ViewMode;
  setView: (v: ViewMode) => void;
  step: Step;
  setStep: (s: Step) => void;
  setRoomPhoto: (dataUrl: string | null) => void;

  // Units
  addUnit: (type: UnitType) => void;
  removeUnit: (id: string) => void;
  duplicateUnit: (id: string) => void;
  selectUnit: (id: string) => void;
  updateUnit: (id: string, patch: UnitPatch) => void;
  // Selected-unit convenience setters
  updateSel: (patch: UnitPatch) => void;
  setSelOverall: (patch: Partial<Unit['overall']>) => void;
  setSelToeKick: (patch: Partial<Unit['toeKick']>) => void;
  setSelMaterials: (patch: Partial<Unit['materials']>) => void;
  setSelConstruction: (patch: Partial<Unit['construction']>) => void;
  setSelPaint: (paint: Unit['paint']) => void;
  setSelPlacement: (patch: Partial<Unit['placement']>) => void;

  // Room
  setRoom: (patch: Partial<RoomModel>) => void;
  addOpening: (kind: OpeningKind, wallIndex: number) => void;
  updateOpening: (id: string, patch: Partial<Opening>) => void;
  removeOpening: (id: string) => void;
}

export const useStore = create<AppState>((set) => {
  const patchUnit = (s: AppState, id: string | null, patch: UnitPatch): Partial<AppState> => ({
    units: s.units.map((u) => (u.id === id ? { ...u, ...patch } : u)),
  });

  return {
    room: defaultRoom,
    units: [],
    selectedId: null,
    draggingId: null,
    setDragging: (id) => set({ draggingId: id }),
    roomPhoto: null,
    roomScanStatus: 'idle',
    roomScanError: null,
    roomAnalysisResult: null,

    analyzeRoomPhoto: async (file) => {
      // Keep a thumbnail/reference regardless of whether analysis succeeds.
      const dataUrl = await new Promise<string | null>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
      set({ roomPhoto: dataUrl, roomScanStatus: 'analyzing', roomScanError: null, roomAnalysisResult: null });
      try {
        const result = await requestRoomAnalysis(file);
        set({ roomScanStatus: 'success', roomAnalysisResult: result });
      } catch (e) {
        const unavailable = e instanceof AnalysisUnavailableError;
        set({
          roomScanStatus: 'error',
          roomScanError: unavailable
            ? 'Photo analysis isn’t connected yet — you can still use this photo as a reference and shape the room yourself.'
            : (e as Error).message || 'Analysis failed.',
        });
      }
    },

    applyRoomAnalysis: (r) =>
      set((s) => {
        const room: RoomModel = { ...s.room, enabled: true, shape: r.room.shape };
        const keys = ['width', 'length', 'height', 'notchW', 'notchL', 'recessW', 'recessD', 'corner'] as const;
        for (const k of keys) if (typeof r.room[k] === 'number') (room as any)[k] = r.room[k];
        room.openings = r.openings.map((o, i) => ({ id: `op${i}`, kind: o.kind, wallIndex: o.wallIndex, offset: o.offset, width: o.width, height: o.height, sill: o.sill }));
        return { room };
      }),

    resetRoomScan: () => set({ roomScanStatus: 'idle', roomScanError: null, roomAnalysisResult: null, roomPhoto: null }),

    view: 'design',
    setView: (v) => set({ view: v }),
    step: 'welcome',
    setStep: (s) => set({ step: s }),
    setRoomPhoto: (dataUrl) => set({ roomPhoto: dataUrl }),

    addUnit: (type) =>
      set((s) => {
        const u = makeUnit(type);
        // Tile new units to the right of any already on the same wall.
        const used = s.units
          .filter((x) => x.placement.wallIndex === u.placement.wallIndex)
          .reduce((a, x) => a + x.overall.width, 0);
        u.placement = { ...u.placement, offset: used };
        return { units: [...s.units, u], selectedId: u.id };
      }),
    removeUnit: (id) =>
      set((s) => {
        const units = s.units.filter((u) => u.id !== id);
        return { units, selectedId: s.selectedId === id ? (units[0]?.id ?? null) : s.selectedId };
      }),
    duplicateUnit: (id) =>
      set((s) => {
        const src = s.units.find((u) => u.id === id);
        if (!src) return {};
        const copy: Unit = { ...src, id: `u${Date.now()}`, label: `${src.label} copy`, placement: { ...src.placement, offset: src.placement.offset + src.overall.width } };
        return { units: [...s.units, copy], selectedId: copy.id };
      }),
    selectUnit: (id) => set({ selectedId: id }),
    updateUnit: (id, patch) => set((s) => patchUnit(s, id, patch)),

    updateSel: (patch) => set((s) => patchUnit(s, s.selectedId, patch)),
    setSelOverall: (patch) => set((s) => patchUnit(s, s.selectedId, { overall: { ...sel(s)!.overall, ...patch } })),
    setSelToeKick: (patch) => set((s) => patchUnit(s, s.selectedId, { toeKick: { ...sel(s)!.toeKick, ...patch } })),
    setSelMaterials: (patch) => set((s) => patchUnit(s, s.selectedId, { materials: { ...sel(s)!.materials, ...patch } })),
    setSelConstruction: (patch) => set((s) => patchUnit(s, s.selectedId, { construction: { ...sel(s)!.construction, ...patch } })),
    setSelPaint: (paint) => set((s) => patchUnit(s, s.selectedId, { paint })),
    setSelPlacement: (patch) => set((s) => patchUnit(s, s.selectedId, { placement: { ...sel(s)!.placement, ...patch } })),

    setRoom: (patch) => set((s) => ({ room: { ...s.room, ...patch } })),
    addOpening: (kind, wallIndex) => set((s) => ({ room: { ...s.room, openings: [...s.room.openings, newOpening(kind, wallIndex)] } })),
    updateOpening: (id, patch) => set((s) => ({ room: { ...s.room, openings: s.room.openings.map((o) => (o.id === id ? { ...o, ...patch } : o)) } })),
    removeOpening: (id) => set((s) => ({ room: { ...s.room, openings: s.room.openings.filter((o) => o.id !== id) } })),
  };
});

/** The currently selected unit (or undefined). */
export function sel(s: AppState): Unit | undefined {
  return s.units.find((u) => u.id === s.selectedId);
}

/** Hook helper: the selected unit. */
export const useSelectedUnit = () => useStore((s) => s.units.find((u) => u.id === s.selectedId));

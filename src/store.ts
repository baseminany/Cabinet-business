// =============================================================================
// APP STATE (Zustand)
// =============================================================================

import { create } from 'zustand';
import type { Unit, UnitType } from './model/types';
import { makeUnit } from './model/catalog';
import { defaultRoom, newOpening, type RoomModel, type Opening, type OpeningKind } from './model/room';
import type { RoomScanStatus, RoomAnalysisResult } from './model/roomAnalysis';
import { requestRoomAnalysis, AnalysisUnavailableError } from './services/roomAnalysis';
import { footprint } from './model/roomShapes';

export type ViewMode = 'design' | 'maker';
export type CameraPreset = 'perspective' | 'front' | 'top';
export type Step = 'welcome' | 'intake' | 'entry' | 'shop' | 'photoReview' | 'room' | 'openings' | 'pieces' | 'quote';

/** Which shop category the shop screen opens on (set by the intake page). */
export type ShopCategory = 'Kids' | 'Entry' | 'Coffee' | 'Storage' | 'All';

export function makerEnabled(): boolean {
  try {
    if (new URLSearchParams(location.search).get('maker') === '1') return true;
    if (localStorage.getItem('STUDIO_MAKER_MODE') === 'true') return true;
  } catch { /* ignore */ }
  return import.meta.env.VITE_ENABLE_MAKER_MODE === 'true';
}

type UnitPatch = Partial<Unit>;
const STORAGE_KEY = 'STUDIO_DESIGN_V1';

const BLANK_ROOM: RoomModel = {
  ...defaultRoom,
  enabled: true,
  shape: 'rect',
  width: 120,
  length: 96,
  height: 96,
  openings: [],
};

const DEMO_ROOM: RoomModel = {
  ...defaultRoom,
  enabled: true,
  shape: 'rect',
  width: 144,
  length: 132,
  height: 96,
  openings: [{ id: 'op0', kind: 'window', wallIndex: 0, offset: 40, width: 36, height: 48, sill: 36 }],
};

function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function cleanRoom(room: RoomModel): RoomModel {
  const next: RoomModel = {
    ...BLANK_ROOM,
    ...room,
    width: clamp(room.width, 24, 480),
    length: clamp(room.length, 24, 480),
    height: clamp(room.height, 72, 180),
  };
  const walls = footprint(next).walls;
  const wallCount = Math.max(1, walls.length);
  next.openings = (next.openings || []).map((o) => {
    const wallIndex = clamp(o.wallIndex, 0, wallCount - 1);
    const wall = walls[wallIndex];
    const width = clamp(o.width, 6, wall ? Math.max(6, wall.length - 2) : 96);
    const height = clamp(o.height, 6, next.height);
    const sill = o.kind === 'door' ? 0 : clamp(o.sill, 0, Math.max(0, next.height - height));
    const maxOff = wall ? Math.max(0, wall.length / 2 - width / 2) : 0;
    return { ...o, wallIndex, width, height, sill, offset: clamp(o.offset, -maxOff, maxOff) };
  });
  return next;
}

function loadSaved(): Partial<AppState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { room?: RoomModel; units?: Unit[]; selectedId?: string | null; step?: Step };
    return {
      room: parsed.room ? cleanRoom(parsed.room) : BLANK_ROOM,
      units: Array.isArray(parsed.units) ? parsed.units : [],
      selectedId: parsed.selectedId ?? null,
      step: parsed.step && parsed.step !== 'welcome' ? parsed.step : 'entry',
    };
  } catch {
    return null;
  }
}

interface AppState {
  room: RoomModel;
  units: Unit[];
  selectedId: string | null;
  draggingId: string | null;
  setDragging: (id: string | null) => void;
  draggingOpeningId: string | null;
  setDraggingOpening: (id: string | null) => void;
  roomPhoto: string | null;
  roomScanStatus: RoomScanStatus;
  roomScanError: string | null;
  roomAnalysisResult: RoomAnalysisResult | null;
  analyzeRoomPhoto: (file: File) => Promise<void>;
  applyRoomAnalysis: (r: RoomAnalysisResult) => void;
  resetRoomScan: () => void;
  view: ViewMode;
  setView: (v: ViewMode) => void;
  cameraPreset: CameraPreset;
  setCameraPreset: (v: CameraPreset) => void;
  step: Step;
  setStep: (s: Step) => void;
  shopCategory: ShopCategory;
  /** Open the ready-made shop on a given category (used by the intake page). */
  openShop: (cat: ShopCategory) => void;
  setRoomPhoto: (dataUrl: string | null) => void;
  startBlankRoom: () => void;
  startDemoRoom: () => void;
  resetProject: () => void;
  addUnit: (type: UnitType) => void;
  addPresetUnit: (type: UnitType, width?: number) => void;
  /** Load a fully-configured pre-built product (studio mode) and jump to a step. */
  orderPreset: (newUnits: Unit[], goTo: Step) => void;
  removeUnit: (id: string) => void;
  duplicateUnit: (id: string) => void;
  selectUnit: (id: string) => void;
  updateUnit: (id: string, patch: UnitPatch) => void;
  updateSel: (patch: UnitPatch) => void;
  setSelOverall: (patch: Partial<Unit['overall']>) => void;
  setSelToeKick: (patch: Partial<Unit['toeKick']>) => void;
  setSelMaterials: (patch: Partial<Unit['materials']>) => void;
  setSelConstruction: (patch: Partial<Unit['construction']>) => void;
  setSelPaint: (paint: Unit['paint']) => void;
  setSelPlacement: (patch: Partial<Unit['placement']>) => void;
  setRoom: (patch: Partial<RoomModel>) => void;
  addOpening: (kind: OpeningKind, wallIndex: number) => void;
  updateOpening: (id: string, patch: Partial<Opening>) => void;
  removeOpening: (id: string) => void;
}

const saved = typeof window !== 'undefined' ? loadSaved() : null;

export const useStore = create<AppState>((set, get) => {
  const patchUnit = (s: AppState, id: string | null, patch: UnitPatch): Partial<AppState> => ({
    units: s.units.map((u) => (u.id === id ? { ...u, ...patch } : u)),
  });
  const addSized = (type: UnitType, width?: number) => {
    const u = makeUnit(type);
    if (width) u.overall.width = width;
    const s = get();
    const wall = footprint(s.room).walls[u.placement.wallIndex];
    const maxOff = wall ? Math.max(0, wall.length / 2 - u.overall.width / 2) : 0;
    const used = s.units.filter((x) => x.placement.wallIndex === u.placement.wallIndex).reduce((a, x) => a + x.overall.width, 0);
    u.placement = { ...u.placement, offset: clamp(used - maxOff, -maxOff, maxOff) };
    set({ units: [...s.units, u], selectedId: u.id });
  };

  return {
    room: saved?.room ?? BLANK_ROOM,
    units: saved?.units ?? [],
    selectedId: saved?.selectedId ?? null,
    draggingId: null,
    setDragging: (id) => set({ draggingId: id }),
    draggingOpeningId: null,
    setDraggingOpening: (id) => set({ draggingOpeningId: id }),
    roomPhoto: null,
    roomScanStatus: 'idle',
    roomScanError: null,
    roomAnalysisResult: null,
    analyzeRoomPhoto: async (file) => {
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
          roomScanError: unavailable ? 'Photo analysis is not connected yet. The photo is saved as a reference, and you can build the room manually.' : (e as Error).message || 'Analysis failed.',
        });
      }
    },
    applyRoomAnalysis: (r) => set((s) => {
      const room: RoomModel = cleanRoom({ ...s.room, enabled: true, shape: r.room.shape, openings: r.openings.map((o, i) => ({ id: `op${i}`, kind: o.kind, wallIndex: o.wallIndex, offset: o.offset, width: o.width, height: o.height, sill: o.sill })) });
      const keys = ['width', 'length', 'height', 'notchW', 'notchL', 'recessW', 'recessD', 'corner'] as const;
      for (const k of keys) if (typeof r.room[k] === 'number') (room as any)[k] = r.room[k];
      return { room: cleanRoom(room) };
    }),
    resetRoomScan: () => set({ roomScanStatus: 'idle', roomScanError: null, roomAnalysisResult: null, roomPhoto: null }),
    view: 'design',
    setView: (v) => set({ view: v }),
    cameraPreset: 'perspective',
    setCameraPreset: (v) => set({ cameraPreset: v }),
    step: saved?.step ?? 'welcome',
    setStep: (s) => set({ step: s }),
    shopCategory: 'Kids',
    openShop: (cat) => set({ shopCategory: cat, step: 'shop' }),
    setRoomPhoto: (dataUrl) => set({ roomPhoto: dataUrl }),
    startBlankRoom: () => set({ room: BLANK_ROOM, units: [], selectedId: null, step: 'room', view: 'design', cameraPreset: 'perspective' }),
    startDemoRoom: () => set({ room: DEMO_ROOM, units: [], selectedId: null, step: 'room', view: 'design', cameraPreset: 'perspective' }),
    resetProject: () => set({ room: BLANK_ROOM, units: [], selectedId: null, step: 'entry', roomPhoto: null, roomScanStatus: 'idle', roomScanError: null, roomAnalysisResult: null }),
    addUnit: (type) => addSized(type),
    addPresetUnit: (type, width) => addSized(type, width),
    orderPreset: (newUnits, goTo) => set((s) => ({
      room: { ...s.room, enabled: false },
      units: [...s.units, ...newUnits],
      selectedId: newUnits[newUnits.length - 1]?.id ?? s.selectedId,
      step: goTo,
      view: 'design',
      cameraPreset: 'perspective',
    })),
    removeUnit: (id) => set((s) => {
      const units = s.units.filter((u) => u.id !== id);
      return { units, selectedId: s.selectedId === id ? (units[0]?.id ?? null) : s.selectedId };
    }),
    duplicateUnit: (id) => set((s) => {
      const src = s.units.find((u) => u.id === id);
      if (!src) return {};
      const copy: Unit = { ...src, id: `u${Date.now()}`, label: `${src.label} copy`, placement: { ...src.placement, offset: src.placement.offset + src.overall.width } };
      return { units: [...s.units, copy], selectedId: copy.id };
    }),
    selectUnit: (id) => set({ selectedId: id }),
    updateUnit: (id, patch) => set((s) => patchUnit(s, id, patch)),
    updateSel: (patch) => set((s) => (s.selectedId ? patchUnit(s, s.selectedId, patch) : {})),
    setSelOverall: (patch) => set((s) => (sel(s) ? patchUnit(s, s.selectedId, { overall: { ...sel(s)!.overall, ...patch } }) : {})),
    setSelToeKick: (patch) => set((s) => (sel(s) ? patchUnit(s, s.selectedId, { toeKick: { ...sel(s)!.toeKick, ...patch } }) : {})),
    setSelMaterials: (patch) => set((s) => (sel(s) ? patchUnit(s, s.selectedId, { materials: { ...sel(s)!.materials, ...patch } }) : {})),
    setSelConstruction: (patch) => set((s) => (sel(s) ? patchUnit(s, s.selectedId, { construction: { ...sel(s)!.construction, ...patch } }) : {})),
    setSelPaint: (paint) => set((s) => (sel(s) ? patchUnit(s, s.selectedId, { paint }) : {})),
    setSelPlacement: (patch) => set((s) => (sel(s) ? patchUnit(s, s.selectedId, { placement: { ...sel(s)!.placement, ...patch } }) : {})),
    setRoom: (patch) => set((s) => ({ room: cleanRoom({ ...s.room, ...patch }) })),
    addOpening: (kind, wallIndex) => set((s) => ({ room: cleanRoom({ ...s.room, openings: [...s.room.openings, newOpening(kind, wallIndex)] }) })),
    updateOpening: (id, patch) => set((s) => ({ room: cleanRoom({ ...s.room, openings: s.room.openings.map((o) => (o.id === id ? { ...o, ...patch } : o)) }) })),
    removeOpening: (id) => set((s) => ({ room: { ...s.room, openings: s.room.openings.filter((o) => o.id !== id) } })),
  };
});

useStore.subscribe((s) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ room: s.room, units: s.units, selectedId: s.selectedId, step: s.step }));
  } catch { /* ignore */ }
});

export function sel(s: AppState): Unit | undefined {
  return s.units.find((u) => u.id === s.selectedId);
}

export const useSelectedUnit = () => useStore((s) => s.units.find((u) => u.id === s.selectedId));

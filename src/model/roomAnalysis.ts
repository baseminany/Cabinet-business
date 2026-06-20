// =============================================================================
// PHOTO → ROOM ANALYSIS (types)
// =============================================================================
// Shape of what a backend vision service returns for an uploaded room photo.
// Pure types — no React. The result is a STARTING DRAFT the customer confirms;
// we never claim exact measurement from a photo.
// =============================================================================

import type { RoomShape } from './room';

export type RoomScanStatus = 'idle' | 'analyzing' | 'success' | 'error';

export interface RoomAnalysisResult {
  version: '1.0';
  summary: string;
  confidence: number; // 0..1
  assumptions: string[];
  room: {
    shape: RoomShape;
    width?: number;
    length?: number;
    height?: number;
    notchW?: number;
    notchL?: number;
    recessW?: number;
    recessD?: number;
    corner?: number;
  };
  openings: Array<{
    kind: 'window' | 'door';
    wallIndex: number;
    offset: number;
    width: number;
    height: number;
    sill: number;
    confidence: number;
    label?: string;
  }>;
  recommendedCabinetZones: Array<{
    wallIndex: number;
    startOffset: number;
    endOffset: number;
    recommendedDepth: number;
    notes: string;
  }>;
  requiredMeasurements: Array<{
    key: string;
    label: string;
    reason: string;
    unit: 'in';
    value?: number;
  }>;
}

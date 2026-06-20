import { useMemo } from 'react';
import { Edges } from '@react-three/drei';
import type { Part } from '../model/types';
import { getMaterial } from '../model/materials';
import { useStore } from '../store';

// Draws a unit by rendering each Part as a box at its 3D position. Subtle edge
// lines give crisp definition (IKEA-planner style) so cabinets read clearly
// against walls. Reads the same Part[] as the cut list + pricing.
export default function CabinetMesh({ parts, unitId }: { parts: Part[]; unitId?: string }) {
  const selectedId = useStore((s) => s.selectedId);
  const selected = unitId != null && unitId === selectedId;
  return (
    <group>
      {parts.map((p) => (
        <PartBox key={p.id} part={p} selected={selected} />
      ))}
    </group>
  );
}

function PartBox({ part, selected }: { part: Part; selected: boolean }) {
  const def = useMemo(() => getMaterial(part.material), [part.material]);
  const { w, h, d } = part.size3d;
  const { x, y, z } = part.position;

  return (
    <mesh position={[x, y, z]} castShadow receiveShadow>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial color={def.color} roughness={def.roughness} metalness={0.02} />
      <Edges threshold={20} color={selected ? '#b88a44' : '#4a3c2b'} />
    </mesh>
  );
}

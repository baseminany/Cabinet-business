import { useMemo } from 'react';
import { Edges } from '@react-three/drei';
import type { Part } from '../model/types';
import { getMaterial } from '../model/materials';
import { useStore } from '../store';

export default function CabinetMesh({ parts, unitId }: { parts: Part[]; unitId?: string }) {
  const selectedId = useStore((s) => s.selectedId);
  const selected = unitId != null && unitId === selectedId;
  return (
    <group>
      {parts.map((p) => <PartBox key={p.id} part={p} selected={selected} />)}
    </group>
  );
}

function PartBox({ part, selected }: { part: Part; selected: boolean }) {
  const def = useMemo(() => getMaterial(part.material), [part.material]);
  const { w, h, d } = part.size3d;
  const { x, y, z } = part.position;
  const isDoor = part.role === 'door';
  const isWood = def.kind === 'wood';
  const edgeColor = selected ? '#b88a44' : isDoor ? '#2b2118' : '#6f604f';

  return (
    <group position={[x, y, z]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={def.color} roughness={def.roughness} metalness={0.015} />
        <Edges threshold={28} color={edgeColor} />
      </mesh>

      {isWood && <WoodGrain w={w} h={h} d={d} />}
      {isDoor && <DoorDetails w={w} h={h} d={d} selected={selected} />}
      {selected && <SelectionHalo w={w} h={h} d={d} />}
    </group>
  );
}

function WoodGrain({ w, h, d }: { w: number; h: number; d: number }) {
  return (
    <mesh position={[0, 0, d / 2 + 0.012]}>
      <boxGeometry args={[Math.max(0.1, w - 0.18), Math.max(0.1, h - 0.18), 0.01]} />
      <meshStandardMaterial color="#ffffff" roughness={0.8} transparent opacity={0.035} />
    </mesh>
  );
}

function DoorDetails({ w, h, d, selected }: { w: number; h: number; d: number; selected: boolean }) {
  const z = d / 2 + 0.04;
  const line = selected ? '#b88a44' : '#1f1710';
  return (
    <group>
      <mesh position={[0, 0, z]}>
        <boxGeometry args={[Math.max(0.1, w - 0.7), 0.08, 0.04]} />
        <meshStandardMaterial color={line} transparent opacity={0.22} />
      </mesh>
      <mesh position={[0, h * 0.38, z]}>
        <boxGeometry args={[Math.max(0.1, w - 1.2), 0.07, 0.04]} />
        <meshStandardMaterial color={line} transparent opacity={0.12} />
      </mesh>
      <mesh position={[w * 0.34, 0, z + 0.07]} castShadow>
        <boxGeometry args={[0.55, Math.min(18, h * 0.28), 0.55]} />
        <meshStandardMaterial color="#b88a44" roughness={0.32} metalness={0.55} />
      </mesh>
    </group>
  );
}

function SelectionHalo({ w, h, d }: { w: number; h: number; d: number }) {
  return (
    <mesh>
      <boxGeometry args={[w + 0.8, h + 0.8, d + 0.8]} />
      <meshBasicMaterial color="#b88a44" transparent opacity={0.045} depthWrite={false} />
      <Edges threshold={12} color="#b88a44" />
    </mesh>
  );
}

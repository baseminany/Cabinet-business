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
  const isBack = part.role === 'back';
  const isShelf = part.role === 'shelf';
  const isToeKick = part.role === 'toekick';
  const isWood = def.kind === 'wood';
  const isPainted = def.kind === 'painted';

  const edgeColor = selected ? '#c49a3a' : isDoor ? '#1a1008' : '#4a3828';
  const roughness = isPainted ? 0.36 : isWood ? Math.min(def.roughness, 0.48) : isBack ? 0.82 : def.roughness;
  const metalness = isPainted ? 0.12 : isWood ? 0.0 : 0.02;
  const envMapIntensity = isPainted ? 0.7 : isWood ? 0.35 : 0.18;

  return (
    <group position={[x, y, z]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={isToeKick ? darken(def.color, 0.12) : def.color}
          roughness={isToeKick ? 0.7 : roughness}
          metalness={metalness}
          envMapIntensity={envMapIntensity}
        />
        {!isBack && <Edges threshold={25} color={edgeColor} />}
      </mesh>

      {isWood && !isBack && !isToeKick && <WoodGrain w={w} h={h} d={d} />}
      {isDoor && <ShakerDoor w={w} h={h} d={d} selected={selected} color={def.color} isPainted={isPainted} />}
      {isShelf && <ShelfFrontEdge w={w} h={h} d={d} />}
      {selected && <SelectionHalo w={w} h={h} d={d} />}
    </group>
  );
}

function darken(hex: string, amount: number): string {
  try {
    const n = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, Math.round(((n >> 16) & 255) * (1 - amount)));
    const g = Math.max(0, Math.round(((n >> 8) & 255) * (1 - amount)));
    const b = Math.max(0, Math.round((n & 255) * (1 - amount)));
    return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
  } catch {
    return hex;
  }
}

function WoodGrain({ w, h, d }: { w: number; h: number; d: number }) {
  const lines = useMemo(() => {
    const result: { x: number; opacity: number; width: number }[] = [];
    const count = Math.max(3, Math.round(w / 3.2));
    const step = w / (count + 1);
    for (let i = 1; i <= count; i++) {
      const vary = (i % 3 === 0) ? 0.35 : (i % 2 === 0) ? 0.18 : 0.26;
      result.push({ x: -w / 2 + i * step + (i % 2 === 0 ? 0.3 : -0.3), opacity: vary, width: i % 4 === 0 ? 0.09 : 0.055 });
    }
    return result;
  }, [w]);

  return (
    <group>
      {lines.map((l, i) => (
        <mesh key={i} position={[l.x, 0, d / 2 + 0.016]}>
          <boxGeometry args={[l.width, Math.max(0.1, h - 0.15), 0.008]} />
          <meshStandardMaterial color="#1e0e04" roughness={0.95} transparent opacity={l.opacity} depthWrite={false} />
        </mesh>
      ))}
      {/* Subtle cross-grain shimmer overlay */}
      <mesh position={[0, 0, d / 2 + 0.013]}>
        <boxGeometry args={[Math.max(0.1, w - 0.2), Math.max(0.1, h - 0.2), 0.006]} />
        <meshStandardMaterial color="#ffffff" roughness={0.7} transparent opacity={0.028} depthWrite={false} />
      </mesh>
    </group>
  );
}

function ShakerDoor({ w, h, d, selected, isPainted }: { w: number; h: number; d: number; selected: boolean; color: string; isPainted: boolean }) {
  const fz = d / 2 + 0.025;
  const railH = Math.max(2.8, Math.min(5.5, h * 0.13));
  const stileW = Math.max(2.2, Math.min(4.5, w * 0.12));
  const lineColor = selected ? '#9b7220' : '#160e04';
  const lineOpacity = isPainted ? 0.48 : 0.38;
  const lineThick = 0.09;
  const panelW = Math.max(0.5, w - stileW * 2 - 0.5);
  const panelH = Math.max(0.5, h - railH * 2 - 0.5);
  const pullBrass = selected ? '#d4b050' : '#c4a040';
  const pullH = Math.min(15, Math.max(5, h * 0.23));

  return (
    <group>
      {/* Top rail inner edge */}
      <mesh position={[0, h / 2 - railH, fz]}>
        <boxGeometry args={[Math.max(0.1, w - stileW * 2 + lineThick), lineThick, lineThick]} />
        <meshStandardMaterial color={lineColor} roughness={0.85} transparent opacity={lineOpacity} depthWrite={false} />
      </mesh>
      {/* Bottom rail inner edge */}
      <mesh position={[0, -(h / 2 - railH), fz]}>
        <boxGeometry args={[Math.max(0.1, w - stileW * 2 + lineThick), lineThick, lineThick]} />
        <meshStandardMaterial color={lineColor} roughness={0.85} transparent opacity={lineOpacity} depthWrite={false} />
      </mesh>
      {/* Left stile inner edge */}
      <mesh position={[-(w / 2 - stileW), 0, fz]}>
        <boxGeometry args={[lineThick, Math.max(0.1, h - railH * 2), lineThick]} />
        <meshStandardMaterial color={lineColor} roughness={0.85} transparent opacity={lineOpacity * 0.85} depthWrite={false} />
      </mesh>
      {/* Right stile inner edge */}
      <mesh position={[w / 2 - stileW, 0, fz]}>
        <boxGeometry args={[lineThick, Math.max(0.1, h - railH * 2), lineThick]} />
        <meshStandardMaterial color={lineColor} roughness={0.85} transparent opacity={lineOpacity * 0.85} depthWrite={false} />
      </mesh>

      {/* Recessed center panel (shadow effect) */}
      {panelW > 1.5 && panelH > 1.5 && (
        <mesh position={[0, 0, fz - 0.14]}>
          <boxGeometry args={[panelW, panelH, 0.14]} />
          <meshStandardMaterial color={lineColor} roughness={0.95} transparent opacity={0.07} depthWrite={false} />
        </mesh>
      )}

      {/* Pull — satin brass bar */}
      <mesh position={[w * 0.33, 0, fz + 0.55]} castShadow>
        <boxGeometry args={[0.55, pullH, 0.55]} />
        <meshStandardMaterial color={pullBrass} roughness={0.18} metalness={0.78} envMapIntensity={1.4} />
      </mesh>
      {/* Pull mounting plate */}
      <mesh position={[w * 0.33, 0, fz + 0.18]}>
        <boxGeometry args={[0.9, pullH + 1.8, 0.12]} />
        <meshStandardMaterial color={pullBrass} roughness={0.32} metalness={0.52} transparent opacity={0.65} />
      </mesh>
    </group>
  );
}

function ShelfFrontEdge({ w, h, d }: { w: number; h: number; d: number }) {
  return (
    <mesh position={[0, 0, d / 2 + 0.02]}>
      <boxGeometry args={[Math.max(0.1, w - 0.1), Math.max(0.04, h + 0.04), 0.04]} />
      <meshStandardMaterial color="#1a0e06" roughness={0.92} transparent opacity={0.14} depthWrite={false} />
    </mesh>
  );
}

function SelectionHalo({ w, h, d }: { w: number; h: number; d: number }) {
  return (
    <mesh>
      <boxGeometry args={[w + 0.9, h + 0.9, d + 0.9]} />
      <meshBasicMaterial color="#c49a3a" transparent opacity={0.06} depthWrite={false} />
      <Edges threshold={12} color="#c49a3a" />
    </mesh>
  );
}

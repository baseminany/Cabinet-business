// =============================================================================
// ROOM 3D — polygon floor + oriented walls + baseboard + openings
// =============================================================================

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { RoomModel, Opening } from '../model/room';
import { WALL_THICKNESS as WT } from '../model/room';
import type { Vec2, WallSeg } from '../model/roomShapes';

const WALL_COLOR = '#eee7da';
const FLOOR_COLOR = '#b98555';
const FLOOR_LINE = '#9b6a43';
const TRIM_COLOR = '#fffdf8';
const GLASS_COLOR = '#8fb4c3';

const BB_H = 5;
const BB_D = 0.75;
const CW = 2.5;
const CD = 1.5;

type Vec3 = [number, number, number];

function Box({ size, position, rotationY = 0, color, roughness = 0.9, transparent, opacity }: { size: Vec3; position: Vec3; rotationY?: number; color: string; roughness?: number; transparent?: boolean; opacity?: number }) {
  return (
    <mesh position={position} rotation={[0, rotationY, 0]} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={roughness} metalness={0.015} transparent={transparent} opacity={opacity} />
    </mesh>
  );
}

export default function Room({ room, walls, points }: { room: RoomModel; walls: WallSeg[]; points: Vec2[] }) {
  const floorGeo = useMemo(() => {
    const shape = new THREE.Shape();
    points.forEach((p, i) => (i === 0 ? shape.moveTo(p[0], -p[1]) : shape.lineTo(p[0], -p[1])));
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
  }, [points]);

  return (
    <group>
      <mesh geometry={floorGeo} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]} receiveShadow>
        <meshStandardMaterial color={FLOOR_COLOR} roughness={0.62} side={THREE.DoubleSide} />
      </mesh>
      <FloorPlanks points={points} />

      {walls.map((w) => (
        <WallUnit key={w.index} wall={w} height={room.height} openings={room.openings.filter((o) => o.wallIndex === w.index)} />
      ))}
    </group>
  );
}

function FloorPlanks({ points }: { points: Vec2[] }) {
  const bounds = points.reduce(
    (b, p) => ({ minX: Math.min(b.minX, p[0]), maxX: Math.max(b.maxX, p[0]), minZ: Math.min(b.minZ, p[1]), maxZ: Math.max(b.maxZ, p[1]) }),
    { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity }
  );
  const lines: JSX.Element[] = [];
  for (let x = Math.floor(bounds.minX / 7) * 7; x <= bounds.maxX; x += 7) {
    lines.push(
      <line key={x} position={[0, 0.015, 0]}>
        <bufferGeometry attach="geometry" setFromPoints={[new THREE.Vector3(x, 0, -bounds.minZ), new THREE.Vector3(x, 0, -bounds.maxZ)]} />
        <lineBasicMaterial attach="material" color={FLOOR_LINE} transparent opacity={0.18} />
      </line>
    );
  }
  return <group>{lines}</group>;
}

function WallUnit({ wall, height, openings }: { wall: WallSeg; height: number; openings: Opening[] }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const cam = state.camera.position;
    const toCam = new THREE.Vector3(cam.x - wall.mid[0], 0, cam.z - wall.mid[1]);
    const facing = wall.normal[0] * toCam.x + wall.normal[1] * toCam.z;
    ref.current.visible = facing <= 0.0;
  });

  const [mx, mz] = wall.mid;
  const [nx, nz] = wall.normal;

  return (
    <group ref={ref}>
      <Box size={[wall.length, height, WT]} position={[mx + nx * (WT / 2), height / 2, mz + nz * (WT / 2)]} rotationY={wall.angleY} color={WALL_COLOR} roughness={0.97} />
      <Box size={[wall.length, BB_H, BB_D]} position={[mx - nx * (BB_D / 2), BB_H / 2, mz - nz * (BB_D / 2)]} rotationY={wall.angleY} color={TRIM_COLOR} roughness={0.55} />
      <Box size={[wall.length, 0.65, BB_D + 0.15]} position={[mx - nx * (BB_D / 2), BB_H + 0.33, mz - nz * (BB_D / 2)]} rotationY={wall.angleY} color={TRIM_COLOR} roughness={0.5} />
      {openings.map((o) => <OpeningMesh key={o.id} opening={o} wall={wall} />)}
    </group>
  );
}

function OpeningMesh({ opening, wall }: { opening: Opening; wall: WallSeg }) {
  const { kind, width: w, height: h, sill, offset } = opening;
  const [mx, mz] = wall.mid;
  const [dx, dz] = wall.dir;
  const px = mx + dx * offset;
  const pz = mz + dz * offset;
  const yc = kind === 'window' ? sill + h / 2 : h / 2;

  return (
    <group position={[px, yc, pz]} rotation={[0, wall.angleY, 0]}>
      {kind === 'window' ? (
        <>
          <Box size={[w, h, 0.7]} position={[0, 0, 0]} color={GLASS_COLOR} roughness={0.08} transparent opacity={0.5} />
          <Box size={[0.45, h, 0.9]} position={[0, 0, 0.55]} color="#e8f2f5" roughness={0.1} transparent opacity={0.45} />
          <Box size={[CW, h + 2 * CW, CD]} position={[-(w / 2 + CW / 2), 0, 0]} color={TRIM_COLOR} roughness={0.52} />
          <Box size={[CW, h + 2 * CW, CD]} position={[w / 2 + CW / 2, 0, 0]} color={TRIM_COLOR} roughness={0.52} />
          <Box size={[w, CW, CD]} position={[0, h / 2 + CW / 2, 0]} color={TRIM_COLOR} roughness={0.52} />
          <Box size={[w + 2 * CW, CW + 1, CD + 0.8]} position={[0, -(h / 2 + CW / 2), 0]} color={TRIM_COLOR} roughness={0.52} />
        </>
      ) : (
        <>
          <Box size={[w, h, 1.4]} position={[0, 0, 0]} color={TRIM_COLOR} roughness={0.62} />
          <Box size={[CW, h + CW, CW]} position={[-(w / 2 + CW / 2), 0, 0]} color={TRIM_COLOR} roughness={0.52} />
          <Box size={[CW, h + CW, CW]} position={[w / 2 + CW / 2), 0, 0]} color={TRIM_COLOR} roughness={0.52} />
          <Box size={[w + 2 * CW, CW, CW]} position={[0, h / 2 + CW / 2, 0]} color={TRIM_COLOR} roughness={0.52} />
        </>
      )}
    </group>
  );
}

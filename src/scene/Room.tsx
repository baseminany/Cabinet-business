import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { RoomModel, Opening } from '../model/room';
import { WALL_THICKNESS as WT } from '../model/room';
import type { Vec2, WallSeg } from '../model/roomShapes';

const WALL_COLOR = '#eadfce';
const WALL_SIDE = '#d9c8ad';
const FLOOR_COLOR = '#b67a45';
const FLOOR_LINE = '#7c4f2c';
const TRIM_COLOR = '#fff8ed';
const GLASS_COLOR = '#9bb8c2';
const EDGE_COLOR = '#b99c77';
const SHADOW_COLOR = '#6a4427';

const BB_H = 5;
const BB_D = 0.75;
const CW = 2.5;
const CD = 1.5;

type Vec3 = [number, number, number];

function Box({ size, position, rotationY = 0, color, roughness = 0.9, metalness = 0.015, transparent, opacity }: { size: Vec3; position: Vec3; rotationY?: number; color: string; roughness?: number; metalness?: number; transparent?: boolean; opacity?: number }) {
  return (
    <mesh position={position} rotation={[0, rotationY, 0]} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} transparent={transparent} opacity={opacity} />
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
      <mesh geometry={floorGeo} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.035, 0]} receiveShadow>
        <meshStandardMaterial color={FLOOR_COLOR} roughness={0.54} metalness={0.035} side={THREE.DoubleSide} />
      </mesh>
      <FloorPlanks points={points} />
      {walls.map((w) => <WallBaseShadow key={`base-${w.index}`} wall={w} />)}
      {walls.map((w) => <WallUnit key={w.index} wall={w} height={room.height} openings={room.openings.filter((o) => o.wallIndex === w.index)} />)}
      <CornerMarkers points={points} height={room.height} />
    </group>
  );
}

function FloorPlanks({ points }: { points: Vec2[] }) {
  const bounds = points.reduce((b, p) => ({ minX: Math.min(b.minX, p[0]), maxX: Math.max(b.maxX, p[0]), minZ: Math.min(b.minZ, p[1]), maxZ: Math.max(b.maxZ, p[1]) }), { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity });
  const depth = Math.max(24, bounds.maxZ - bounds.minZ);
  const width = Math.max(24, bounds.maxX - bounds.minX);
  const centerZ = (bounds.minZ + bounds.maxZ) / 2;
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const lines: JSX.Element[] = [];
  for (let x = Math.floor(bounds.minX / 7) * 7; x <= bounds.maxX; x += 7) lines.push(<mesh key={`x-${x}`} position={[x, 0.018, centerZ]} receiveShadow><boxGeometry args={[0.08, 0.025, depth]} /><meshStandardMaterial color={FLOOR_LINE} roughness={0.8} transparent opacity={0.2} /></mesh>);
  for (let z = Math.floor(bounds.minZ / 36) * 36; z <= bounds.maxZ; z += 36) lines.push(<mesh key={`z-${z}`} position={[centerX, 0.02, z]} receiveShadow><boxGeometry args={[width, 0.025, 0.08]} /><meshStandardMaterial color={FLOOR_LINE} roughness={0.8} transparent opacity={0.12} /></mesh>);
  return <group>{lines}</group>;
}

function WallBaseShadow({ wall }: { wall: WallSeg }) {
  const [mx, mz] = wall.mid;
  const [nx, nz] = wall.normal;
  return <Box size={[wall.length, 0.18, 1.25]} position={[mx - nx * 0.45, 0.08, mz - nz * 0.45]} rotationY={wall.angleY} color={SHADOW_COLOR} roughness={0.9} transparent opacity={0.18} />;
}

function CornerMarkers({ points, height }: { points: Vec2[]; height: number }) {
  return <group>{points.map((p, i) => <Box key={i} size={[1.05, height, 1.05]} position={[p[0], height / 2, p[1]]} color={EDGE_COLOR} roughness={0.9} transparent opacity={0.32} />)}</group>;
}

function WallUnit({ wall, height, openings }: { wall: WallSeg; height: number; openings: Opening[] }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const cam = state.camera.position;
    const toCam = new THREE.Vector3(cam.x - wall.mid[0], 0, cam.z - wall.mid[1]);
    const facing = wall.normal[0] * toCam.x + wall.normal[1] * toCam.z;
    ref.current.visible = facing <= 0.03;
  });

  const [mx, mz] = wall.mid;
  const [nx, nz] = wall.normal;

  return (
    <group ref={ref}>
      <Box size={[wall.length, height, WT]} position={[mx + nx * (WT / 2), height / 2, mz + nz * (WT / 2)]} rotationY={wall.angleY} color={WALL_COLOR} roughness={0.96} />
      <Box size={[wall.length, height, 0.08]} position={[mx - nx * 0.06, height / 2, mz - nz * 0.06]} rotationY={wall.angleY} color={WALL_SIDE} roughness={0.98} transparent opacity={0.18} />
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
          <Box size={[w + 2.2, h + 2.2, 0.42]} position={[0, 0, -0.06]} color="#d5c4aa" roughness={0.92} transparent opacity={0.62} />
          <Box size={[w, h, 0.78]} position={[0, 0, 0.02]} color={GLASS_COLOR} roughness={0.12} transparent opacity={0.56} />
          <Box size={[0.45, h, 0.95]} position={[0, 0, 0.58]} color="#edf5f6" roughness={0.18} transparent opacity={0.42} />
          <Box size={[CW, h + 2 * CW, CD]} position={[-(w / 2 + CW / 2), 0, 0.18]} color={TRIM_COLOR} roughness={0.52} />
          <Box size={[CW, h + 2 * CW, CD]} position={[w / 2 + CW / 2, 0, 0.18]} color={TRIM_COLOR} roughness={0.52} />
          <Box size={[w, CW, CD]} position={[0, h / 2 + CW / 2, 0.18]} color={TRIM_COLOR} roughness={0.52} />
          <Box size={[w + 2 * CW, CW + 1, CD + 0.8]} position={[0, -(h / 2 + CW / 2), 0.2]} color={TRIM_COLOR} roughness={0.52} />
        </>
      ) : (
        <>
          <Box size={[w + 1.5, h + 1.5, 0.48]} position={[0, 0, -0.08]} color="#d1bea3" roughness={0.92} transparent opacity={0.45} />
          <Box size={[w, h, 0.95]} position={[0, 0, 0.02]} color="#f4eadb" roughness={0.7} />
          <Box size={[CW, h + CW, CW]} position={[-(w / 2 + CW / 2), 0, 0.18]} color={TRIM_COLOR} roughness={0.52} />
          <Box size={[CW, h + CW, CW]} position={[w / 2 + CW / 2, 0, 0.18]} color={TRIM_COLOR} roughness={0.52} />
          <Box size={[w + 2 * CW, CW, CW]} position={[0, h / 2 + CW / 2, 0.18]} color={TRIM_COLOR} roughness={0.52} />
        </>
      )}
    </group>
  );
}

// =============================================================================
// ROOM 3D — polygon floor + oriented walls + baseboard + openings
// =============================================================================
// Walls are built from the footprint's wall segments (any angle, incl. the 45°
// corner). Each wall "unit" (wall + baseboard + its windows/doors) auto-hides
// when it sits between the camera and the room interior — a dollhouse view so
// you can always see inside as you orbit.
// =============================================================================

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { RoomModel, Opening } from '../model/room';
import { WALL_THICKNESS as WT } from '../model/room';
import type { Vec2, WallSeg } from '../model/roomShapes';

// Distinct, designed tones — walls clearly lighter than the wood floor, crisp
// white trim, readable glazing — so room, floor, and cabinetry never blend.
const WALL_COLOR = '#e6ddcb'; // soft warm plaster (the lightest big surface)
const FLOOR_COLOR = '#b07e4e'; // mid-warm oak floor — grounds the scene
const TRIM_COLOR = '#fbf8f1'; // crisp warm-white baseboard/casing
const GLASS_COLOR = '#aacfdb'; // clearly readable glazing

const BB_H = 5;
const BB_D = 0.6;
const CW = 2.5; // casing width
const CD = 1.4; // casing depth

type Vec3 = [number, number, number];

function Box({
  size,
  position,
  rotationY = 0,
  color,
  roughness = 0.9,
  transparent,
  opacity,
}: {
  size: Vec3;
  position: Vec3;
  rotationY?: number;
  color: string;
  roughness?: number;
  transparent?: boolean;
  opacity?: number;
}) {
  return (
    <mesh position={position} rotation={[0, rotationY, 0]} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={roughness} metalness={0.02} transparent={transparent} opacity={opacity} />
    </mesh>
  );
}

export default function Room({
  room,
  walls,
  points,
}: {
  room: RoomModel;
  walls: WallSeg[];
  points: Vec2[];
}) {
  // Floor as a filled polygon (handles every shape, incl. the chamfer).
  const floorGeo = useMemo(() => {
    const shape = new THREE.Shape();
    points.forEach((p, i) => (i === 0 ? shape.moveTo(p[0], -p[1]) : shape.lineTo(p[0], -p[1])));
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
  }, [points]);

  return (
    <group>
      <mesh geometry={floorGeo} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <meshStandardMaterial color={FLOOR_COLOR} roughness={0.8} side={THREE.DoubleSide} />
      </mesh>

      {walls.map((w) => (
        <WallUnit
          key={w.index}
          wall={w}
          height={room.height}
          openings={room.openings.filter((o) => o.wallIndex === w.index)}
        />
      ))}
    </group>
  );
}

function WallUnit({ wall, height, openings }: { wall: WallSeg; height: number; openings: Opening[] }) {
  const ref = useRef<THREE.Group>(null);

  // Dollhouse: hide this wall when it faces the camera (is between camera + room).
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
      {/* Wall (centered just outside the footprint edge). */}
      <Box
        size={[wall.length, height, WT]}
        position={[mx + nx * (WT / 2), height / 2, mz + nz * (WT / 2)]}
        rotationY={wall.angleY}
        color={WALL_COLOR}
        roughness={0.96}
      />
      {/* Baseboard just inside the edge. */}
      <Box
        size={[wall.length, BB_H, BB_D]}
        position={[mx - nx * (BB_D / 2), BB_H / 2, mz - nz * (BB_D / 2)]}
        rotationY={wall.angleY}
        color={TRIM_COLOR}
      />
      {openings.map((o) => (
        <OpeningMesh key={o.id} opening={o} wall={wall} />
      ))}
    </group>
  );
}

function OpeningMesh({ opening, wall }: { opening: Opening; wall: WallSeg }) {
  const { kind, width: w, height: h, sill, offset } = opening;
  const [mx, mz] = wall.mid;
  const [dx, dz] = wall.dir;
  // Anchor point on the wall, slid along it.
  const px = mx + dx * offset;
  const pz = mz + dz * offset;
  const yc = kind === 'window' ? sill + h / 2 : h / 2;

  return (
    <group position={[px, yc, pz]} rotation={[0, wall.angleY, 0]}>
      {kind === 'window' ? (
        <>
          <Box size={[w, h, 0.6]} position={[0, 0, 0]} color={GLASS_COLOR} roughness={0.1} transparent opacity={0.45} />
          <Box size={[CW, h + 2 * CW, CD]} position={[-(w / 2 + CW / 2), 0, 0]} color={TRIM_COLOR} />
          <Box size={[CW, h + 2 * CW, CD]} position={[w / 2 + CW / 2, 0, 0]} color={TRIM_COLOR} />
          <Box size={[w, CW, CD]} position={[0, h / 2 + CW / 2, 0]} color={TRIM_COLOR} />
          <Box size={[w + 2 * CW, CW + 1, CD + 0.8]} position={[0, -(h / 2 + CW / 2), 0]} color={TRIM_COLOR} />
        </>
      ) : (
        <>
          <Box size={[w, h, 1.4]} position={[0, 0, 0]} color={TRIM_COLOR} roughness={0.7} />
          <Box size={[CW, h + CW, CW]} position={[-(w / 2 + CW / 2), 0, 0]} color={TRIM_COLOR} />
          <Box size={[CW, h + CW, CW]} position={[w / 2 + CW / 2, 0, 0]} color={TRIM_COLOR} />
          <Box size={[w + 2 * CW, CW, CW]} position={[0, h / 2 + CW / 2, 0]} color={TRIM_COLOR} />
        </>
      )}
    </group>
  );
}

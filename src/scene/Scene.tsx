import { useEffect, useMemo, useRef } from 'react';
import type React from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store';
import { buildParts } from '../model/buildParts';
import { footprint, type WallSeg } from '../model/roomShapes';
import { unitTransforms, projectFocus } from './layout';
import CabinetMesh from './CabinetMesh';
import Room from './Room';

export default function Scene() {
  const units = useStore((s) => s.units);
  const room = useStore((s) => s.room);
  const view = useStore((s) => s.view);
  const cameraPreset = useStore((s) => s.cameraPreset);
  const draggingId = useStore((s) => s.draggingId);
  const selectUnit = useStore((s) => s.selectUnit);
  const setDragging = useStore((s) => s.setDragging);
  const controls = useRef<any>(null);
  const inRoom = room.enabled;
  const fp = useMemo(() => footprint(room), [room]);
  const built = useMemo(() => units.map((u) => buildParts(u)), [units]);
  const transforms = useMemo(() => unitTransforms(units, room), [units, room]);
  const focus = useMemo(() => projectFocus(units, transforms), [units, transforms]);
  const roomSpan = Math.max(room.width, room.length);
  const sceneSpan = Math.max(roomSpan, focus.topY * 1.5, 72);
  const camDist = inRoom ? Math.max(focus.topY * 2.0, roomSpan * 0.95, 128) : Math.max(focus.topY * 2.2, sceneSpan, 90);
  const target: [number, number, number] = [focus.cx, Math.max(28, focus.topY * 0.45), focus.cz];
  const camera = cameraFor(cameraPreset, focus.cx, focus.cz, focus.topY, camDist, sceneSpan);
  const startDrag = (id: string) => { selectUnit(id); if (inRoom) { setDragging(id); if (controls.current) controls.current.enabled = false; } };

  return (
    <Canvas key={`${inRoom ? 'room' : 'studio'}-${cameraPreset}`} shadows dpr={[1, 2]} camera={{ ...camera, near: 1, far: 9000 }} gl={{ antialias: true, alpha: true }} onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.08; }}>
      <color attach="background" args={[inRoom ? '#f2eadb' : '#f4eadb']} />
      <ambientLight intensity={inRoom ? 0.58 : 0.5} />
      <hemisphereLight intensity={0.48} color="#fff8ed" groundColor="#b98555" />
      <directionalLight position={[140, 260, 200]} intensity={1.85} color="#fff4e5" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.0004} shadow-camera-left={-280} shadow-camera-right={280} shadow-camera-top={380} shadow-camera-bottom={-140} />
      <directionalLight position={[-180, 130, -110]} intensity={0.32} color="#eaf1ff" />
      <Environment preset="apartment" />
      {inRoom && <Room room={room} walls={fp.walls} points={fp.points} />}
      {units.map((u, i) => { const t = transforms[i]; return <group key={u.id} position={[t.x, t.y, t.z]} rotation={[0, t.rotY, 0]} onPointerDown={(e) => { e.stopPropagation(); startDrag(u.id); }} onPointerOver={() => inRoom && (document.body.style.cursor = 'grab')} onPointerOut={() => (document.body.style.cursor = 'auto')}><CabinetMesh parts={built[i].parts} unitId={u.id} /></group>; })}
      {inRoom && <Dragger walls={fp.walls} controls={controls} />}
      <ContactShadows position={[focus.cx, 0.025, focus.cz]} scale={sceneSpan * 2.4} far={sceneSpan} blur={2.15} opacity={inRoom ? 0.38 : 0.44} color="#2b2016" resolution={1024} />
      {view === 'maker' && !inRoom && <Grid args={[480, 480]} cellSize={12} cellThickness={0.55} cellColor="#cdbfa9" sectionSize={48} sectionThickness={1} sectionColor="#b88a44" fadeDistance={900} infiniteGrid />}
      <OrbitControls ref={controls} makeDefault enabled={!draggingId} target={target} enableDamping minPolarAngle={0.08} maxPolarAngle={Math.PI / 2 + 0.05} enableRotate={cameraPreset !== 'top'} />
    </Canvas>
  );
}

function cameraFor(preset: string, cx: number, cz: number, topY: number, dist: number, span: number) {
  if (preset === 'front') return { position: [cx, Math.max(46, topY * 0.52), cz + dist] as [number, number, number], fov: 32 };
  if (preset === 'top') return { position: [cx, Math.max(190, span * 1.6), cz + 0.1] as [number, number, number], fov: 36 };
  return { position: [cx + dist * 0.36, Math.max(60, topY * 0.75), cz + dist] as [number, number, number], fov: 38 };
}

function Dragger({ walls, controls }: { walls: WallSeg[]; controls: React.MutableRefObject<any> }) {
  const { gl, camera } = useThree();
  const setDragging = useStore((s) => s.setDragging);
  const updateUnit = useStore((s) => s.updateUnit);
  const ref = useRef({ walls, units: useStore.getState().units, dragging: useStore.getState().draggingId });
  useEffect(() => useStore.subscribe((s) => (ref.current = { ...ref.current, units: s.units, dragging: s.draggingId })), []);
  ref.current.walls = walls;
  useEffect(() => {
    const el = gl.domElement;
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const hit = new THREE.Vector3();
    const onMove = (e: PointerEvent) => {
      const { dragging, units, walls } = ref.current;
      if (!dragging || walls.length === 0) return;
      const u = units.find((x) => x.id === dragging);
      if (!u) return;
      const rect = el.getBoundingClientRect();
      ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      ray.setFromCamera(ndc, camera);
      if (!ray.ray.intersectPlane(plane, hit)) return;
      let best = -1; let bestD = Infinity; let bestOff = 0;
      for (const w of walls) { const t = (hit.x - w.mid[0]) * w.dir[0] + (hit.z - w.mid[1]) * w.dir[1]; const tc = Math.max(-w.length / 2, Math.min(w.length / 2, t)); const px = w.mid[0] + w.dir[0] * tc; const pz = w.mid[1] + w.dir[1] * tc; const d = Math.hypot(hit.x - px, hit.z - pz); if (d < bestD) { bestD = d; best = w.index; bestOff = tc; } }
      if (best < 0) return;
      const w = walls[best];
      const maxOff = Math.max(0, w.length / 2 - u.overall.width / 2);
      const off = Math.max(-maxOff, Math.min(maxOff, bestOff));
      updateUnit(u.id, { placement: { wallIndex: best, offset: off } });
    };
    const onUp = () => { if (ref.current.dragging) { setDragging(null); if (controls.current) controls.current.enabled = true; document.body.style.cursor = 'auto'; } };
    el.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp);
    return () => { el.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
  }, [gl, camera, setDragging, updateUnit, controls]);
  return null;
}

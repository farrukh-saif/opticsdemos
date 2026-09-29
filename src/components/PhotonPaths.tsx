'use client';

import { memo, useCallback, useEffect, useMemo, useState, type MutableRefObject } from 'react';
import { Line } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { PhotonPath } from '@/types/optics';

type PathHighlight = 'normal' | 'hovered' | 'dimmed';

interface PhotonPathsProps {
  photons: PhotonPath[];
  missRef: MutableRefObject<() => void>;
  interactive?: boolean;
  onTourHover?: () => void;
  onTourSelect?: () => void;
}

function getPathColor(status: PhotonPath['status']): string {
  switch (status) {
    case 'absorbed':
      return '#e53935';
    case 'transmitted':
      return '#43a047';
    case 'scattered-out':
      return '#1e88e5';
    case 'traveling':
      return '#ffc107';
    default:
      return '#9e9e9e';
  }
}

const ARROW_HEIGHT = 0.2;
const DIM_COLOR = new THREE.Color('#d4dbe3');

function mixPathColor(hex: string, highlight: PathHighlight): string {
  if (highlight !== 'dimmed') return hex;
  const color = new THREE.Color(hex);
  color.lerp(DIM_COLOR, 0.82);
  return `#${color.getHexString()}`;
}

function DirectionArrow({
  position,
  direction,
  color,
  highlight,
}: {
  position: THREE.Vector3;
  direction: THREE.Vector3;
  color: string;
  highlight: PathHighlight;
}) {
  const { placed, quaternion } = useMemo(() => {
    const dir = direction.lengthSq() > 1e-8 ? direction.clone().normalize() : new THREE.Vector3(0, -1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir
    );
    const placed = position.clone().addScaledVector(dir, ARROW_HEIGHT * 0.5);
    return { placed, quaternion };
  }, [position, direction]);

  const scale = highlight === 'hovered' ? 1.45 : highlight === 'dimmed' ? 0.72 : 1;

  return (
    <mesh
      position={placed}
      quaternion={quaternion}
      scale={scale}
      frustumCulled={false}
      renderOrder={highlight === 'hovered' ? 8 : 3}
    >
      <coneGeometry args={[0.06, ARROW_HEIGHT, 10]} />
      <meshBasicMaterial
        color={color}
        toneMapped={false}
        depthTest
        depthWrite
      />
    </mesh>
  );
}

function pointAlongPath(
  segs: { start: THREE.Vector3; end: THREE.Vector3; len: number; s0: number }[],
  s: number
) {
  const last = segs[segs.length - 1];
  for (const seg of segs) {
    if (s <= seg.s0 + seg.len) {
      const t = seg.len > 0 ? (s - seg.s0) / seg.len : 0;
      return {
        position: seg.start.clone().lerp(seg.end, Math.min(1, Math.max(0, t))),
        direction: seg.end.clone().sub(seg.start).normalize(),
      };
    }
  }
  return {
    position: last.end.clone(),
    direction: last.end.clone().sub(last.start).normalize(),
  };
}

function samplePathArrows(points: THREE.Vector3[]) {
  if (points.length < 2) return [];

  const segs: { start: THREE.Vector3; end: THREE.Vector3; len: number; s0: number }[] = [];
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const len = points[i].distanceTo(points[i - 1]);
    if (len < 1e-6) continue;
    segs.push({ start: points[i - 1], end: points[i], len, s0: total });
    total += len;
  }
  if (segs.length === 0 || total < 0.35) return [];

  const skip = segs[0].len;
  const rest = total - skip;
  if (rest < 0.25) {
    return [pointAlongPath(segs, total * 0.7)];
  }

  const count = rest > 5 ? 3 : rest > 2 ? 2 : 1;
  const arrows = [];
  for (let k = 1; k <= count; k++) {
    arrows.push(pointAlongPath(segs, skip + (rest * k) / (count + 1)));
  }
  return arrows;
}

function PhotonPathLine({
  photon,
  showArrows,
  highlight,
  interactive,
  onHover,
  onUnhover,
  onSelect,
}: {
  photon: PhotonPath;
  showArrows: boolean;
  highlight: PathHighlight;
  interactive: boolean;
  onHover: (id: string) => void;
  onUnhover: (id: string) => void;
  onSelect: (id: string) => void;
}) {
  const points = useMemo(() => {
    return photon.points.map((p) => new THREE.Vector3(p.x, p.y, p.z));
  }, [photon.points]);

  const color = mixPathColor(getPathColor(photon.status), highlight);
  const arrows = useMemo(
    () => (showArrows || highlight === 'hovered' ? samplePathArrows(points) : []),
    [points, showArrows, highlight]
  );

  if (points.length < 2) return null;

  const lineWidth = highlight === 'hovered' ? 0.06 : highlight === 'dimmed' ? 0.028 : 0.045;

  return (
    <group
      onPointerOver={interactive ? (event) => {
        event.stopPropagation();
        onHover(photon.id);
      } : undefined}
      onPointerOut={interactive ? (event) => {
        event.stopPropagation();
        onUnhover(photon.id);
      } : undefined}
      onPointerDown={interactive ? (event) => {
        event.stopPropagation();
      } : undefined}
      onClick={interactive ? (event) => {
        event.stopPropagation();
        onSelect(photon.id);
      } : undefined}
    >
      <Line
        points={points}
        color={color}
        lineWidth={lineWidth}
        worldUnits
        frustumCulled={false}
        depthTest
        depthWrite
        transparent={false}
        renderOrder={highlight === 'hovered' ? 7 : 2}
        toneMapped={false}
        raycast={interactive ? undefined : () => {}}
      />
      {arrows.map((arrow, i) => (
        <DirectionArrow
          key={i}
          position={arrow.position}
          direction={arrow.direction}
          color={color}
          highlight={highlight}
        />
      ))}
    </group>
  );
}

function arrowsForPhoton(id: string) {
  let n = 0;
  for (let i = 0; i < id.length; i++) n += id.charCodeAt(i);
  return n % 2 === 0;
}

const MemoPhotonPathLine = memo(PhotonPathLine);

function PathHoverCursor({
  active,
  onLeave,
}: {
  active: boolean;
  onLeave: () => void;
}) {
  const { gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.style.cursor = active ? 'pointer' : 'auto';
    const handleLeave = () => onLeave();
    canvas.addEventListener('pointerleave', handleLeave);
    return () => {
      canvas.style.cursor = '';
      canvas.removeEventListener('pointerleave', handleLeave);
    };
  }, [active, gl, onLeave]);

  return null;
}

export function PhotonPaths({
  photons,
  missRef,
  interactive = true,
  onTourHover,
  onTourSelect,
}: PhotonPathsProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const visibleIds = useMemo(
    () => new Set(photons.map((photon) => photon.id)),
    [photons]
  );
  const activeHoverId = hoveredId && visibleIds.has(hoveredId) ? hoveredId : null;
  const activeSelectedId = selectedId && visibleIds.has(selectedId) ? selectedId : null;
  const anyFocus = activeHoverId !== null || activeSelectedId !== null;

  const onHover = useCallback((id: string) => {
    setHoveredId(id);
    onTourHover?.();
  }, [onTourHover]);

  const onUnhover = useCallback((id: string) => {
    setHoveredId((current) => (current === id ? null : current));
  }, []);

  const clearHover = useCallback(() => {
    setHoveredId(null);
  }, []);

  const onSelect = useCallback((id: string) => {
    setSelectedId((current) => (current === id ? null : id));
    onTourSelect?.();
  }, [onTourSelect]);

  useEffect(() => {
    missRef.current = () => setSelectedId(null);
  }, [missRef]);

  return (
    <group>
      {interactive ? <PathHoverCursor active={activeHoverId !== null} onLeave={clearHover} /> : null}
      {photons.map((photon) => {
        const focused = photon.id === activeHoverId || photon.id === activeSelectedId;
        const highlight: PathHighlight = focused
          ? 'hovered'
          : anyFocus
            ? 'dimmed'
            : 'normal';
        return (
          <MemoPhotonPathLine
            key={photon.id}
            photon={photon}
            showArrows={arrowsForPhoton(photon.id)}
            highlight={highlight}
            interactive={interactive}
            onHover={onHover}
            onUnhover={onUnhover}
            onSelect={onSelect}
          />
        );
      })}
    </group>
  );
}

interface BeamSourceProps {
  position: [number, number, number];
  radius: number;
}

export function BeamSource({ position, radius }: BeamSourceProps) {
  return (
    <group position={position}>
      <mesh position={[0, 0.12, 0]} renderOrder={1} raycast={() => { }}>
        <cylinderGeometry args={[radius * 1.35, radius * 1.35, 0.08, 48]} />
        <meshStandardMaterial
          color="#cfd8dc"
          transparent
          opacity={0.28}
          roughness={0.28}
          metalness={0.05}
          depthTest
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0.06, 0]} raycast={() => { }}>
        <cylinderGeometry args={[radius, radius, 0.12, 48]} />
        <meshStandardMaterial
          color="#ffd54f"
          emissive="#ffb300"
          emissiveIntensity={0.4}
          depthTest
          depthWrite
        />
      </mesh>
      <mesh position={[0, -0.02, 0]} raycast={() => { }}>
        <cylinderGeometry args={[radius * 0.9, radius * 0.9, 0.08, 48]} />
        <meshBasicMaterial
          color="#fff9c4"
          depthTest
          depthWrite
        />
      </mesh>
    </group>
  );
}

'use client';

import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { PhotonPath } from '@/types/optics';

interface PhotonPathsProps {
  photons: PhotonPath[];
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

interface ArrowProps {
  start: THREE.Vector3;
  end: THREE.Vector3;
  color: string;
  opacity: number;
}

function DirectionArrow({ start, end, color, opacity }: ArrowProps) {
  const arrowSize = 0.35;
  const dir = new THREE.Vector3().subVectors(end, start).normalize();
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  
  const up = new THREE.Vector3(0, 1, 0);
  let perp = new THREE.Vector3().crossVectors(dir, up).normalize();
  if (perp.length() < 0.1) {
    perp = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(1, 0, 0)).normalize();
  }
  perp.multiplyScalar(arrowSize * 0.4);
  
  const back = dir.clone().multiplyScalar(-arrowSize * 0.8);
  
  const tip = mid.clone();
  const left = mid.clone().add(back).add(perp);
  const right = mid.clone().add(back).sub(perp);

  return (
    <Line
      points={[left, tip, right]}
      color={color}
      lineWidth={2}
      transparent
      opacity={Math.min(1, opacity * 1.2)}
    />
  );
}

function PhotonPathLine({ photon, showArrows }: { photon: PhotonPath; showArrows: boolean }) {
  const points = useMemo(() => {
    return photon.points.map((p) => new THREE.Vector3(p.x, p.y, p.z));
  }, [photon.points]);

  const age = Date.now() - photon.createdAt;
  const fadeStart = 2500;
  const fadeDuration = 1500;
  const opacity = age < fadeStart ? 0.85 : Math.max(0.15, 0.85 - (age - fadeStart) / fadeDuration * 0.7);
  const color = getPathColor(photon.status);

  const arrows = useMemo(() => {
    if (!showArrows || points.length < 4) return [];
    const result: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];
    const step = Math.max(3, Math.floor(points.length / 3));
    for (let i = step; i < points.length; i += step) {
      result.push({ start: points[i - 1], end: points[i] });
    }
    return result;
  }, [points, showArrows]);

  if (points.length < 2) return null;

  return (
    <group>
      <Line
        points={points}
        color={color}
        lineWidth={1.8}
        transparent
        opacity={opacity}
      />
      {arrows.map((arrow, i) => (
        <DirectionArrow
          key={i}
          start={arrow.start}
          end={arrow.end}
          color={color}
          opacity={opacity}
        />
      ))}
    </group>
  );
}

export function PhotonPaths({ photons }: PhotonPathsProps) {
  const recentPhotons = useMemo(() => {
    const now = Date.now();
    const maxAge = 4000;
    return photons.filter((p) => now - p.createdAt < maxAge);
  }, [photons]);

  return (
    <group>
      {recentPhotons.map((photon, idx) => (
        <PhotonPathLine 
          key={photon.id} 
          photon={photon} 
          showArrows={idx % 2 === 0}
        />
      ))}
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
      <mesh>
        <cylinderGeometry args={[radius, radius, 0.2, 32]} />
        <meshStandardMaterial 
          color="#ffd54f" 
          emissive="#ffb300"
          emissiveIntensity={0.4}
        />
      </mesh>
      
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[radius * 0.9, radius * 0.9, 0.08, 32]} />
        <meshBasicMaterial color="#fff9c4" transparent opacity={0.7} />
      </mesh>

      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[radius * 2.4, 0.1, radius * 2.4]} />
        <meshStandardMaterial color="#424242" />
      </mesh>
    </group>
  );
}

interface DetectorProps {
  position: [number, number, number];
  size: number;
}

export function Detector({ position, size }: DetectorProps) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[size, 0.15, size]} />
        <meshStandardMaterial 
          color="#2e7d32"
          roughness={0.3}
        />
      </mesh>
      
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[size * 0.92, 0.02, size * 0.92]} />
        <meshStandardMaterial 
          color="#81c784"
          emissive="#4caf50"
          emissiveIntensity={0.15}
        />
      </mesh>

      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[size + 0.1, 0.02, size + 0.1]} />
        <meshBasicMaterial color="#1b5e20" />
      </mesh>
    </group>
  );
}

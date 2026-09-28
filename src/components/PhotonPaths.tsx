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

function PhotonPathLine({ photon }: { photon: PhotonPath }) {
  const points = useMemo(() => {
    return photon.points.map((p) => new THREE.Vector3(p.x, p.y, p.z));
  }, [photon.points]);

  const age = Date.now() - photon.createdAt;
  const fadeStart = 2500;
  const fadeDuration = 1500;
  const opacity = age < fadeStart ? 0.85 : Math.max(0.15, 0.85 - (age - fadeStart) / fadeDuration * 0.7);

  if (points.length < 2) return null;

  return (
    <Line
      points={points}
      color={getPathColor(photon.status)}
      lineWidth={1.8}
      transparent
      opacity={opacity}
    />
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
      {recentPhotons.map((photon) => (
        <PhotonPathLine key={photon.id} photon={photon} />
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
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[radius, radius, 0.3, 32]} />
        <meshStandardMaterial 
          color="#ffd54f" 
          emissive="#ffb300"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      <mesh position={[0, -0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[radius * 0.95, radius * 0.95, 0.1, 32]} />
        <meshBasicMaterial color="#fff59d" transparent opacity={0.6} />
      </mesh>

      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[radius * 2.2, 0.15, radius * 2.2]} />
        <meshStandardMaterial color="#616161" />
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
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial 
          color="#81c784" 
          side={THREE.DoubleSide}
          transparent
          opacity={0.4}
        />
      </mesh>
      
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <ringGeometry args={[size * 0.48, size * 0.5, 32]} />
        <meshBasicMaterial color="#4caf50" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

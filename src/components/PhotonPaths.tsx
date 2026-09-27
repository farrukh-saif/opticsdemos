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
      return '#ff4444';
    case 'transmitted':
      return '#44ff44';
    case 'scattered-out':
      return '#4488ff';
    case 'traveling':
      return '#ffff44';
    default:
      return '#ffffff';
  }
}

function PhotonPathLine({ photon }: { photon: PhotonPath }) {
  const points = useMemo(() => {
    return photon.points.map((p) => new THREE.Vector3(p.x, p.y, p.z));
  }, [photon.points]);

  const age = Date.now() - photon.createdAt;
  const fadeStart = 3000;
  const fadeDuration = 2000;
  const opacity = age < fadeStart ? 0.8 : Math.max(0.1, 0.8 - (age - fadeStart) / fadeDuration * 0.7);

  if (points.length < 2) return null;

  return (
    <Line
      points={points}
      color={getPathColor(photon.status)}
      lineWidth={1.5}
      transparent
      opacity={opacity}
    />
  );
}

export function PhotonPaths({ photons }: PhotonPathsProps) {
  const recentPhotons = useMemo(() => {
    const now = Date.now();
    const maxAge = 5000;
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

export function LightSource({ thickness }: { thickness: number }) {
  return (
    <group position={[-thickness / 2 - 2, 0, 0]}>
      <mesh>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color="#ffff44" />
      </mesh>
      <pointLight color="#ffff00" intensity={2} distance={10} />

      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 1;
        return (
          <mesh
            key={i}
            position={[
              0.3,
              Math.sin(angle) * radius * 0.3,
              Math.cos(angle) * radius * 0.3,
            ]}
          >
            <coneGeometry args={[0.1, 0.5, 8]} />
            <meshBasicMaterial color="#ffff88" transparent opacity={0.5} />
          </mesh>
        );
      })}
    </group>
  );
}

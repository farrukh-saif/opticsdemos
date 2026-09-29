'use client';

import { useEffect, useMemo } from 'react';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';

interface TissueSlabProps {
  thickness: number;
  size: number;
  absorptionCoef: number;
  scatteringCoef: number;
}

export function TissueSlab({
  thickness,
  size,
  absorptionCoef,
  scatteringCoef,
}: TissueSlabProps) {
  const opacity = Math.min(0.26, 0.1 + absorptionCoef * 0.1 + scatteringCoef * 0.0025);
  const texture = useMemo(() => {
    const n = 64;
    const data = new Uint8Array(n * n * 4);
    for (let i = 0; i < n * n; i++) {
      const grain = Math.random() * 22;
      const vein = Math.random() > 0.97 ? 28 : 0;
      data[i * 4] = Math.min(255, 214 - grain + vein * 0.3);
      data[i * 4 + 1] = Math.max(80, 132 - grain * 0.7 - vein);
      data[i * 4 + 2] = Math.max(80, 118 - grain * 0.5 - vein * 0.4);
      data[i * 4 + 3] = 255;
    }
    const tex = new THREE.DataTexture(data, n, n);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2.5, Math.max(1, thickness / 4));
    tex.needsUpdate = true;
    return tex;
  }, [thickness]);

  useEffect(() => {
    return () => {
      texture.dispose();
    };
  }, [texture]);

  return (
    <mesh position={[0, 0, 0]} renderOrder={0} raycast={() => {}}>
      <boxGeometry args={[size, thickness, size]} />
      <meshStandardMaterial
        map={texture}
        color="#d29a8c"
        transparent
        opacity={opacity}
        roughness={0.82}
        metalness={0}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
      <Edges
        threshold={15}
        color="#b08980"
        linewidth={1}
        raycast={() => {}}
      />
    </mesh>
  );
}

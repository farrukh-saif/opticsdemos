'use client';

import { useRef } from 'react';
import { Mesh } from 'three';
import { useFrame } from '@react-three/fiber';

interface TissueSlabProps {
  thickness: number;
  width: number;
  height: number;
  absorptionCoef: number;
  scatteringCoef: number;
}

export function TissueSlab({
  thickness,
  width,
  height,
  absorptionCoef,
  scatteringCoef,
}: TissueSlabProps) {
  const meshRef = useRef<Mesh>(null);

  const opacity = Math.min(0.7, 0.2 + (absorptionCoef + scatteringCoef * 0.1) * 0.3);
  const redness = Math.min(1, 0.6 + absorptionCoef * 0.3);
  const turbidity = Math.min(1, scatteringCoef / 20);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0005;
    }
  });

  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[thickness, height, width]} />
        <meshStandardMaterial
          color={[redness, 0.5 - turbidity * 0.2, 0.5 - turbidity * 0.3]}
          transparent
          opacity={opacity}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[thickness + 0.05, height + 0.05, width + 0.05]} />
        <meshBasicMaterial
          color="#666"
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>

      <mesh position={[-thickness / 2 - 0.1, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[width * 0.8, height * 0.8]} />
        <meshBasicMaterial color="#ffff00" transparent opacity={0.1} />
      </mesh>
    </group>
  );
}

'use client';

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
  const opacity = Math.min(0.65, 0.25 + (absorptionCoef * 2 + scatteringCoef * 0.02) * 0.3);
  const redness = Math.min(1, 0.75 + absorptionCoef * 0.2);
  const turbidity = Math.min(0.3, scatteringCoef / 50);

  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[size, thickness, size]} />
        <meshStandardMaterial
          color={[redness, 0.55 - turbidity, 0.5 - turbidity]}
          transparent
          opacity={opacity}
          roughness={0.7}
          metalness={0.05}
        />
      </mesh>

      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[size + 0.02, thickness + 0.02, size + 0.02]} />
        <meshBasicMaterial
          color="#78909c"
          wireframe
          transparent
          opacity={0.25}
        />
      </mesh>
    </group>
  );
}

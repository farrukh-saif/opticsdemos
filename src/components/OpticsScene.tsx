'use client';

import { Suspense, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, OrthographicCamera, Text } from '@react-three/drei';
import * as THREE from 'three';
import { TissueSlab } from './TissueSlab';
import { PhotonPaths, BeamSource, Detector } from './PhotonPaths';
import { PhotonPath, ViewMode } from '@/types/optics';

interface SceneContentProps {
  photons: PhotonPath[];
  thickness: number;
  slabSize: number;
  absorptionCoef: number;
  scatteringCoef: number;
  beamRadius: number;
  viewMode: ViewMode;
}

function CameraController({ viewMode }: { viewMode: ViewMode }) {
  const { camera, size } = useThree();

  useEffect(() => {
    if (viewMode === '2d') {
      camera.position.set(30, 0, 0);
      camera.lookAt(0, 0, 0);
      if (camera instanceof THREE.OrthographicCamera) {
        const aspect = size.width / size.height;
        camera.left = -15 * aspect;
        camera.right = 15 * aspect;
        camera.top = 15;
        camera.bottom = -15;
        camera.updateProjectionMatrix();
      }
    } else {
      camera.position.set(18, 12, 18);
      camera.lookAt(0, 0, 0);
    }
  }, [viewMode, camera, size]);

  return null;
}

function SceneContent({
  photons,
  thickness,
  slabSize,
  absorptionCoef,
  scatteringCoef,
  beamRadius,
  viewMode,
}: SceneContentProps) {
  const airGap = 3;
  const tissueTop = thickness / 2;
  const tissueBottom = -thickness / 2;

  return (
    <>
      <CameraController viewMode={viewMode} />

      {viewMode === '3d' ? (
        <PerspectiveCamera makeDefault position={[18, 12, 18]} fov={45} />
      ) : (
        <OrthographicCamera makeDefault position={[30, 0, 0]} zoom={20} />
      )}

      <OrbitControls
        enableRotate={viewMode === '3d'}
        enablePan={true}
        enableZoom={true}
        minDistance={8}
        maxDistance={60}
      />

      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={0.7} />
      <directionalLight position={[-5, -5, -5]} intensity={0.2} />

      <TissueSlab
        thickness={thickness}
        size={slabSize}
        absorptionCoef={absorptionCoef}
        scatteringCoef={scatteringCoef}
      />

      <PhotonPaths photons={photons} />

      <BeamSource 
        position={[0, tissueTop + airGap, 0]} 
        radius={beamRadius} 
      />

      <Detector 
        position={[0, tissueBottom - 2, 0]} 
        size={slabSize * 0.7} 
      />

      <Text
        position={[0, tissueTop + airGap + 1.5, 0]}
        fontSize={0.6}
        color="#666"
        anchorX="center"
        anchorY="bottom"
      >
        Source
      </Text>

      <Text
        position={[slabSize / 2 + 1, 0, 0]}
        fontSize={0.5}
        color="#888"
        anchorX="left"
        rotation={[0, 0, 0]}
      >
        Tissue
      </Text>

      <Text
        position={[0, tissueBottom - 3.5, 0]}
        fontSize={0.6}
        color="#666"
        anchorX="center"
        anchorY="top"
      >
        Detector
      </Text>
    </>
  );
}

interface OpticsSceneProps {
  photons: PhotonPath[];
  thickness: number;
  slabSize: number;
  absorptionCoef: number;
  scatteringCoef: number;
  beamRadius: number;
  viewMode: ViewMode;
}

export function OpticsScene({
  photons,
  thickness,
  slabSize,
  absorptionCoef,
  scatteringCoef,
  beamRadius,
  viewMode,
}: OpticsSceneProps) {
  return (
    <div className="w-full h-full bg-gradient-to-b from-slate-100 to-slate-200 overflow-hidden">
      <Canvas>
        <Suspense fallback={null}>
          <SceneContent
            photons={photons}
            thickness={thickness}
            slabSize={slabSize}
            absorptionCoef={absorptionCoef}
            scatteringCoef={scatteringCoef}
            beamRadius={beamRadius}
            viewMode={viewMode}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

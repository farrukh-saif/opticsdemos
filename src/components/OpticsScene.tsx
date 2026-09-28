'use client';

import { Suspense, useEffect, useRef } from 'react';
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

function CameraController({ viewMode, thickness }: { viewMode: ViewMode; thickness: number }) {
  const { camera, size } = useThree();

  useEffect(() => {
    const sceneHeight = thickness + 12;
    
    if (viewMode === '2d') {
      camera.position.set(40, 0, 0);
      camera.lookAt(0, 0, 0);
      if (camera instanceof THREE.OrthographicCamera) {
        const aspect = size.width / size.height;
        const viewHeight = sceneHeight * 1.3;
        const viewWidth = viewHeight * aspect;
        camera.left = -viewWidth / 2;
        camera.right = viewWidth / 2;
        camera.top = viewHeight / 2;
        camera.bottom = -viewHeight / 2;
        camera.zoom = 1;
        camera.updateProjectionMatrix();
      }
    } else {
      camera.position.set(18, 12, 18);
      camera.lookAt(0, 0, 0);
    }
  }, [viewMode, camera, size, thickness]);

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
  const controlsRef = useRef<React.ComponentRef<typeof OrbitControls>>(null);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  }, [viewMode]);

  return (
    <>
      <CameraController viewMode={viewMode} thickness={thickness} />

      {viewMode === '3d' ? (
        <PerspectiveCamera makeDefault position={[18, 12, 18]} fov={45} />
      ) : (
        <OrthographicCamera makeDefault position={[40, 0, 0]} zoom={1} />
      )}

      <OrbitControls
        ref={controlsRef}
        enableRotate={viewMode === '3d'}
        enablePan={true}
        enableZoom={true}
        minDistance={viewMode === '3d' ? 8 : undefined}
        maxDistance={viewMode === '3d' ? 60 : undefined}
        minZoom={viewMode === '2d' ? 0.5 : undefined}
        maxZoom={viewMode === '2d' ? 3 : undefined}
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
        position={[0, tissueBottom - 2.5, 0]} 
        size={slabSize * 0.6} 
      />

      <Text
        position={[0, tissueTop + airGap + 1.2, 0]}
        fontSize={0.5}
        color="#555"
        anchorX="center"
        anchorY="bottom"
      >
        Source
      </Text>

      <Text
        position={[slabSize / 2 + 0.8, 0, 0]}
        fontSize={0.45}
        color="#777"
        anchorX="left"
      >
        Tissue
      </Text>

      <Text
        position={[0, tissueBottom - 4, 0]}
        fontSize={0.5}
        color="#2e7d32"
        anchorX="center"
        anchorY="top"
        fontWeight="bold"
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

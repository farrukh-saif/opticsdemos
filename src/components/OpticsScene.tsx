'use client';

import { Suspense, useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, OrthographicCamera, Grid, Text } from '@react-three/drei';
import * as THREE from 'three';
import { TissueSlab } from './TissueSlab';
import { PhotonPaths, LightSource } from './PhotonPaths';
import { PhotonPath, ViewMode } from '@/types/optics';

interface SceneContentProps {
  photons: PhotonPath[];
  thickness: number;
  width: number;
  height: number;
  absorptionCoef: number;
  scatteringCoef: number;
  viewMode: ViewMode;
}

function CameraController({ viewMode }: { viewMode: ViewMode }) {
  const { camera, size } = useThree();
  const controlsRef = useRef<typeof OrbitControls | null>(null);

  useEffect(() => {
    if (viewMode === '2d') {
      camera.position.set(0, 0, 40);
      camera.lookAt(0, 0, 0);
      if (camera instanceof THREE.OrthographicCamera) {
        const aspect = size.width / size.height;
        camera.left = -20 * aspect;
        camera.right = 20 * aspect;
        camera.top = 20;
        camera.bottom = -20;
        camera.updateProjectionMatrix();
      }
    } else {
      camera.position.set(20, 15, 25);
      camera.lookAt(0, 0, 0);
    }
  }, [viewMode, camera, size]);

  return null;
}

function SceneContent({
  photons,
  thickness,
  width,
  height,
  absorptionCoef,
  scatteringCoef,
  viewMode,
}: SceneContentProps) {
  return (
    <>
      <CameraController viewMode={viewMode} />

      {viewMode === '3d' ? (
        <PerspectiveCamera makeDefault position={[20, 15, 25]} fov={50} />
      ) : (
        <OrthographicCamera makeDefault position={[0, 0, 40]} zoom={15} />
      )}

      <OrbitControls
        enableRotate={viewMode === '3d'}
        enablePan={true}
        enableZoom={true}
        minDistance={10}
        maxDistance={100}
      />

      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <directionalLight position={[-10, -10, -5]} intensity={0.3} />

      <TissueSlab
        thickness={thickness}
        width={width}
        height={height}
        absorptionCoef={absorptionCoef}
        scatteringCoef={scatteringCoef}
      />

      <PhotonPaths photons={photons} />

      <LightSource thickness={thickness} />

      {viewMode === '3d' && (
        <Grid
          args={[50, 50]}
          position={[0, -height / 2 - 0.5, 0]}
          cellSize={2}
          cellThickness={0.5}
          cellColor="#444"
          sectionSize={10}
          sectionThickness={1}
          sectionColor="#666"
          fadeDistance={50}
          fadeStrength={1}
        />
      )}

      <Text
        position={[-thickness / 2 - 4, height / 2 + 1, 0]}
        fontSize={1}
        color="#ffff44"
        anchorX="center"
      >
        Light Source
      </Text>

      <Text
        position={[0, height / 2 + 1, 0]}
        fontSize={1}
        color="#ff8866"
        anchorX="center"
      >
        Tissue
      </Text>

      <mesh position={[thickness / 2 + 2, 0, 0]}>
        <planeGeometry args={[0.1, height * 0.8]} />
        <meshBasicMaterial color="#44ff44" transparent opacity={0.3} />
      </mesh>
      <Text
        position={[thickness / 2 + 4, height / 2 + 1, 0]}
        fontSize={0.8}
        color="#44ff44"
        anchorX="center"
      >
        Detector
      </Text>
    </>
  );
}

interface OpticsSceneProps {
  photons: PhotonPath[];
  thickness: number;
  width: number;
  height: number;
  absorptionCoef: number;
  scatteringCoef: number;
  viewMode: ViewMode;
}

export function OpticsScene({
  photons,
  thickness,
  width,
  height,
  absorptionCoef,
  scatteringCoef,
  viewMode,
}: OpticsSceneProps) {
  return (
    <div className="w-full h-full bg-gradient-to-b from-gray-900 to-black rounded-lg overflow-hidden">
      <Canvas>
        <Suspense fallback={null}>
          <SceneContent
            photons={photons}
            thickness={thickness}
            width={width}
            height={height}
            absorptionCoef={absorptionCoef}
            scatteringCoef={scatteringCoef}
            viewMode={viewMode}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

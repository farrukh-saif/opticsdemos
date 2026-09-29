'use client';

import { Suspense, useEffect, useRef, type MutableRefObject } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, OrthographicCamera, Text } from '@react-three/drei';
import * as THREE from 'three';
import { TissueSlab } from './TissueSlab';
import { PhotonPaths, BeamSource } from './PhotonPaths';
import { PhotonPath, ViewMode } from '@/types/optics';
import { AIR_GAP } from '@/lib/monteCarlo';
import { type TourStep } from '@/lib/onboarding';

interface SceneContentProps {
  photons: PhotonPath[];
  thickness: number;
  slabSize: number;
  absorptionCoef: number;
  scatteringCoef: number;
  beamRadius: number;
  viewMode: ViewMode;
  missRef: MutableRefObject<() => void>;
  tourStep: TourStep | null;
  onTourAction: (action: TourStep) => void;
  pathPicking: boolean;
}

function CameraController({ viewMode, thickness }: { viewMode: ViewMode; thickness: number }) {
  const { camera, size } = useThree();

  useEffect(() => {
    camera.near = 0.05;
    camera.far = 800;

    if (viewMode === '2d') {
      camera.position.set(40, 0, 0);
      camera.lookAt(0, 0, 0);
      if (camera instanceof THREE.OrthographicCamera) {
        camera.zoom = 1;
      }
    } else {
      camera.position.set(18, 12, 18);
      camera.lookAt(0, 0, 0);
    }

    camera.updateProjectionMatrix();
  }, [viewMode, camera]);

  useEffect(() => {
    camera.near = 0.05;
    camera.far = 800;

    if (viewMode === '2d' && camera instanceof THREE.OrthographicCamera) {
      const aspect = size.width / Math.max(size.height, 1);
      const viewHeight = (thickness + 12) * 1.3;
      const viewWidth = viewHeight * aspect;
      camera.left = -viewWidth / 2;
      camera.right = viewWidth / 2;
      camera.top = viewHeight / 2;
      camera.bottom = -viewHeight / 2;
    }

    camera.updateProjectionMatrix();
  }, [viewMode, camera, size, thickness]);

  return null;
}

function TourFollowAlong({
  step,
  onAction,
}: {
  step: TourStep | null;
  onAction: (action: TourStep) => void;
}) {
  const { gl } = useThree();
  const drag = useRef<{ x: number; y: number } | null>(null);
  const pinch = useRef<number | null>(null);

  useEffect(() => {
    if (step !== 'orbit' && step !== 'zoom') return;
    const el = gl.domElement;

    const onDown = (event: PointerEvent) => {
      if (step !== 'orbit' || event.button !== 0) return;
      drag.current = { x: event.clientX, y: event.clientY };
    };
    const onMove = (event: PointerEvent) => {
      if (step !== 'orbit' || !drag.current) return;
      const dx = event.clientX - drag.current.x;
      const dy = event.clientY - drag.current.y;
      if (dx * dx + dy * dy > 100) {
        drag.current = null;
        onAction('orbit');
      }
    };
    const onUp = () => {
      drag.current = null;
    };
    const onWheel = () => {
      if (step === 'zoom') onAction('zoom');
    };
    const touchDistance = (event: TouchEvent) => {
      if (event.touches.length < 2) return null;
      const a = event.touches[0];
      const b = event.touches[1];
      const dx = a.clientX - b.clientX;
      const dy = a.clientY - b.clientY;
      return Math.hypot(dx, dy);
    };
    const onTouchStart = (event: TouchEvent) => {
      pinch.current = touchDistance(event);
    };
    const onTouchMove = (event: TouchEvent) => {
      if (step !== 'zoom') return;
      const distance = touchDistance(event);
      if (distance == null || pinch.current == null) return;
      if (Math.abs(distance - pinch.current) > 16) {
        pinch.current = null;
        onAction('zoom');
      }
    };
    const onTouchEnd = () => {
      pinch.current = null;
    };

    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    el.addEventListener('wheel', onWheel, { passive: true });
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [step, gl, onAction]);

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
  missRef,
  tourStep,
  onTourAction,
  pathPicking,
}: SceneContentProps) {
  const tissueTop = thickness / 2;
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
        <PerspectiveCamera
          makeDefault
          fov={45}
          near={0.05}
          far={800}
        />
      ) : (
        <OrthographicCamera
          makeDefault
          near={0.05}
          far={800}
        />
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

      <TourFollowAlong step={tourStep} onAction={onTourAction} />

      <ambientLight intensity={0.75} />
      <directionalLight position={[6, 12, 8]} intensity={0.85} />
      <directionalLight position={[-6, 4, -4]} intensity={0.28} />

      <TissueSlab
        thickness={thickness}
        size={slabSize}
        absorptionCoef={absorptionCoef}
        scatteringCoef={scatteringCoef}
      />

      <BeamSource
        position={[0, tissueTop + AIR_GAP, 0]}
        radius={beamRadius}
      />

      <PhotonPaths
        photons={photons}
        missRef={missRef}
        interactive={pathPicking}
        onTourHover={() => onTourAction('hover')}
        onTourSelect={() => onTourAction('click')}
      />

      <Text
        position={[0, tissueTop + AIR_GAP + 1.2, 0]}
        fontSize={0.5}
        color="#555"
        anchorX="center"
        anchorY="bottom"
        raycast={() => {}}
      >
        Source
      </Text>

      <Text
        position={[slabSize / 2 + 0.8, 0, 0]}
        fontSize={0.45}
        color="#777"
        anchorX="left"
        raycast={() => {}}
      >
        Tissue
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
  tourStep: TourStep | null;
  onTourAction: (action: TourStep) => void;
  pathPicking?: boolean;
}

export function OpticsScene({
  photons,
  thickness,
  slabSize,
  absorptionCoef,
  scatteringCoef,
  beamRadius,
  viewMode,
  tourStep,
  onTourAction,
  pathPicking = true,
}: OpticsSceneProps) {
  const missRef = useRef<() => void>(() => {});

  return (
    <div className="w-full h-full bg-gradient-to-b from-slate-100 to-slate-200 overflow-hidden">
      <Canvas
        gl={{ antialias: true, logarithmicDepthBuffer: true }}
        raycaster={{
          params: {
            Line: { threshold: 0.15 },
            Line2: { threshold: 0.12 },
          } as THREE.Raycaster['params'],
        }}
        onPointerMissed={() => missRef.current()}
      >
        <Suspense fallback={null}>
          <SceneContent
            photons={photons}
            thickness={thickness}
            slabSize={slabSize}
            absorptionCoef={absorptionCoef}
            scatteringCoef={scatteringCoef}
            beamRadius={beamRadius}
            viewMode={viewMode}
            missRef={missRef}
            tourStep={tourStep}
            onTourAction={onTourAction}
            pathPicking={pathPicking}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

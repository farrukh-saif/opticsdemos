'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { PhotonPath, SimulationParams, SimulationStats } from '@/types/optics';

const STEP_SIZE = 0.1;
const MAX_STEPS = 500;
const MAX_PHOTONS = 150;
const SLAB_SIZE = 12; // tissue slab is a square

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function henyeyGreenstein(g: number): number {
  if (Math.abs(g) < 0.001) {
    return 2 * Math.random() - 1;
  }
  const xi = Math.random();
  const cosTheta =
    (1 / (2 * g)) *
    (1 + g * g - Math.pow((1 - g * g) / (1 - g + 2 * g * xi), 2));
  return Math.max(-1, Math.min(1, cosTheta));
}

function sampleScatterDirection(
  currentDir: THREE.Vector3,
  g: number
): THREE.Vector3 {
  const cosTheta = henyeyGreenstein(g);
  const sinTheta = Math.sqrt(1 - cosTheta * cosTheta);
  const phi = 2 * Math.PI * Math.random();

  const perpX = new THREE.Vector3();
  const perpY = new THREE.Vector3();

  if (Math.abs(currentDir.y) < 0.9) {
    perpX.set(0, 1, 0);
  } else {
    perpX.set(1, 0, 0);
  }
  perpX.crossVectors(currentDir, perpX).normalize();
  perpY.crossVectors(currentDir, perpX).normalize();

  const newDir = new THREE.Vector3()
    .copy(currentDir)
    .multiplyScalar(cosTheta)
    .add(perpX.multiplyScalar(sinTheta * Math.cos(phi)))
    .add(perpY.multiplyScalar(sinTheta * Math.sin(phi)));

  return newDir.normalize();
}

function sampleBeamPosition(beamRadius: number): { x: number; z: number } {
  const r = beamRadius * Math.sqrt(Math.random());
  const theta = Math.random() * 2 * Math.PI;
  return {
    x: r * Math.cos(theta),
    z: r * Math.sin(theta),
  };
}

function simulatePhoton(params: SimulationParams): PhotonPath {
  const { absorptionCoef, scatteringCoef, thickness, anisotropy, beamRadius } = params;
  const totalCoef = absorptionCoef + scatteringCoef;
  const albedo = scatteringCoef / totalCoef;

  const points: THREE.Vector3[] = [];
  
  const beamPos = sampleBeamPosition(beamRadius);
  const tissueTop = thickness / 2;
  const tissueBottom = -thickness / 2;
  const airGap = 3;

  let position = new THREE.Vector3(beamPos.x, tissueTop + airGap, beamPos.z);
  let direction = new THREE.Vector3(0, -1, 0);
  let weight = 1.0;
  let status: PhotonPath['status'] = 'traveling';

  points.push(position.clone());

  for (let step = 0; step < MAX_STEPS && status === 'traveling'; step++) {
    const freePathLength = -Math.log(Math.random()) / totalCoef;
    const stepLength = Math.min(freePathLength, STEP_SIZE * 5);

    position = position.clone().add(direction.clone().multiplyScalar(stepLength));
    points.push(position.clone());

    if (position.y < tissueBottom) {
      status = 'transmitted';
      break;
    }

    if (position.y > tissueTop + airGap + 1) {
      status = 'scattered-out';
      break;
    }

    if (
      Math.abs(position.x) > SLAB_SIZE / 2 ||
      Math.abs(position.z) > SLAB_SIZE / 2
    ) {
      status = 'scattered-out';
      break;
    }

    if (position.y <= tissueTop && position.y >= tissueBottom) {
      const survivalProb = albedo;
      if (Math.random() > survivalProb) {
        status = 'absorbed';
        weight *= absorptionCoef / totalCoef;
        break;
      }

      weight *= survivalProb;
      direction = sampleScatterDirection(direction, anisotropy);
    }

    if (weight < 0.001) {
      status = 'absorbed';
      break;
    }
  }

  if (status === 'traveling') {
    status = 'absorbed';
  }

  return {
    id: generateId(),
    points,
    status,
    weight,
    createdAt: Date.now(),
  };
}

export function usePhotonSimulation(params: SimulationParams) {
  const [photons, setPhotons] = useState<PhotonPath[]>([]);
  const [stats, setStats] = useState<SimulationStats>({
    absorbed: 0,
    transmitted: 0,
    scatteredOut: 0,
    total: 0,
  });
  const [isRunning, setIsRunning] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const addPhoton = useCallback(() => {
    const newPhoton = simulatePhoton(params);
    setPhotons((prev) => {
      const updated = [...prev, newPhoton];
      if (updated.length > MAX_PHOTONS) {
        return updated.slice(-MAX_PHOTONS);
      }
      return updated;
    });

    setStats((prev) => ({
      ...prev,
      total: prev.total + 1,
      absorbed: prev.absorbed + (newPhoton.status === 'absorbed' ? 1 : 0),
      transmitted: prev.transmitted + (newPhoton.status === 'transmitted' ? 1 : 0),
      scatteredOut:
        prev.scatteredOut + (newPhoton.status === 'scattered-out' ? 1 : 0),
    }));
  }, [params]);

  const reset = useCallback(() => {
    setPhotons([]);
    setStats({
      absorbed: 0,
      transmitted: 0,
      scatteredOut: 0,
      total: 0,
    });
  }, []);

  const toggleRunning = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (isRunning && params.photonRate > 0) {
      const interval = 1000 / params.photonRate;
      intervalRef.current = setInterval(addPhoton, interval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, params.photonRate, addPhoton]);

  useEffect(() => {
    reset();
  }, [params.absorptionCoef, params.scatteringCoef, params.thickness, params.anisotropy, params.beamRadius, reset]);

  return {
    photons,
    stats,
    isRunning,
    toggleRunning,
    reset,
    slabDimensions: {
      width: SLAB_SIZE,
      height: SLAB_SIZE,
      thickness: params.thickness,
    },
  };
}

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { PhotonPath, SimulationParams, SimulationStats } from '@/types/optics';
import { MAX_PHOTONS, SLAB_SIZE, seedPhotons, simulatePhoton } from '@/lib/monteCarlo';

export function usePhotonSimulation(params: SimulationParams) {
  const [photons, setPhotons] = useState<PhotonPath[]>([]);
  const [stats, setStats] = useState<SimulationStats>({
    absorbed: 0,
    transmitted: 0,
    scatteredOut: 0,
    total: 0,
  });
  const [isRunning, setIsRunning] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const addPhoton = useCallback(() => {
    const current = paramsRef.current;
    const newPhoton = simulatePhoton(current);
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
  }, []);

  const reset = useCallback(() => {
    const seeded = seedPhotons(paramsRef.current);
    setPhotons(seeded.photons);
    setStats(seeded.stats);
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
  }, [
    params.absorptionCoef,
    params.scatteringCoef,
    params.thickness,
    params.anisotropy,
    params.beamRadius,
    reset,
  ]);

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

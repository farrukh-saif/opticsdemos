'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ControlPanel } from '@/components/ControlPanel';
import { Legend } from '@/components/Legend';
import { InfoPanel } from '@/components/InfoPanel';
import { usePhotonSimulation } from '@/hooks/usePhotonSimulation';
import { SimulationParams, ViewMode, DEFAULT_PARAMS } from '@/types/optics';

const OpticsScene = dynamic(
  () => import('@/components/OpticsScene').then((mod) => mod.OpticsScene),
  { ssr: false }
);

export default function Home() {
  const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
  const [viewMode, setViewMode] = useState<ViewMode>('3d');

  const { photons, stats, isRunning, toggleRunning, reset, slabDimensions } =
    usePhotonSimulation(params);

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-100 relative">
      <OpticsScene
        photons={photons}
        thickness={slabDimensions.thickness}
        slabSize={slabDimensions.width}
        absorptionCoef={params.absorptionCoef}
        scatteringCoef={params.scatteringCoef}
        beamRadius={params.beamRadius}
        viewMode={viewMode}
      />

      <div className="absolute top-3 left-3 flex items-center gap-2">
        <h1 className="text-sm font-medium text-gray-700 bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-md shadow-sm border border-gray-200">
          Photon Transport
        </h1>
        <InfoPanel />
      </div>

      <div className="absolute top-3 right-3">
        <ControlPanel
          params={params}
          setParams={setParams}
          stats={stats}
          viewMode={viewMode}
          setViewMode={setViewMode}
          isRunning={isRunning}
          onToggleRunning={toggleRunning}
          onReset={reset}
        />
      </div>

      <div className="absolute bottom-3 left-3">
        <Legend />
      </div>
    </div>
  );
}

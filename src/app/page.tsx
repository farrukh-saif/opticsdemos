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

function PhotonLabLogo() {
  return (
    <svg viewBox="0 0 32 32" className="w-6 h-6" fill="none">
      <rect width="32" height="32" rx="6" fill="#f1f5f9"/>
      <circle cx="16" cy="10" r="4" fill="#fbbf24"/>
      <circle cx="16" cy="10" r="2.5" fill="#fcd34d"/>
      <path d="M16 14 L16 26" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M16 14 L12 22" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round" opacity="0.8"/>
      <path d="M16 14 L20 24" stroke="#22c55e" strokeWidth="1.2" strokeLinecap="round" opacity="0.8"/>
      <path d="M16 14 L10 20" stroke="#3b82f6" strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
      <rect x="8" y="26" width="16" height="2" rx="1" fill="#94a3b8"/>
    </svg>
  );
}

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

      <div className="absolute top-3 left-3 flex items-center gap-3">
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg shadow-sm border border-gray-200">
          <PhotonLabLogo />
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-medium tracking-wide">PHOTONLAB</span>
            <span className="text-xs font-medium text-gray-700 -mt-0.5">Light Attenuation</span>
          </div>
        </div>
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

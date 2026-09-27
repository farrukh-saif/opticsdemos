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
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Welcome to Optics</h1>
            <p className="text-sm text-gray-400">
              Interactive light absorption and scattering in tissue
            </p>
          </div>
          <InfoPanel />
        </div>
      </header>

      <main className="p-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 h-[calc(100vh-120px)]">
          <div className="relative min-h-[400px] lg:min-h-0">
            <OpticsScene
              photons={photons}
              thickness={slabDimensions.thickness}
              width={slabDimensions.width}
              height={slabDimensions.height}
              absorptionCoef={params.absorptionCoef}
              scatteringCoef={params.scatteringCoef}
              viewMode={viewMode}
            />

            <div className="absolute bottom-4 left-4">
              <Legend />
            </div>

            <div className="absolute top-4 left-4 bg-gray-800/80 backdrop-blur-sm rounded-lg px-3 py-1.5 text-sm">
              <span className="text-gray-400">View: </span>
              <span className="font-medium">{viewMode === '3d' ? '3D Perspective' : '2D Side View'}</span>
            </div>
          </div>

          <div className="space-y-4 overflow-y-auto">
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

            <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-2">Quick Tips</h3>
              <ul className="text-sm text-gray-400 space-y-1.5">
                <li>• Increase μₐ to see more absorption (red paths)</li>
                <li>• Increase μₛ to see more scattering (zigzag paths)</li>
                <li>• Low g values make scattering more random</li>
                <li>• Drag to rotate in 3D, scroll to zoom</li>
                <li>• Switch to 2D for a clear side view</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

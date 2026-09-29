'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { ControlPanel } from '@/components/ControlPanel';
import { StatsPanel } from '@/components/StatsPanel';
import { InfoPanel } from '@/components/InfoPanel';
import { OnboardingHint } from '@/components/OnboardingHint';
import { usePhotonSimulation } from '@/hooks/usePhotonSimulation';
import { useFirstVisitTour } from '@/hooks/useFirstVisitTour';
import { useIsCoarsePointer, useIsNarrow } from '@/hooks/useMatchMedia';
import { SimulationParams, ViewMode, DEFAULT_PARAMS } from '@/types/optics';
import { tourStepsForPointer } from '@/lib/onboarding';

const OpticsScene = dynamic(
  () => import('@/components/OpticsScene').then((mod) => mod.OpticsScene),
  { ssr: false }
);

function OpticsLogo() {
  return (
    <svg viewBox="0 0 32 32" className="w-6 h-6 shrink-0" fill="none">
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
  const [sheetOpen, setSheetOpen] = useState(false);
  const coarsePointer = useIsCoarsePointer();
  const isNarrow = useIsNarrow();
  const touchUi = coarsePointer || isNarrow;
  const tourSteps = tourStepsForPointer(touchUi);

  const { photons, stats, isRunning, toggleRunning, reset, slabDimensions } =
    usePhotonSimulation(params);
  const { step, skip, start, next, report } = useFirstVisitTour(viewMode, tourSteps);

  useEffect(() => {
    if (step === 'sliders') setSheetOpen(true);
    if (step === 'orbit' || step === 'zoom' || step === 'stats' || step === 'pause') {
      setSheetOpen(false);
    }
  }, [step]);

  const controlProps = {
    params,
    setParams,
    viewMode,
    setViewMode,
    isRunning,
    onToggleRunning: toggleRunning,
    onReset: reset,
    tourStep: step,
    onTourAction: report,
  };

  return (
    <div className="h-dvh w-screen overflow-hidden bg-slate-100 relative">
      <OpticsScene
        photons={photons}
        thickness={slabDimensions.thickness}
        slabSize={slabDimensions.width}
        absorptionCoef={params.absorptionCoef}
        scatteringCoef={params.scatteringCoef}
        beamRadius={params.beamRadius}
        viewMode={viewMode}
        tourStep={step}
        onTourAction={report}
        pathPicking={!touchUi}
      />

      <div className="absolute z-20 top-[max(0.75rem,env(safe-area-inset-top))] left-3 right-3 flex items-center gap-2 pointer-events-none">
        <div className="flex items-center gap-2 min-w-0 pointer-events-auto">
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-2.5 py-1.5 md:px-3 md:py-2 rounded-lg shadow-sm border border-gray-200 min-w-0">
            <OpticsLogo />
            <div className="flex flex-col min-w-0 hidden md:flex">
              <span className="text-[11px] text-gray-400 font-medium tracking-wide">opticsdemos</span>
              <span className="text-sm font-medium text-gray-700 -mt-0.5">Light Attenuation</span>
            </div>
          </div>
          {!step ? (
            <button
              type="button"
              onClick={start}
              className="h-8 px-2.5 rounded-full bg-white/90 hover:bg-white border border-gray-200 shadow-sm text-xs text-gray-600 shrink-0"
            >
              Tutorial
            </button>
          ) : null}
          <InfoPanel />
        </div>
        <div className="md:hidden ml-auto flex items-center gap-1.5 pointer-events-auto shrink-0">
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="h-8 px-2.5 rounded-full bg-white/90 hover:bg-white border border-gray-200 shadow-sm text-xs text-gray-600"
          >
            Controls
          </button>
          <button
            type="button"
            onClick={() => {
              toggleRunning();
              report('pause');
            }}
            className={`h-8 px-2.5 rounded-full border shadow-sm text-xs font-medium ${
              step === 'pause' ? 'tour-spotlight' : ''
            } ${
              isRunning
                ? 'bg-amber-100 border-amber-200 text-amber-800'
                : 'bg-emerald-100 border-emerald-200 text-emerald-800'
            }`}
          >
            {isRunning ? 'Pause' : 'Run'}
          </button>
          <button
            type="button"
            onClick={reset}
            className="h-8 px-2.5 rounded-full bg-white/90 hover:bg-white border border-gray-200 shadow-sm text-xs text-gray-600"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="hidden md:block absolute top-3 right-3 z-20">
        <ControlPanel {...controlProps} />
      </div>

      {sheetOpen ? (
        <div className="md:hidden fixed inset-0 z-30">
          <button
            type="button"
            className="absolute inset-0 bg-black/20"
            aria-label="Close controls"
            onClick={() => setSheetOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0">
            <ControlPanel
              {...controlProps}
              layout="sheet"
              onClose={() => setSheetOpen(false)}
            />
          </div>
        </div>
      ) : null}

      {step ? (
        <OnboardingHint
          step={step}
          steps={tourSteps}
          pinchZoom={touchUi}
          onSkip={skip}
          onNext={next}
        />
      ) : null}

      <div className="absolute z-20 left-3 right-3 md:right-auto bottom-[max(0.75rem,env(safe-area-inset-bottom))] md:bottom-16 md:left-3 pointer-events-none">
        <div className="pointer-events-auto">
          <StatsPanel
            stats={stats}
            spotlight={step === 'stats'}
            onSelect={() => report('stats')}
          />
        </div>
      </div>
    </div>
  );
}

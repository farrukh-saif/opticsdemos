'use client';

import { useState } from 'react';
import { SimulationParams, ViewMode } from '@/types/optics';
import { meanFreePath, transportMeanFreePath } from '@/lib/monteCarlo';
import type { TourStep } from '@/lib/onboarding';

interface SliderProps {
  label: string;
  symbol?: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
}

function Slider({ label, symbol, hint, value, min, max, step, unit, onChange }: SliderProps) {
  const digits = step < 0.1 ? 2 : step < 1 ? 1 : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-baseline gap-2 text-sm">
        <span className="text-gray-600">
          {label}
          {symbol ? <span className="ml-1.5 font-mono text-gray-800">{symbol}</span> : null}
        </span>
        <span className="font-mono text-gray-800 shrink-0">
          {value.toFixed(digits)}{unit ? ` ${unit}` : ''}
        </span>
      </div>
      {hint ? <p className="text-[11px] text-gray-400 leading-tight">{hint}</p> : null}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 rounded-full cursor-pointer"
      />
    </div>
  );
}

function formatMm(value: number): string {
  if (!Number.isFinite(value)) return 'n/a';
  if (value < 0.01) return `${value.toFixed(3)} mm`;
  if (value < 1) return `${value.toFixed(2)} mm`;
  return `${value.toFixed(1)} mm`;
}

interface ControlPanelProps {
  params: SimulationParams;
  setParams: (params: SimulationParams) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isRunning: boolean;
  onToggleRunning: () => void;
  onReset: () => void;
  tourStep?: TourStep | null;
  onTourAction?: (action: TourStep) => void;
  layout?: 'docked' | 'sheet';
  onClose?: () => void;
}

export function ControlPanel({
  params,
  setParams,
  viewMode,
  setViewMode,
  isRunning,
  onToggleRunning,
  onReset,
  tourStep = null,
  onTourAction,
  layout = 'docked',
  onClose,
}: ControlPanelProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const updateParam = <K extends keyof SimulationParams>(
    key: K,
    value: SimulationParams[K]
  ) => {
    setParams({ ...params, [key]: value });
  };

  const mfp = meanFreePath(params.absorptionCoef, params.scatteringCoef);
  const tmfp = transportMeanFreePath(
    params.absorptionCoef,
    params.scatteringCoef,
    params.anisotropy
  );

  const sheet = layout === 'sheet';

  return (
    <div
      className={
        sheet
          ? `bg-white rounded-t-2xl shadow-lg border border-gray-200 w-full text-sm max-h-[70dvh] flex flex-col ${tourStep === 'sliders' || tourStep === 'pause' ? 'tour-spotlight' : ''}`
          : `bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 w-72 text-sm max-h-[calc(100vh-1.5rem)] flex flex-col ${tourStep === 'sliders' || tourStep === 'pause' ? 'tour-spotlight' : ''}`
      }
    >
      {sheet ? (
        <div className="flex justify-center pt-2 pb-1 shrink-0" aria-hidden>
          <div className="h-1 w-10 rounded-full bg-gray-200" />
        </div>
      ) : null}
      <div className="flex items-center justify-between px-4 pt-3 pb-2.5 border-b border-gray-100 shrink-0">
        <span className="font-medium text-gray-700 text-sm">Controls</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewMode(viewMode === '3d' ? '2d' : '3d')}
            className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-gray-600"
          >
            {viewMode.toUpperCase()}
          </button>
          {sheet && onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 text-lg leading-none"
              aria-label="Close controls"
            >
              ×
            </button>
          ) : null}
        </div>
      </div>

      <div className={`px-4 py-2.5 space-y-2 overflow-y-auto min-h-0 flex-1 ${tourStep === 'sliders' ? 'tour-spotlight-inner' : ''}`}>
        <Slider
          label="Absorption"
          symbol="μₐ"
          value={params.absorptionCoef}
          min={0.001}
          max={1}
          step={0.005}
          unit="mm⁻¹"
          onChange={(v) => {
            updateParam('absorptionCoef', v);
            onTourAction?.('sliders');
          }}
        />
        <Slider
          label="Scattering"
          symbol="μₛ"
          value={params.scatteringCoef}
          min={0.5}
          max={40}
          step={0.5}
          unit="mm⁻¹"
          onChange={(v) => {
            updateParam('scatteringCoef', v);
            onTourAction?.('sliders');
          }}
        />
        {sheet ? null : (
          <>
            <Slider
              label="Anisotropy"
              symbol="g"
              value={params.anisotropy}
              min={0}
              max={0.98}
              step={0.02}
              onChange={(v) => {
                updateParam('anisotropy', v);
                onTourAction?.('sliders');
              }}
            />
            <Slider
              label="Thickness"
              value={params.thickness}
              min={1}
              max={12}
              step={0.5}
              unit="mm"
              onChange={(v) => {
                updateParam('thickness', v);
                onTourAction?.('sliders');
              }}
            />
          </>
        )}
        <Slider
          label="Photons per second"
          hint={sheet ? undefined : 'How busy the source is'}
          value={params.photonRate}
          min={1}
          max={40}
          step={1}
          unit="s⁻¹"
          onChange={(v) => {
            updateParam('photonRate', v);
            onTourAction?.('sliders');
          }}
        />
      </div>

      <div className={`px-4 pt-1.5 pb-1 shrink-0 border-t border-gray-100 ${sheet ? 'pb-[max(0.75rem,env(safe-area-inset-bottom))]' : ''}`}>
        <button
          type="button"
          onClick={() => setDetailsOpen((open) => !open)}
          aria-expanded={detailsOpen}
          className="w-full flex items-center justify-between px-1 py-0.5 text-xs text-gray-500 hover:text-gray-700"
        >
          <span>More details</span>
          <span className="font-mono">{detailsOpen ? '▾' : '▸'}</span>
        </button>

        {detailsOpen && (
          <div className="rounded-md border border-gray-100 bg-gray-50 px-2.5 py-2 mt-1.5 space-y-1.5 text-xs text-gray-600">
            {sheet ? (
              <div className="space-y-2 pb-1.5">
                <Slider
                  label="Anisotropy"
                  symbol="g"
                  value={params.anisotropy}
                  min={0}
                  max={0.98}
                  step={0.02}
                  onChange={(v) => {
                    updateParam('anisotropy', v);
                    onTourAction?.('sliders');
                  }}
                />
                <Slider
                  label="Thickness"
                  value={params.thickness}
                  min={1}
                  max={12}
                  step={0.5}
                  unit="mm"
                  onChange={(v) => {
                    updateParam('thickness', v);
                    onTourAction?.('sliders');
                  }}
                />
              </div>
            ) : null}
            <div className="flex justify-between gap-2">
              <span>Mean free path</span>
              <span className="font-mono text-gray-800">{formatMm(mfp)}</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-snug">
              1 / (μₐ + μₛ). Average distance between events.
            </p>
            <div className="flex justify-between gap-2 pt-1">
              <span>Transport mean free path</span>
              <span className="font-mono text-gray-800">{formatMm(tmfp)}</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-snug">
              1 / (μₐ + μₛ(1 − g)). Distance to forget the original direction.
            </p>
          </div>
        )}
      </div>

      {sheet ? null : (
      <div className={`flex gap-2 px-4 pt-2 border-t border-gray-100 shrink-0 pb-3 ${tourStep === 'pause' ? 'tour-spotlight-inner' : ''}`}>
        <button
          onClick={() => {
            onToggleRunning();
            onTourAction?.('pause');
          }}
          className={`flex-1 py-1.5 px-2 rounded-md text-sm font-medium transition-colors ${
            isRunning
              ? 'bg-amber-100 hover:bg-amber-200 text-amber-800'
              : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
          }`}
        >
          {isRunning ? 'Pause' : 'Run'}
        </button>
        <button
          onClick={onReset}
          className="flex-1 py-1.5 px-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-600 transition-colors"
        >
          Reset
        </button>
      </div>
      )}
    </div>
  );
}

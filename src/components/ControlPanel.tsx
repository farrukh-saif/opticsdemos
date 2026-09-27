'use client';

import { SimulationParams, SimulationStats, ViewMode } from '@/types/optics';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
  description?: string;
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  description,
}: SliderProps) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-200">{label}</label>
        <span className="text-sm font-mono text-blue-400">
          {value.toFixed(step < 1 ? 2 : 0)} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />
      {description && (
        <p className="text-xs text-gray-400">{description}</p>
      )}
    </div>
  );
}

interface ControlPanelProps {
  params: SimulationParams;
  setParams: (params: SimulationParams) => void;
  stats: SimulationStats;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isRunning: boolean;
  onToggleRunning: () => void;
  onReset: () => void;
}

export function ControlPanel({
  params,
  setParams,
  stats,
  viewMode,
  setViewMode,
  isRunning,
  onToggleRunning,
  onReset,
}: ControlPanelProps) {
  const updateParam = <K extends keyof SimulationParams>(
    key: K,
    value: SimulationParams[K]
  ) => {
    setParams({ ...params, [key]: value });
  };

  const transmissionPercent = stats.total > 0 
    ? ((stats.transmitted / stats.total) * 100).toFixed(1)
    : '0.0';
  const absorptionPercent = stats.total > 0 
    ? ((stats.absorbed / stats.total) * 100).toFixed(1)
    : '0.0';
  const scatterPercent = stats.total > 0 
    ? ((stats.scatteredOut / stats.total) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 space-y-4 text-white">
      <div className="flex items-center justify-between border-b border-gray-700 pb-3">
        <h2 className="text-lg font-semibold">Optical Properties</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === '3d' ? '2d' : '3d')}
            className="px-3 py-1.5 text-sm font-medium bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            {viewMode === '3d' ? '2D View' : '3D View'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <Slider
          label="Absorption Coefficient (μₐ)"
          value={params.absorptionCoef}
          min={0.01}
          max={2}
          step={0.01}
          unit="mm⁻¹"
          onChange={(v) => updateParam('absorptionCoef', v)}
          description="How strongly light is absorbed. Higher values mean more energy lost to heat."
        />

        <Slider
          label="Scattering Coefficient (μₛ)"
          value={params.scatteringCoef}
          min={0.1}
          max={50}
          step={0.1}
          unit="mm⁻¹"
          onChange={(v) => updateParam('scatteringCoef', v)}
          description="How often light changes direction. Typical tissue: 10-40 mm⁻¹"
        />

        <Slider
          label="Photon Rate"
          value={params.photonRate}
          min={1}
          max={100}
          step={1}
          unit="/sec"
          onChange={(v) => updateParam('photonRate', v)}
          description="Number of simulated photons launched per second"
        />

        <Slider
          label="Tissue Thickness"
          value={params.thickness}
          min={2}
          max={20}
          step={0.5}
          unit="mm"
          onChange={(v) => updateParam('thickness', v)}
        />

        <Slider
          label="Anisotropy (g)"
          value={params.anisotropy}
          min={-0.5}
          max={0.99}
          step={0.01}
          unit=""
          onChange={(v) => updateParam('anisotropy', v)}
          description="Scattering direction preference. 0 = isotropic, ~0.9 = forward (typical tissue)"
        />
      </div>

      <div className="border-t border-gray-700 pt-3">
        <h3 className="text-sm font-semibold mb-2 text-gray-300">Statistics</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-gray-700/50 rounded p-2">
            <div className="text-gray-400">Total Photons</div>
            <div className="font-mono text-lg">{stats.total}</div>
          </div>
          <div className="bg-green-900/30 rounded p-2">
            <div className="text-green-400">Transmitted</div>
            <div className="font-mono text-lg text-green-300">
              {stats.transmitted} ({transmissionPercent}%)
            </div>
          </div>
          <div className="bg-red-900/30 rounded p-2">
            <div className="text-red-400">Absorbed</div>
            <div className="font-mono text-lg text-red-300">
              {stats.absorbed} ({absorptionPercent}%)
            </div>
          </div>
          <div className="bg-blue-900/30 rounded p-2">
            <div className="text-blue-400">Scattered Out</div>
            <div className="font-mono text-lg text-blue-300">
              {stats.scatteredOut} ({scatterPercent}%)
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={onToggleRunning}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            isRunning
              ? 'bg-yellow-600 hover:bg-yellow-700'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isRunning ? 'Pause' : 'Resume'}
        </button>
        <button
          onClick={onReset}
          className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-lg font-medium transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

'use client';

import { SimulationParams, SimulationStats, ViewMode } from '@/types/optics';

interface SliderProps {
  label: string;
  symbol?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
}

function Slider({ label, symbol, value, min, max, step, unit, onChange }: SliderProps) {
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-600">
          {symbol ? <span className="font-mono">{symbol}</span> : label}
        </span>
        <span className="font-mono text-gray-800">
          {value.toFixed(step < 1 ? (step < 0.1 ? 2 : 1) : 0)}{unit && ` ${unit}`}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full cursor-pointer"
      />
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

  const pct = (n: number) => stats.total > 0 ? ((n / stats.total) * 100).toFixed(0) : '0';

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-3 w-56 text-sm">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
        <span className="font-medium text-gray-700 text-xs uppercase tracking-wide">Controls</span>
        <button
          onClick={() => setViewMode(viewMode === '3d' ? '2d' : '3d')}
          className="px-2 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors text-gray-600"
        >
          {viewMode.toUpperCase()}
        </button>
      </div>

      <div className="space-y-2.5">
        <Slider
          label="Absorption"
          symbol="μₐ"
          value={params.absorptionCoef}
          min={0.001}
          max={1}
          step={0.005}
          unit="mm⁻¹"
          onChange={(v) => updateParam('absorptionCoef', v)}
        />
        <Slider
          label="Scattering"
          symbol="μₛ"
          value={params.scatteringCoef}
          min={0.5}
          max={40}
          step={0.5}
          unit="mm⁻¹"
          onChange={(v) => updateParam('scatteringCoef', v)}
        />
        <Slider
          label="Anisotropy"
          symbol="g"
          value={params.anisotropy}
          min={0}
          max={0.98}
          step={0.02}
          onChange={(v) => updateParam('anisotropy', v)}
        />
        <Slider
          label="Thickness"
          value={params.thickness}
          min={1}
          max={12}
          step={0.5}
          unit="mm"
          onChange={(v) => updateParam('thickness', v)}
        />
        <Slider
          label="Rate"
          value={params.photonRate}
          min={5}
          max={80}
          step={5}
          unit="/s"
          onChange={(v) => updateParam('photonRate', v)}
        />
      </div>

      <div className="mt-3 pt-2 border-t border-gray-100">
        <div className="grid grid-cols-4 gap-1 text-[10px] text-center mb-2">
          <div className="bg-gray-50 rounded px-1 py-1">
            <div className="text-gray-400">n</div>
            <div className="font-mono text-gray-700">{stats.total}</div>
          </div>
          <div className="bg-green-50 rounded px-1 py-1">
            <div className="text-green-600">T</div>
            <div className="font-mono text-green-700">{pct(stats.transmitted)}%</div>
          </div>
          <div className="bg-red-50 rounded px-1 py-1">
            <div className="text-red-500">A</div>
            <div className="font-mono text-red-600">{pct(stats.absorbed)}%</div>
          </div>
          <div className="bg-blue-50 rounded px-1 py-1">
            <div className="text-blue-500">S</div>
            <div className="font-mono text-blue-600">{pct(stats.scatteredOut)}%</div>
          </div>
        </div>

        <div className="flex gap-1.5">
          <button
            onClick={onToggleRunning}
            className={`flex-1 py-1 px-2 rounded text-xs font-medium transition-colors ${
              isRunning
                ? 'bg-amber-100 hover:bg-amber-200 text-amber-700'
                : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'
            }`}
          >
            {isRunning ? 'Pause' : 'Run'}
          </button>
          <button
            onClick={onReset}
            className="flex-1 py-1 px-2 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium text-gray-600 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

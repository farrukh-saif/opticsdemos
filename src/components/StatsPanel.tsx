'use client';

import { SimulationStats } from '@/types/optics';

interface StatsPanelProps {
  stats: SimulationStats;
  spotlight?: boolean;
  onSelect?: () => void;
}

export function StatsPanel({ stats, spotlight = false, onSelect }: StatsPanelProps) {
  const pct = (n: number) =>
    stats.total > 0 ? `${((n / stats.total) * 100).toFixed(0)}%` : '0%';

  const rows = [
    {
      label: 'Transmitted',
      short: 'T',
      hint: 'Made it through with no scatter',
      count: stats.transmitted,
      bar: 'bg-green-500',
      color: 'text-green-700',
    },
    {
      label: 'Absorbed',
      short: 'A',
      hint: 'Stopped in tissue',
      count: stats.absorbed,
      bar: 'bg-red-500',
      color: 'text-red-700',
    },
    {
      label: 'Scattered',
      short: 'S',
      hint: 'Changed direction',
      count: stats.scatteredOut,
      bar: 'bg-blue-500',
      color: 'text-blue-700',
    },
  ];

  return (
    <div
      className={`bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 text-sm w-[calc(100vw-1.5rem)] md:w-64 ${spotlight ? 'tour-spotlight' : ''}`}
      onClick={onSelect}
    >
      <div className="hidden md:flex items-baseline justify-between px-3 py-2 border-b border-gray-100">
        <span className="text-xs text-gray-500">Photons</span>
        <span className="font-mono text-sm text-gray-800">{stats.total}</span>
      </div>
      <div className="hidden md:block px-3 py-2 space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <div className={`w-3.5 h-0.5 ${row.bar} rounded-full`} />
                <span className={`font-medium ${row.color}`}>{row.label}</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-tight pl-5">{row.hint}</p>
            </div>
            <div className="text-right shrink-0">
              <div className={`font-mono ${row.color}`}>{row.count}</div>
              <div className="font-mono text-[11px] text-gray-400">{pct(row.count)}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="md:hidden flex items-center gap-3 px-3 py-2">
        <div className="shrink-0">
          <div className="text-[11px] text-gray-400 leading-none">Photons</div>
          <div className="font-mono text-sm text-gray-800">{stats.total}</div>
        </div>
        <div className="flex flex-1 items-center justify-end gap-3 min-w-0">
          {rows.map((row) => (
            <div key={row.label} className="flex items-baseline gap-1.5 min-w-0">
              <div className={`w-2 h-2 rounded-full ${row.bar} shrink-0`} />
              <span className={`text-[11px] ${row.color}`}>{row.short}</span>
              <span className={`font-mono text-sm ${row.color}`}>{row.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';

export function Legend() {
  const items = [
    { color: 'bg-green-500', label: 'Transmitted', description: 'Photon passed through' },
    { color: 'bg-red-500', label: 'Absorbed', description: 'Energy converted to heat' },
    { color: 'bg-blue-500', label: 'Scattered Out', description: 'Exited from side/back' },
    { color: 'bg-yellow-400', label: 'Traveling', description: 'Currently propagating' },
  ];

  return (
    <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-3">
      <h3 className="text-sm font-semibold text-gray-300 mb-2">Photon Paths</h3>
      <div className="space-y-1.5">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-sm">
            <div className={`w-4 h-1 ${item.color} rounded`} />
            <span className="text-white font-medium">{item.label}</span>
            <span className="text-gray-400 text-xs hidden sm:inline">
              - {item.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

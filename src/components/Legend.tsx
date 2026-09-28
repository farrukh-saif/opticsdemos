'use client';

export function Legend() {
  const items = [
    { color: 'bg-green-500', label: 'Transmitted' },
    { color: 'bg-red-500', label: 'Absorbed' },
    { color: 'bg-blue-500', label: 'Scattered' },
  ];

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-md shadow-sm border border-gray-200 px-2 py-1.5 flex gap-3 text-xs">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <div className={`w-3 h-0.5 ${item.color} rounded-full`} />
          <span className="text-gray-600">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

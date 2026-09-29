'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

function ModalContent({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/20" />
      <div
        className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-5 text-sm max-h-[min(32rem,calc(100dvh-2rem))] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2.5 right-2.5 w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 text-lg"
        >
          ×
        </button>

        <h3 className="font-semibold text-gray-800 mb-3 text-base">Light in Tissue</h3>

        <div className="space-y-3 text-gray-600 text-sm leading-relaxed">
          <p>
            <strong className="text-gray-700">Absorption (μₐ):</strong> Light converts to heat.
            Intensity falls as I = I₀·e<sup>−μₐ·d</sup>.
          </p>
          <p>
            <strong className="text-gray-700">Scattering (μₛ):</strong> Photons change direction
            when hitting particles. Higher values mean more zigzag paths.
          </p>
          <p>
            <strong className="text-gray-700">Anisotropy (g):</strong> 0 = scatter equally all directions.
            About 0.9 = mostly forward scattering.
          </p>
          <p>
            <strong className="text-gray-700">Photons per second:</strong> How fast the source launches photons.
            This only changes how busy the demo looks, not μₐ or μₛ.
          </p>
          <p className="pt-1 border-t border-gray-100">
            <strong className="text-gray-700">Transmitted</strong> photons go through with no absorption and no scatter.
            <strong className="text-gray-700"> Absorbed</strong> photons stop in tissue.
            <strong className="text-gray-700"> Scattered</strong> photons change direction at least once.
          </p>
        </div>

        <p className="mt-3 pt-2 border-t border-gray-100 text-xs text-gray-400">
          Simplified Monte Carlo model for education.
        </p>
      </div>
    </div>
  );
}

export function InfoPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full bg-white/90 hover:bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 text-base transition-colors"
        aria-label="Help"
      >
        ?
      </button>

      {isOpen && mounted && createPortal(
        <ModalContent onClose={() => setIsOpen(false)} />,
        document.body
      )}
    </>
  );
}

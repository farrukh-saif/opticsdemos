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
        className="relative bg-white rounded-lg shadow-xl max-w-sm w-full p-4 text-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        >
          ×
        </button>

        <h3 className="font-semibold text-gray-800 mb-3">Light in Tissue</h3>

        <div className="space-y-2.5 text-gray-600 text-xs leading-relaxed">
          <p>
            <strong className="text-gray-700">Absorption (μₐ):</strong> Light converts to heat. 
            Intensity falls as I = I₀·e<sup>−μₐ·d</sup>.
          </p>
          <p>
            <strong className="text-gray-700">Scattering (μₛ):</strong> Photons change direction 
            when hitting particles. Higher values = more zigzag paths.
          </p>
          <p>
            <strong className="text-gray-700">Anisotropy (g):</strong> 0 = scatter equally all directions. 
            ~0.9 = mostly forward scattering.
          </p>
        </div>

        <p className="mt-3 pt-2 border-t border-gray-100 text-[10px] text-gray-400">
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
        className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-sm transition-colors"
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

'use client';

import { useState } from 'react';

export function InfoPanel() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-800/90 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center text-white hover:bg-gray-700 transition-colors"
        aria-label="Show physics information"
      >
        ?
      </button>

      {isOpen && (
        <div className="absolute top-10 right-0 w-80 bg-gray-800/95 backdrop-blur-sm rounded-xl p-4 text-white text-sm z-50 shadow-xl">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-white"
          >
            ×
          </button>

          <h3 className="font-bold text-lg mb-3">How Light Interacts with Tissue</h3>

          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-blue-400">Absorption (Beer-Lambert Law)</h4>
              <p className="text-gray-300">
                Light intensity decreases exponentially: I = I₀ × e^(-μₐ × d).
                Higher absorption coefficient (μₐ) means more energy is converted to heat.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-blue-400">Scattering</h4>
              <p className="text-gray-300">
                Photons change direction when hitting particles. The scattering coefficient (μₛ)
                determines how often this happens. Tissue typically scatters light strongly.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-blue-400">Anisotropy (g)</h4>
              <p className="text-gray-300">
                Controls scattering direction. g=0 means equal chance in all directions (isotropic).
                g~0.9 (typical for tissue) means most scattering is forward-directed.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-blue-400">Monte Carlo Simulation</h4>
              <p className="text-gray-300">
                Each photon path is simulated statistically. The simulation samples random
                interaction distances and scattering angles based on the optical properties.
              </p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-700">
            <p className="text-xs text-gray-400">
              This is a simplified educational model. Real tissue optics involves more complex
              phenomena including wavelength-dependent properties and multiple tissue layers.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

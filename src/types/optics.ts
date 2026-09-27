import * as THREE from 'three';

export interface SimulationParams {
  absorptionCoef: number; // μₐ (mm⁻¹)
  scatteringCoef: number; // μₛ (mm⁻¹)
  photonRate: number; // photons per second
  thickness: number; // tissue thickness (mm)
  anisotropy: number; // g factor (-1 to 1)
}

export interface PhotonPath {
  id: string;
  points: THREE.Vector3[];
  status: 'traveling' | 'absorbed' | 'transmitted' | 'scattered-out';
  weight: number;
  createdAt: number;
}

export interface SimulationStats {
  absorbed: number;
  transmitted: number;
  scatteredOut: number;
  total: number;
}

export type ViewMode = '3d' | '2d';

export const DEFAULT_PARAMS: SimulationParams = {
  absorptionCoef: 0.1, // typical tissue value
  scatteringCoef: 10, // typical tissue value
  photonRate: 50,
  thickness: 10, // 10mm slab
  anisotropy: 0.9, // forward-scattering like tissue
};

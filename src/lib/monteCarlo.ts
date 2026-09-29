import * as THREE from 'three';
import { PhotonPath, SimulationParams, SimulationStats } from '../types/optics';

export const SLAB_SIZE = 12;
export const AIR_GAP = 3;
export const MAX_STEPS = 2500;
export const MAX_PHOTONS = 150;
export const INITIAL_PHOTON_COUNT = 10;

const EPS = 1e-6;
const EXIT_AIR = 1.6;

type Face = 'top' | 'bottom' | 'side';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function henyeyGreenstein(g: number): number {
  if (Math.abs(g) < 0.001) {
    return 2 * Math.random() - 1;
  }
  const xi = Math.random();
  const cosTheta =
    (1 / (2 * g)) *
    (1 + g * g - Math.pow((1 - g * g) / (1 - g + 2 * g * xi), 2));
  return Math.max(-1, Math.min(1, cosTheta));
}

function sampleScatterDirection(
  currentDir: THREE.Vector3,
  g: number
): THREE.Vector3 {
  const cosTheta = henyeyGreenstein(g);
  const sinTheta = Math.sqrt(Math.max(0, 1 - cosTheta * cosTheta));
  const phi = 2 * Math.PI * Math.random();

  const perpX = new THREE.Vector3();
  const perpY = new THREE.Vector3();

  if (Math.abs(currentDir.y) < 0.9) {
    perpX.set(0, 1, 0);
  } else {
    perpX.set(1, 0, 0);
  }
  perpX.crossVectors(currentDir, perpX).normalize();
  perpY.crossVectors(currentDir, perpX).normalize();

  return new THREE.Vector3()
    .copy(currentDir)
    .multiplyScalar(cosTheta)
    .add(perpX.multiplyScalar(sinTheta * Math.cos(phi)))
    .add(perpY.multiplyScalar(sinTheta * Math.sin(phi)))
    .normalize();
}

function sampleBeamPosition(beamRadius: number): { x: number; z: number } {
  const r = beamRadius * Math.sqrt(Math.random());
  const theta = Math.random() * 2 * Math.PI;
  return {
    x: r * Math.cos(theta),
    z: r * Math.sin(theta),
  };
}

function distanceToTissueBoundary(
  pos: THREE.Vector3,
  dir: THREE.Vector3,
  tissueTop: number,
  tissueBottom: number,
  half: number
): { t: number; face: Face } | null {
  let tMin = Infinity;
  let face: Face | null = null;

  const consider = (t: number, nextFace: Face) => {
    if (t > EPS && t < tMin) {
      tMin = t;
      face = nextFace;
    }
  };

  if (Math.abs(dir.y) > EPS) {
    consider((tissueTop - pos.y) / dir.y, 'top');
    consider((tissueBottom - pos.y) / dir.y, 'bottom');
  }
  if (Math.abs(dir.x) > EPS) {
    consider((half - pos.x) / dir.x, 'side');
    consider((-half - pos.x) / dir.x, 'side');
  }
  if (Math.abs(dir.z) > EPS) {
    consider((half - pos.z) / dir.z, 'side');
    consider((-half - pos.z) / dir.z, 'side');
  }

  if (face === null || !Number.isFinite(tMin)) return null;
  return { t: tMin, face };
}

export function meanFreePath(absorptionCoef: number, scatteringCoef: number): number {
  const muT = absorptionCoef + scatteringCoef;
  return muT > 0 ? 1 / muT : Infinity;
}

export function transportMeanFreePath(
  absorptionCoef: number,
  scatteringCoef: number,
  anisotropy: number
): number {
  const muTr = absorptionCoef + scatteringCoef * (1 - anisotropy);
  return muTr > 0 ? 1 / muTr : Infinity;
}

export function simulatePhoton(params: SimulationParams): PhotonPath {
  const { absorptionCoef, scatteringCoef, thickness, anisotropy, beamRadius } =
    params;
  const muT = absorptionCoef + scatteringCoef;
  const albedo = muT > 0 ? scatteringCoef / muT : 0;
  const half = SLAB_SIZE / 2;
  const tissueTop = thickness / 2;
  const tissueBottom = -thickness / 2;

  const beamPos = sampleBeamPosition(beamRadius);
  const points: THREE.Vector3[] = [];

  let position = new THREE.Vector3(beamPos.x, tissueTop + AIR_GAP, beamPos.z);
  let direction = new THREE.Vector3(0, -1, 0);
  let status: PhotonPath['status'] = 'traveling';
  let didScatter = false;

  points.push(position.clone());

  const tEntry = (tissueTop - position.y) / direction.y;
  position = position.clone().add(direction.clone().multiplyScalar(tEntry));
  position.y = tissueTop;
  points.push(position.clone());

  if (Math.abs(position.x) > half || Math.abs(position.z) > half) {
    return {
      id: generateId(),
      points,
      status: 'scattered-out',
      weight: 1,
      createdAt: Date.now(),
    };
  }

  position = position.clone().addScaledVector(direction, EPS * 20);

  for (let step = 0; step < MAX_STEPS && status === 'traveling'; step++) {
    const freePath = muT > 0 ? -Math.log(Math.random()) / muT : Infinity;
    const hit = distanceToTissueBoundary(
      position,
      direction,
      tissueTop,
      tissueBottom,
      half
    );

    if (!hit) {
      status = 'scattered-out';
      break;
    }

    if (hit.t <= freePath) {
      position = position.clone().addScaledVector(direction, hit.t);
      points.push(position.clone());
      if (hit.face === 'bottom' && !didScatter) {
        status = 'transmitted';
      } else {
        status = 'scattered-out';
      }
      points.push(position.clone().addScaledVector(direction, EXIT_AIR));
      break;
    }

    position = position.clone().addScaledVector(direction, freePath);
    points.push(position.clone());

    if (Math.random() > albedo) {
      status = 'absorbed';
      break;
    }

    didScatter = true;
    direction = sampleScatterDirection(direction, anisotropy);
  }

  if (status === 'traveling') {
    status = 'absorbed';
  }

  return {
    id: generateId(),
    points,
    status,
    weight: 1,
    createdAt: Date.now(),
  };
}

export function seedPhotons(
  params: SimulationParams,
  count: number = INITIAL_PHOTON_COUNT
): { photons: PhotonPath[]; stats: SimulationStats } {
  const photons: PhotonPath[] = [];
  const stats: SimulationStats = {
    absorbed: 0,
    transmitted: 0,
    scatteredOut: 0,
    total: 0,
  };

  for (let i = 0; i < count; i++) {
    const photon = simulatePhoton(params);
    photons.push(photon);
    stats.total += 1;
    if (photon.status === 'absorbed') stats.absorbed += 1;
    else if (photon.status === 'transmitted') stats.transmitted += 1;
    else if (photon.status === 'scattered-out') stats.scatteredOut += 1;
  }

  return { photons, stats };
}

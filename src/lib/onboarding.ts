export const TOUR_STORAGE_KEY = 'opticsdemos.tour.v1';

export const TOUR_STEPS = [
  'orbit',
  'zoom',
  'hover',
  'click',
  'sliders',
  'pause',
  'stats',
] as const;

export const MOBILE_TOUR_STEPS = [
  'orbit',
  'zoom',
  'sliders',
  'pause',
  'stats',
] as const;

export type TourStep = (typeof TOUR_STEPS)[number];

export const TOUR_COPY: Record<TourStep, string> = {
  orbit: 'Drag the scene to look around',
  zoom: 'Scroll to zoom in and out',
  hover: 'Hover a path to highlight it',
  click: 'Click a path to keep it selected',
  sliders: 'Drag Absorption or Scattering and watch the paths change',
  pause: 'Pause or Run the source',
  stats: 'These counts are what happened to each photon',
};

export function tourStepsForPointer(coarse: boolean): readonly TourStep[] {
  return coarse ? MOBILE_TOUR_STEPS : TOUR_STEPS;
}

export function tourCopy(step: TourStep, pinchZoom: boolean): string {
  if (step === 'zoom' && pinchZoom) return 'Pinch to zoom in and out';
  return TOUR_COPY[step];
}

export function hasCompletedTour(): boolean {
  try {
    return window.localStorage.getItem(TOUR_STORAGE_KEY) === '1';
  } catch {
    return true;
  }
}

export function markTourCompleted(): void {
  try {
    window.localStorage.setItem(TOUR_STORAGE_KEY, '1');
  } catch {
    /* ignore quota / private mode */
  }
}

export function nextTourStep(
  step: TourStep,
  steps: readonly TourStep[] = TOUR_STEPS
): TourStep | null {
  const index = steps.indexOf(step);
  if (index >= 0) {
    if (index >= steps.length - 1) return null;
    return steps[index + 1];
  }

  const masterIndex = TOUR_STEPS.indexOf(step);
  return steps.find((item) => TOUR_STEPS.indexOf(item) > masterIndex) ?? null;
}

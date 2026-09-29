'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  hasCompletedTour,
  markTourCompleted,
  nextTourStep,
  type TourStep,
} from '@/lib/onboarding';

export function useFirstVisitTour(
  viewMode: '3d' | '2d',
  steps: readonly TourStep[]
) {
  const [step, setStep] = useState<TourStep | null>(null);
  const stepRef = useRef<TourStep | null>(null);
  const stepsRef = useRef(steps);
  stepRef.current = step;
  stepsRef.current = steps;

  const finish = useCallback(() => {
    setStep(null);
    markTourCompleted();
  }, []);

  const start = useCallback(() => {
    setStep(stepsRef.current[0] ?? 'orbit');
  }, []);

  const next = useCallback(() => {
    const current = stepRef.current;
    if (!current) return;
    const following = nextTourStep(current, stepsRef.current);
    if (following) setStep(following);
    else finish();
  }, [finish]);

  const report = useCallback(
    (action: TourStep) => {
      if (stepRef.current === action) next();
    },
    [next]
  );

  useEffect(() => {
    if (hasCompletedTour() || viewMode !== '3d') return;
    const startTimer = window.setTimeout(() => {
      setStep(stepsRef.current[0] ?? 'orbit');
    }, 900);
    return () => window.clearTimeout(startTimer);
  }, [viewMode]);

  useEffect(() => {
    const current = stepRef.current;
    if (!current || steps.includes(current)) return;
    const following = nextTourStep(current, steps);
    if (following) setStep(following);
    else finish();
  }, [steps, finish]);

  return { step, skip: finish, start, next, report };
}

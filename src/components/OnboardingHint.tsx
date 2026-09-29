'use client';

import { tourCopy, type TourStep } from '@/lib/onboarding';

function PinchGlyph() {
  return (
    <>
      <circle cx="18" cy="22" r="5.5" fill="none" stroke="#334155" strokeWidth="1.6" className="tour-pinch-left" />
      <circle cx="18" cy="22" r="2" fill="#64748b" className="tour-pinch-left" />
      <circle cx="38" cy="22" r="5.5" fill="none" stroke="#334155" strokeWidth="1.6" className="tour-pinch-right" />
      <circle cx="38" cy="22" r="2" fill="#64748b" className="tour-pinch-right" />
    </>
  );
}

function Gesture({ step, pinchZoom }: { step: TourStep; pinchZoom: boolean }) {
  return (
    <div className="relative h-11 w-14 shrink-0" aria-hidden>
      <svg viewBox="0 0 56 44" className="h-11 w-14 overflow-visible">
        {step === 'orbit' && (
          <>
            <path
              d="M8 30c10-14 30-14 40 0"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="tour-orbit-arc"
            />
            {pinchZoom ? (
              <circle cx="28" cy="18" r="6" fill="#fff" stroke="#334155" strokeWidth="1.6" className="tour-mouse-drag" />
            ) : (
              <g className="tour-mouse-drag">
                <path d="M20 8 20 26 24 22 27 28 30 26 26 20 32 20 Z" fill="#fff" stroke="#334155" strokeWidth="1.6" strokeLinejoin="round" />
              </g>
            )}
          </>
        )}
        {step === 'zoom' && (pinchZoom ? (
          <PinchGlyph />
        ) : (
          <>
            <path d="M28 6v6M28 32v6M25 9l3-3 3 3M25 35l3 3 3-3" fill="none" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" className="tour-scroll-chevrons" />
            <g className="tour-mouse-scroll" transform="translate(0, 2)">
              <path d="M20 10 20 28 24 24 27 30 30 28 26 22 32 22 Z" fill="#fff" stroke="#334155" strokeWidth="1.6" strokeLinejoin="round" />
            </g>
          </>
        ))}
        {(step === 'hover' || step === 'click') && (
          <>
            <path d="M6 30h44" stroke="#3b82f6" strokeWidth="2.2" strokeLinecap="round" className="tour-path-line" />
            <g className={step === 'click' ? 'tour-mouse-click' : 'tour-mouse-hover'}>
              <path d="M22 8 22 26 26 22 29 28 32 26 28 20 34 20 Z" fill="#fff" stroke="#334155" strokeWidth="1.6" strokeLinejoin="round" />
            </g>
          </>
        )}
        {step === 'sliders' && (
          <>
            <rect x="8" y="20" width="40" height="4" rx="2" fill="#e2e8f0" />
            <circle cx="16" cy="22" r="5" fill="#64748b" className="tour-slider-thumb" />
          </>
        )}
        {step === 'pause' && (
          <g>
            <rect x="16" y="12" width="6" height="20" rx="1" fill="#f59e0b" />
            <rect x="30" y="12" width="6" height="20" rx="1" fill="#f59e0b" />
          </g>
        )}
        {step === 'stats' && (
          <g>
            <rect x="10" y="10" width="36" height="8" rx="2" fill="#bbf7d0" />
            <rect x="10" y="22" width="36" height="8" rx="2" fill="#fecaca" />
            <rect x="10" y="34" width="36" height="8" rx="2" fill="#bfdbfe" />
          </g>
        )}
      </svg>
    </div>
  );
}

interface OnboardingHintProps {
  step: TourStep;
  steps: readonly TourStep[];
  pinchZoom?: boolean;
  onSkip: () => void;
  onNext: () => void;
}

export function OnboardingHint({
  step,
  steps,
  pinchZoom = false,
  onSkip,
  onNext,
}: OnboardingHintProps) {
  const isLast = steps[steps.length - 1] === step;

  return (
    <div className="absolute z-40 pointer-events-none left-3 right-3 top-[max(4.25rem,calc(env(safe-area-inset-top)+3.5rem))] md:top-auto md:left-1/2 md:right-auto md:bottom-7 md:-translate-x-1/2">
      <div className="pointer-events-auto flex items-center gap-3 rounded-xl border border-gray-200 bg-white/92 px-3.5 py-2 shadow-sm backdrop-blur-sm md:w-auto">
        <Gesture step={step} pinchZoom={pinchZoom} />
        <div className="min-w-0 flex-1 md:min-w-[14.5rem] md:max-w-[18rem] md:flex-none">
          <p className="text-sm text-gray-700">{tourCopy(step, pinchZoom)}</p>
          <div className="mt-1.5 flex items-center gap-1">
            {steps.map((item) => (
              <span
                key={item}
                className={`h-1 w-2.5 rounded-full ${
                  item === step ? 'bg-slate-600' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 self-start">
          <button
            type="button"
            onClick={onNext}
            className="text-xs font-medium text-slate-700 hover:text-slate-900 px-1 py-0.5"
          >
            {isLast ? 'Done' : 'Next'}
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="text-xs text-gray-400 hover:text-gray-600 px-1 py-0.5"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';

export function useMatchMedia(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);

  return matches;
}

export function useIsNarrow() {
  return useMatchMedia('(max-width: 767px)');
}

export function useIsCoarsePointer() {
  return useMatchMedia('(pointer: coarse)');
}

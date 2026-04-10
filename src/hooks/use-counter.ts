'use client';

import { useEffect, useState } from 'react';

interface UseCounterOptions {
  duration?: number;
  decimals?: number;
  enabled?: boolean;
}

export function useCounter(target: number, options: UseCounterOptions = {}) {
  const { duration = 1800, decimals = 0, enabled = false } = options;
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!enabled || target === 0) return;

    const startTime = performance.now();

    function update(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = target * ease;
      setValue(decimals > 0 ? parseFloat(current.toFixed(decimals)) : Math.round(current));
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }, [target, duration, decimals, enabled]);

  return value;
}

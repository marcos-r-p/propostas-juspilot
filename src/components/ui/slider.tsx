'use client';

import { cn } from '@/lib/utils/cn';

interface SliderProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  className?: string;
}

export function Slider({ label, value, onChange, min, max, step = 1, suffix, className }: SliderProps) {
  return (
    <div className={className}>
      {label && (
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-body font-medium text-ink">{label}</label>
          <span className="text-body font-medium text-ink">
            {value}{suffix}
          </span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn(
          'w-full appearance-none h-px bg-rule outline-none',
          '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-none [&::-webkit-slider-thumb]:bg-ink [&::-webkit-slider-thumb]:cursor-pointer',
        )}
      />
    </div>
  );
}

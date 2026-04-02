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
          <label className="text-sm font-medium text-[#09090b]">{label}</label>
          <span className="text-sm font-medium text-[#09090b]">
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
          'w-full appearance-none h-1 rounded-full bg-[#e4e4e7] outline-none',
          '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#09090b] [&::-webkit-slider-thumb]:cursor-pointer',
        )}
      />
    </div>
  );
}

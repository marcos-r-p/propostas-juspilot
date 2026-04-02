'use client';

import { cn } from '@/lib/utils/cn';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  className?: string;
}

export function Checkbox({ checked, onChange, label, description, className }: CheckboxProps) {
  return (
    <label className={cn('flex cursor-pointer items-start gap-3', className)}>
      <div
        className={cn(
          'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
          checked
            ? 'border-[#09090b] bg-[#09090b] text-white'
            : 'border-[#d4d4d8] bg-white'
        )}
        onClick={(e) => {
          e.preventDefault();
          onChange(!checked);
        }}
      >
        {checked && (
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      {(label || description) && (
        <div>
          {label && <div className="text-sm font-medium text-[#09090b]">{label}</div>}
          {description && <div className="text-xs text-[#a1a1aa]">{description}</div>}
        </div>
      )}
    </label>
  );
}

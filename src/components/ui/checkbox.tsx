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
          'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-none border-[1.5px] transition-colors',
          checked
            ? 'border-ink bg-ink text-paper-pure'
            : 'border-ink bg-transparent'
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
          {label && <div className="text-body font-medium text-ink">{label}</div>}
          {description && <div className="text-body-sm text-whisper">{description}</div>}
        </div>
      )}
    </label>
  );
}

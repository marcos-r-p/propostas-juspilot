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
          'mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-sm border transition-colors',
          checked
            ? 'border-brand bg-brand text-paper-pure'
            : 'border-rule bg-paper-pure hover:border-mute'
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
          {label && <div className="text-[14px] font-medium text-ink">{label}</div>}
          {description && <div className="mt-0.5 text-[13px] text-mute">{description}</div>}
        </div>
      )}
    </label>
  );
}

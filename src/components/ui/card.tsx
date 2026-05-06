import { cn } from '@/lib/utils/cn';
import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered-strong' | 'orange-accent' | 'dark';
  /** Enable hover lift (translateY + shadow). Default: false (static cards). */
  interactive?: boolean;
}

export function Card({ className, variant = 'default', interactive = false, children, ...props }: CardProps) {
  const variantClass =
    variant === 'bordered-strong'
      ? 'border border-ink bg-paper-pure'
      : variant === 'orange-accent'
        ? 'border border-rule border-t-[3px] border-t-brand bg-paper-pure'
        : variant === 'dark'
          ? 'border border-white/8 bg-ink-2 text-paper-pure'
          : 'border border-rule bg-paper-pure';

  const interactiveClass = interactive
    ? 'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)]'
    : '';

  return (
    <div
      className={cn(
        'rounded-md p-8',
        variantClass,
        interactiveClass,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

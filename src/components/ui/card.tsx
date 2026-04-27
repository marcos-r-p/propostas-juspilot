import { cn } from '@/lib/utils/cn';
import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered-strong';
}

export function Card({ className, variant = 'default', children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg bg-paper-pure p-6',
        variant === 'bordered-strong' ? 'border border-ink' : 'border border-rule',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

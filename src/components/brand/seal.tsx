import { cn } from '@/lib/utils/cn';

interface SealProps {
  tone?: 'ink' | 'paper';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Seal({ tone = 'ink', size = 'md', className }: SealProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-sm rounded-lg',
    md: 'h-10 w-10 text-base rounded-lg',
    lg: 'h-14 w-14 text-xl rounded-xl',
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center bg-[var(--color-brand)] font-bold text-white',
        sizeClasses[size],
        className
      )}
      aria-label="JusPilot"
    >
      J
    </div>
  );
}

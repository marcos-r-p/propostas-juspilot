import { cn } from '@/lib/utils/cn';

interface WordmarkProps {
  tone?: 'ink' | 'paper';
  className?: string;
}

export function Wordmark({ tone = 'ink', className }: WordmarkProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-brand)]">
        <span className="text-base font-bold text-white">J</span>
      </div>
      <span
        className={cn(
          'text-lg font-bold tracking-tight',
          tone === 'ink' ? 'text-ink' : 'text-paper-pure'
        )}
      >
        Juspilot
      </span>
    </div>
  );
}

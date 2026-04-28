import { cn } from '@/lib/utils/cn';
import { JuspilotSymbol } from './juspilot-symbol';

interface WordmarkProps {
  tone?: 'ink' | 'paper';
  className?: string;
}

export function Wordmark({ tone = 'ink', className }: WordmarkProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <JuspilotSymbol size={36} tone={tone === 'ink' ? 'brand' : 'white'} />
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

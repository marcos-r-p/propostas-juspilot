import { cn } from '@/lib/utils/cn';

interface WordmarkProps {
  tone?: 'ink' | 'paper';
  className?: string;
}

export function Wordmark({ tone = 'ink', className }: WordmarkProps) {
  const fill = tone === 'ink' ? 'var(--color-ink)' : 'var(--color-paper-pure)';

  return (
    <svg
      viewBox="0 0 320 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-8', className)}
      aria-label="JusPilot"
    >
      <text
        x="0"
        y="32"
        fill={fill}
        fontFamily="var(--font-display), 'Fraunces', serif"
        fontSize="38"
        fontWeight="400"
        letterSpacing="0.06em"
        style={{ fontVariantCaps: 'small-caps' }}
      >
        Juspilot
      </text>
    </svg>
  );
}

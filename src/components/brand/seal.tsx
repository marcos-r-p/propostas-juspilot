import { cn } from '@/lib/utils/cn';

interface SealProps {
  tone?: 'ink' | 'paper';
  className?: string;
}

export function Seal({ tone = 'ink', className }: SealProps) {
  const primary = tone === 'ink' ? 'var(--color-ink)' : 'var(--color-paper-pure)';
  const secondary = tone === 'ink' ? 'var(--color-graphite)' : 'var(--color-whisper)';
  const bg = tone === 'ink' ? 'var(--color-paper-pure)' : 'var(--color-ink)';

  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-16 w-16', className)}
      aria-label="JusPilot seal"
    >
      {/* Outer circle */}
      <circle cx="60" cy="60" r="58" fill={secondary} />
      {/* Inner white circle */}
      <circle cx="60" cy="60" r="34" fill={bg} />
      {/* J monogram */}
      <text
        x="60"
        y="72"
        textAnchor="middle"
        fill={primary}
        fontFamily="var(--font-display), 'Fraunces', serif"
        fontSize="42"
        fontWeight="400"
      >
        J
      </text>
      {/* Circular text — JUSPILOT · MAIS COM MENOS */}
      <path
        id="seal-circle-top"
        d="M 60 12 A 48 48 0 0 1 108 60"
        fill="none"
      />
      <text fill={bg} fontSize="7.5" letterSpacing="0.14em" fontFamily="var(--font-display), 'Fraunces', serif">
        <textPath href="#seal-circle-top" startOffset="10%">
          JUSPILOT
        </textPath>
      </text>
      <path
        id="seal-circle-bottom"
        d="M 108 60 A 48 48 0 0 1 12 60"
        fill="none"
      />
      <text fill={bg} fontSize="7.5" letterSpacing="0.14em" fontFamily="var(--font-display), 'Fraunces', serif">
        <textPath href="#seal-circle-bottom" startOffset="5%">
          MAIS COM MENOS
        </textPath>
      </text>
      {/* Dots between words */}
      <circle cx="17" cy="60" r="1.5" fill={bg} />
      <circle cx="103" cy="60" r="1.5" fill={bg} />
    </svg>
  );
}

import { cn } from '@/lib/utils/cn';

interface JuspilotSymbolProps {
  size?: number;
  tone?: 'brand' | 'white';
  className?: string;
}

/**
 * JusPilot symbol — rounded square with stylized "J" letter.
 * Matches the official MIV (Manual de Identidade Visual).
 *
 * @param tone 'brand' = terracota bg + white J (default), 'white' = white bg + terracota J
 */
export function JuspilotSymbol({ size = 40, tone = 'brand', className }: JuspilotSymbolProps) {
  const bg = tone === 'brand' ? '#D97757' : '#FFFFFF';
  const border = '#D97757';
  const fg = tone === 'brand' ? '#FFFFFF' : '#D97757';

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      fill="none"
      className={cn('shrink-0', className)}
      aria-label="JusPilot"
    >
      {/* Outer rounded square */}
      <rect x="6" y="6" width="188" height="188" rx="44" fill={bg} stroke={border} strokeWidth="10" />
      {/* Inner white/clear area */}
      <rect x="20" y="20" width="160" height="160" rx="34" fill={tone === 'brand' ? 'white' : '#FFFEEE'} />
      {/* Stylized J letter */}
      <path
        d="M72 52c0-6 5-11 11-11h44c6 0 11 5 11 11s-5 11-11 11h-13v51c0 22-18 40-40 40h-2c-6 0-11-5-11-11s5-11 11-11h2c10 0 18-8 18-18V63H83c-6 0-11-5-11-11z"
        fill={border}
      />
    </svg>
  );
}

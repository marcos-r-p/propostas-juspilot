import { cn } from '@/lib/utils/cn';
import { JuspilotSymbol } from './juspilot-symbol';

interface SealProps {
  tone?: 'ink' | 'paper';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Seal({ tone = 'ink', size = 'md', className }: SealProps) {
  const sizeMap = { sm: 32, md: 40, lg: 56 };

  return (
    <JuspilotSymbol
      size={sizeMap[size]}
      tone={tone === 'ink' ? 'brand' : 'white'}
      className={className}
    />
  );
}

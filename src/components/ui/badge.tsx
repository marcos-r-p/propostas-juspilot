import { cn } from '@/lib/utils/cn';
import type { PropostaStatus } from '@/types';

const statusStyles: Record<PropostaStatus, string> = {
  rascunho: 'bg-[#f4f4f5] text-[#71717a]',
  publicada: 'bg-[#fef3c7] text-[#92400e]',
  visualizada: 'bg-[#e0e7ff] text-[#3730a3]',
  aceita: 'bg-[#dcfce7] text-[#166534]',
  recusada: 'bg-[#fee2e2] text-[#991b1b]',
  expirada: 'bg-[#f4f4f5] text-[#a1a1aa]',
};

const statusLabels: Record<PropostaStatus, string> = {
  rascunho: 'Rascunho',
  publicada: 'Publicada',
  visualizada: 'Visualizada',
  aceita: 'Aceita',
  recusada: 'Recusada',
  expirada: 'Expirada',
};

interface BadgeProps {
  status: PropostaStatus;
  className?: string;
}

export function Badge({ status, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        statusStyles[status],
        className
      )}
    >
      {statusLabels[status]}
    </span>
  );
}

import { cn } from '@/lib/utils/cn';
import type { PropostaStatus } from '@/types';

const statusStyles: Record<PropostaStatus, string> = {
  rascunho: 'border-rule bg-rule-soft text-mute',
  publicada: 'border-brand/30 bg-brand-soft text-brand',
  visualizada: 'border-brand/50 bg-brand-soft text-brand',
  aceita: 'border-success bg-success/10 text-success',
  recusada: 'border-danger/40 bg-danger/10 text-danger',
  expirada: 'border-rule-soft bg-rule-soft text-mute',
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
        'inline-flex items-center rounded-sm border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.05em]',
        statusStyles[status],
        className
      )}
    >
      {statusLabels[status]}
    </span>
  );
}

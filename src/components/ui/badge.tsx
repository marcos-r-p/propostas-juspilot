import { cn } from '@/lib/utils/cn';
import type { PropostaStatus } from '@/types';

const statusStyles: Record<PropostaStatus, string> = {
  rascunho: 'border-rule text-mute bg-transparent',
  publicada: 'border-graphite text-graphite bg-transparent',
  visualizada: 'border-ink text-ink bg-transparent',
  aceita: 'border-ink bg-ink text-paper-pure',
  recusada: 'border-danger text-danger bg-transparent',
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
        'inline-flex items-center rounded-none border px-2 py-0.5 text-caption',
        statusStyles[status],
        className
      )}
    >
      {statusLabels[status]}
    </span>
  );
}

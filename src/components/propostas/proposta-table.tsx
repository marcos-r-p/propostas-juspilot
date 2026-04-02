import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import type { Proposta, PropostaStatus } from '@/types';

interface PropostaTableProps {
  propostas: Proposta[];
}

export function PropostaTable({ propostas }: PropostaTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#e4e4e7] bg-white">
      <div className="grid grid-cols-[2fr_1.2fr_100px_100px_80px_100px] border-b border-[#e4e4e7] px-4 py-2.5 text-xs uppercase tracking-wide text-[#a1a1aa]">
        <div>Escritório</div>
        <div>Lead</div>
        <div>Status</div>
        <div>Valor</div>
        <div>Views</div>
        <div>Criada</div>
      </div>
      {propostas.map((p) => (
        <Link key={p.id} href={`/proposta/${p.id}`} className="grid grid-cols-[2fr_1.2fr_100px_100px_80px_100px] items-center border-b border-[#f4f4f5] px-4 py-3 text-sm transition-colors last:border-0 hover:bg-[#fafafa]">
          <div className="font-medium text-[#09090b]">{p.escritorio_nome}</div>
          <div className="text-[#71717a]">{p.lead_nome || '—'}</div>
          <div><Badge status={p.status as PropostaStatus} /></div>
          <div className="font-medium text-[#09090b]">{formatCurrency(p.preco_mensalidade_final)}</div>
          <div className="text-[#71717a]">{p.visualizacoes || '—'}</div>
          <div className="text-[#a1a1aa]">{formatDate(p.created_at)}</div>
        </Link>
      ))}
    </div>
  );
}

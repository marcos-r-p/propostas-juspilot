import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils/format';
import { getDoresByIds } from '@/lib/constants/dores';
import type { Proposta, PropostaStatus } from '@/types';
import type { DorId } from '@/lib/constants/dores';
import { PropostaActions } from './actions';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PropostaDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createServerClient();

  const { data: proposta, error } = await supabase
    .from('propostas')
    .select('*, profile:profiles(*)')
    .eq('id', id)
    .single();

  if (error || !proposta) notFound();

  const p = proposta as Proposta;
  const dores = getDoresByIds((p.escritorio_dores || []) as DorId[]);

  const { data: activities } = await supabase
    .from('proposta_activities')
    .select('*, profile:profiles(*)')
    .eq('proposta_id', id)
    .order('created_at', { ascending: false });

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-semibold text-[#101010] sm:text-xl">{p.escritorio_nome}</h1>
              <Badge status={p.status as PropostaStatus} />
            </div>
            <p className="mt-0.5 text-xs text-[#7A7370] sm:text-sm">
              {p.escritorio_cidade}—{p.escritorio_uf} · {p.escritorio_qtd_advogados} advogados · Criada em {formatDate(p.created_at)}
            </p>
          </div>
          <PropostaActions proposta={p} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Lead */}
        <Card>
          <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-brand">Lead</div>
          <div className="mt-2 space-y-1 text-sm">
            <div className="font-medium text-[#101010]">{p.lead_nome}</div>
            <div className="truncate text-[#7A7370]">{p.lead_email}</div>
            <div className="text-[#7A7370]">{p.lead_telefone}</div>
            {p.lead_cargo && <div className="text-[#7A7370]">{p.lead_cargo}</div>}
          </div>
        </Card>

        {/* Valores */}
        <Card>
          <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-brand">Valores</div>
          <div className="mt-2 space-y-1 text-sm">
            <div><span className="text-[#7A7370]">Mensalidade:</span> <span className="font-semibold text-[#101010]">{formatCurrency(p.preco_mensalidade_final)}</span></div>
            <div><span className="text-[#7A7370]">Setup:</span> <span className="font-medium text-[#101010]">{formatCurrency(p.preco_setup)}</span></div>
            {p.preco_desconto > 0 && <div><span className="text-[#7A7370]">Desconto:</span> <span className="text-[#101010]">{p.preco_desconto}%</span></div>}
          </div>
        </Card>

        {/* ROI */}
        <Card>
          <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-brand">ROI</div>
          <div className="mt-2 space-y-1 text-sm">
            <div><span className="text-[#7A7370]">Múltiplo:</span> <span className="font-bold text-[#101010]">{p.roi_multiplo}x</span></div>
            <div><span className="text-[#7A7370]">Economia:</span> <span className="text-[#101010]">{p.roi_horas_economizadas_total}h/mês</span></div>
            <div><span className="text-[#7A7370]">Valor gerado:</span> <span className="text-[#101010]">{formatCurrency(p.roi_valor_gerado || 0)}/mês</span></div>
          </div>
        </Card>
      </div>

      {/* Dores */}
      {dores.length > 0 && (
        <Card className="mt-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-brand">Dores selecionadas</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {dores.map((d) => (
              <span key={d.id} className="rounded-full bg-[#F0EDEB] px-3 py-1 text-xs text-[#7A7370]">
                {d.icon} {d.label}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Métricas */}
      <Card className="mt-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-[#7A7370]">Métricas</div>
        <div className="mt-2 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4 sm:gap-4">
          <div><span className="text-[#7A7370]">Visualizações:</span> <span className="font-medium text-[#101010]">{p.visualizacoes}</span></div>
          <div><span className="text-[#7A7370]">Primeira view:</span> <span className="text-[#101010]">{p.primeira_visualizacao ? formatDateTime(p.primeira_visualizacao) : '—'}</span></div>
          <div><span className="text-[#7A7370]">Última view:</span> <span className="text-[#101010]">{p.ultima_visualizacao ? formatDateTime(p.ultima_visualizacao) : '—'}</span></div>
          <div><span className="text-[#7A7370]">Expira em:</span> <span className="text-[#101010]">{p.data_expiracao ? formatDate(p.data_expiracao) : '—'}</span></div>
        </div>
      </Card>

      {/* Atividades */}
      {activities && activities.length > 0 && (
        <Card className="mt-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-brand">Atividades</div>
          <div className="mt-3 space-y-3">
            {activities.map((a: any) => (
              <div key={a.id} className="flex flex-wrap items-center gap-2 text-sm sm:gap-3">
                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#E3E0DD]" />
                <span className="text-[#7A7370]">{a.action}</span>
                <span className="text-xs text-[#7A7370]">{formatDateTime(a.created_at)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

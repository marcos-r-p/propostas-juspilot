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
              <h1 className="text-lg font-semibold text-[#09090b] sm:text-xl">{p.escritorio_nome}</h1>
              <Badge status={p.status as PropostaStatus} />
            </div>
            <p className="mt-0.5 text-xs text-[#a1a1aa] sm:text-sm">
              {p.escritorio_cidade}—{p.escritorio_uf} · {p.escritorio_qtd_advogados} advogados · Criada em {formatDate(p.created_at)}
            </p>
          </div>
          <PropostaActions proposta={p} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Lead */}
        <Card>
          <div className="text-xs font-semibold uppercase tracking-wide text-[#a1a1aa]">Lead</div>
          <div className="mt-2 space-y-1 text-sm">
            <div className="font-medium text-[#09090b]">{p.lead_nome}</div>
            <div className="truncate text-[#71717a]">{p.lead_email}</div>
            <div className="text-[#71717a]">{p.lead_telefone}</div>
            {p.lead_cargo && <div className="text-[#71717a]">{p.lead_cargo}</div>}
          </div>
        </Card>

        {/* Valores */}
        <Card>
          <div className="text-xs font-semibold uppercase tracking-wide text-[#a1a1aa]">Valores</div>
          <div className="mt-2 space-y-1 text-sm">
            <div><span className="text-[#a1a1aa]">Mensalidade:</span> <span className="font-semibold text-[#09090b]">{formatCurrency(p.preco_mensalidade_final)}</span></div>
            <div><span className="text-[#a1a1aa]">Setup:</span> <span className="font-medium text-[#09090b]">{formatCurrency(p.preco_setup)}</span></div>
            {p.preco_desconto > 0 && <div><span className="text-[#a1a1aa]">Desconto:</span> <span className="text-[#09090b]">{p.preco_desconto}%</span></div>}
          </div>
        </Card>

        {/* ROI */}
        <Card>
          <div className="text-xs font-semibold uppercase tracking-wide text-[#a1a1aa]">ROI</div>
          <div className="mt-2 space-y-1 text-sm">
            <div><span className="text-[#a1a1aa]">Múltiplo:</span> <span className="font-bold text-[#09090b]">{p.roi_multiplo}x</span></div>
            <div><span className="text-[#a1a1aa]">Economia:</span> <span className="text-[#09090b]">{p.roi_horas_economizadas_total}h/mês</span></div>
            <div><span className="text-[#a1a1aa]">Valor gerado:</span> <span className="text-[#09090b]">{formatCurrency(p.roi_valor_gerado || 0)}/mês</span></div>
          </div>
        </Card>
      </div>

      {/* Dores */}
      {dores.length > 0 && (
        <Card className="mt-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-[#a1a1aa]">Dores selecionadas</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {dores.map((d) => (
              <span key={d.id} className="rounded-full bg-[#f4f4f5] px-3 py-1 text-xs text-[#71717a]">
                {d.icon} {d.label}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Métricas */}
      <Card className="mt-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-[#a1a1aa]">Métricas</div>
        <div className="mt-2 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4 sm:gap-4">
          <div><span className="text-[#a1a1aa]">Visualizações:</span> <span className="font-medium text-[#09090b]">{p.visualizacoes}</span></div>
          <div><span className="text-[#a1a1aa]">Primeira view:</span> <span className="text-[#09090b]">{p.primeira_visualizacao ? formatDateTime(p.primeira_visualizacao) : '—'}</span></div>
          <div><span className="text-[#a1a1aa]">Última view:</span> <span className="text-[#09090b]">{p.ultima_visualizacao ? formatDateTime(p.ultima_visualizacao) : '—'}</span></div>
          <div><span className="text-[#a1a1aa]">Expira em:</span> <span className="text-[#09090b]">{p.data_expiracao ? formatDate(p.data_expiracao) : '—'}</span></div>
        </div>
      </Card>

      {/* Atividades */}
      {activities && activities.length > 0 && (
        <Card className="mt-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-[#a1a1aa]">Atividades</div>
          <div className="mt-3 space-y-3">
            {activities.map((a: any) => (
              <div key={a.id} className="flex flex-wrap items-center gap-2 text-sm sm:gap-3">
                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#d4d4d8]" />
                <span className="text-[#71717a]">{a.action}</span>
                <span className="text-xs text-[#a1a1aa]">{formatDateTime(a.created_at)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

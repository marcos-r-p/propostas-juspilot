import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate, formatRef, formatPerfilTipo } from '@/lib/utils/format';
import { PropostaActions } from '@/components/propostas/proposta-actions';
import type { Proposta, PropostaStatus } from '@/types';

interface PropostaTableProps {
  propostas: Proposta[];
}

export function PropostaTable({ propostas }: PropostaTableProps) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-hidden border border-rule bg-paper-pure md:block">
        <div className="grid grid-cols-[140px_2fr_1fr_100px_110px_110px_220px] border-b border-rule bg-paper px-4 py-3">
          <div className="text-caption font-semibold text-mute">REF</div>
          <div className="text-caption font-semibold text-mute">Escritorio</div>
          <div className="text-caption font-semibold text-mute">Tipo</div>
          <div className="text-caption font-semibold text-mute">Data</div>
          <div className="text-caption font-semibold text-mute">Valor</div>
          <div className="text-caption font-semibold text-mute">Status</div>
          <div className="text-caption font-semibold text-mute">Acoes</div>
        </div>
        {propostas.map((p) => (
          <div
            key={p.id}
            className="grid grid-cols-[140px_2fr_1fr_100px_110px_110px_220px] items-center border-b border-rule-soft px-4 py-3.5 text-body-sm transition-colors last:border-0 hover:bg-rule-soft/50"
          >
            <div className="text-xs font-semibold tracking-wide text-ink">
              {formatRef(p.slug, p.created_at)}
            </div>
            <div>
              <div className="font-medium text-ink">{p.escritorio_nome}</div>
              <div className="text-xs text-mute">{p.lead_nome || '\u2014'}</div>
            </div>
            <div className="text-mute">{formatPerfilTipo(p.escritorio_perfil)}</div>
            <div className="text-mute">{formatDate(p.created_at)}</div>
            <div className="font-medium text-ink">{formatCurrency(p.preco_mensalidade_final)}</div>
            <div><Badge status={p.status as PropostaStatus} /></div>
            <div><PropostaActions id={p.id} slug={p.slug} /></div>
          </div>
        ))}
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {propostas.map((p) => (
          <div key={p.id} className="border border-rule bg-paper-pure p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold tracking-wide text-mute">
                  {formatRef(p.slug, p.created_at)}
                </div>
                <div className="mt-1 truncate text-body font-medium text-ink">{p.escritorio_nome}</div>
                <div className="truncate text-xs text-mute">{p.lead_nome || '\u2014'}</div>
              </div>
              <Badge status={p.status as PropostaStatus} />
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-whisper">
              <span className="font-medium text-ink">{formatCurrency(p.preco_mensalidade_final)}</span>
              <span>{formatPerfilTipo(p.escritorio_perfil)}</span>
              <span>{formatDate(p.created_at)}</span>
            </div>
            <div className="mt-3 border-t border-rule-soft pt-3">
              <PropostaActions id={p.id} slug={p.slug} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

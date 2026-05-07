import type { PricingData } from '@/lib/pricing/types';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/format';

export function ModeloTab({ data }: { data: PricingData }) {
  const { roi, faixas_porte, limites } = data;
  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-base font-semibold text-[#101010]">Como o Juspilot precifica propostas</h2>
        <p className="mt-2 text-sm text-[#7A7370]">
          O preço sugerido depende do <strong>porte do escritório</strong> (qtd. de advogados),
          combinado com <strong>parâmetros de ROI</strong> (perfil e maturidade IA) que justificam o investimento.
        </p>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#7A7370]">Fluxo</h3>
        <ol className="mt-3 space-y-2 text-sm text-[#101010]">
          <li><strong>1.</strong> Porte → faixa de tabela (ex.: 1–3, 4–10, 11–20, 21+).</li>
          <li><strong>2.</strong> Faixa retorna setup + mensalidade base.</li>
          <li><strong>3.</strong> Vendedor pode aplicar <em>desconto</em> (até {limites.desconto_maximo_pct}%) ou <em>faixas progressivas</em>.</li>
          <li><strong>4.</strong> Mensalidade final ≥ {formatCurrency(limites.mensalidade_minima)} (piso).</li>
          <li><strong>5.</strong> ROI = valor gerado pelo cliente ÷ mensalidade final.</li>
        </ol>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#7A7370]">Fórmula do ROI</h3>
        <pre className="mt-3 overflow-x-auto rounded-md bg-[#fafafa] p-3 text-xs text-[#101010]">
{`horas_mes = ${roi.horas_mensais}
% atividades IA (perfil) = boutique ${roi.atividades_ia_por_perfil.boutique * 100}% · misto ${roi.atividades_ia_por_perfil.misto * 100}% · massa ${roi.atividades_ia_por_perfil.massa * 100}%
taxa redução (maturidade) = nunca ${roi.taxa_reducao_por_maturidade.nunca * 100}% · iniciante ${roi.taxa_reducao_por_maturidade.iniciante * 100}% · intermediário ${roi.taxa_reducao_por_maturidade.intermediario * 100}% · avançado ${roi.taxa_reducao_por_maturidade.avancado * 100}%

horas_economizadas/adv = horas_mes × % atividades × taxa redução
valor_gerado            = horas_economizadas × valor_hora
roi_múltiplo            = valor_gerado ÷ mensalidade_final`}
        </pre>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#7A7370]">Faixas de porte (atual)</h3>
        <table className="mt-3 w-full text-sm">
          <thead className="text-left text-[#7A7370]">
            <tr><th>Faixa</th><th>Setup</th><th>Mensalidade</th><th>Usuários</th></tr>
          </thead>
          <tbody>
            {faixas_porte.map((f, i) => (
              <tr key={i} className="border-t border-[#E3E0DD]">
                <td className="py-2">{f.min}–{f.max ?? '∞'} adv.</td>
                <td>{formatCurrency(f.setup)}</td>
                <td>{formatCurrency(f.mensalidade)}{f.incremento_por_dezena_advogados ? ` (+${formatCurrency(f.incremento_por_dezena_advogados)}/10 adv.)` : ''}</td>
                <td>{f.usuarios ?? '∞'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

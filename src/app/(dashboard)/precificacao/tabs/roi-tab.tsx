'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createVersion } from '../actions';
import { calculateROI, getPrecoSugerido } from '@/lib/utils/roi';
import { formatCurrency } from '@/lib/utils/format';
import type { PricingTableCurrent } from '@/lib/pricing/types';
import type { PropostaFormData } from '@/types';

export function RoiTab({ table, isAdmin }: { table: PricingTableCurrent; isAdmin: boolean }) {
  const router = useRouter();
  const [roi, setRoi] = useState(table.data.roi);
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(roi) !== JSON.stringify(table.data.roi);

  const [simAdv, setSimAdv] = useState(10);
  const [simHora, setSimHora] = useState(300);
  const [simPerfil, setSimPerfil] = useState<'boutique' | 'misto' | 'massa'>('boutique');
  const [simMaturidade, setSimMaturidade] = useState<'nunca' | 'iniciante' | 'intermediario' | 'avancado'>('nunca');
  const editedData = { ...table.data, roi };
  const sugerido = getPrecoSugerido(simAdv, editedData);
  const sim = calculateROI({
    escritorio_qtd_advogados: simAdv,
    escritorio_valor_hora: simHora,
    escritorio_valor_hora_informado: true,
    escritorio_perfil: simPerfil,
    escritorio_maturidade_ia: simMaturidade,
    usar_preco_sugerido: true,
    preco_setup: sugerido.setup,
    preco_mensalidade: sugerido.mensalidade,
    preco_usuarios_inclusos: sugerido.usuarios,
    preco_desconto: 0,
    usar_preco_faixas: false,
    preco_faixas: null,
  } as PropostaFormData, editedData);

  const handleSave = async () => {
    setSaving(true);
    try {
      await createVersion(table.id, editedData);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#7A7370]">Parâmetros</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="text-sm">Horas/mês
              <Input type="number" value={roi.horas_mensais} disabled={!isAdmin}
                onChange={(e) => setRoi({ ...roi, horas_mensais: Number(e.target.value) })} />
            </label>
            <label className="text-sm">Valor-hora padrão (R$)
              <Input type="number" value={roi.valor_hora_padrao} disabled={!isAdmin}
                onChange={(e) => setRoi({ ...roi, valor_hora_padrao: Number(e.target.value) })} />
            </label>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#7A7370]">% atividades IA por perfil (0–1)</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {(['boutique', 'misto', 'massa'] as const).map((p) => (
              <label key={p} className="text-sm capitalize">{p}
                <Input type="number" step="0.01" min="0" max="1"
                  value={roi.atividades_ia_por_perfil[p]} disabled={!isAdmin}
                  onChange={(e) => setRoi({
                    ...roi,
                    atividades_ia_por_perfil: { ...roi.atividades_ia_por_perfil, [p]: Number(e.target.value) },
                  })} />
              </label>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#7A7370]">Taxa de redução por maturidade IA (0–1)</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-4">
            {(['nunca', 'iniciante', 'intermediario', 'avancado'] as const).map((m) => (
              <label key={m} className="text-sm capitalize">{m}
                <Input type="number" step="0.01" min="0" max="1"
                  value={roi.taxa_reducao_por_maturidade[m]} disabled={!isAdmin}
                  onChange={(e) => setRoi({
                    ...roi,
                    taxa_reducao_por_maturidade: { ...roi.taxa_reducao_por_maturidade, [m]: Number(e.target.value) },
                  })} />
              </label>
            ))}
          </div>
        </Card>

        {isAdmin && dirty && (
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Salvando…' : 'Salvar (cria nova versão)'}</Button>
        )}
      </div>

      <Card>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#7A7370]">Simulação ao vivo</h3>
        <div className="mt-3 space-y-2 text-sm">
          <label>Advogados: <Input type="number" value={simAdv} onChange={(e) => setSimAdv(Number(e.target.value))} /></label>
          <label>Valor-hora: <Input type="number" value={simHora} onChange={(e) => setSimHora(Number(e.target.value))} /></label>
          <label>Perfil:
            <select className="h-9 w-full rounded-md border border-[#E3E0DD] px-2"
              value={simPerfil} onChange={(e) => setSimPerfil(e.target.value as typeof simPerfil)}>
              <option value="boutique">Boutique</option><option value="misto">Misto</option><option value="massa">Massa</option>
            </select>
          </label>
          <label>Maturidade:
            <select className="h-9 w-full rounded-md border border-[#E3E0DD] px-2"
              value={simMaturidade} onChange={(e) => setSimMaturidade(e.target.value as typeof simMaturidade)}>
              <option value="nunca">Nunca</option><option value="iniciante">Iniciante</option>
              <option value="intermediario">Intermediário</option><option value="avancado">Avançado</option>
            </select>
          </label>
        </div>
        <div className="mt-4 space-y-1 text-sm">
          <div>Mensalidade sugerida: <strong>{formatCurrency(sugerido.mensalidade)}</strong></div>
          <div>Horas economizadas/adv: <strong>{sim.horas_economizadas_por_adv}</strong></div>
          <div>Valor gerado: <strong>{formatCurrency(sim.valor_gerado)}</strong></div>
          <div>ROI múltiplo: <strong>{sim.roi_multiplo}x</strong></div>
        </div>
      </Card>
    </div>
  );
}

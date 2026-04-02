// src/components/wizard/step-precos.tsx
'use client';

import { useWizardStore } from '@/stores/wizard-store';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { getPrecoSugerido } from '@/lib/utils/roi';
import { formatCurrency } from '@/lib/utils/format';

export function StepPrecos() {
  const { formData, roi, updateField, updateFields } = useWizardStore();
  const sugerido = getPrecoSugerido(formData.escritorio_qtd_advogados);

  return (
    <div>
      <h2 className="text-lg font-semibold text-[#09090b]">Precificação</h2>
      <p className="mb-6 text-sm text-[#a1a1aa]">Configure os valores da proposta.</p>

      <div className="mb-6">
        <Checkbox
          checked={formData.usar_preco_sugerido}
          onChange={(v) => {
            if (v) {
              updateFields({
                usar_preco_sugerido: true,
                preco_setup: sugerido.setup,
                preco_mensalidade: sugerido.mensalidade,
                preco_usuarios_inclusos: sugerido.usuarios,
              });
            } else {
              updateField('usar_preco_sugerido', false);
            }
          }}
          label="Usar preço sugerido"
          description={`Setup ${formatCurrency(sugerido.setup)} + ${formatCurrency(sugerido.mensalidade)}/mês para ${formData.escritorio_qtd_advogados} advogados`}
        />
      </div>

      {!formData.usar_preco_sugerido && (
        <div className="mb-6 space-y-4">
          <Input
            id="preco_setup"
            label="Setup (implementacao)"
            type="number"
            value={formData.preco_setup}
            onChange={(e) => updateField('preco_setup', Number(e.target.value))}
          />
          <Input
            id="preco_mensalidade"
            label="Mensalidade"
            type="number"
            value={formData.preco_mensalidade}
            onChange={(e) => updateField('preco_mensalidade', Number(e.target.value))}
          />
          <Input
            id="preco_usuarios_inclusos"
            label="Usuarios inclusos"
            type="number"
            value={formData.preco_usuarios_inclusos}
            onChange={(e) => updateField('preco_usuarios_inclusos', Number(e.target.value))}
          />
        </div>
      )}

      <div className="mb-8">
        <Slider
          label="Desconto"
          value={formData.preco_desconto}
          onChange={(v) => updateField('preco_desconto', v)}
          min={0}
          max={30}
          suffix="%"
        />
      </div>

      <Card className="bg-[#f4f4f5] p-5">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#a1a1aa]">
          Resumo da proposta
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-[#a1a1aa]">Mensalidade final</div>
            <div className="text-lg font-bold text-[#09090b]">{formatCurrency(roi.mensalidade_final)}/mes</div>
          </div>
          <div>
            <div className="text-xs text-[#a1a1aa]">ROI estimado</div>
            <div className="text-lg font-bold text-[#09090b]">{roi.roi_multiplo}x</div>
          </div>
          <div>
            <div className="text-xs text-[#a1a1aa]">Horas economizadas</div>
            <div className="text-lg font-bold text-[#09090b]">{roi.horas_economizadas_total}h/mes</div>
          </div>
          <div>
            <div className="text-xs text-[#a1a1aa]">Valor gerado</div>
            <div className="text-lg font-bold text-[#09090b]">{formatCurrency(roi.valor_gerado)}/mes</div>
          </div>
          <div>
            <div className="text-xs text-[#a1a1aa]">Custo por advogado</div>
            <div className="text-lg font-bold text-[#09090b]">{formatCurrency(roi.custo_por_advogado)}/mes</div>
          </div>
          <div>
            <div className="text-xs text-[#a1a1aa]">ROI percentual</div>
            <div className="text-lg font-bold text-[#09090b]">{roi.roi_percentual}%</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

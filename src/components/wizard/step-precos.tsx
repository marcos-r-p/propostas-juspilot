// src/components/wizard/step-precos.tsx
'use client';

import { useWizardStore } from '@/stores/wizard-store';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { getPrecoSugerido } from '@/lib/utils/roi';
import { clampDesconto, validateMensalidade } from '@/lib/pricing/apply-limits';
import { formatCurrency } from '@/lib/utils/format';
import type { PrecoFaixa } from '@/types';

function createDefaultFaixas(): PrecoFaixa[] {
  return [
    { de_mes: 1, ate_mes: 3, valor: 1500 },
    { de_mes: 4, ate_mes: null, valor: 3000 },
  ];
}

export function StepPrecos() {
  const { formData, roi, updateField, updateFields, pricingData } = useWizardStore();
  const sugerido = getPrecoSugerido(formData.escritorio_qtd_advogados, pricingData);
  const faixas = formData.preco_faixas || [];

  const mensalidadeCheck = validateMensalidade(roi.mensalidade_final, pricingData.limites);

  const handleToggleFaixas = (enabled: boolean) => {
    if (enabled) {
      updateFields({
        usar_preco_faixas: true,
        preco_faixas: createDefaultFaixas(),
      });
    } else {
      updateFields({
        usar_preco_faixas: false,
        preco_faixas: null,
      });
    }
  };

  const updateFaixa = (index: number, field: keyof PrecoFaixa, value: number | null) => {
    const newFaixas = [...faixas];
    newFaixas[index] = { ...newFaixas[index], [field]: value };
    // Sync preco_mensalidade with last faixa valor
    const lastFaixa = newFaixas[newFaixas.length - 1];
    updateFields({
      preco_faixas: newFaixas,
      preco_mensalidade: lastFaixa.valor,
    });
  };

  const normalizeFaixas = (raw: typeof faixas): typeof faixas => {
    // Ensure continuity: each faixa.de_mes = previous.ate_mes + 1
    return raw.map((f, i) => {
      if (i === 0) return { ...f, de_mes: 1 };
      const prev = raw[i - 1];
      return { ...f, de_mes: (prev.ate_mes ?? prev.de_mes) + 1 };
    });
  };

  const addFaixa = () => {
    if (faixas.length >= 5) return;
    const newFaixas = [...faixas];
    const prevLast = newFaixas[newFaixas.length - 1];
    const nextDeMes = (prevLast.ate_mes || prevLast.de_mes) + 3;
    newFaixas[newFaixas.length - 1] = { ...prevLast, ate_mes: nextDeMes - 1 };
    newFaixas.push({ de_mes: nextDeMes, ate_mes: null, valor: prevLast.valor });
    const normalized = normalizeFaixas(newFaixas);
    updateFields({ preco_faixas: normalized, preco_mensalidade: prevLast.valor });
  };

  const removeFaixa = (index: number) => {
    if (faixas.length <= 2) return;
    const newFaixas = faixas.filter((_, i) => i !== index);
    newFaixas[newFaixas.length - 1] = { ...newFaixas[newFaixas.length - 1], ate_mes: null };
    const normalized = normalizeFaixas(newFaixas);
    const lastFaixa = normalized[normalized.length - 1];
    updateFields({ preco_faixas: normalized, preco_mensalidade: lastFaixa.valor });
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-[#101010]">Precificação</h2>
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
          {!formData.usar_preco_faixas && (
            <Input
              id="preco_mensalidade"
              label="Mensalidade"
              type="number"
              value={formData.preco_mensalidade}
              onChange={(e) => updateField('preco_mensalidade', Number(e.target.value))}
            />
          )}
          <Input
            id="preco_usuarios_inclusos"
            label="Usuarios inclusos"
            type="number"
            value={formData.preco_usuarios_inclusos}
            onChange={(e) => updateField('preco_usuarios_inclusos', Number(e.target.value))}
          />
        </div>
      )}

      {/* Toggle faixas */}
      <div className="mb-6">
        <Checkbox
          checked={formData.usar_preco_faixas}
          onChange={handleToggleFaixas}
          label="Precificação por faixas"
          description="Ofereça valores promocionais nos primeiros meses"
        />
      </div>

      {/* Faixas editor */}
      {formData.usar_preco_faixas && faixas.length > 0 && (
        <div className="mb-6 space-y-3">
          <label className="block text-sm font-medium text-[#101010]">Faixas de preço</label>
          {faixas.map((faixa, index) => {
            const isLast = index === faixas.length - 1;
            return (
              <div key={index} className="flex items-center gap-2 rounded-lg border border-[#E3E0DD] p-3">
                <div className="flex-1">
                  <div className="mb-1 text-xs text-[#a1a1aa]">
                    Mês {faixa.de_mes} {isLast ? 'em diante' : `até ${faixa.ate_mes}`}
                  </div>
                  <div className="flex items-center gap-2">
                    {!isLast && (
                      <input
                        type="number"
                        min={faixa.de_mes}
                        value={faixa.ate_mes ?? ''}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          const newFaixas = [...faixas];
                          newFaixas[index] = { ...faixas[index], ate_mes: val };
                          const normalized = normalizeFaixas(newFaixas);
                          const lastFaixa = normalized[normalized.length - 1];
                          updateFields({ preco_faixas: normalized, preco_mensalidade: lastFaixa.valor });
                        }}
                        className="w-16 rounded border border-[#E3E0DD] px-2 py-1 text-sm"
                        placeholder="Até mês"
                      />
                    )}
                    <span className="text-sm text-[#a1a1aa]">R$</span>
                    <input
                      type="number"
                      min={0}
                      value={faixa.valor}
                      onChange={(e) => updateFaixa(index, 'valor', Number(e.target.value))}
                      className="w-24 rounded border border-[#E3E0DD] px-2 py-1 text-sm"
                    />
                  </div>
                </div>
                {!isLast && faixas.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeFaixa(index)}
                    className="text-[#a1a1aa] hover:text-[#ef4444] transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            );
          })}
          {faixas.length < 5 && (
            <button
              type="button"
              onClick={addFaixa}
              className="w-full rounded-lg border border-dashed border-[#E3E0DD] px-3 py-2 text-sm text-[#a1a1aa] hover:border-[#101010] hover:text-[#101010] transition-colors"
            >
              + Adicionar faixa
            </button>
          )}
        </div>
      )}

      <div className="mb-8">
        <Slider
          label="Desconto"
          value={formData.preco_desconto}
          onChange={(v) =>
            updateField('preco_desconto', clampDesconto(v, pricingData.limites))
          }
          min={0}
          max={pricingData.limites.desconto_maximo_pct}
          suffix="%"
        />
        {!mensalidadeCheck.ok && (
          <p className="mt-1 text-xs text-red-600">{mensalidadeCheck.message}</p>
        )}
      </div>

      <Card className="bg-[#F0EDEB] p-5">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#a1a1aa]">
          Resumo da proposta
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-[#a1a1aa]">Mensalidade final</div>
            <div className="text-lg font-bold text-[#101010]">{formatCurrency(roi.mensalidade_final)}/mes</div>
          </div>
          <div>
            <div className="text-xs text-[#a1a1aa]">ROI estimado</div>
            <div className="text-lg font-bold text-[#101010]">{roi.roi_multiplo}x</div>
          </div>
          <div>
            <div className="text-xs text-[#a1a1aa]">Horas economizadas</div>
            <div className="text-lg font-bold text-[#101010]">{roi.horas_economizadas_total}h/mes</div>
          </div>
          <div>
            <div className="text-xs text-[#a1a1aa]">Valor gerado</div>
            <div className="text-lg font-bold text-[#101010]">{formatCurrency(roi.valor_gerado)}/mes</div>
          </div>
          <div>
            <div className="text-xs text-[#a1a1aa]">Custo por advogado</div>
            <div className="text-lg font-bold text-[#101010]">{formatCurrency(roi.custo_por_advogado)}/mes</div>
          </div>
          <div>
            <div className="text-xs text-[#a1a1aa]">ROI percentual</div>
            <div className="text-lg font-bold text-[#101010]">{roi.roi_percentual}%</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

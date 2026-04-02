// src/components/wizard/step-escritorio.tsx
'use client';

import { useWizardStore } from '@/stores/wizard-store';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { UFS } from '@/lib/constants/ufs';

export function StepEscritorio() {
  const { formData, updateField } = useWizardStore();

  return (
    <div>
      <h2 className="text-lg font-semibold text-[#09090b]">Dados do Escritorio</h2>
      <p className="mb-6 text-sm text-[#a1a1aa]">Informacoes basicas sobre o escritorio do lead.</p>

      <div className="space-y-5">
        <Input
          id="escritorio_nome"
          label="Nome do escritorio"
          placeholder="Silva & Associados"
          value={formData.escritorio_nome}
          onChange={(e) => updateField('escritorio_nome', e.target.value)}
        />

        <div className="grid grid-cols-[2fr_1fr] gap-3">
          <Input
            id="escritorio_cidade"
            label="Cidade"
            placeholder="Brasilia"
            value={formData.escritorio_cidade}
            onChange={(e) => updateField('escritorio_cidade', e.target.value)}
          />
          <Select
            id="escritorio_uf"
            label="UF"
            options={UFS}
            value={formData.escritorio_uf}
            onChange={(e) => updateField('escritorio_uf', e.target.value)}
          />
        </div>

        <Slider
          label="Quantidade de advogados"
          value={formData.escritorio_qtd_advogados}
          onChange={(v) => updateField('escritorio_qtd_advogados', v)}
          min={1}
          max={100}
        />

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium text-[#09090b]">Valor da hora</label>
            <Checkbox
              checked={formData.escritorio_valor_hora_informado}
              onChange={(v) => updateField('escritorio_valor_hora_informado', v)}
              label="Informado pelo lead"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#a1a1aa]">R$</span>
            <Input
              id="escritorio_valor_hora"
              type="number"
              value={formData.escritorio_valor_hora}
              onChange={(e) => updateField('escritorio_valor_hora', Number(e.target.value))}
              className="w-24"
            />
            <span className="text-xs text-[#a1a1aa]">/hora</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// src/components/wizard/step-perfil.tsx
'use client';

import { useWizardStore } from '@/stores/wizard-store';
import { Checkbox } from '@/components/ui/checkbox';
import { AREAS_ATUACAO } from '@/lib/constants/areas';
import { PERFIS_ESCRITORIO } from '@/lib/constants/perfis';
import { cn } from '@/lib/utils/cn';

export function StepPerfil() {
  const { formData, updateField, toggleArrayField } = useWizardStore();

  return (
    <div>
      <h2 className="text-lg font-semibold text-[#09090b]">Perfil do Escritorio</h2>
      <p className="mb-6 text-sm text-[#a1a1aa]">Areas de atuacao e tipo de operacao.</p>

      <div className="mb-8">
        <label className="mb-3 block text-sm font-medium text-[#09090b]">Areas de atuacao</label>
        <div className="grid grid-cols-2 gap-2">
          {AREAS_ATUACAO.map((area) => (
            <Checkbox
              key={area.value}
              checked={formData.escritorio_areas.includes(area.value)}
              onChange={() => toggleArrayField('escritorio_areas', area.value)}
              label={area.label}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="mb-3 block text-sm font-medium text-[#09090b]">Perfil do escritorio</label>
        <div className="space-y-2">
          {PERFIS_ESCRITORIO.map((perfil) => (
            <button
              key={perfil.value}
              onClick={() => updateField('escritorio_perfil', perfil.value)}
              className={cn(
                'w-full rounded-lg border p-3 text-left transition-colors',
                formData.escritorio_perfil === perfil.value
                  ? 'border-[#09090b] bg-[#f4f4f5]'
                  : 'border-[#e4e4e7] hover:border-[#d4d4d8]'
              )}
            >
              <div className="text-sm font-medium text-[#09090b]">{perfil.label}</div>
              <div className="mt-0.5 text-xs text-[#a1a1aa]">{perfil.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

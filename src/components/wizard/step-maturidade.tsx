// src/components/wizard/step-maturidade.tsx
'use client';

import { useWizardStore } from '@/stores/wizard-store';
import { MATURIDADE_PROCESSOS, MATURIDADE_IA } from '@/lib/constants/maturidade';
import { cn } from '@/lib/utils/cn';

export function StepMaturidade() {
  const { formData, updateField } = useWizardStore();

  return (
    <div>
      <h2 className="text-lg font-semibold text-[#09090b]">Maturidade</h2>
      <p className="mb-6 text-sm text-[#a1a1aa]">Nivel de organizacao e experiencia com IA.</p>

      <div className="mb-8">
        <label className="mb-3 block text-sm font-medium text-[#09090b]">Maturidade de processos</label>
        <div className="space-y-2">
          {MATURIDADE_PROCESSOS.map((m) => (
            <button
              key={m.value}
              onClick={() => updateField('escritorio_maturidade_processos', m.value)}
              className={cn(
                'w-full rounded-lg border p-3 text-left transition-colors',
                formData.escritorio_maturidade_processos === m.value
                  ? 'border-[#09090b] bg-[#f4f4f5]'
                  : 'border-[#e4e4e7] hover:border-[#d4d4d8]'
              )}
            >
              <div className="text-sm font-medium text-[#09090b]">{m.label}</div>
              <div className="mt-0.5 text-xs text-[#a1a1aa]">{m.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-3 block text-sm font-medium text-[#09090b]">Experiencia com IA</label>
        <div className="space-y-2">
          {MATURIDADE_IA.map((m) => (
            <button
              key={m.value}
              onClick={() => updateField('escritorio_maturidade_ia', m.value)}
              className={cn(
                'w-full rounded-lg border p-3 text-left transition-colors',
                formData.escritorio_maturidade_ia === m.value
                  ? 'border-[#09090b] bg-[#f4f4f5]'
                  : 'border-[#e4e4e7] hover:border-[#d4d4d8]'
              )}
            >
              <div className="text-sm font-medium text-[#09090b]">{m.label}</div>
              <div className="mt-0.5 text-xs text-[#a1a1aa]">{m.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

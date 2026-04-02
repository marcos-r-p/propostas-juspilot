// src/components/wizard/step-dores.tsx
'use client';

import { useWizardStore } from '@/stores/wizard-store';
import { DORES } from '@/lib/constants/dores';
import { cn } from '@/lib/utils/cn';

export function StepDores() {
  const { formData, updateField, toggleArrayField } = useWizardStore();

  return (
    <div>
      <h2 className="text-lg font-semibold text-[#09090b]">Dores e Desafios</h2>
      <p className="mb-6 text-sm text-[#a1a1aa]">Quais problemas o escritorio enfrenta hoje?</p>

      <div className="space-y-2">
        {DORES.map((dor) => {
          const isSelected = formData.escritorio_dores.includes(dor.id);
          return (
            <button
              key={dor.id}
              onClick={() => toggleArrayField('escritorio_dores', dor.id)}
              className={cn(
                'flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors',
                isSelected ? 'border-[#09090b] bg-[#f4f4f5]' : 'border-[#e4e4e7] hover:border-[#d4d4d8]'
              )}
            >
              <span className="mt-0.5 text-lg">{dor.icon}</span>
              <div>
                <div className="text-sm font-medium text-[#09090b]">{dor.label}</div>
                <div className="mt-0.5 text-xs text-[#a1a1aa]">
                  Solucao: <span className="font-medium text-[#71717a]">{dor.highlight}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <label className="mb-1.5 block text-sm font-medium text-[#09090b]">
          Contexto adicional (opcional)
        </label>
        <textarea
          value={formData.escritorio_contexto || ''}
          onChange={(e) => updateField('escritorio_contexto', e.target.value)}
          placeholder="Detalhes relevantes sobre o escritorio..."
          rows={3}
          className="w-full rounded-md border border-[#d4d4d8] bg-white px-3 py-2 text-sm text-[#09090b] placeholder:text-[#a1a1aa] focus:outline-none focus:ring-2 focus:ring-[#09090b] focus:ring-offset-1"
        />
      </div>
    </div>
  );
}

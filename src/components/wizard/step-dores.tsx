// src/components/wizard/step-dores.tsx
'use client';

import { useWizardStore } from '@/stores/wizard-store';
import { DORES, getSuggestedDores } from '@/lib/constants/dores';
import { cn } from '@/lib/utils/cn';

export function StepDores() {
  const { formData, updateField, toggleArrayField } = useWizardStore();

  const suggested = getSuggestedDores(
    formData.escritorio_areas,
    formData.escritorio_perfil
  );
  const suggestedIds = new Set(suggested.map((d) => d.id));

  // Show suggested first, then remaining
  const sortedDores = [
    ...suggested,
    ...DORES.filter((d) => !suggestedIds.has(d.id)),
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold text-[#101010]">Dores e Desafios</h2>
      <p className="mb-6 text-sm text-[#a1a1aa]">Quais problemas o escritório enfrenta hoje?</p>

      {suggested.length > 0 && (
        <div className="mb-3 text-xs font-medium uppercase tracking-wide text-[#a1a1aa]">
          Sugeridos para o perfil do escritório
        </div>
      )}

      <div className="space-y-2">
        {sortedDores.map((dor, i) => {
          const isSelected = formData.escritorio_dores.includes(dor.id);
          const isSuggested = suggestedIds.has(dor.id);
          const showDivider = i === suggested.length && suggested.length > 0;

          return (
            <div key={dor.id}>
              {showDivider && (
                <div className="mb-2 mt-4 text-xs font-medium uppercase tracking-wide text-[#a1a1aa]">
                  Outras opções
                </div>
              )}
              <button
                onClick={() => toggleArrayField('escritorio_dores', dor.id)}
                className={cn(
                  'flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors',
                  isSelected
                    ? 'border-[#101010] bg-[#F0EDEB]'
                    : isSuggested
                      ? 'border-[#D97757]/30 bg-[#D97757]/5 hover:border-[#D97757]/50'
                      : 'border-[#E3E0DD] hover:border-[#E3E0DD]'
                )}
              >
                <div className="mt-0.5 text-[var(--vt-mute,#a1a1aa)]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={dor.iconPath} />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-[#101010]">{dor.label}</div>
                  <div className="mt-0.5 text-xs text-[#a1a1aa]">
                    Solução: <span className="font-medium text-[#7A7370]">{dor.highlight}</span>
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <label className="mb-1.5 block text-sm font-medium text-[#101010]">
          Contexto adicional (opcional)
        </label>
        <textarea
          value={formData.escritorio_contexto || ''}
          onChange={(e) => updateField('escritorio_contexto', e.target.value)}
          placeholder="Detalhes relevantes sobre o escritório..."
          rows={3}
          className="w-full rounded-md border border-[#E3E0DD] bg-white px-3 py-2 text-sm text-[#101010] placeholder:text-[#a1a1aa] focus:outline-none focus:ring-2 focus:ring-[#101010] focus:ring-offset-1"
        />
      </div>
    </div>
  );
}

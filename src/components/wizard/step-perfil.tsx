// src/components/wizard/step-perfil.tsx
'use client';

import { useState } from 'react';
import { useWizardStore } from '@/stores/wizard-store';
import { Checkbox } from '@/components/ui/checkbox';
import { AREAS_ATUACAO_GROUPED } from '@/lib/constants/areas';
import { PERFIS_ESCRITORIO } from '@/lib/constants/perfis';
import { cn } from '@/lib/utils/cn';

export function StepPerfil() {
  const { formData, updateField, toggleArrayField } = useWizardStore();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(AREAS_ATUACAO_GROUPED.map((g) => g.group)));

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  };

  const getGroupSelectedCount = (group: typeof AREAS_ATUACAO_GROUPED[number]) => {
    return group.areas.filter((a) => formData.escritorio_areas.includes(a.value)).length;
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-[#09090b]">Perfil do Escritório</h2>
      <p className="mb-6 text-sm text-[#a1a1aa]">Áreas de atuação e tipo de operação.</p>

      <div className="mb-8">
        <label className="mb-3 block text-sm font-medium text-[#09090b]">Áreas de atuação</label>
        <div className="space-y-1">
          {AREAS_ATUACAO_GROUPED.map((group) => {
            const isExpanded = expandedGroups.has(group.group);
            const selectedCount = getGroupSelectedCount(group);

            return (
              <div key={group.group} className="rounded-lg border border-[#e4e4e7] overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.group)}
                  className="flex w-full items-center justify-between px-3 py-2.5 text-left hover:bg-[#fafafa] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <svg
                      className={cn('h-3.5 w-3.5 text-[#a1a1aa] transition-transform', isExpanded && 'rotate-90')}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-sm font-medium text-[#09090b]">{group.group}</span>
                  </div>
                  {selectedCount > 0 && (
                    <span className="rounded-full bg-[#09090b] px-2 py-0.5 text-[10px] font-medium text-white">
                      {selectedCount}
                    </span>
                  )}
                </button>
                {isExpanded && (
                  <div className="grid grid-cols-2 gap-1 px-3 pb-3">
                    {group.areas.map((area) => (
                      <Checkbox
                        key={area.value}
                        checked={formData.escritorio_areas.includes(area.value)}
                        onChange={() => toggleArrayField('escritorio_areas', area.value)}
                        label={area.label}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
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

// src/components/wizard/wizard-sidebar.tsx
'use client';

import { cn } from '@/lib/utils/cn';
import { useWizardStore } from '@/stores/wizard-store';

const STEPS = [
  { id: 1, label: 'Lead', subtitle: 'Dados do contato' },
  { id: 2, label: 'Escritorio', subtitle: 'Dados basicos' },
  { id: 3, label: 'Perfil', subtitle: 'Areas e tipo' },
  { id: 4, label: 'Maturidade', subtitle: 'Processos e IA' },
  { id: 5, label: 'Dores', subtitle: 'Desafios atuais' },
  { id: 6, label: 'Precos', subtitle: 'Calculadora' },
  { id: 7, label: 'Preview', subtitle: 'Revisar e publicar' },
];

interface WizardSidebarProps {
  currentStep: number;
  completedSteps: number[];
  onStepClick: (step: number) => void;
}

export function WizardSidebar({ currentStep, completedSteps, onStepClick }: WizardSidebarProps) {
  const { formData } = useWizardStore();

  function getStepSummary(stepId: number): string | null {
    switch (stepId) {
      case 1: return formData.lead_nome || null;
      case 2: return formData.escritorio_nome || null;
      case 3: return formData.escritorio_areas.length > 0 ? `${formData.escritorio_areas.length} areas` : null;
      case 4: return formData.escritorio_maturidade_ia !== 'iniciante' ? formData.escritorio_maturidade_ia : null;
      case 5: return formData.escritorio_dores.length > 0 ? `${formData.escritorio_dores.length} dores` : null;
      default: return null;
    }
  }

  function isStepAccessible(stepId: number): boolean {
    if (stepId === 1) return true;
    return completedSteps.includes(stepId - 1);
  }

  return (
    <div className="w-[220px] border-r border-[#e4e4e7] bg-white py-6">
      <div className="mb-4 px-5 text-xs font-semibold uppercase tracking-wide text-[#a1a1aa]">
        Etapas
      </div>

      {STEPS.map((step) => {
        const isCompleted = completedSteps.includes(step.id);
        const isActive = currentStep === step.id;
        const accessible = isStepAccessible(step.id);
        const summary = isCompleted ? getStepSummary(step.id) : null;

        return (
          <button
            key={step.id}
            onClick={() => accessible && onStepClick(step.id)}
            disabled={!accessible}
            className={cn(
              'flex w-full items-center gap-3 px-5 py-2 text-left transition-colors',
              isActive && 'border-r-2 border-[#09090b] bg-[#f4f4f5]',
              !accessible && 'opacity-40 cursor-not-allowed',
              accessible && !isActive && 'hover:bg-[#f4f4f5]'
            )}
          >
            <div
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs',
                isCompleted && 'bg-[#09090b] text-white',
                isActive && !isCompleted && 'bg-[#09090b] text-white font-semibold',
                !isActive && !isCompleted && accessible && 'border-[1.5px] border-[#d4d4d8] text-[#a1a1aa]',
                !accessible && 'border-[1.5px] border-[#e4e4e7] text-[#d4d4d8]'
              )}
            >
              {isCompleted ? '\u2713' : step.id}
            </div>

            <div className="min-w-0">
              <div className={cn('text-sm', isActive ? 'font-medium text-[#09090b]' : 'text-[#71717a]')}>
                {step.label}
              </div>
              {summary ? (
                <div className="truncate text-xs text-[#a1a1aa]">{summary}</div>
              ) : (
                !isActive && accessible && (
                  <div className="text-xs text-[#a1a1aa]">{step.subtitle}</div>
                )
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// src/components/wizard/wizard-container.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore } from '@/stores/wizard-store';
import { WizardSidebar } from './wizard-sidebar';
import { WizardNavigation } from './wizard-navigation';
import { StepLead } from './step-lead';
import { StepEscritorio } from './step-escritorio';
import { StepPerfil } from './step-perfil';
import { StepMaturidade } from './step-maturidade';
import { StepDores } from './step-dores';
import { StepConsultor } from './step-consultor';
import { StepPrecos } from './step-precos';
import { StepPreview } from './step-preview';
import { toast } from '@/hooks/use-toast';
import { propostaSchema } from '@/lib/validations/proposta';
import type { PricingTableCurrent } from '@/lib/pricing/types';

const STEPS = [
  { id: 1, label: 'Lead', component: StepLead },
  { id: 2, label: 'Escritório', component: StepEscritorio },
  { id: 3, label: 'Perfil', component: StepPerfil },
  { id: 4, label: 'Maturidade', component: StepMaturidade },
  { id: 5, label: 'Dores', component: StepDores },
  { id: 6, label: 'Consultor', component: StepConsultor },
  { id: 7, label: 'Preços', component: StepPrecos },
  { id: 8, label: 'Preview', component: StepPreview },
];

interface ConsultorProfile {
  id: string;
  email: string;
  nome: string;
  cargo?: string;
  telefone?: string;
  avatar_url?: string;
}

interface WizardContainerProps {
  tables?: PricingTableCurrent[];
  initialTable?: PricingTableCurrent | null;
  consultorProfile?: ConsultorProfile | null;
}

export function WizardContainer({
  tables = [],
  initialTable = null,
  consultorProfile = null,
}: WizardContainerProps = {}) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { formData, roi, resetForm, setPricingTable, pricingTableId, pricingVersionId, updateFields } = useWizardStore();

  useEffect(() => {
    if (initialTable) {
      setPricingTable({
        id: initialTable.id,
        versionId: initialTable.current_version_id,
        data: initialTable.data,
      });
    }
  }, [initialTable, setPricingTable]);

  // Pre-fill consultor fields from logged-in user profile (only if empty)
  useEffect(() => {
    if (!consultorProfile) return;
    const patch: Partial<typeof formData> = {};
    if (!formData.consultor_nome && consultorProfile.nome) {
      patch.consultor_nome = consultorProfile.nome;
    }
    if ((formData.consultor_cargo === '' || formData.consultor_cargo === 'Consultor Comercial') && consultorProfile.cargo) {
      patch.consultor_cargo = consultorProfile.cargo;
    }
    if (!formData.consultor_email && consultorProfile.email) {
      patch.consultor_email = consultorProfile.email;
    }
    if (!formData.consultor_whatsapp && consultorProfile.telefone) {
      patch.consultor_whatsapp = consultorProfile.telefone;
    }
    if (Object.keys(patch).length > 0) {
      updateFields(patch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consultorProfile]);

  const CurrentStepComponent = STEPS[currentStep - 1].component;

  function canProceed(): boolean {
    switch (currentStep) {
      case 1: return !!(formData.lead_nome && formData.lead_email && formData.lead_telefone);
      case 2: return !!(formData.escritorio_nome && formData.escritorio_cidade);
      case 3: return formData.escritorio_areas.length > 0;
      default: return true;
    }
  }

  function handleNext() {
    if (currentStep < STEPS.length) {
      setCompletedSteps((prev) => prev.includes(currentStep) ? prev : [...prev, currentStep]);
      setCurrentStep(currentStep + 1);
    }
  }

  function handleBack() {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  }

  function handleStepClick(step: number) {
    setCurrentStep(step);
  }

  async function handleSubmit() {
    const result = propostaSchema.safeParse(formData);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      toast({ title: 'Dados incompletos', description: firstIssue.message, variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/propostas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          pricing_table_id: pricingTableId,
          pricing_version_id: pricingVersionId,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao criar proposta');
      }

      const proposta = await res.json();
      toast({ title: 'Proposta criada!', description: 'Sua proposta foi salva com sucesso.' });
      resetForm();
      router.push(`/proposta/${proposta.id}`);
    } catch (error) {
      toast({
        title: 'Erro ao criar proposta',
        description: error instanceof Error ? error.message : 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-48px)] flex-col md:flex-row">
      {/* Mobile step indicator */}
      <div className="flex items-center gap-1 border-b border-[#e4e4e7] bg-white px-4 py-3 md:hidden">
        {STEPS.map((step) => (
          <div key={step.id} className="flex flex-1 flex-col items-center">
            <div
              className={`h-1.5 w-full rounded-full transition-colors ${
                completedSteps.includes(step.id)
                  ? 'bg-[#09090b]'
                  : currentStep === step.id
                    ? 'bg-[#09090b]'
                    : 'bg-[#e4e4e7]'
              }`}
            />
          </div>
        ))}
        <span className="ml-2 shrink-0 text-xs font-medium text-[#71717a]">
          {currentStep}/{STEPS.length}
        </span>
      </div>
      <div className="mb-2 px-4 pt-2 md:hidden">
        <span className="text-xs font-semibold uppercase tracking-wide text-[#a1a1aa]">
          Etapa {currentStep}:
        </span>{' '}
        <span className="text-xs font-medium text-[#09090b]">{STEPS[currentStep - 1].label}</span>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <WizardSidebar
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={handleStepClick}
        />
      </div>

      {/* Form content */}
      <div className="flex-1 px-4 py-4 md:px-10 md:py-8">
        <div className="max-w-[520px]">
          {currentStep === 2 ? (
            <StepEscritorio tables={tables} />
          ) : (
            <CurrentStepComponent />
          )}
          <WizardNavigation
            currentStep={currentStep}
            totalSteps={STEPS.length}
            canProceed={canProceed()}
            isSubmitting={isSubmitting}
            onBack={handleBack}
            onNext={handleNext}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}

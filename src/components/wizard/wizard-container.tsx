// src/components/wizard/wizard-container.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore } from '@/stores/wizard-store';
import { WizardSidebar } from './wizard-sidebar';
import { WizardNavigation } from './wizard-navigation';
import { StepLead } from './step-lead';
import { StepEscritorio } from './step-escritorio';
import { StepPerfil } from './step-perfil';
import { StepMaturidade } from './step-maturidade';
import { StepDores } from './step-dores';
import { StepPrecos } from './step-precos';
import { StepPreview } from './step-preview';
import { toast } from '@/hooks/use-toast';

const STEPS = [
  { id: 1, component: StepLead },
  { id: 2, component: StepEscritorio },
  { id: 3, component: StepPerfil },
  { id: 4, component: StepMaturidade },
  { id: 5, component: StepDores },
  { id: 6, component: StepPrecos },
  { id: 7, component: StepPreview },
];

export function WizardContainer() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { formData, roi, resetForm } = useWizardStore();

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
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/propostas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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
    <div className="flex min-h-[calc(100vh-48px)]">
      <WizardSidebar
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={handleStepClick}
      />
      <div className="flex-1 px-10 py-8">
        <div className="max-w-[520px]">
          <CurrentStepComponent />
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

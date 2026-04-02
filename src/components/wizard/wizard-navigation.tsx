// src/components/wizard/wizard-navigation.tsx
import { Button } from '@/components/ui/button';

interface WizardNavigationProps {
  currentStep: number;
  totalSteps: number;
  canProceed: boolean;
  isSubmitting: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export function WizardNavigation({
  currentStep,
  totalSteps,
  canProceed,
  isSubmitting,
  onBack,
  onNext,
  onSubmit,
}: WizardNavigationProps) {
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="mt-8 flex items-center justify-between border-t border-[#e4e4e7] pt-5">
      {currentStep > 1 ? (
        <Button variant="secondary" onClick={onBack}>
          ← Voltar
        </Button>
      ) : (
        <div />
      )}

      {isLastStep ? (
        <Button onClick={onSubmit} loading={isSubmitting} disabled={!canProceed}>
          Publicar Proposta
        </Button>
      ) : (
        <Button onClick={onNext} disabled={!canProceed}>
          Próximo →
        </Button>
      )}
    </div>
  );
}

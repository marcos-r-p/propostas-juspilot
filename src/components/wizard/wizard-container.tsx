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
import type { Proposta } from '@/types';

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
  /** Proposta existente para editar. Se passada, wizard entra em modo edit. */
  editingProposta?: Proposta | null;
}

export function WizardContainer({
  tables = [],
  initialTable = null,
  consultorProfile = null,
  editingProposta = null,
}: WizardContainerProps = {}) {
  const router = useRouter();
  const isEditing = !!editingProposta;
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { formData, roi, resetForm, setPricingTable, pricingTableId, pricingVersionId, updateFields } = useWizardStore();

  // Pre-fill from existing proposta when editing
  useEffect(() => {
    if (!editingProposta) return;
    resetForm();
    updateFields({
      lead_nome: editingProposta.lead_nome ?? '',
      lead_email: editingProposta.lead_email ?? '',
      lead_telefone: editingProposta.lead_telefone ?? '',
      lead_cargo: editingProposta.lead_cargo ?? '',
      escritorio_nome: editingProposta.escritorio_nome,
      escritorio_cidade: editingProposta.escritorio_cidade,
      escritorio_uf: editingProposta.escritorio_uf,
      escritorio_qtd_advogados: editingProposta.escritorio_qtd_advogados,
      escritorio_valor_hora: editingProposta.escritorio_valor_hora,
      escritorio_valor_hora_informado: editingProposta.escritorio_valor_hora_informado,
      escritorio_site_url: editingProposta.escritorio_site_url ?? '',
      escritorio_logo_url: editingProposta.escritorio_logo_url ?? '',
      escritorio_areas: editingProposta.escritorio_areas,
      escritorio_perfil: editingProposta.escritorio_perfil,
      escritorio_maturidade_processos: editingProposta.escritorio_maturidade_processos,
      escritorio_maturidade_ia: editingProposta.escritorio_maturidade_ia,
      escritorio_dores: editingProposta.escritorio_dores,
      escritorio_contexto: editingProposta.escritorio_contexto ?? '',
      consultor_nome: editingProposta.consultor_nome ?? '',
      consultor_cargo: editingProposta.consultor_cargo ?? 'Consultor Comercial',
      consultor_whatsapp: editingProposta.consultor_whatsapp ?? '',
      consultor_email: editingProposta.consultor_email ?? '',
      usar_preco_sugerido: false,
      preco_setup: editingProposta.preco_setup,
      preco_mensalidade: editingProposta.preco_mensalidade,
      preco_usuarios_inclusos: editingProposta.preco_usuarios_inclusos,
      preco_desconto: editingProposta.preco_desconto,
      usar_preco_faixas: !!editingProposta.preco_faixas?.length,
      preco_faixas: editingProposta.preco_faixas ?? null,
    });
    // Mark all steps complete (allow free navigation)
    setCompletedSteps([1, 2, 3, 4, 5, 6, 7]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingProposta]);

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
      const url = isEditing
        ? `/api/propostas/${editingProposta!.id}`
        : '/api/propostas';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          pricing_table_id: pricingTableId,
          pricing_version_id: pricingVersionId,
          // Recalculated ROI fields (server can override)
          roi_horas_economizadas_total: roi.horas_economizadas_total,
          roi_horas_economizadas_por_adv: roi.horas_economizadas_por_adv,
          roi_valor_gerado: roi.valor_gerado,
          roi_percentual: roi.roi_percentual,
          roi_multiplo: roi.roi_multiplo,
          roi_custo_por_advogado: roi.custo_por_advogado,
          preco_mensalidade_final: roi.mensalidade_final,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || `Erro ao ${isEditing ? 'atualizar' : 'criar'} proposta`);
      }

      const proposta = await res.json();
      toast({
        title: isEditing ? 'Proposta atualizada!' : 'Proposta criada!',
        description: isEditing
          ? 'As alterações já estão refletidas no link público.'
          : 'Sua proposta foi salva com sucesso.',
      });
      if (!isEditing) resetForm();
      router.push(`/proposta/${proposta.id}`);
    } catch (error) {
      toast({
        title: `Erro ao ${isEditing ? 'atualizar' : 'criar'} proposta`,
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
      <div className="flex items-center gap-1 border-b border-[#E3E0DD] bg-white px-4 py-3 md:hidden">
        {STEPS.map((step) => (
          <div key={step.id} className="flex flex-1 flex-col items-center">
            <div
              className={`h-1.5 w-full rounded-full transition-colors ${
                completedSteps.includes(step.id)
                  ? 'bg-[#101010]'
                  : currentStep === step.id
                    ? 'bg-[#101010]'
                    : 'bg-[#E3E0DD]'
              }`}
            />
          </div>
        ))}
        <span className="ml-2 shrink-0 text-xs font-medium text-[#7A7370]">
          {currentStep}/{STEPS.length}
        </span>
      </div>
      <div className="mb-2 px-4 pt-2 md:hidden">
        <span className="text-xs font-semibold uppercase tracking-wide text-[#a1a1aa]">
          Etapa {currentStep}:
        </span>{' '}
        <span className="text-xs font-medium text-[#101010]">{STEPS[currentStep - 1].label}</span>
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

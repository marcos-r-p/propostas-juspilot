'use client';

import { useWizardStore } from '@/stores/wizard-store';
import { Input } from '@/components/ui/input';

export function StepConsultor() {
  const { formData, updateField } = useWizardStore();
  const hasPrefilled = !!(formData.consultor_nome || formData.consultor_email);

  return (
    <div>
      <h2 className="text-lg font-semibold text-[#09090b]">Consultor Responsável</h2>
      <p className="mb-2 text-sm text-[#a1a1aa]">
        Dados do consultor JusPilot que aparecerão na proposta.
      </p>
      {hasPrefilled && (
        <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-[#D97757]/30 bg-[#D97757]/5 px-3 py-1.5 text-xs text-[#71717a]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 12l2 2 4-4M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
          </svg>
          Pré-preenchido com seus dados do perfil. Você pode editar.
        </div>
      )}

      <div className="space-y-4">
        <Input
          id="consultor_nome"
          label="Nome completo"
          value={formData.consultor_nome}
          onChange={(e) => updateField('consultor_nome', e.target.value)}
          placeholder="Ex: João Silva"
        />
        <Input
          id="consultor_cargo"
          label="Cargo"
          value={formData.consultor_cargo}
          onChange={(e) => updateField('consultor_cargo', e.target.value)}
          placeholder="Ex: Consultor Comercial"
        />
        <Input
          id="consultor_whatsapp"
          label="WhatsApp"
          value={formData.consultor_whatsapp}
          onChange={(e) => updateField('consultor_whatsapp', e.target.value)}
          placeholder="Ex: 5561984014175"
        />
        <Input
          id="consultor_email"
          label="E-mail"
          type="email"
          value={formData.consultor_email}
          onChange={(e) => updateField('consultor_email', e.target.value)}
          placeholder="Ex: joao@juspilot.com.br"
        />
      </div>
    </div>
  );
}

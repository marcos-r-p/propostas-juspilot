// src/components/wizard/step-lead.tsx
'use client';

import { useWizardStore } from '@/stores/wizard-store';
import { Input } from '@/components/ui/input';

export function StepLead() {
  const { formData, updateField } = useWizardStore();

  return (
    <div>
      <h2 className="text-lg font-semibold text-[#101010]">Dados do Lead</h2>
      <p className="mb-6 text-sm text-[#a1a1aa]">Informacoes do contato no escritorio.</p>

      <div className="space-y-5">
        <Input
          id="lead_nome"
          label="Nome do lead"
          placeholder="Joao Silva"
          value={formData.lead_nome}
          onChange={(e) => updateField('lead_nome', e.target.value)}
        />
        <Input
          id="lead_email"
          label="Email"
          type="email"
          placeholder="joao@escritorio.com.br"
          value={formData.lead_email}
          onChange={(e) => updateField('lead_email', e.target.value)}
        />
        <Input
          id="lead_telefone"
          label="Telefone"
          placeholder="(61) 99999-9999"
          value={formData.lead_telefone}
          onChange={(e) => updateField('lead_telefone', e.target.value)}
        />
        <Input
          id="lead_cargo"
          label="Cargo (opcional)"
          placeholder="Socio, Gerente, etc."
          value={formData.lead_cargo || ''}
          onChange={(e) => updateField('lead_cargo', e.target.value)}
        />
      </div>
    </div>
  );
}

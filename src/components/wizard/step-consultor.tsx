'use client';

import { useWizardStore } from '@/stores/wizard-store';
import { Input } from '@/components/ui/input';

export function StepConsultor() {
  const { formData, updateField } = useWizardStore();

  return (
    <div>
      <h2 className="text-lg font-semibold text-[#09090b]">Consultor Responsável</h2>
      <p className="mb-6 text-sm text-[#a1a1aa]">
        Dados do consultor JusPilot que aparecerão na proposta.
      </p>

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

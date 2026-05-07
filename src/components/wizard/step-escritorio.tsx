// src/components/wizard/step-escritorio.tsx
'use client';

import { useState } from 'react';
import { useWizardStore } from '@/stores/wizard-store';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { UFS } from '@/lib/constants/ufs';
import type { PricingTableCurrent } from '@/lib/pricing/types';

interface StepEscritorioProps {
  tables?: PricingTableCurrent[];
}

export function StepEscritorio({ tables = [] }: StepEscritorioProps = {}) {
  const { formData, updateField, pricingTableId, setPricingTable } = useWizardStore();
  const [logoLoading, setLogoLoading] = useState(false);
  const [logoError, setLogoError] = useState('');

  const handleSiteUrlBlur = async () => {
    const url = formData.escritorio_site_url.trim();
    if (!url) return;

    // Basic URL validation
    let fullUrl = url;
    if (!fullUrl.startsWith('http')) {
      fullUrl = `https://${fullUrl}`;
    }

    setLogoLoading(true);
    setLogoError('');

    try {
      const res = await fetch('/api/scrape-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: fullUrl }),
      });
      const data = await res.json();

      if (data.logo_url) {
        updateField('escritorio_logo_url', data.logo_url);
      } else {
        setLogoError(data.error || 'Não foi possível extrair a logo');
      }
    } catch {
      setLogoError('Erro ao buscar logo do site');
    } finally {
      setLogoLoading(false);
    }
  };

  const handleChangeTable = (id: string) => {
    const t = tables.find((x) => x.id === id);
    if (!t) return;
    if (formData.preco_desconto > 0 || formData.usar_preco_faixas) {
      const ok = typeof window !== 'undefined'
        ? window.confirm('Trocar tabela vai resetar os preços editados. Continuar?')
        : true;
      if (!ok) return;
    }
    setPricingTable({ id: t.id, versionId: t.current_version_id, data: t.data });
  };

  const handleManualUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setLogoError('Arquivo deve ter no máximo 2MB');
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    setLogoLoading(true);
    setLogoError('');

    try {
      const res = await fetch('/api/scrape-logo', {
        method: 'PUT',
        body: formDataUpload,
      });
      const data = await res.json();

      if (data.logo_url) {
        updateField('escritorio_logo_url', data.logo_url);
      } else {
        setLogoError(data.error || 'Erro no upload');
      }
    } catch {
      setLogoError('Erro ao fazer upload');
    } finally {
      setLogoLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-[#101010]">Dados do Escritório</h2>
      <p className="mb-6 text-sm text-[#a1a1aa]">Informações básicas sobre o escritório do lead.</p>

      <div className="space-y-5">
        {tables.length > 0 && (
          <label className="block text-sm font-medium text-[#101010]">
            Tabela comercial
            <select
              className="mt-1.5 h-9 w-full rounded-md border border-[#E3E0DD] bg-white px-2 text-sm text-[#101010]"
              value={pricingTableId ?? ''}
              onChange={(e) => handleChangeTable(e.target.value)}
            >
              {tables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}{t.is_default ? ' (default)' : ''}
                </option>
              ))}
            </select>
          </label>
        )}

        <Input
          id="escritorio_nome"
          label="Nome do escritorio"
          placeholder="Silva & Associados"
          value={formData.escritorio_nome}
          onChange={(e) => updateField('escritorio_nome', e.target.value)}
        />

        <div className="grid grid-cols-[2fr_1fr] gap-3">
          <Input
            id="escritorio_cidade"
            label="Cidade"
            placeholder="Brasilia"
            value={formData.escritorio_cidade}
            onChange={(e) => updateField('escritorio_cidade', e.target.value)}
          />
          <Select
            id="escritorio_uf"
            label="UF"
            options={UFS}
            value={formData.escritorio_uf}
            onChange={(e) => updateField('escritorio_uf', e.target.value)}
          />
        </div>

        <Slider
          label="Quantidade de advogados"
          value={formData.escritorio_qtd_advogados}
          onChange={(v) => updateField('escritorio_qtd_advogados', v)}
          min={1}
          max={100}
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#101010]">Valor da hora</label>

          <div className="space-y-2">
            <label className="flex cursor-pointer items-start gap-2 rounded-md border border-[#E3E0DD] p-3 hover:border-[#D97757]/40">
              <input
                type="radio"
                name="valor_hora_origem"
                checked={formData.escritorio_valor_hora_informado}
                onChange={() => updateField('escritorio_valor_hora_informado', true)}
                className="mt-1 accent-[#D97757]"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-[#101010]">Informado pelo lead</div>
                <div className="text-xs text-[#a1a1aa]">Use quando o cliente disse o valor que cobra por hora</div>
                {formData.escritorio_valor_hora_informado && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm text-[#a1a1aa]">R$</span>
                    <Input
                      id="escritorio_valor_hora"
                      type="number"
                      min={50}
                      max={2000}
                      value={formData.escritorio_valor_hora}
                      onChange={(e) => updateField('escritorio_valor_hora', Number(e.target.value))}
                      className="w-24"
                    />
                    <span className="text-xs text-[#a1a1aa]">/hora</span>
                  </div>
                )}
              </div>
            </label>

            <label className="flex cursor-pointer items-start gap-2 rounded-md border border-[#E3E0DD] p-3 hover:border-[#D97757]/40">
              <input
                type="radio"
                name="valor_hora_origem"
                checked={!formData.escritorio_valor_hora_informado}
                onChange={() => updateField('escritorio_valor_hora_informado', false)}
                className="mt-1 accent-[#D97757]"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-[#101010]">Estimativa de mercado</div>
                <div className="text-xs text-[#a1a1aa]">Usaremos R$ 250/hora — média do mercado jurídico brasileiro</div>
              </div>
            </label>
          </div>
        </div>

        {/* Site URL + Logo */}
        <div>
          <Input
            id="escritorio_site_url"
            label="Site do escritório (opcional)"
            placeholder="www.silvaadvogados.com.br"
            value={formData.escritorio_site_url}
            onChange={(e) => updateField('escritorio_site_url', e.target.value)}
            onBlur={handleSiteUrlBlur}
          />

          {logoLoading && (
            <div className="mt-2 flex items-center gap-2 text-sm text-[#a1a1aa]">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Buscando logo...
            </div>
          )}

          {logoError && (
            <div className="mt-2">
              <p className="text-sm text-[#ef4444]">{logoError}</p>
              <label className="mt-1 inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-[#101010] hover:underline">
                Fazer upload manual
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp,image/x-icon"
                  onChange={handleManualUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {formData.escritorio_logo_url && !logoLoading && (
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#E3E0DD] bg-white p-1">
                <img
                  src={formData.escritorio_logo_url}
                  alt="Logo do escritório"
                  className="max-h-10 max-w-10 object-contain"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  updateField('escritorio_logo_url', '');
                  setLogoError('');
                }}
                className="text-sm text-[#a1a1aa] hover:text-[#ef4444] transition-colors"
              >
                Remover
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createVersion } from '../actions';
import { ProgressiveTemplateList } from '../components/progressive-template-editor';
import type { PricingTableCurrent, ProgressiveTemplate } from '@/lib/pricing/types';

export function LimitesTab({
  table,
  templates,
  isAdmin,
}: {
  table: PricingTableCurrent;
  templates: ProgressiveTemplate[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [limites, setLimites] = useState(table.data.limites);
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(limites) !== JSON.stringify(table.data.limites);

  const handleSave = async () => {
    setSaving(true);
    try {
      await createVersion(table.id, { ...table.data, limites });
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#71717a]">Limites comerciais</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="text-sm">Desconto máximo (%)
            <Input type="number" min="0" max="100" value={limites.desconto_maximo_pct} disabled={!isAdmin}
              onChange={(e) => setLimites({ ...limites, desconto_maximo_pct: Number(e.target.value) })} />
          </label>
          <label className="text-sm">Mensalidade mínima (R$)
            <Input type="number" min="0" value={limites.mensalidade_minima} disabled={!isAdmin}
              onChange={(e) => setLimites({ ...limites, mensalidade_minima: Number(e.target.value) })} />
          </label>
          <label className="text-sm">Validade padrão (dias)
            <Input type="number" min="1" value={limites.validade_proposta_dias} disabled={!isAdmin}
              onChange={(e) => setLimites({ ...limites, validade_proposta_dias: Number(e.target.value) })} />
          </label>
          <label className="text-sm">Reajuste anual (%)
            <Input type="number" min="0" max="100" value={limites.reajuste_anual_pct} disabled={!isAdmin}
              onChange={(e) => setLimites({ ...limites, reajuste_anual_pct: Number(e.target.value) })} />
          </label>
        </div>
        {isAdmin && dirty && (
          <div className="mt-4">
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Salvando…' : 'Salvar (cria nova versão)'}</Button>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#71717a]">Templates de faixas progressivas</h3>
        <p className="mt-1 text-xs text-[#71717a]">
          Templates ficam disponíveis no wizard de proposta como atalhos de progressão (ex.: &quot;3+9 meses&quot;).
        </p>
        <div className="mt-4"><ProgressiveTemplateList templates={templates} isAdmin={isAdmin} /></div>
      </Card>
    </div>
  );
}

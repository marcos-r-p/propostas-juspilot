'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FaixasPorteEditor } from '../components/faixas-porte-editor';
import { createVersion, updateTableMetadata, setDefaultTable, softDeleteTable } from '../actions';
import { faixasPorteSchema } from '@/lib/validations/pricing';
import type { PricingTableCurrent } from '@/lib/pricing/types';

export function TabelasTab({ table, isAdmin }: { table: PricingTableCurrent; isAdmin: boolean }) {
  const router = useRouter();
  const [name, setName] = useState(table.name);
  const [description, setDescription] = useState(table.description ?? '');
  const [faixas, setFaixas] = useState(table.data.faixas_porte);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const dirty =
    name !== table.name ||
    description !== (table.description ?? '') ||
    JSON.stringify(faixas) !== JSON.stringify(table.data.faixas_porte);

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      const parsed = faixasPorteSchema.parse(faixas);
      if (name !== table.name || description !== (table.description ?? '')) {
        await updateTableMetadata(table.id, { name, description: description || null });
      }
      if (JSON.stringify(parsed) !== JSON.stringify(table.data.faixas_porte)) {
        await createVersion(table.id, { ...table.data, faixas_porte: parsed });
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#71717a]">Identificação</h3>
          <div className="flex items-center gap-2">
            {table.is_default && <span className="rounded-md border border-[#D97757]/40 bg-[#D97757]/10 px-2 py-0.5 text-xs font-medium text-[#D97757]">Default</span>}
            {!table.is_active && <span className="rounded-md border border-[#e4e4e7] bg-[#fafafa] px-2 py-0.5 text-xs font-medium text-[#71717a]">Inativa</span>}
          </div>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} disabled={!isAdmin} placeholder="Nome" />
          <Input value={description} onChange={(e) => setDescription(e.target.value)} disabled={!isAdmin} placeholder="Descrição" />
        </div>
        {isAdmin && (
          <div className="mt-3 flex gap-2">
            {!table.is_default && (
              <Button variant="secondary" onClick={async () => { await setDefaultTable(table.id); router.refresh(); }}>
                Tornar default
              </Button>
            )}
            {!table.is_default && (
              <Button variant="secondary" onClick={async () => {
                if (confirm('Desativar esta tabela?')) { await softDeleteTable(table.id); router.refresh(); }
              }}>Desativar</Button>
            )}
          </div>
        )}
      </Card>

      <Card>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#71717a]">Faixas de porte</h3>
        <p className="mt-1 text-xs text-[#71717a]">
          Faixas devem ser contínuas e a última deve ter max=∞. Use o campo &quot;+10 adv.&quot; na última para setar o incremento progressivo.
        </p>
        <div className="mt-3"><FaixasPorteEditor faixas={faixas} onChange={setFaixas} disabled={!isAdmin} /></div>
      </Card>

      {isAdmin && dirty && (
        <div className="sticky bottom-4 flex items-center justify-between rounded-lg border border-[#D97757] bg-white p-3 shadow-md">
          <div className="text-sm">
            {error ? <span className="text-red-600">{error}</span> : 'Há alterações não salvas.'}
          </div>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Salvando…' : 'Salvar (cria nova versão)'}</Button>
        </div>
      )}
    </div>
  );
}

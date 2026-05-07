'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createTable } from '../actions';
import type { PricingTableCurrent } from '@/lib/pricing/types';

export function NovaTabelaDialog({
  open,
  onOpenChange,
  sourceTables,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  sourceTables: PricingTableCurrent[];
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [copyFrom, setCopyFrom] = useState<string>(sourceTables[0]?.id ?? '');
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      const source = sourceTables.find((t) => t.id === copyFrom);
      if (!source) throw new Error('Selecione uma tabela base');
      await createTable({ name, description: description || null, data: source.data });
      onOpenChange(false);
      setName('');
      setDescription('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => onOpenChange(false)} title="Nova tabela comercial">
      <div className="space-y-3">
        <div className="space-y-3">
          <Input placeholder="Nome (ex.: Enterprise)" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Descrição (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} />
          <label className="block text-sm">
            Copiar valores de:
            <select className="mt-1 h-9 w-full rounded-md border border-[#E3E0DD] px-2"
              value={copyFrom} onChange={(e) => setCopyFrom(e.target.value)}>
              {sourceTables.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={!name || !copyFrom || submitting}>
              {submitting ? 'Criando…' : 'Criar'}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

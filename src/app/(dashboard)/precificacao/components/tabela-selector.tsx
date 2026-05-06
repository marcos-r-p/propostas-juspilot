'use client';

import { useState } from 'react';
import type { PricingTableCurrent } from '@/lib/pricing/types';
import { Button } from '@/components/ui/button';
import { NovaTabelaDialog } from './nova-tabela-dialog';

export function TabelaSelector({
  tables,
  value,
  onChange,
  isAdmin,
}: {
  tables: PricingTableCurrent[];
  value: string | null;
  onChange: (id: string) => void;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = tables.find((t) => t.id === value);
  return (
    <div className="flex items-center gap-3">
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-md border border-[#e4e4e7] bg-white px-3 text-sm"
      >
        {tables.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}{t.is_default ? ' (default)' : ''}
          </option>
        ))}
      </select>
      {selected && (
        <span className="text-xs text-[#71717a]">
          v{selected.version_number} · {new Date(selected.version_created_at).toLocaleDateString('pt-BR')}
        </span>
      )}
      {isAdmin && (
        <>
          <Button variant="secondary" onClick={() => setOpen(true)}>+ Nova tabela</Button>
          <NovaTabelaDialog open={open} onOpenChange={setOpen} sourceTables={tables} />
        </>
      )}
    </div>
  );
}

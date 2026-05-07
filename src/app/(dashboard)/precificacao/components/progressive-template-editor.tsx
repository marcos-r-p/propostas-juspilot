'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  createProgressiveTemplate,
  updateProgressiveTemplate,
  deleteProgressiveTemplate,
} from '../actions';
import type { ProgressiveTemplate } from '@/lib/pricing/types';
import { useRouter } from 'next/navigation';

type Faixas = ProgressiveTemplate['faixas'];

export function ProgressiveTemplateList({
  templates,
  isAdmin,
}: {
  templates: ProgressiveTemplate[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftFaixas, setDraftFaixas] = useState<Faixas>([
    { mes_inicio: 1, mes_fim: 3, valor: 1500 },
    { mes_inicio: 4, mes_fim: null, valor: 3000 },
  ]);

  const editing = templates.find((t) => t.id === editingId);
  const isNew = editingId === 'new';

  const startEdit = (t: ProgressiveTemplate) => {
    setEditingId(t.id);
    setDraftName(t.name);
    setDraftFaixas(t.faixas);
  };
  const startNew = () => {
    setEditingId('new');
    setDraftName('');
    setDraftFaixas([{ mes_inicio: 1, mes_fim: 3, valor: 1500 }, { mes_inicio: 4, mes_fim: null, valor: 3000 }]);
  };

  const save = async () => {
    if (isNew) await createProgressiveTemplate({ name: draftName, faixas: draftFaixas });
    else if (editing) await updateProgressiveTemplate(editing.id, { name: draftName, faixas: draftFaixas });
    setEditingId(null);
    router.refresh();
  };

  return (
    <div className="space-y-3">
      {templates.map((t) => (
        <div key={t.id} className="flex items-center justify-between rounded-md border border-[#E3E0DD] p-3">
          <div className="text-sm">
            <div className="font-medium text-[#101010]">{t.name}</div>
            <div className="text-xs text-[#7A7370]">
              {t.faixas.map((f, i) => (
                <span key={i}>{i > 0 && ' → '}meses {f.mes_inicio}{f.mes_fim ? `–${f.mes_fim}` : '+'}: R$ {f.valor}</span>
              ))}
            </div>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => startEdit(t)}>Editar</Button>
              <Button variant="secondary" onClick={async () => {
                if (confirm('Excluir este template?')) { await deleteProgressiveTemplate(t.id); router.refresh(); }
              }}>Excluir</Button>
            </div>
          )}
        </div>
      ))}
      {isAdmin && <Button onClick={startNew}>+ Novo template</Button>}

      {(isNew || editing) && (
        <Card>
          <div className="space-y-2">
            <Input value={draftName} placeholder="Nome (ex.: 3+9)" onChange={(e) => setDraftName(e.target.value)} />
            {draftFaixas.map((f, i) => (
              <div key={i} className="grid grid-cols-3 gap-2">
                <Input type="number" placeholder="mês início" value={f.mes_inicio}
                  onChange={(e) => setDraftFaixas(draftFaixas.map((d, idx) => idx === i ? { ...d, mes_inicio: Number(e.target.value) } : d))} />
                <Input type="number" placeholder="mês fim (∞ = vazio)" value={f.mes_fim ?? ''}
                  onChange={(e) => setDraftFaixas(draftFaixas.map((d, idx) => idx === i ? { ...d, mes_fim: e.target.value === '' ? null : Number(e.target.value) } : d))} />
                <Input type="number" placeholder="valor R$" value={f.valor}
                  onChange={(e) => setDraftFaixas(draftFaixas.map((d, idx) => idx === i ? { ...d, valor: Number(e.target.value) } : d))} />
              </div>
            ))}
            <button className="text-sm text-[#D97757] hover:underline"
              onClick={() => setDraftFaixas([...draftFaixas, { mes_inicio: 1, mes_fim: null, valor: 0 }])}>
              + Adicionar faixa
            </button>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setEditingId(null)}>Cancelar</Button>
              <Button onClick={save} disabled={!draftName}>Salvar</Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { PricingTableCurrent, ProgressiveTemplate } from '@/lib/pricing/types';
import { ModeloTab } from './tabs/modelo-tab';
import { TabelasTab } from './tabs/tabelas-tab';
import { RoiTab } from './tabs/roi-tab';
import { LimitesTab } from './tabs/limites-tab';
import { HistoricoTab } from './tabs/historico-tab';
import { TabelaSelector } from './components/tabela-selector';

interface Props {
  isAdmin: boolean;
  tables: PricingTableCurrent[];
  initialSelectedId: string | null;
  initialVersions: Array<{ id: string; version_number: number; created_at: string; created_by: string | null; data: unknown }>;
  progressiveTemplates: ProgressiveTemplate[];
}

export function PrecificacaoClient({ isAdmin, tables, initialSelectedId, initialVersions, progressiveTemplates }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId);
  const selected = tables.find((t) => t.id === selectedId) ?? null;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#101010]">Precificação</h1>
        <TabelaSelector tables={tables} value={selectedId} onChange={setSelectedId} isAdmin={isAdmin} />
      </div>

      {!selected ? (
        <div className="text-sm text-[#7A7370]">Nenhuma tabela ativa. {isAdmin && 'Crie uma para começar.'}</div>
      ) : (
        <Tabs defaultValue="modelo">
          <TabsList className="mb-6">
            <TabsTrigger value="modelo">Modelo</TabsTrigger>
            <TabsTrigger value="tabelas">Tabelas comerciais</TabsTrigger>
            <TabsTrigger value="roi">ROI</TabsTrigger>
            <TabsTrigger value="limites">Limites e padrões</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="modelo"><ModeloTab data={selected.data} /></TabsContent>
          <TabsContent value="tabelas"><TabelasTab table={selected} isAdmin={isAdmin} /></TabsContent>
          <TabsContent value="roi"><RoiTab table={selected} isAdmin={isAdmin} /></TabsContent>
          <TabsContent value="limites"><LimitesTab table={selected} templates={progressiveTemplates} isAdmin={isAdmin} /></TabsContent>
          <TabsContent value="historico"><HistoricoTab tableId={selected.id} initialVersions={initialVersions} /></TabsContent>
        </Tabs>
      )}
    </div>
  );
}

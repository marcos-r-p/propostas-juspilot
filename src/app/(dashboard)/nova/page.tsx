// src/app/(dashboard)/nova/page.tsx
import { listActivePricingTables, loadDefaultPricingTable } from '@/lib/pricing/load';
import { WizardContainer } from '@/components/wizard/wizard-container';

export const metadata = { title: 'Nova Proposta' };

export default async function NovaPropostaPage() {
  const tables = await listActivePricingTables();
  const defaultTable = (await loadDefaultPricingTable()) ?? tables[0] ?? null;
  return <WizardContainer tables={tables} initialTable={defaultTable} />;
}

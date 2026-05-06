// src/app/(dashboard)/nova/page.tsx
import { listActivePricingTables, loadDefaultPricingTable } from '@/lib/pricing/load';
import { createServerClient } from '@/lib/supabase/server';
import { WizardContainer } from '@/components/wizard/wizard-container';
import type { Profile } from '@/types/database';

export const metadata = { title: 'Nova Proposta' };

export default async function NovaPropostaPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const profilePromise = user
    ? supabase
        .from('profiles')
        .select('id, email, nome, cargo, telefone, avatar_url')
        .eq('id', user.id)
        .maybeSingle()
    : Promise.resolve({ data: null });

  const [tables, defaultTable, profileResult] = await Promise.all([
    listActivePricingTables(),
    loadDefaultPricingTable(),
    profilePromise,
  ]);

  const initialTable = defaultTable ?? tables[0] ?? null;
  const profile = (profileResult.data ?? null) as Pick<
    Profile,
    'id' | 'email' | 'nome' | 'cargo' | 'telefone' | 'avatar_url'
  > | null;

  return (
    <WizardContainer
      tables={tables}
      initialTable={initialTable}
      consultorProfile={profile}
    />
  );
}

import { createServerClient } from '@/lib/supabase/server';
import { listActivePricingTables, listVersions } from '@/lib/pricing/load';
import { PrecificacaoClient } from './precificacao-client';

export const metadata = { title: 'Precificação' };

export default async function PrecificacaoPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user!.id).single();
  const isAdmin = profile?.role === 'admin';

  const tables = await listActivePricingTables();
  const defaultTable = tables.find((t) => t.is_default) ?? tables[0];
  const versions = defaultTable ? await listVersions(defaultTable.id) : [];

  const { data: templates } = await supabase
    .from('progressive_templates').select('*').order('name');

  return (
    <PrecificacaoClient
      isAdmin={isAdmin}
      tables={tables}
      initialSelectedId={defaultTable?.id ?? null}
      initialVersions={versions}
      progressiveTemplates={templates ?? []}
    />
  );
}

import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { listActivePricingTables, loadDefaultPricingTable, loadPricingTableById } from '@/lib/pricing/load';
import { WizardContainer } from '@/components/wizard/wizard-container';
import type { Proposta, Profile } from '@/types/database';

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata = { title: 'Editar Proposta' };

export default async function EditarPropostaPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const [propostaRes, tables, profileRes] = await Promise.all([
    supabase.from('propostas').select('*').eq('id', id).maybeSingle(),
    listActivePricingTables(),
    supabase
      .from('profiles')
      .select('id, email, nome, cargo, telefone, avatar_url')
      .eq('id', user.id)
      .maybeSingle(),
  ]);

  if (propostaRes.error || !propostaRes.data) notFound();
  const proposta = propostaRes.data as Proposta;

  // Carrega a tabela de pricing usada na proposta (se houver), senão a default
  let pricingTable = null;
  if (proposta.pricing_table_id) {
    pricingTable = await loadPricingTableById(proposta.pricing_table_id);
  }
  if (!pricingTable) {
    pricingTable = await loadDefaultPricingTable();
  }
  if (!pricingTable) {
    pricingTable = tables[0] ?? null;
  }

  const profile = (profileRes.data ?? null) as Pick<
    Profile,
    'id' | 'email' | 'nome' | 'cargo' | 'telefone' | 'avatar_url'
  > | null;

  const isPublished = proposta.status !== 'rascunho';
  const wasViewed = (proposta.visualizacoes ?? 0) > 0;

  return (
    <div>
      {isPublished && (
        <div className={`mx-4 mb-4 rounded-md border p-3 text-sm md:mx-10 ${
          wasViewed
            ? 'border-amber-300 bg-amber-50 text-amber-900'
            : 'border-[#D97757]/30 bg-[#D97757]/5 text-[#71717a]'
        }`}>
          <div className="flex items-start gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v4M12 17h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
            </svg>
            <div>
              <strong className="block font-medium text-[#09090b]">
                Editando proposta {wasViewed ? 'já visualizada pelo cliente' : 'publicada'}
              </strong>
              <span>
                {wasViewed
                  ? `O cliente já abriu esta proposta ${proposta.visualizacoes} vez(es). Alterações refletem imediatamente no link público.`
                  : 'Alterações refletem imediatamente no link público.'}
              </span>
            </div>
          </div>
        </div>
      )}

      <WizardContainer
        tables={tables}
        initialTable={pricingTable}
        consultorProfile={profile}
        editingProposta={proposta}
      />
    </div>
  );
}

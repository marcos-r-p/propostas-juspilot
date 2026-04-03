import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { PropostaStats } from '@/components/propostas/proposta-stats';
import { PropostaFilters } from '@/components/propostas/proposta-filters';
import { PropostaTable } from '@/components/propostas/proposta-table';
import { EmptyState } from '@/components/shared/empty-state';
import type { Proposta } from '@/types';

interface Props {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}

export default async function DashboardPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createServerClient();

  const { count: total } = await supabase.from('propostas').select('*', { count: 'exact', head: true });
  const { count: publicadas } = await supabase.from('propostas').select('*', { count: 'exact', head: true }).eq('status', 'publicada');
  const { count: visualizadas } = await supabase.from('propostas').select('*', { count: 'exact', head: true }).eq('status', 'visualizada');
  const { count: aceitas } = await supabase.from('propostas').select('*', { count: 'exact', head: true }).eq('status', 'aceita');

  let query = supabase.from('propostas').select('*').order('created_at', { ascending: false }).range(0, 19);

  if (params.status && params.status !== 'all') query = query.eq('status', params.status);
  if (params.search) query = query.or(`escritorio_nome.ilike.%${params.search}%,lead_nome.ilike.%${params.search}%`);

  const { data: propostas } = await query;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#09090b]">Propostas</h1>
          <p className="mt-0.5 text-sm text-[#a1a1aa]">{total || 0} propostas no total</p>
        </div>
        <Link href="/nova"><Button className="w-full sm:w-auto">+ Nova Proposta</Button></Link>
      </div>
      <div className="mb-6"><PropostaStats total={total || 0} publicadas={publicadas || 0} visualizadas={visualizadas || 0} aceitas={aceitas || 0} /></div>
      <div className="mb-4"><PropostaFilters /></div>
      {propostas && propostas.length > 0 ? (
        <PropostaTable propostas={propostas as Proposta[]} />
      ) : (
        <EmptyState title="Nenhuma proposta encontrada" description="Crie sua primeira proposta para começar." action={{ label: '+ Nova Proposta', href: '/nova' }} />
      )}
    </div>
  );
}

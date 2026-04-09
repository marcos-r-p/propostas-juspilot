import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { PropostaStats } from '@/components/propostas/proposta-stats';
import { PropostaTabs } from '@/components/propostas/proposta-tabs';
import { PropostaFilters } from '@/components/propostas/proposta-filters';
import { PropostaTable } from '@/components/propostas/proposta-table';
import { EmptyState } from '@/components/shared/empty-state';
import type { Proposta } from '@/types';

interface Props {
  searchParams: Promise<{
    status?: string;
    search?: string;
    tipo?: string;
    periodo?: string;
    page?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createServerClient();

  // Stats: counts by status
  const now = new Date();
  const mesInicio = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    { count: totalMes },
    { count: totalGeral },
    { count: publicadas },
    { count: visualizadas },
    { count: aceitas },
    { count: recusadas },
  ] = await Promise.all([
    supabase.from('propostas').select('*', { count: 'exact', head: true }).gte('created_at', mesInicio),
    supabase.from('propostas').select('*', { count: 'exact', head: true }),
    supabase.from('propostas').select('*', { count: 'exact', head: true }).eq('status', 'publicada'),
    supabase.from('propostas').select('*', { count: 'exact', head: true }).eq('status', 'visualizada'),
    supabase.from('propostas').select('*', { count: 'exact', head: true }).eq('status', 'aceita'),
    supabase.from('propostas').select('*', { count: 'exact', head: true }).eq('status', 'recusada'),
  ]);

  // Valor aceito do mes
  const { data: aceitasData } = await supabase
    .from('propostas')
    .select('preco_mensalidade_final')
    .eq('status', 'aceita')
    .gte('created_at', mesInicio);
  const valorAceito = (aceitasData || []).reduce(
    (sum, p) => sum + (p.preco_mensalidade_final || 0),
    0
  );

  const enviadasCount = (publicadas || 0) + (visualizadas || 0) + (aceitas || 0) + (recusadas || 0);

  // Filtered list query
  let query = supabase
    .from('propostas')
    .select('*')
    .order('created_at', { ascending: false })
    .range(0, 19);

  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status);
  }
  if (params.search) {
    query = query.or(
      `escritorio_nome.ilike.%${params.search}%,lead_nome.ilike.%${params.search}%`
    );
  }
  if (params.tipo) {
    query = query.eq('escritorio_perfil', params.tipo);
  }
  if (params.periodo) {
    const periodoMap: Record<string, number> = { '1m': 1, '3m': 3, '6m': 6 };
    const meses = periodoMap[params.periodo];
    if (meses) {
      const desde = new Date();
      desde.setMonth(desde.getMonth() - meses);
      query = query.gte('created_at', desde.toISOString());
    }
  }

  const { data: propostas } = await query;

  return (
    <div>
      {/* Header */}
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-heading-lg text-ink">Propostas</h1>
          <p className="mt-0.5 text-body-sm text-mute">
            Gerencie todas as propostas criadas e enviadas
          </p>
        </div>
        <Link href="/nova">
          <Button className="w-full sm:w-auto">+ Nova Proposta</Button>
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="mb-7">
        <PropostaStats
          total={totalMes || 0}
          visualizadas={visualizadas || 0}
          enviadas={enviadasCount}
          aceitas={aceitas || 0}
          valorAceito={valorAceito}
        />
      </div>

      {/* Tabs */}
      <div className="mb-4">
        <PropostaTabs
          counts={{
            total: totalGeral || 0,
            publicadas: publicadas || 0,
            visualizadas: visualizadas || 0,
            aceitas: aceitas || 0,
            recusadas: recusadas || 0,
          }}
        />
      </div>

      {/* Filters */}
      <div className="mb-5">
        <PropostaFilters />
      </div>

      {/* Table or Empty State */}
      {propostas && propostas.length > 0 ? (
        <PropostaTable propostas={propostas as Proposta[]} />
      ) : (
        <EmptyState
          title="Nenhuma proposta encontrada"
          description="Crie sua primeira proposta para comecar."
          action={{ label: '+ Nova Proposta', href: '/nova' }}
        />
      )}
    </div>
  );
}

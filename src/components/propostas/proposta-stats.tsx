import { formatCurrency } from '@/lib/utils/format';

interface PropostaStatsProps {
  total: number;
  visualizadas: number;
  enviadas: number;
  aceitas: number;
  valorAceito: number;
}

export function PropostaStats({ total, visualizadas, enviadas, aceitas, valorAceito }: PropostaStatsProps) {
  const taxaConversao = enviadas > 0 ? Math.round((aceitas / enviadas) * 100) : 0;
  const pctVisualizadas = enviadas > 0 ? Math.round((visualizadas / enviadas) * 100) : 0;

  const stats = [
    { label: 'Total propostas', value: String(total), sub: 'este mes' },
    { label: 'Visualizadas', value: String(visualizadas), sub: `${pctVisualizadas}% das enviadas` },
    { label: 'Taxa de conversao', value: `${taxaConversao}%`, sub: 'aceitas / enviadas' },
    { label: 'Valor aceito', value: formatCurrency(valorAceito), sub: 'acumulado do mes' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="border border-rule bg-paper-pure p-5">
          <div className="text-caption font-medium text-mute">{stat.label}</div>
          <div className="mt-2 text-[28px] font-bold leading-none tracking-tight text-ink">{stat.value}</div>
          <div className="mt-1 text-xs text-whisper">{stat.sub}</div>
        </div>
      ))}
    </div>
  );
}

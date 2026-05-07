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
    { label: 'Total propostas', value: String(total), sub: 'este mês' },
    { label: 'Visualizadas', value: String(visualizadas), sub: `${pctVisualizadas}% das enviadas` },
    { label: 'Taxa de conversão', value: `${taxaConversao}%`, sub: 'aceitas / enviadas' },
    { label: 'Valor aceito', value: formatCurrency(valorAceito), sub: 'acumulado do mês' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="group relative overflow-hidden rounded-md border border-rule bg-paper-pure p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(0,0,0,0.06)]"
        >
          <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-brand">
            {stat.label}
          </div>
          <div className="mt-3 text-[28px] font-bold leading-none tracking-[-0.5px] text-ink tabular-nums">
            {stat.value}
          </div>
          <div className="mt-1.5 text-[12px] text-mute">{stat.sub}</div>
          {/* Bottom accent bar (hidden, animates in on hover) */}
          <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-brand transition-[width] duration-500 ease-out group-hover:w-full" />
        </div>
      ))}
    </div>
  );
}

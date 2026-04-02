import { Card } from '@/components/ui/card';

interface StatsProps {
  total: number;
  publicadas: number;
  visualizadas: number;
  aceitas: number;
}

export function PropostaStats({ total, publicadas, visualizadas, aceitas }: StatsProps) {
  const stats = [
    { label: 'Total', value: total },
    { label: 'Publicadas', value: publicadas },
    { label: 'Visualizadas', value: visualizadas },
    { label: 'Aceitas', value: aceitas },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-4">
          <div className="text-xs uppercase tracking-wide text-[#a1a1aa]">{stat.label}</div>
          <div className="mt-1 text-2xl font-semibold text-[#09090b]">{stat.value}</div>
        </Card>
      ))}
    </div>
  );
}

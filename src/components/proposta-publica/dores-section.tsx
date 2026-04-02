import type { Proposta } from '@/types';
import { getDoresByIds } from '@/lib/constants/dores';
import type { DorId } from '@/lib/constants/dores';

interface DoresSectionProps {
  proposta: Proposta;
}

export function DoresSection({ proposta }: DoresSectionProps) {
  const dores = getDoresByIds((proposta.escritorio_dores || []) as DorId[]);

  if (dores.length === 0) return null;

  return (
    <section className="reveal px-8 py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-2 text-2xl font-bold text-white">
          Proposta para {proposta.escritorio_nome}
        </h2>
        <p className="mb-10 text-[#a1a1aa]">
          Identificamos os seguintes desafios que o JusPilot pode resolver:
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {dores.map((dor) => (
            <div
              key={dor.id}
              className="rounded-lg border border-[#27272a] bg-[#18181b] p-5 transition-colors hover:border-[#3f3f46]"
            >
              <div className="mb-2 text-lg">{dor.icon}</div>
              <h3 className="mb-1 text-sm font-semibold text-white">{dor.label}</h3>
              <p className="text-xs text-[#a1a1aa]">{dor.description}</p>
              <div className="mt-3 inline-block rounded-full bg-[#27272a] px-3 py-1 text-xs font-medium text-white">
                {dor.highlight}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

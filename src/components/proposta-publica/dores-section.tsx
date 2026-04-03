import type { Proposta } from '@/types';
import { getDoresByIds } from '@/lib/constants/dores';
import type { DorId } from '@/lib/constants/dores';

interface DoresSectionProps {
  proposta: Proposta;
}

const DORE_ICONS: Record<string, string> = {
  tempo_pecas: 'M13 10V3L4 14h7v7l9-11h-7z',
  pesquisa_jurisprudencia: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  gestao_prazos: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  padronizacao: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  comunicacao_cliente: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  contratos: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z',
  automacao: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
};

export function DoresSection({ proposta }: DoresSectionProps) {
  const dores = getDoresByIds((proposta.escritorio_dores || []) as DorId[]);

  if (dores.length === 0) return null;

  return (
    <section className="px-4 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="reveal mb-16">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c9a96e]">Diagnóstico</span>
          <h2 className="font-display mt-3 text-3xl font-medium tracking-tight text-[#f1f5f9] md:text-4xl">
            Desafios identificados
          </h2>
          <p className="mt-4 max-w-xl text-[#8b95a5]">
            Com base no perfil do seu escritório, identificamos as principais oportunidades de transformação.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {dores.map((dor, i) => (
            <div
              key={dor.id}
              className={`reveal reveal-delay-${Math.min(i + 1, 4)} card-hover group rounded-xl border border-[#1e293b] bg-[#141c2e]/60 p-5 backdrop-blur-sm sm:p-7`}
            >
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#1e293b] bg-[#0a0f1c]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={DORE_ICONS[dor.id] || DORE_ICONS.automacao} />
                    {dor.id === 'automacao' && <circle cx="12" cy="12" r="3" />}
                  </svg>
                </div>
                <span className="rounded-full border border-[#c9a96e]/20 bg-[#c9a96e]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#c9a96e]">
                  {dor.highlight}
                </span>
              </div>
              <h3 className="mb-2 text-base font-semibold text-[#f1f5f9]">{dor.label}</h3>
              <p className="text-sm leading-relaxed text-[#8b95a5]">{dor.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="section-divider mx-auto mt-20 max-w-6xl" />
    </section>
  );
}

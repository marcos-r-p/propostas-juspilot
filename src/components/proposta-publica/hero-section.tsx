import type { Proposta } from '@/types';

interface HeroSectionProps {
  proposta: Proposta;
}

export function HeroSection({ proposta }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden px-4 pb-14 pt-16 sm:px-8 sm:pb-20 sm:pt-24">
      {/* Decorative elements */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2">
        <div className="h-[400px] w-[600px] rounded-full bg-[#c9a96e] opacity-[0.03] blur-[120px]" />
      </div>
      <div className="pointer-events-none absolute right-0 top-20 h-64 w-64 rounded-full bg-[#c9a96e] opacity-[0.02] blur-[80px]" />

      <div className="relative mx-auto max-w-6xl">
        <div className="reveal flex flex-col items-center text-center">
          <div className="mb-8 flex items-center gap-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#c9a96e]" />
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c9a96e]">
              Proposta Comercial
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#c9a96e]" />
          </div>

          <h1 className="font-display text-3xl font-medium leading-tight tracking-tight text-[#f1f5f9] sm:text-5xl md:text-6xl lg:text-7xl">
            Transforme seu{' '}
            <span className="gradient-text italic">escritório</span>
            <br />
            com inteligência artificial
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#8b95a5] sm:mt-8 sm:text-lg">
            Proposta personalizada para{' '}
            <span className="font-medium text-[#f1f5f9]">{proposta.escritorio_nome}</span>.
          </p>

          {proposta.lead_nome && (
            <div className="mt-10 inline-flex items-center gap-3 rounded-full border border-[#1e293b] bg-[#141c2e]/60 px-6 py-3 backdrop-blur-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#c9a96e] to-[#a08450] text-xs font-semibold text-white">
                {proposta.lead_nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-[#f1f5f9]">{proposta.lead_nome}</div>
                {proposta.lead_cargo && <div className="text-xs text-[#4a5568]">{proposta.lead_cargo}</div>}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="section-divider mx-auto mt-14 max-w-6xl sm:mt-20" />
    </section>
  );
}

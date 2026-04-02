import type { Proposta } from '@/types';

interface CTASectionProps {
  proposta: Proposta;
}

export function CTASection({ proposta }: CTASectionProps) {
  const validadeDias = proposta.validade_dias || 30;
  const criadoEm = new Date(proposta.created_at);
  const expiraEm = proposta.data_expiracao
    ? new Date(proposta.data_expiracao)
    : new Date(criadoEm.getTime() + validadeDias * 24 * 60 * 60 * 1000);

  const diasRestantes = Math.max(0, Math.ceil((expiraEm.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <section className="relative overflow-hidden px-8 py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c9a96e] opacity-[0.04] blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-3xl text-center">
        <div className="reveal">
          <div className="mb-8 flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#c9a96e]" />
            <div className="h-2 w-2 rotate-45 border border-[#c9a96e]" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#c9a96e]" />
          </div>

          <h2 className="font-display text-4xl font-medium tracking-tight text-[#f1f5f9] md:text-5xl">
            Pronto para <span className="gradient-text italic">transformar</span>
            <br />seu escritório?
          </h2>

          <p className="mx-auto mt-6 max-w-md text-[#8b95a5]">
            Agende uma demonstração e veja como o JusPilot pode acelerar a produtividade do seu time.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="https://wa.me/5561984014175?text=Olá! Vi a proposta do JusPilot e gostaria de agendar uma demonstração."
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#c9a96e] to-[#a08450] px-8 py-4 text-sm font-semibold text-[#0a0f1c] transition-all duration-300 hover:shadow-[0_0_40px_-8px_rgba(201,169,110,0.4)]"
            >
              Agendar demonstração
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-1">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </div>

          {diasRestantes > 0 && (
            <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-[#1e293b] bg-[#141c2e]/60 px-5 py-2.5 backdrop-blur-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-[#c9a96e] animate-pulse-gold" />
              <span className="text-xs tracking-wide text-[#4a5568]">
                Esta proposta é válida por mais <span className="font-medium text-[#8b95a5]">{diasRestantes} dia{diasRestantes !== 1 ? 's' : ''}</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

import type { Proposta } from '@/types';

interface FooterProps {
  proposta: Proposta;
}

export function PropostaFooter({ proposta: _proposta }: FooterProps) {
  return (
    <footer className="bg-[#0a0a0a]">
      <div className="mx-auto max-w-[1100px] px-6 py-14 sm:px-12">
        <div className="flex flex-col items-center gap-6 border-t border-[var(--vt-paper)]/6 pt-14 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col items-center gap-3 sm:items-start">
            <img
              src="/brand/wordmark-light.png"
              alt="Juspilot"
              className="h-7 w-auto opacity-90"
            />
            <span className="text-[12px] tracking-wide text-[var(--vt-mute)]">
              Proposta gerada por JusPilot — Copiloto Jurídico com IA
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 text-[11px] uppercase tracking-[0.06em] text-[var(--vt-graphite)]">
            <a href="https://juspilot.com.br" target="_blank" rel="noopener noreferrer" className="opacity-60 transition-opacity duration-300 hover:opacity-100">
              Site
            </a>
            <a href="https://juspilot.com.br/termos" target="_blank" rel="noopener noreferrer" className="opacity-60 transition-opacity duration-300 hover:opacity-100">
              Termos
            </a>
            <a href="https://juspilot.com.br/privacidade" target="_blank" rel="noopener noreferrer" className="opacity-60 transition-opacity duration-300 hover:opacity-100">
              Privacidade
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

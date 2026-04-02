import type { Proposta } from '@/types';

interface HeaderProps {
  proposta: Proposta;
}

export function PropostaHeader({ proposta }: HeaderProps) {
  const now = new Date();
  const month = now.toLocaleString('pt-BR', { month: 'long' });
  const year = now.getFullYear();

  return (
    <header className="relative z-10 px-8 py-5">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#c9a96e] to-[#a08450]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="font-display text-lg font-medium tracking-wide text-[#f1f5f9]">JusPilot</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#4a5568]">
            {proposta.escritorio_cidade} — {proposta.escritorio_uf}
          </span>
          <span className="h-4 w-px bg-[#1e293b]" />
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#4a5568]">
            {month} {year}
          </span>
        </div>
      </div>
    </header>
  );
}

import type { Proposta } from '@/types';

interface HeaderProps {
  proposta: Proposta;
}

export function PropostaHeader({ proposta }: HeaderProps) {
  const now = new Date();
  const month = now.toLocaleString('pt-BR', { month: 'long' });
  const year = now.getFullYear();

  return (
    <header className="relative z-10 mx-auto max-w-[1100px] px-6 py-9 sm:px-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Brand icon */}
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--vt-brand)]">
            <span className="text-lg font-bold text-white">J</span>
          </div>
          {/* Wordmark */}
          <span className="text-xl font-bold tracking-tight text-[var(--vt-paper)]">
            Juspilot
          </span>
        </div>

        <div className="hidden items-center gap-4 sm:flex">
          <span className="text-xs uppercase tracking-[0.06em] text-[var(--vt-mute)]">
            {proposta.escritorio_cidade} — {proposta.escritorio_uf}
          </span>
          <span className="h-4 w-px bg-[var(--vt-graphite)]" />
          <span className="text-xs uppercase tracking-[0.06em] text-[var(--vt-mute)]">
            {month} {year}
          </span>
        </div>
      </div>
    </header>
  );
}

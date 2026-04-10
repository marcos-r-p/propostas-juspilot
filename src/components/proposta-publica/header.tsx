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
        <div className="flex items-center gap-4">
          {/* Monogram seal */}
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-[1.5px] border-[var(--vt-paper)]/25 transition-[border-color] duration-400 hover:border-[var(--vt-paper)]/60">
            <span className="font-display text-[22px] font-semibold leading-none text-[var(--vt-paper)]">
              J
            </span>
          </div>
          {/* Wordmark */}
          <span className="font-display text-[32px] font-semibold leading-none tracking-[0.05em] text-[var(--vt-paper)]" style={{ fontVariantCaps: 'small-caps' }}>
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

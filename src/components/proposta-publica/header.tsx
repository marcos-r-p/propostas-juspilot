import type { Proposta } from '@/types';

interface HeaderProps {
  proposta: Proposta;
}

function getInitials(nome: string): string {
  return nome
    .split(' ')
    .filter((p) => p.length > 0)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function PropostaHeader({ proposta }: HeaderProps) {
  const now = new Date();
  const month = now.toLocaleString('pt-BR', { month: 'long' });
  const year = now.getFullYear();
  const hasLogo = !!proposta.escritorio_logo_url;

  return (
    <header className="relative z-10">
      {/* Brand Bar (top) */}
      <div className="bg-[var(--vt-brand)]">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-2.5 sm:px-12">
          <div className="flex items-center gap-2">
            <img
              src="/brand/symbol-light.png"
              alt="JusPilot"
              className="h-5 w-5"
            />
            <span className="text-[13px] font-semibold tracking-tight text-white">
              Juspilot
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-[0.14em] text-white/70">
            Proposta Comercial
          </span>
        </div>
      </div>

      {/* Main area (escritório) */}
      <div className="mx-auto max-w-[1100px] px-6 py-7 sm:px-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {hasLogo ? (
              <img
                src={proposta.escritorio_logo_url!}
                alt={`Logo ${proposta.escritorio_nome}`}
                className="max-h-10 object-contain"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[var(--vt-brand)] text-sm font-bold tracking-[0.04em] text-white">
                {getInitials(proposta.escritorio_nome)}
              </div>
            )}
            <div>
              <div className="text-base font-semibold tracking-tight text-[var(--vt-paper)]">
                {proposta.escritorio_nome}
              </div>
              <div className="text-[11px] uppercase tracking-[0.06em] text-[var(--vt-mute)]">
                Advogados — {proposta.escritorio_cidade}, {proposta.escritorio_uf}
              </div>
            </div>
          </div>

          <div className="hidden sm:block">
            <span className="text-[11px] uppercase tracking-[0.06em] text-[var(--vt-mute)]">
              {month} {year}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

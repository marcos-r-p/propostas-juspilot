import type { Proposta } from '@/types';

interface HeaderProps {
  proposta: Proposta;
}

export function PropostaHeader({ proposta }: HeaderProps) {
  const now = new Date();
  const month = now.toLocaleString('pt-BR', { month: 'long' });
  const year = now.getFullYear();

  return (
    <header className="border-b border-[#27272a] px-8 py-6">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <div className="text-lg font-bold text-white">⚖️ JusPilot</div>
        <div className="text-sm text-[#a1a1aa]">
          {proposta.escritorio_cidade}—{proposta.escritorio_uf} · {month} {year}
        </div>
      </div>
    </header>
  );
}

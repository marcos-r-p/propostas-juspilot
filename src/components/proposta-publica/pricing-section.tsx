import type { Proposta } from '@/types';
import { formatCurrency } from '@/lib/utils/format';
import { FEATURES_INCLUIDAS } from '@/lib/constants/precos';

interface PricingSectionProps {
  proposta: Proposta;
}

export function PricingSection({ proposta }: PricingSectionProps) {
  return (
    <section className="reveal px-8 py-16">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-2 text-center text-2xl font-bold text-white">Investimento</h2>
        <p className="mb-10 text-center text-[#a1a1aa]">Tudo incluso, sem surpresas.</p>

        <div className="rounded-xl border border-[#27272a] bg-[#18181b] p-8">
          <div className="mb-6 flex items-baseline justify-between border-b border-[#27272a] pb-6">
            <div>
              <div className="text-sm text-[#a1a1aa]">Setup (implementação)</div>
              <div className="text-2xl font-bold text-white">{formatCurrency(proposta.preco_setup)}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-[#a1a1aa]">Mensalidade</div>
              <div className="text-3xl font-bold text-white">{formatCurrency(proposta.preco_mensalidade_final)}<span className="text-base font-normal text-[#a1a1aa]">/mês</span></div>
            </div>
          </div>

          <div className="mb-4 text-sm text-[#a1a1aa]">
            {proposta.preco_usuarios_inclusos} usuários inclusos
            {proposta.preco_desconto > 0 && ` · ${proposta.preco_desconto}% de desconto aplicado`}
          </div>

          <ul className="space-y-2">
            {FEATURES_INCLUIDAS.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-[#a1a1aa]">
                <span className="text-white">✓</span> {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

import type { Proposta } from '@/types';
import { formatCurrency } from '@/lib/utils/format';
import { FEATURES_INCLUIDAS } from '@/lib/constants/precos';

interface PricingSectionProps {
  proposta: Proposta;
}

export function PricingSection({ proposta }: PricingSectionProps) {
  return (
    <section className="relative overflow-hidden px-8 py-24">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0a0f1c] via-[#111827] to-[#0a0f1c]" />
      <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2">
        <div className="h-[400px] w-[400px] rounded-full bg-[#c9a96e] opacity-[0.04] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-4xl">
        <div className="reveal mb-16 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c9a96e]">Investimento</span>
          <h2 className="font-display mt-3 text-3xl font-medium tracking-tight text-[#f1f5f9] md:text-4xl">
            Valores transparentes
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[#8b95a5]">
            Tudo incluso, sem surpresas. Cancele quando quiser.
          </p>
        </div>

        <div className="reveal gold-glow rounded-2xl border border-[#c9a96e]/20 bg-[#141c2e]/80 backdrop-blur-sm">
          {/* Price header */}
          <div className="border-b border-[#1e293b] p-10">
            <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4a5568]">Implementação</div>
                <div className="font-display mt-2 text-3xl font-medium text-[#f1f5f9]">{formatCurrency(proposta.preco_setup)}</div>
                <div className="mt-1 text-xs text-[#4a5568]">pagamento único</div>
              </div>

              <div className="hidden h-16 w-px bg-[#1e293b] md:block" />

              <div className="text-center md:text-right">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4a5568]">Mensalidade</div>
                <div className="mt-2 flex items-baseline justify-center gap-1 md:justify-end">
                  <span className="font-display text-5xl font-medium gradient-text">{formatCurrency(proposta.preco_mensalidade_final)}</span>
                  <span className="text-base text-[#4a5568]">/mês</span>
                </div>
                <div className="mt-1 text-xs text-[#4a5568]">
                  {proposta.preco_usuarios_inclusos} usuários inclusos
                  {proposta.preco_desconto > 0 && (
                    <span className="ml-2 inline-flex rounded-full bg-[#c9a96e]/10 px-2 py-0.5 text-[10px] font-semibold text-[#c9a96e]">
                      -{proposta.preco_desconto}% desconto
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="p-10">
            <div className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#4a5568]">Incluso no plano</div>
            <div className="grid gap-3 md:grid-cols-2">
              {FEATURES_INCLUIDAS.map((f) => (
                <div key={f} className="flex items-center gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#c9a96e]/10">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span className="text-sm text-[#8b95a5]">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="section-divider relative mx-auto mt-24 max-w-6xl" />
    </section>
  );
}

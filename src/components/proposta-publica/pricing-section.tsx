'use client';

import type { Proposta, PrecoFaixa } from '@/types';
import { formatCurrency } from '@/lib/utils/format';
import { FEATURES_INCLUIDAS } from '@/lib/constants/precos';
import { useReveal } from '@/hooks/use-reveal';

interface PricingSectionProps {
  proposta: Proposta;
}

function FaixasTimeline({ faixas, desconto }: { faixas: PrecoFaixa[]; desconto: number }) {
  const reveal = useReveal();
  const ultimaFaixa = faixas[faixas.length - 1];
  const valorCheio = ultimaFaixa.valor;

  // Calculate savings across promotional tiers
  let economia = 0;
  let mesesPromo = 0;
  for (const faixa of faixas) {
    if (faixa.ate_mes === null) break;
    const meses = faixa.ate_mes - faixa.de_mes + 1;
    economia += (valorCheio - faixa.valor) * meses;
    mesesPromo += meses;
  }

  return (
    <div
      ref={reveal.ref}
      className={`vt-reveal ${reveal.isVisible ? 'visible' : ''} mb-12 border-b border-[var(--vt-paper)]/8 pb-12`}
      style={{ transitionDelay: '0.15s' }}
    >
      <div className="mb-2 text-[11px] uppercase tracking-[0.14em] text-[var(--vt-mute)]">
        Condição especial de adoção
      </div>
      {economia > 0 && (
        <div className="mb-6 text-sm text-[var(--vt-whisper)]">
          Economia de {formatCurrency(economia)} nos primeiros {mesesPromo} meses
        </div>
      )}

      <div className="relative flex items-start gap-0">
        {/* Timeline line */}
        <div className="absolute left-0 right-0 top-5 h-px bg-[var(--vt-paper)]/10" />

        {faixas.map((faixa, i) => {
          const isLast = i === faixas.length - 1;
          const valorComDesconto = Math.round(faixa.valor * (1 - desconto / 100));

          return (
            <div key={i} className="relative flex-1 text-center">
              {/* Dot */}
              <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--vt-brand)] bg-[var(--vt-ink)]">
                <span className="text-xs font-bold text-[var(--vt-brand)]">{i + 1}</span>
              </div>
              {/* Value */}
              <div className="text-lg font-extrabold text-[var(--vt-paper)]">
                {formatCurrency(valorComDesconto)}
                <span className="text-xs font-normal text-[var(--vt-whisper)]">/mês</span>
              </div>
              {/* Period */}
              <div className="mt-1 text-[11px] uppercase tracking-[0.08em] text-[var(--vt-mute)]">
                {isLast
                  ? `Mês ${faixa.de_mes} em diante`
                  : `Mês ${faixa.de_mes}${faixa.ate_mes !== faixa.de_mes ? `–${faixa.ate_mes}` : ''}`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PricingSection({ proposta }: PricingSectionProps) {
  const label = useReveal();
  const title = useReveal();
  const card = useReveal();

  const criadoEm = new Date(proposta.created_at);
  const validadeDias = proposta.validade_dias || 30;
  const expiraEm = proposta.data_expiracao
    ? new Date(proposta.data_expiracao)
    : new Date(criadoEm.getTime() + validadeDias * 24 * 60 * 60 * 1000);

  const dataValidade = expiraEm.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const hasFaixas = proposta.preco_faixas && proposta.preco_faixas.length > 0;
  const whatsapp = proposta.consultor_whatsapp || '5561984014175';

  // Per-attorney cost
  const custoAdv = proposta.escritorio_qtd_advogados > 0
    ? Math.round(proposta.preco_mensalidade_final / proposta.escritorio_qtd_advogados)
    : null;

  return (
    <section id="investimento" className="mx-auto max-w-[1100px] px-6 py-24 sm:px-12">
      <div
        ref={label.ref}
        className={`vt-reveal ${label.isVisible ? 'visible' : ''} mb-3.5 flex items-center gap-4 text-[11px] uppercase tracking-[0.14em] text-[var(--vt-mute)]`}
      >
        <span className="h-px w-6 bg-[var(--vt-brand)]" />
        Investimento
      </div>
      <div
        ref={title.ref}
        className={`vt-reveal ${title.isVisible ? 'visible' : ''} mb-14 text-4xl font-extrabold leading-[1.12] text-[var(--vt-paper)]`}
        style={{ transitionDelay: '0.1s' }}
      >
        Seu plano sob medida
      </div>

      <div
        ref={card.ref}
        className={`vt-reveal ${card.isVisible ? 'visible' : ''} relative overflow-hidden border border-[var(--vt-graphite)] p-14 transition-[border-color] duration-400 hover:border-[var(--vt-mute)]`}
        style={{ transitionDelay: '0.2s' }}
      >
        {/* Top gradient line */}
        <div className="absolute left-0 top-0 h-[2px] w-full bg-gradient-to-r from-transparent via-[var(--vt-paper)]/15 to-transparent" />

        {/* Faixas timeline (conditional) */}
        {hasFaixas && (
          <FaixasTimeline faixas={proposta.preco_faixas!} desconto={proposta.preco_desconto} />
        )}

        {/* Pricing blocks */}
        <div className="flex flex-col items-start justify-between gap-8 border-b border-[var(--vt-paper)]/8 pb-12 md:flex-row">
          <div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--vt-mute)]">Setup único</div>
            <div className="mt-2.5 text-[44px] font-extrabold leading-[1.1] text-[var(--vt-paper)]">
              {formatCurrency(proposta.preco_setup)}
            </div>
            <div className="mt-1.5 text-[13px] text-[var(--vt-mute)]">Cobrado na assinatura</div>
          </div>

          <div className="hidden h-auto w-px self-stretch bg-[var(--vt-paper)]/8 md:block" />

          <div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--vt-mute)]">
              Mensalidade
            </div>
            <div className="mt-2.5 text-[44px] font-extrabold leading-[1.1] text-[var(--vt-paper)]">
              {formatCurrency(proposta.preco_mensalidade_final)}
              <span className="ml-1 text-base font-normal text-[var(--vt-whisper)]">/mês</span>
            </div>
            {custoAdv && (
              <div className="mt-1.5 text-[13px] text-[var(--vt-mute)]">
                ≈ {formatCurrency(custoAdv)} por advogado/mês para {proposta.escritorio_qtd_advogados} advogados
              </div>
            )}
            {proposta.preco_desconto > 0 && (
              <div className="mt-2.5 text-[11px] uppercase tracking-[0.08em] text-[var(--vt-brand)]">
                {proposta.preco_desconto}% de desconto aplicado
              </div>
            )}
          </div>
        </div>

        {/* Feature checklist */}
        <div className="grid gap-4 py-12 sm:grid-cols-2 sm:gap-x-10">
          {FEATURES_INCLUIDAS.map((f) => (
            <div key={f} className="flex items-center gap-3 border-b border-[var(--vt-paper)]/5 py-2 text-sm text-[var(--vt-whisper)] transition-colors duration-300 hover:text-[var(--vt-paper)]">
              <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border-[1.5px] border-[var(--vt-brand)]">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
              {f}
            </div>
          ))}
        </div>

        {/* CTA row */}
        <div className="flex flex-col items-start gap-6 border-t border-[var(--vt-paper)]/8 pt-12 sm:flex-row sm:items-center">
          <a
            href={`https://wa.me/${whatsapp}?text=Olá! Vi a proposta do JusPilot para ${proposta.escritorio_nome} e gostaria de agendar uma conversa.`}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-xl bg-[var(--vt-brand)] px-8 py-4 text-sm font-bold tracking-[0.02em] text-white"
          >
            <span className="relative z-10 transition-colors duration-300">Agendar conversa</span>
            <span className="relative z-10 transition-[color,transform] duration-300 group-hover:translate-x-1">&#8594;</span>
            <span className="absolute inset-0 z-0 translate-y-full bg-[var(--vt-brand-hover)] transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
          </a>

          <a href="#" className="group relative pb-0.5 text-sm text-[var(--vt-whisper)] transition-colors duration-300 hover:text-[var(--vt-paper)]">
            Baixar proposta em PDF
            <span className="absolute bottom-0 left-0 h-px w-full bg-[var(--vt-graphite)] transition-[background] duration-300 group-hover:bg-[var(--vt-paper)]" />
          </a>

          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] text-[var(--vt-mute)] sm:ml-auto">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--vt-brand)]" />
            Válida até {dataValidade}
          </div>
        </div>
      </div>
    </section>
  );
}

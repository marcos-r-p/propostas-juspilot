'use client';

import type { Proposta } from '@/types';
import { useReveal } from '@/hooks/use-reveal';
import { useCounter } from '@/hooks/use-counter';
import { deriveProfile } from '@/lib/utils/proposta-profile';

interface ROISectionProps {
  proposta: Proposta;
}

function ROICard({
  target,
  unit,
  label,
  decimals = 0,
  prefix = '',
  index,
}: {
  target: number;
  unit: string;
  label: string;
  decimals?: number;
  prefix?: string;
  index: number;
}) {
  const { ref, isVisible } = useReveal();
  const value = useCounter(target, { enabled: isVisible, decimals });

  return (
    <div
      ref={ref}
      className={`vt-reveal ${isVisible ? 'visible' : ''} group relative overflow-hidden bg-[var(--vt-ink)] px-9 py-14 text-center transition-[background] duration-300 hover:bg-[var(--vt-ink-soft)]`}
      style={{ transitionDelay: `${index * 0.08}s` }}
    >
      <div className="absolute bottom-0 left-1/2 h-[2px] w-0 -translate-x-1/2 bg-[var(--vt-brand)] transition-[width] duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-3/5" />

      <div className="text-[60px] font-extrabold leading-none text-[var(--vt-paper)]" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {prefix}
        {decimals > 0 ? value.toFixed(decimals) : value}
        <span className="text-2xl font-normal text-[var(--vt-whisper)]">{unit}</span>
      </div>
      <div
        className="mt-3.5 text-[13px] leading-[1.4] text-[var(--vt-mute)]"
        dangerouslySetInnerHTML={{ __html: label.replace('\n', '<br/>') }}
      />
    </div>
  );
}

function CompareBar({ mensalidade, valorGerado }: { mensalidade: number; valorGerado: number }) {
  const { ref, isVisible } = useReveal();
  const total = mensalidade + valorGerado;
  const mensalidadePct = total > 0 ? (mensalidade / total) * 100 : 0;
  const valorPct = total > 0 ? (valorGerado / total) * 100 : 0;

  return (
    <div ref={ref} className={`vt-reveal ${isVisible ? 'visible' : ''} mt-12`} style={{ transitionDelay: '0.3s' }}>
      <div className="mb-3 flex items-center justify-between text-[12px] uppercase tracking-[0.08em] text-[var(--vt-mute)]">
        <span>Mensalidade</span>
        <span>Valor gerado</span>
      </div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-[var(--vt-graphite)]">
        <div
          className="h-full bg-[var(--vt-graphite)] transition-[width] duration-1000 ease-out"
          style={{ width: isVisible ? `${mensalidadePct}%` : '0%' }}
        />
        <div
          className="h-full bg-[var(--vt-brand)] transition-[width] duration-1000 ease-out"
          style={{ width: isVisible ? `${valorPct}%` : '0%', transitionDelay: '0.2s' }}
        />
      </div>
      <div className="mt-3 flex items-center justify-between text-sm text-[var(--vt-whisper)]" style={{ fontVariantNumeric: 'tabular-nums' }}>
        <span>R$ {mensalidade.toLocaleString('pt-BR')}</span>
        <span className="font-semibold text-[var(--vt-paper)]">R$ {valorGerado.toLocaleString('pt-BR')}</span>
      </div>
    </div>
  );
}

export function ROISection({ proposta }: ROISectionProps) {
  const profile = deriveProfile(proposta);
  const label = useReveal();
  const title = useReveal();
  const anchor = useReveal();

  const valorGerado = proposta.roi_valor_gerado || 0;
  const mensalidade = proposta.preco_mensalidade_final || proposta.preco_mensalidade || 0;
  const multiplo = Number(proposta.roi_multiplo) || 0;

  return (
    <section id="numeros" className="mx-auto max-w-[1100px] px-6 py-24 sm:px-12">
      <div
        ref={label.ref}
        className={`vt-reveal ${label.isVisible ? 'visible' : ''} mb-3.5 flex items-center gap-4 text-[11px] uppercase tracking-[0.14em] text-[var(--vt-mute)]`}
      >
        <span className="h-px w-6 bg-[var(--vt-brand)]" />
        Retorno sobre investimento
      </div>
      <div
        ref={title.ref}
        className={`vt-reveal ${title.isVisible ? 'visible' : ''} mb-14 text-4xl font-extrabold leading-[1.12] text-[var(--vt-paper)]`}
        style={{ transitionDelay: '0.1s' }}
      >
        {profile.roiTitle}
      </div>

      <div className="mosaic-grid mb-2 grid-cols-1 sm:grid-cols-3">
        <ROICard
          target={proposta.roi_horas_economizadas_total || 0}
          unit="h"
          label={`Horas economizadas\npor mês`}
          index={0}
        />
        <ROICard
          target={Math.round(valorGerado / 1000)}
          unit="mil"
          label={`Valor gerado\npor mês`}
          prefix="R$"
          index={1}
        />
        <ROICard target={multiplo} unit="x" label={`Retorno sobre\ninvestimento`} decimals={1} index={2} />
      </div>

      <CompareBar mensalidade={mensalidade} valorGerado={valorGerado} />

      <p
        ref={anchor.ref}
        className={`vt-reveal ${anchor.isVisible ? 'visible' : ''} mt-10 text-center text-base text-[var(--vt-whisper)]`}
        style={{ transitionDelay: '0.4s' }}
      >
        Para cada R$ 1 investido, seu escritório recupera{' '}
        <span className="font-semibold text-[var(--vt-paper)]">R$ {multiplo.toFixed(1)}</span> em produtividade.
      </p>
    </section>
  );
}

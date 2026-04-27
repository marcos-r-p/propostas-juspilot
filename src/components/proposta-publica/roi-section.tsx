'use client';

import type { Proposta } from '@/types';
import { useReveal } from '@/hooks/use-reveal';
import { useCounter } from '@/hooks/use-counter';

interface ROISectionProps {
  proposta: Proposta;
}

function ROICard({ target, unit, label, decimals = 0, prefix = '', index }: {
  target: number; unit: string; label: string; decimals?: number; prefix?: string; index: number;
}) {
  const { ref, isVisible } = useReveal();
  const value = useCounter(target, { enabled: isVisible, decimals });

  return (
    <div
      ref={ref}
      className={`vt-reveal ${isVisible ? 'visible' : ''} group relative overflow-hidden bg-[var(--vt-ink)] px-9 py-14 text-center transition-[background] duration-300 hover:bg-[var(--vt-ink-soft)]`}
      style={{ transitionDelay: `${index * 0.08}s` }}
    >
      {/* Bottom accent line on hover */}
      <div className="absolute bottom-0 left-1/2 h-[2px] w-0 -translate-x-1/2 bg-[var(--vt-brand)] transition-[width] duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-3/5" />

      <div className="text-[60px] font-extrabold leading-none text-[var(--vt-paper)]" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {prefix}{decimals > 0 ? value.toFixed(decimals) : value}
        <span className="text-2xl font-normal text-[var(--vt-whisper)]">{unit}</span>
      </div>
      <div className="mt-3.5 text-[13px] leading-[1.4] text-[var(--vt-mute)]" dangerouslySetInnerHTML={{ __html: label.replace('\n', '<br/>') }} />
    </div>
  );
}

export function ROISection({ proposta }: ROISectionProps) {
  const label = useReveal();
  const title = useReveal();

  return (
    <section id="numeros" className="mx-auto max-w-[1100px] px-6 py-24 sm:px-12">
      <div
        ref={label.ref}
        className={`vt-reveal ${label.isVisible ? 'visible' : ''} mb-3.5 flex items-center gap-4 text-[11px] uppercase tracking-[0.14em] text-[var(--vt-mute)]`}
      >
        <span className="h-px w-6 bg-[var(--vt-brand)]" />
        Os números
      </div>
      <div
        ref={title.ref}
        className={`vt-reveal ${title.isVisible ? 'visible' : ''} mb-14 text-4xl font-extrabold leading-[1.12] text-[var(--vt-paper)]`}
        style={{ transitionDelay: '0.1s' }}
      >
        O retorno do seu investimento
      </div>

      <div className="mosaic-grid mb-18 grid-cols-1 sm:grid-cols-3">
        <ROICard target={proposta.roi_horas_economizadas_total || 0} unit="h" label={`Horas economizadas\npor mês`} index={0} />
        <ROICard target={Math.round((proposta.roi_valor_gerado || 0) / 1000)} unit="mil" label={`Valor gerado\npor mês`} prefix="R$" index={1} />
        <ROICard target={Number(proposta.roi_multiplo) || 0} unit="x" label={`Retorno sobre\ninvestimento`} decimals={1} index={2} />
      </div>
    </section>
  );
}

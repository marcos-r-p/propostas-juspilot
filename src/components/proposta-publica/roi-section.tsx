'use client';

import { useEffect, useRef, useState } from 'react';
import type { Proposta } from '@/types';

interface ROISectionProps {
  proposta: Proposta;
}

function AnimatedCounter({ target, prefix, suffix }: { target: number; prefix?: string; suffix?: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const duration = 2000;
          const start = performance.now();
          function animate(now: number) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            setValue(Math.round(target * eased));
            if (progress < 1) requestAnimationFrame(animate);
          }
          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="font-display text-3xl font-medium tabular-nums tracking-tight text-[#f1f5f9] sm:text-5xl md:text-6xl">
      {prefix}<span className="gradient-text">{value.toLocaleString('pt-BR')}</span>{suffix}
    </div>
  );
}

export function ROISection({ proposta }: ROISectionProps) {
  const stats = [
    {
      target: proposta.roi_horas_economizadas_total || 0,
      suffix: 'h',
      label: 'Horas economizadas por mês',
      sublabel: `${proposta.roi_horas_economizadas_por_adv || 0}h por advogado`,
    },
    {
      target: proposta.roi_valor_gerado || 0,
      prefix: 'R$ ',
      label: 'Valor gerado por mês',
      sublabel: 'em horas liberadas para atividades estratégicas',
    },
    {
      target: Number(proposta.roi_multiplo) || 0,
      suffix: 'x',
      label: 'Retorno sobre investimento',
      sublabel: `${proposta.roi_percentual || 0}% de ROI mensal`,
    },
  ];

  return (
    <section className="relative overflow-hidden px-4 py-14 sm:px-8 sm:py-24">
      {/* Background accent */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0a0f1c] via-[#111827] to-[#0a0f1c]" />
      <div className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2">
        <div className="h-[300px] w-[300px] rounded-full bg-[#c9a96e] opacity-[0.03] blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="reveal mb-16 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c9a96e]">Projeção</span>
          <h2 className="font-display mt-3 text-3xl font-medium tracking-tight text-[#f1f5f9] md:text-4xl">
            Retorno do investimento
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[#8b95a5]">
            Estimativa conservadora baseada no perfil do seu escritório.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`reveal reveal-delay-${i + 1} gold-glow rounded-xl border border-[#1e293b] bg-[#141c2e]/80 p-6 text-center backdrop-blur-sm sm:rounded-2xl sm:p-10`}
            >
              <AnimatedCounter target={stat.target} prefix={stat.prefix} suffix={stat.suffix} />
              <div className="mt-4 text-sm font-medium text-[#f1f5f9]">{stat.label}</div>
              <div className="mt-1 text-xs text-[#4a5568]">{stat.sublabel}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="section-divider relative mx-auto mt-24 max-w-6xl" />
    </section>
  );
}

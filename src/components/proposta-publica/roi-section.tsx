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
          const duration = 1500;
          const start = performance.now();
          function animate(now: number) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
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
    <div ref={ref} className="text-4xl font-bold tabular-nums text-white">
      {prefix}{value.toLocaleString('pt-BR')}{suffix}
    </div>
  );
}

export function ROISection({ proposta }: ROISectionProps) {
  return (
    <section className="reveal px-8 py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-2 text-2xl font-bold text-white">Retorno do Investimento</h2>
        <p className="mb-10 text-[#a1a1aa]">Estimativa baseada no perfil do escritório.</p>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-[#27272a] bg-[#18181b] p-6 text-center">
            <AnimatedCounter target={proposta.roi_horas_economizadas_total || 0} suffix="h" />
            <div className="mt-2 text-sm text-[#a1a1aa]">Horas economizadas/mês</div>
          </div>
          <div className="rounded-lg border border-[#27272a] bg-[#18181b] p-6 text-center">
            <AnimatedCounter target={proposta.roi_valor_gerado || 0} prefix="R$ " />
            <div className="mt-2 text-sm text-[#a1a1aa]">Valor gerado/mês</div>
          </div>
          <div className="rounded-lg border border-[#27272a] bg-[#18181b] p-6 text-center">
            <div className="text-4xl font-bold text-white">{proposta.roi_multiplo}x</div>
            <div className="mt-2 text-sm text-[#a1a1aa]">ROI sobre investimento</div>
          </div>
        </div>
      </div>
    </section>
  );
}

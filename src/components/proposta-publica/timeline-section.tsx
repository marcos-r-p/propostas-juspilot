'use client';

import { useReveal } from '@/hooks/use-reveal';

const STEPS = [
  { number: '01', title: 'Onboarding', period: 'Dia 1 — 7', description: 'Configuração da conta, importação de dados e treinamento da equipe.' },
  { number: '02', title: 'Calibração', period: 'Dia 8 — 21', description: 'Ajuste dos agentes de IA ao perfil do escritório e validação com casos reais.' },
  { number: '03', title: 'Operação plena', period: 'Dia 22 — 30', description: 'Equipe operando de forma autônoma com acompanhamento do time JusPilot.' },
];

function TimelineStep({ step, index }: { step: typeof STEPS[number]; index: number }) {
  const { ref, isVisible } = useReveal();

  return (
    <div
      ref={ref}
      className={`vt-reveal ${isVisible ? 'visible' : ''} group relative flex-1 bg-[var(--vt-ink)] p-9 transition-[background] duration-300 hover:bg-[var(--vt-ink-soft)]`}
      style={{ transitionDelay: `${index * 0.08}s` }}
    >
      {/* Top accent line on hover */}
      <div className="absolute left-0 top-0 h-[2px] w-0 bg-[var(--vt-paper)] transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full" />

      <div className="mb-5 font-display text-[52px] font-semibold leading-none text-[var(--vt-paper)]/6 transition-colors duration-400 group-hover:text-[var(--vt-paper)]/16">
        {step.number}
      </div>
      <div className="text-base font-semibold text-[var(--vt-paper)]">{step.title}</div>
      <div className="mt-1.5 text-[11px] uppercase tracking-[0.08em] text-[var(--vt-mute)]">{step.period}</div>
      <div className="mt-3.5 text-[13px] leading-[1.55] text-[var(--vt-whisper)]">{step.description}</div>
    </div>
  );
}

export function TimelineSection() {
  const label = useReveal();
  const title = useReveal();

  return (
    <section id="implantacao" className="mx-auto max-w-[1100px] px-6 py-24 sm:px-12">
      <div
        ref={label.ref}
        className={`vt-reveal ${label.isVisible ? 'visible' : ''} mb-3.5 flex items-center gap-4 text-[11px] uppercase tracking-[0.14em] text-[var(--vt-mute)]`}
      >
        <span className="h-px w-6 bg-[var(--vt-graphite)]" />
        Implantação
      </div>
      <div
        ref={title.ref}
        className={`vt-reveal ${title.isVisible ? 'visible' : ''} mb-14 font-display text-4xl font-semibold leading-[1.12] text-[var(--vt-paper)]`}
        style={{ transitionDelay: '0.1s' }}
      >
        Do contrato ao primeiro resultado
      </div>

      <div className="mosaic-grid flex flex-col sm:flex-row">
        {STEPS.map((step, i) => (
          <TimelineStep key={step.number} step={step} index={i} />
        ))}
      </div>
    </section>
  );
}

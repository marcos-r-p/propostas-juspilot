'use client';

import type { Proposta } from '@/types';
import { useReveal } from '@/hooks/use-reveal';
import { deriveProfile } from '@/lib/utils/proposta-profile';

interface TimelineSectionProps {
  proposta: Proposta;
}

const STEPS = [
  { number: '01', title: 'Onboarding técnico', period: 'Dia 1 — 15', description: 'Configuração da conta, importação de dados, integração com ferramentas existentes e treinamento inicial da equipe.' },
  { number: '02', title: 'Calibração e treinamento', period: 'Dia 16 — 45', description: 'Ajuste fino dos agentes de IA com minutas históricas, validação por área de atuação e treinamento avançado.' },
  { number: '03', title: 'Adoção plena', period: 'Dia 46 — 90', description: 'Expansão progressiva por área de atuação, business review mensal com Customer Success dedicado.' },
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
      <div className="absolute left-0 top-0 h-[2px] w-0 bg-[var(--vt-brand)] transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full" />

      <div className="mb-5 text-[52px] font-extrabold leading-none text-[var(--vt-brand)]/15 transition-colors duration-400 group-hover:text-[var(--vt-brand)]/30">
        {step.number}
      </div>
      <div className="text-base font-semibold text-[var(--vt-paper)]">{step.title}</div>
      <div className="mt-1.5 text-[11px] uppercase tracking-[0.08em] text-[var(--vt-mute)]">{step.period}</div>
      <div className="mt-3.5 text-[13px] leading-[1.55] text-[var(--vt-whisper)]">{step.description}</div>
    </div>
  );
}

export function TimelineSection({ proposta }: TimelineSectionProps) {
  const profile = deriveProfile(proposta);
  const label = useReveal();
  const title = useReveal();

  return (
    <section id="implantacao" className="mx-auto max-w-[1100px] px-6 py-24 sm:px-12">
      <div
        ref={label.ref}
        className={`vt-reveal ${label.isVisible ? 'visible' : ''} mb-3.5 flex items-center gap-4 text-[11px] uppercase tracking-[0.14em] text-[var(--vt-mute)]`}
      >
        <span className="h-px w-6 bg-[var(--vt-brand)]" />
        Implantação
      </div>
      <div
        ref={title.ref}
        className={`vt-reveal ${title.isVisible ? 'visible' : ''} mb-14 text-4xl font-extrabold leading-[1.12] text-[var(--vt-paper)]`}
        style={{ transitionDelay: '0.1s' }}
      >
        {profile.timelineTitle}
      </div>

      <div className="mosaic-grid flex flex-col sm:flex-row">
        {STEPS.map((step, i) => (
          <TimelineStep key={step.number} step={step} index={i} />
        ))}
      </div>
    </section>
  );
}

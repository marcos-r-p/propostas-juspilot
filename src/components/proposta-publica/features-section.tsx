'use client';

import { useReveal } from '@/hooks/use-reveal';

const FEATURES = [
  {
    title: 'IA Jurídica',
    description: 'Minutas, petições e contratos gerados com contexto do caso.',
    detail: 'Gere minutas, petições e contratos com IA treinada em jurisprudência brasileira.',
    iconPath: 'M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93V12h3.75a2.5 2.5 0 0 1 2.5 2.5V16a4 4 0 1 1-2 0v-1.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5V16a4 4 0 1 1-2 0v-1.5A2.5 2.5 0 0 1 7.5 12h3.75V9.93A4 4 0 0 1 12 2Z',
  },
  {
    title: 'Base de Conhecimento',
    description: 'Documentos indexados e pesquisáveis com IA.',
    detail: 'Indexe documentos do escritório e encontre qualquer informação com busca semântica.',
    iconPath: 'M11 11m-8 0a8 8 0 1 0 16 0a8 8 0 1 0-16 0 M21 21l-4.35-4.35',
  },
  {
    title: 'Gestão de Casos',
    description: 'Prazos, tarefas e andamentos centralizados.',
    detail: 'Centralize prazos, tarefas e andamentos processuais em uma única interface.',
    iconPath: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  },
  {
    title: 'Workflows',
    description: 'Automação de rotinas com agentes inteligentes.',
    detail: 'Automatize rotinas repetitivas com agentes inteligentes configurados para o seu fluxo.',
    iconPath: 'M16 3l5 0 0 5 M4 20l17-17 M21 16l0 5-5 0 M15 15l6 6 M4 4l5 5',
  },
  {
    title: 'CRM Jurídico',
    description: 'Clientes, captação e relacionamento em um só lugar.',
    detail: 'Gerencie clientes, captação e relacionamento com visão completa do ciclo de vida.',
    iconPath: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0 M19 8v6 M22 11h-6',
  },
  {
    title: 'Jurisprudência',
    description: 'Base curada do STF, STJ, TJs e TST com alertas.',
    detail: 'Acesse jurisprudência do STF, STJ, TJs e TST com alertas de mudança de entendimento.',
    iconPath: 'M12 2L2 7l10 5 10-5-10-5Z M2 17l10 5 10-5 M2 12l10 5 10-5',
  },
];

function FeatureCell({ feature, index }: { feature: typeof FEATURES[number]; index: number }) {
  const { ref, isVisible } = useReveal();

  return (
    <div
      ref={ref}
      className={`vt-reveal ${isVisible ? 'visible' : ''} group relative flex items-start gap-4 bg-[var(--vt-ink)] p-8 transition-[background] duration-300 hover:bg-[var(--vt-ink-soft)]`}
      style={{ transitionDelay: `${index * 0.08}s` }}
    >
      {/* Tooltip */}
      <div className="pointer-events-none absolute bottom-[calc(100%+8px)] left-8 right-8 z-10 translate-y-1 border border-[var(--vt-graphite)] bg-[var(--vt-ink-soft)] px-4 py-3 text-xs leading-[1.5] text-[var(--vt-whisper)] opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        {feature.detail}
      </div>

      {/* Icon */}
      <div className="mt-0.5 shrink-0 text-[var(--vt-graphite)] transition-colors duration-300 group-hover:text-[var(--vt-whisper)]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d={feature.iconPath} />
        </svg>
      </div>

      <div>
        <div className="text-sm font-semibold text-[var(--vt-paper)]">{feature.title}</div>
        <div className="mt-1.5 text-[13px] leading-[1.5] text-[var(--vt-mute)]">{feature.description}</div>
      </div>
    </div>
  );
}

export function FeaturesSection() {
  const label = useReveal();

  return (
    <div className="mx-auto max-w-[1100px] px-6 sm:px-12">
      <div
        ref={label.ref}
        className={`vt-reveal ${label.isVisible ? 'visible' : ''} mb-6 flex items-center gap-4 text-[11px] uppercase tracking-[0.14em] text-[var(--vt-mute)]`}
      >
        <span className="h-px w-6 bg-[var(--vt-graphite)]" />
        A plataforma
      </div>
      <div className="mosaic-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <FeatureCell key={f.title} feature={f} index={i} />
        ))}
      </div>
    </div>
  );
}

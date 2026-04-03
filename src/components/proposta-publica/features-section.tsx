const FEATURES = [
  {
    title: 'IA Jurídica',
    description: 'Geração de peças, análise de documentos e pesquisa com IA multimodelo.',
    icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  },
  {
    title: 'Base de Conhecimento',
    description: 'A IA aprende o estilo do escritório. Suas peças viram referência.',
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  },
  {
    title: 'Gestão de Casos',
    description: 'Kanban, prazos com SLA, atribuição de responsáveis e alertas.',
    icon: 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2',
  },
  {
    title: 'Workflows',
    description: 'Automações no-code para alertas, follow-ups e comunicações.',
    icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  },
  {
    title: 'CRM Jurídico',
    description: 'Gestão de clientes com timeline de interações e insights por IA.',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  },
  {
    title: 'Jurisprudência',
    description: 'Acesso a 30.969+ jurisprudências curadas do STF, STJ e tribunais.',
    icon: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3',
  },
];

export function FeaturesSection() {
  return (
    <section className="px-4 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="reveal mb-16 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c9a96e]">Plataforma</span>
          <h2 className="font-display mt-3 text-3xl font-medium tracking-tight text-[#f1f5f9] md:text-4xl">
            Tudo em um só lugar
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[#8b95a5]">
            Cada módulo foi desenhado para a rotina jurídica. Sem adaptações, sem gambiarras.
          </p>
        </div>

        <div className="grid gap-px overflow-hidden rounded-xl border border-[#1e293b] bg-[#1e293b] sm:rounded-2xl md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={`reveal reveal-delay-${Math.min(i + 1, 4)} group bg-[#141c2e]/80 p-8 transition-colors duration-500 hover:bg-[#1a2440]`}
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-[#1e293b] bg-[#0a0f1c] transition-colors duration-500 group-hover:border-[#c9a96e]/30">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-500 group-hover:scale-110">
                  <path d={f.icon} />
                </svg>
              </div>
              <h3 className="mb-2 text-base font-semibold text-[#f1f5f9]">{f.title}</h3>
              <p className="text-sm leading-relaxed text-[#8b95a5]">{f.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="section-divider mx-auto mt-20 max-w-6xl" />
    </section>
  );
}

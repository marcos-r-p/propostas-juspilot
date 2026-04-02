const FEATURES = [
  { icon: '🤖', title: 'IA Jurídica', description: 'Geração de peças, análise de documentos e pesquisa com IA multimodelo.' },
  { icon: '📚', title: 'Base de Conhecimento', description: 'A IA aprende o estilo do escritório. Suas peças viram referência.' },
  { icon: '📋', title: 'Gestão de Casos', description: 'Kanban, prazos com SLA, atribuição de responsáveis e alertas.' },
  { icon: '⚡', title: 'Workflows', description: 'Automações no-code para alertas, follow-ups e comunicações.' },
  { icon: '👥', title: 'CRM Jurídico', description: 'Gestão de clientes com timeline de interações e insights por IA.' },
  { icon: '🔍', title: 'Jurisprudência', description: 'Acesso a 30.969+ jurisprudências curadas do STF, STJ e tribunais.' },
];

export function FeaturesSection() {
  return (
    <section className="reveal px-8 py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-2 text-2xl font-bold text-white">Plataforma Completa</h2>
        <p className="mb-10 text-[#a1a1aa]">Tudo que seu escritório precisa em um só lugar.</p>

        <div className="grid gap-4 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-lg border border-[#27272a] bg-[#18181b] p-5 transition-colors hover:border-[#3f3f46]"
            >
              <div className="mb-3 text-2xl">{f.icon}</div>
              <h3 className="mb-1 font-semibold text-white">{f.title}</h3>
              <p className="text-sm text-[#a1a1aa]">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  { step: 1, title: 'Assinatura', description: 'Formalização do contrato e pagamento do setup.' },
  { step: 2, title: 'Onboarding', description: 'Configuração da plataforma e migração de dados.' },
  { step: 3, title: 'Treinamento', description: 'Capacitação do time em todas as funcionalidades.' },
  { step: 4, title: 'Go-Live', description: 'Lançamento oficial com suporte dedicado.' },
  { step: 5, title: 'Acompanhamento', description: 'Revisão de métricas e otimização contínua.' },
];

export function TimelineSection() {
  return (
    <section className="reveal px-8 py-16">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-2 text-center text-2xl font-bold text-white">Implementação</h2>
        <p className="mb-10 text-center text-[#a1a1aa]">Do contrato ao Go-Live em 2 semanas.</p>

        <div className="relative">
          <div className="absolute left-5 top-0 h-full w-px bg-[#27272a]" />
          <div className="space-y-8">
            {STEPS.map((s, i) => (
              <div key={s.step} className="relative flex gap-6 pl-12" style={{ animationDelay: `${i * 0.12}s` }}>
                <div className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#09090b] text-sm font-bold text-white">
                  {s.step}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{s.title}</h3>
                  <p className="mt-1 text-sm text-[#a1a1aa]">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

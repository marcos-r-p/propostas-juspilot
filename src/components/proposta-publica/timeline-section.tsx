const STEPS = [
  { step: 1, title: 'Assinatura', description: 'Formalização do contrato e pagamento do setup.', days: 'Dia 1' },
  { step: 2, title: 'Onboarding', description: 'Configuração da plataforma e migração de dados.', days: 'Dias 2-4' },
  { step: 3, title: 'Treinamento', description: 'Capacitação do time em todas as funcionalidades.', days: 'Dias 5-8' },
  { step: 4, title: 'Go-Live', description: 'Lançamento oficial com suporte dedicado.', days: 'Dias 9-10' },
  { step: 5, title: 'Acompanhamento', description: 'Revisão de métricas e otimização contínua.', days: 'Dia 14+' },
];

export function TimelineSection() {
  return (
    <section className="px-8 py-20">
      <div className="mx-auto max-w-4xl">
        <div className="reveal mb-16 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c9a96e]">Implementação</span>
          <h2 className="font-display mt-3 text-3xl font-medium tracking-tight text-[#f1f5f9] md:text-4xl">
            Do contrato ao Go-Live
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[#8b95a5]">
            Processo estruturado com acompanhamento dedicado em cada etapa.
          </p>
        </div>

        <div className="reveal relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 h-full w-px bg-gradient-to-b from-[#c9a96e]/40 via-[#1e293b] to-transparent md:left-1/2" />

          <div className="space-y-12">
            {STEPS.map((s, i) => (
              <div
                key={s.step}
                className={`reveal reveal-delay-${Math.min(i + 1, 4)} relative flex items-start gap-8 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                {/* Content card */}
                <div className={`ml-16 flex-1 md:ml-0 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                  <div className="rounded-xl border border-[#1e293b] bg-[#141c2e]/60 p-6 backdrop-blur-sm">
                    <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c9a96e]">{s.days}</div>
                    <h3 className="text-base font-semibold text-[#f1f5f9]">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#8b95a5]">{s.description}</p>
                  </div>
                </div>

                {/* Circle indicator */}
                <div className="absolute left-0 flex h-12 w-12 items-center justify-center md:left-1/2 md:-translate-x-1/2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#c9a96e]/30 bg-[#0a0f1c]">
                    <span className="font-display text-sm font-semibold gradient-text">{s.step}</span>
                  </div>
                </div>

                {/* Spacer for opposite side */}
                <div className="hidden flex-1 md:block" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section-divider mx-auto mt-20 max-w-6xl" />
    </section>
  );
}
